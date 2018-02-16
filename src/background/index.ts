const browser = require('webextension-polyfill')
import { run } from '@cycle/run'
import xs, { Stream } from 'xstream'
import sampleCombine from 'xstream/extra/sampleCombine'
import { createRestoreUrl, extensionUrl, newMessage, pickType, urlMatcher } from '../utils'
import { Component, DriverSinks, IDriverSources, makeDrivers } from './drivers'
import { IMessage, IWindow } from './interfaces'
import { model } from './model'

const scriptUrl = browser.runtime.getURL('index.html')
const width = Math.round(window.screen.availWidth * 0.90)
const height = Math.round(window.screen.availHeight * 0.85)
const left = Math.round((window.screen.availWidth - width) / 2)
const top = Math.round((window.screen.availHeight - height) / 2)

function showSwitcher() {
	// `focuses: true` not supported on firefox but might be useful to make sure
	// that the window opens in focus every time
	browser.windows.create({ url: scriptUrl, type: 'popup', width, height, left, top })
}

interface IState {
	count: number
	windows: { [k: string]: IWindow }
	recentlyClosed: any[]
}

export type Reducer = (prev?: IState) => IState // | undefined
export type Sources = IDriverSources & { onion: StateSource<IState> }
export type Sinks = DriverSinks & { onion: Stream<Reducer> } // & { count: Stream<any> }

export function main(sources: Sources): Sinks {
	const state$ = sources.onion.state$
	const app$: Stream<IMessage> = pickType(sources.messages, 'app')

	const restore$: Stream<IMessage> = pickType(app$, 'restoreWindow')
		.compose(sampleCombine(state$))
		.map(([[id], state]: any) => newMessage('create', [{
			url: state.windows[id].tabs.map(createRestoreUrl),
		}]))

	const restored$ = pickType(sources.tabs, 'onCreated')
		.filter(([tab]) => tab.url.match(extensionUrl + '(.*?)/'))

	const tab$: Stream<IMessage> = xs.merge(
		pickType(sources.messages, 'tabs'),
		restored$
			.map(([tab]) => {
				const match = urlMatcher.exec(tab.url)
				if (match instanceof Array) {
					const [_, _windowId, url] = match
					return newMessage('update', [tab.id, {
						url, // tab.url.replace(extensionUrl, ''),
					}])
				}
				return null
			}),
	)
	const window$ = xs.merge(pickType(sources.messages, 'windows'), restore$)
	const models = model(sources)

	const message$: Stream<IMessage> = xs.merge(
		state$
			.map(state => newMessage('state_changed', state)),
		app$
			.filter((message: any) => message.type === 'current_state_requested')
			.compose(sampleCombine(state$))
			.map(([, state]: any) => newMessage('state_changed', state)),
	)

	return {
		messages: message$,
		onion: models.onion, // onion$,
		tabs: tab$,
		windows: window$,
	}
}

browser.commands.onCommand.addListener((command: string) => {
	if (command === 'show-tab-switcher') {
		showSwitcher()
	}
})

import onionify, { StateSource } from 'cycle-onionify'
import storageify from 'cycle-storageify'
// declare interface IStorageifyOptions {
// 	key: string
// 	serialize(state: any): string
// 	deserialize(stateStr: string): any
// }

// import { compressToUTF16, decompressFromUTF16 } from 'lz-string'
const Background: Component = onionify(
	storageify(main, {
		key: 'background-state',
		serialize: (state: any) => {
			const serialized = JSON.stringify(state)
			// TODO: compression adds noticeable lag but excellent savings (~1/3 of size). Can it be async?
			// TODO: localStorage space is limited anyway. Consider other possibilities.
			// console.log('Uncompressed: ', serialized.length / 1024 + 'KiB')
			// const compressed = compressToUTF16(JSON.stringify(state))
			return serialized
		},
		// deserialize: data => JSON.parse(decompressFromUTF16(data)),
	}),
)

run(Background as any, makeDrivers())
