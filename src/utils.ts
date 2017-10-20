import { Stream } from 'xstream'
import { IMessage, ITab, IWindow, MessageType } from './interfaces'

export function pickType(message$: Stream<IMessage>, type: string) {
	return message$
		.filter((msg: IMessage) => msg.type === type)
		.map((msg: IMessage) => msg.payload)
}

export function newMessage(type: MessageType | MessageType[], payload?: any): IMessage {
	if (Array.isArray(type)) {
		if (type.length === 0) { throw new Error('Must provide a type') }
		const [thisType, ...types] = type
		return {
			type: thisType,
			payload: types.length === 0 ? payload : newMessage(types, payload),
		}
	}

	return { type, payload }
}

const merge = require('lodash/merge')
export function MetafyTab(tab: browser.tabs.Tab): ITab {
	return merge(
		{ meta: { status: 'active' } },
		tab, {
			// TODO: cross-browser version of this?
			favIconUrl: 'chrome://favicon/' + tab.url,
		},
	)
}

export function MetafyWindow(window: browser.windows.Window): IWindow {
	return merge(
		{ meta: { status: 'active' } },
		window,
		{ tabs: (window.tabs || []).map(MetafyTab) },
	)
}

import { browser } from './browser'
export const extensionUrl = `chrome-extension://${browser.runtime.id}/`
export const urlMatcher = new RegExp(extensionUrl + '(.*?)/(.*)')
export const createRestoreUrl = (tab: ITab) => extensionUrl + tab.windowId + '/' + tab.url

export const serializeKeys = (...keys: string[]) =>
	(state: any): any => {
		const obj = {}
		keys.forEach(key => obj[key] = state[key])
		return obj
	}
