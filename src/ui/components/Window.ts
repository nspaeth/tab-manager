import { button, div, span, VNode } from '@cycle/dom'
import isolate from '@cycle/isolate'
import { makeCollection, StateSource } from 'cycle-onionify'
import xs, { Stream } from 'xstream'
import sampleCombine from 'xstream/extra/sampleCombine'
import { DriverSinks, IDriverSources, IMessage, ITab, IWindow } from '../interfaces'
import { main as Tab } from './Tab'

import { newMessage } from '../../utils'
type IState = IWindow

export type Reducer = (prev: IState) => IState// | undefined
export type Sources = IDriverSources & { onion: StateSource<IState> }
export type Sinks = DriverSinks & { onion: Stream<Reducer> }

import { makeSortable } from 'cyclejs-sortable'
import debounce from 'xstream/extra/debounce'
const makeTabs = (sources: Sources) => makeCollection({
	item: Tab,
	itemKey: (childState: ITab, index: number) => childState.id.toString(),
	itemScope: (key: any) => '._' + key, // + Math.round((Math.random() * 100000)),
	collectSinks: (instances: any) => ({
		DOM: instances.pickCombine('DOM')
		// TODO: this makes updates very slow and doesn't work anyway
			.compose(debounce(100))
			.map((itemVNodes: any) => div('.tabs', {style: {position: 'relative'}}, itemVNodes))
			.compose(makeSortable(sources.DOM, {
				handle: '.tab',
				parentSelector: '.tabs',
				selectionDelay: 250,
			})),
		messages: instances.pickMerge('messages'),
			onion: instances.pickMerge('onion'),
	}),
})

export function main(sources: Sources): Sinks {
	const tab$ = isolate(makeTabs(sources), 'tabs')(sources)
	const intent$ = intent(sources)

	return {
		DOM: view(sources, tab$.DOM),
		messages: xs.merge(intent$.messages, tab$.messages as Stream<IMessage>),
		onion: tab$.onion as Stream<Reducer>,
	}
}

type EventType = [any, IWindow]
function intent(sources: Sources) {
	const DOM = sources.DOM
	const saveClick$ = DOM.select('.save').events('click')
		.compose(sampleCombine(sources.onion.state$))
	const closeClick$ = DOM.select('.close').events('click')
		.compose(sampleCombine(sources.onion.state$))

	return {
		messages: xs.merge(
			DOM.select('.restore').events('click')
				.compose(sampleCombine(sources.onion.state$))
				.map(([_, { id }]: EventType) => newMessage(['app', 'restoreWindow'], [id])),
			saveClick$.map(([_, { id }]: EventType) => newMessage(['app', 'saveWindow'], [id])),
			saveClick$.map(([_, { id }]: EventType) => newMessage(['windows', 'remove'], [id])),
			xs.merge(
				closeClick$
					// close the window if it exists
					.filter(([_, { id, meta }]: EventType) => meta.status === 'active')
					.map(([_, { id, meta }]: EventType) => newMessage(['windows', 'remove'], [id])),
				closeClick$.map(
					// and always delete it
					([_, { id, meta }]: EventType) => newMessage(['app', 'destroyWindow'], [id])),
			),
			DOM.select('.newTab').events('click')
				.compose(sampleCombine(sources.onion.state$))
				.map(([_, { id }]) => newMessage(['tabs', 'create'], [{ windowId: id }])),
		),
	}
}
// the grid is created with the Tab as the standard unit
// each window is the height of the contained tabs +
// the height of any extra chrome
// currently, title(1) + new tab button(1) + padding/margin (1) +
//
const extraWindowSpacing = 4 // # of tab heights

import { attrs } from '../utils'

import { newTabS, TabContainerS, WindowControlsS, WindowHeaderS, WindowS } from './styles'
function view(sources: Sources, tabDOM$: Stream<VNode>): Stream<VNode> {
	const window$ = sources.onion.state$

	return xs.combine(window$, tabDOM$).map(
		([window, tabs]) => div(`.${WindowS}`, {
			style: {
				'grid-row': `auto / span ${(window.tabs.length + extraWindowSpacing)}`,
				...(window.focused ? { 'background-color': 'salmon' } : {}),
			},
		}, [
				div(`.${WindowHeaderS}`, [
					window.id,
					`(${window.tabs.length})`,
					div(`.${WindowControlsS}`, [
						window.meta.status === 'saved'
							? span('.restore', attrs({ title: 'Restore this window' }), ['O'])
							: span('.save', attrs({ title: 'Save this window' }), ['o']),
						span('.close', attrs({ title: 'Close Window (and all tabs)' }), ['X']),
					]),
				]),
				div(`.${TabContainerS}`, tabs),
				button(`.newTab.${newTabS}`, attrs({ title: 'New Tab' }), ['New Tab']),
			]),
	)
}
