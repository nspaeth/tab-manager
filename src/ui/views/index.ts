import { button, div, DOMSource, input, VNode } from '@cycle/dom'
import isolate from '@cycle/isolate'
import { makeCollection, StateSource } from 'cycle-onionify'
import xs, { Stream } from 'xstream'
import { newMessage, pickType } from '../../utils'
import { main as Header } from '../components/Header'
import { main as Window } from '../components/Window'
import { DriverSinks, IDriverSources, IMessage, IMeta, ITab, IWindow } from '../interfaces'

export interface IState {
	count: number
	windows: IWindow[]
	search: string
}

export const initialState = {
	count: 0,
	windows: [],
	search: '',
}

const Windows = makeCollection({
	item: Window,
	itemKey: (state: IWindow) => state.id.toString(),
	itemScope: (key: any) => key,
	collectSinks: (instances: any) => ({
		DOM: instances.pickCombine('DOM'),
		messages: instances.pickMerge('messages'),
		onion: instances.pickMerge('onion'),
	}),
})

export type Reducer = (prev: IState) => IState // | undefined
export type Sources = IDriverSources & { onion: StateSource<IState> }
export type Sinks = DriverSinks & { onion: Stream<Reducer> }

const searchLens = {
	get: (state: IState): IWindow[] =>
		state.search ? state.windows.map(
			window => ({
				...window,
				// tabs: window.tabs.filter(
				// 	tab =>
				// 		(tab.title || '').toLowerCase().includes(state.search)
				// 		|| tab.url.toLowerCase().includes(state.search),
				// ),
			}))
		.filter(window => window.tabs.find(tab => (tab.title || '').toLowerCase().includes(state.search)))
			// .filter(window => window.tabs.length)
			: state.windows,
	set: (state: IState, childState: IWindow[]): IState => state, // ignore updates
}

export function Home(sources: Sources): Sinks {
	const windows$ = isolate(Windows, { onion: searchLens })(sources)
	const vdom$: Stream<VNode> = view(sources, windows$.DOM)
	const intent$ = intent(sources.DOM)
	const message$ = xs.merge(intent$.messages, windows$.messages as Stream<IMessage>)
	const onion$ = xs.merge(
		intent$.onion,
		windows$.onion as Stream<Reducer>,
		pickType(sources.messages, 'state_changed')
			.map((payload: any) => (prevState: IState):
				IState => ({
					...prevState,
					...payload,
					windows: Object.values(payload.windows),
				})),
	)

	return {
		DOM: vdom$,
		onion: onion$,
		messages: message$,
	}
}

const chunk = require('lodash/chunk')
export function createWindow(tabs: ITab[],
                             windowId: number | string = 1,
                             meta: IMeta = { status: 'active' },
                            ): IWindow {
	const id = parseInt(windowId as string)
	let tabsArray = tabs

	return {
		id: windowId, meta, tabs,
		incognito: false,
		focused: false,
		alwaysOnTop: false,
	}
}

import { BagOfWords, CRP } from 'chinese-restaurant-process'

const natural = require('natural')
natural.PorterStemmer.attach()

function clusterTabs(tabs: ITab[]) {
  const crp = new CRP(0.1, .15)
  crp.addDocsToCorpus(
    tabs.map((tab) => ({ data: tab, bag: new BagOfWords(tab.title.tokenizeAndStem()) }))
  )
  crp.cluster(100)
  const IDFs = crp.calcIDFs()
  crp.tables.filter(table => table)
    .map(table => table.calcTF_IDF(IDFs))

  crp.tables.filter(table => table)
    .map(table => ({
	    titles: Object.keys(table.docs)
        .map(idx => table.docs[idx].text), // docs: table.docs,
	    terms: table.topNTerms(5),
	    //	tf_idf: table.TF_IDF
    }))
  return crp.tables.filter(table => table)
}

function intent(DOM: DOMSource) {
	const newWindow$ = DOM.select('.newWindow').events('click')
		.mapTo(newMessage(['windows', 'create']))

	const regroup$ = DOM.select('.regroup').events('click')
		.map(
			() =>
				(prevState: IState) =>
				({
					...prevState,
					windows: clusterTabs(
            ([] as ITab[]).concat(
              ...prevState.windows
                .map(window => window.tabs)
            )
          )
          // chunk(([] as ITab[])
          //       .concat(
          //         ...prevState.windows
          //           .map(window => window.tabs)), 10)
            .map((tabs: any[], index: number) =>
                 createWindow(
                   Array.from(tabs.docs.values()).map(tab => tab.data),
                   index,
                   { status: 'active', keywords: tabs.topNTerms(5) }
                 )),
				}),
		)
	// .mapTo(newMessage(['app', 'regroup']))

	const increment$ = DOM.select('.increment').events('click')
		.mapTo(newMessage(['app', 'increment']))
		.startWith(newMessage(['app', 'current_state_requested']))

	return {
		messages: xs.merge(newWindow$, increment$),
		onion: xs.merge(
      DOM.select('.search').events('input').map(
			({ target }: any) =>
				(prevState: IState): IState =>
					({ ...prevState, search: target.value && target.value.toLowerCase() }),
		),
      regroup$,
    )
	}
}

function view(sources: Sources, windowsDOM$: Stream<VNode>): Stream<VNode> {
	const state$: Stream<IState> = sources.onion.state$
	const count$ = sources.messages.filter(
		(message: any) => message.type === 'state_changed',
	).map(({ payload }: any) => payload.count)

	const header$: Stream<VNode> = Header(sources).DOM as any

	return xs.combine(count$, header$, state$, windowsDOM$).map(
		([count, header, state, windowsDOM]: any) =>
			div([
				div([
					input('.search', { attrs: { type: 'text', autofocus: true } }),
					'canary', button('.increment', ['increment']), count,
					button('.newWindow', ['New Window']),
					header,
					button('.regroup', ['Regroup tabs']),
				]),
				// createBackupLink(state),
				div({
					style: {
						'display': 'grid',
						'font-size': '0.85em',
						'grid-gap': '1em',
						'grid-template-columns': 'repeat(auto-fill, minmax(20em, 1fr))',
					},
				},
					windowsDOM,
				),
			]),
	)
}

// import { pack, Box } from 'bin-packer'
// const renderBoxes = (windows) => pack(windows.slice(0, count).map(
// 	(window: any) => new Box({width: 1, height: 2 + window.tabs.length}, window)), {width, height})
// 	.map((box: any) =>
// 			 div({ style: {
// 					border: '1px solid black',
// 					// 'grid-row-start': box.y + 1,
// 					// 'grid-row-end': box.bottom + 1,
// 					// 'grid-column-start': box.x + 1,
// 					// 'grid-column-end': box.right + 1,
// 					'grid-row': `auto / span ${(window.tabs.length + 2) || 1}`,
// 					//'grid-row': `auto / span ${(box.content && box.content.tabs.length + 2) || 1}`,
// 					// 'background-color': box.content ? 'grey': 'rgb(110, 115, 151)',
// 					// opacity: box.content ? 1 : 0.5,
// //					width: '20em'
// 			 }}, [
// 				 Window(window)
// 					//box.content ? Window(box.content) : div()
// 				]))

// function createBackupLink(data: any) {
// 	const file = new Blob([JSON.stringify(data, undefined, 2)], { type: 'plain/text' })
// 	const filename = 'tabs.json'
// 	const url = window.URL.createObjectURL(file)
// 	return a({
// 		attrs: {
// 			href: url,
// 			download: filename,
// 		},
// 	}, ['Save Backup'])
// 	// return { url, filename }
// }
