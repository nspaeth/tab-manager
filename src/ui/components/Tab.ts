import { div, img, span, VNode } from '@cycle/dom'
import { StateSource } from 'cycle-onionify'
import xs, { Stream } from 'xstream'
import sampleCombine from 'xstream/extra/sampleCombine'

import { newMessage } from '../../utils'
import { DriverSinks, IDriverSources, ITab } from '../interfaces'
import { attrs } from '../utils'

type IState = ITab

export type Reducer = (prev: IState) => IState // | undefined
export type Sources = IDriverSources & { onion: StateSource<IState> }
export type Sinks = DriverSinks & { onion: Stream<Reducer> }

export function main(sources: Sources): Sinks {
	const intent$ = intent(sources)
	return {
		DOM: view(sources),
		messages: intent$.messages,
		onion: xs.of((state: any) => state),
	}
}

type EventType = [any, ITab]
function intent(sources: Sources) {
	const closeClick$ = sources.DOM.select('.close').events('click')
		.compose(sampleCombine(sources.onion.state$))
	const dblClick$ = sources.DOM.select('.tab').events('dblclick')
		.compose(sampleCombine(sources.onion.state$))

	const mouseDown$ = xs.merge(
		sources.DOM.select('.tab').events('pointerdown'),
		sources.DOM.select('.tab').events('mousedown'),
	)

	return {
		messages: xs.merge(
			mouseDown$.map(() => console.log('down!') || ({type: 'none', payload: 'non'}) ),
			dblClick$
				.map(([_, { id }]: EventType) =>
					newMessage(['tabs', 'update'], [id, { active: true }])),
			xs.merge(
				closeClick$
					.filter(([_, { id, meta }]: EventType) => meta.status === 'active')
					// close the window if it exists
					.map(([_, { id, meta }]: EventType) => newMessage(['tabs', 'remove'], [id])),
				// and always delete it
				closeClick$.map(([_, { id }]: EventType) => newMessage(['app', 'destroyTab'], [id])),
			),
			dblClick$.map(
				([_, { windowId }]: EventType) =>
					newMessage(['windows', 'update'], [windowId, { focused: true }])),
		),
	}
}

import { FavIconBoxS, faviconS, tabControlsS, tabS, TabTitleS } from './styles'
function view(sources: Sources): Stream<VNode> {
	const tab$ = sources.onion.state$
	return tab$.map(
		tab =>
			div(`.tab.${tabS}`, {
				attrs: { title: tab.title },
				style: tab.active ? { 'background-color': 'lightblue' } : {},
			}, [
					div(`.${FavIconBoxS}`, [
						img(`.${faviconS}`, {
							attrs: { src: tab.favIconUrl },
						}),
					]),
					div(`.${TabTitleS}`, [
						div(`.${tabControlsS}`, [span('.close', attrs({ title: 'Close Tab' }), ['X'])]),
						tab.title,
					]),
				]))
}
