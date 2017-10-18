import xs, { Stream } from 'xstream'
import { pickType } from '../utils'

import {
	IMessage, IReducerFactoryMap, IState, ITab,
	IWindow, Reducer, ReducerFactory, Sinks, Sources,
} from './interfaces'
const defaultReducer = (prevState: IState): IState => prevState

function reducerCaller(reducerObject: IReducerFactoryMap): ReducerFactory {
	return ({ type, payload }: IMessage) => {
		const reducerFactory = reducerObject[type]
		return stateValidator(reducerFactory ? reducerFactory(...payload) : defaultReducer)
	}
}

const initialState: IState = {
	count: 0,
	windows: {},
	recentlyClosed: [],
}

export function stateValidator(reducer: Reducer) {
	return (prevState: IState) => {
		const newState = reducer(prevState)
		// TODO: only gets the first error
		// TODO: push errors to state.errors
		try {
			isValidState(newState)
		} catch (e) {
			console.error(e)
		}
		return newState
	}
}

// TODO: put tabs in a weakMap?
import { appReducers } from './app.model'
import { tabReducers } from './tabs.model'
import { windowReducers } from './windows.model'
const windowReducerFactory = reducerCaller(windowReducers)
const tabReducerFactory = reducerCaller(tabReducers)
const appReducerFactory = reducerCaller(appReducers)
export function model(sources: Sources): Sinks {
	const window$ = sources.windows.map(windowReducerFactory)
	const tab$ = sources.tabs.map(tabReducerFactory)
	// const app$ = pickType(sources.messages, 'app').map()
	const app$: Stream<Reducer> = pickType(sources.messages, 'app')
		.map(appReducerFactory)

	const onion$: Stream<Reducer> = xs.merge(window$, tab$, app$)
		.startWith((prevState: IState): IState => !prevState ? initialState : prevState)

	return {
		onion: onion$,
	}
}

export function isValidTab(tab: ITab): boolean {
	if (!tab.meta) { throw new Error((`tab(${tab.id}) missing meta data`)) }
	return true // !!tab.meta
}

export function isValidWindow(window: IWindow): boolean {
	// const badTab =
	window.tabs.find((tab: ITab, idx: number) => {
		if (idx !== tab.index) { throw (new Error(`actual index(${idx}) != tab.index(${tab.index})`)) }
		if (tab.meta.status !== window.meta.status) {
			throw (new Error(`Window[${window.id}] status:'${window.meta.status}' \
!= tab[${tab.index}] status:'${tab.meta.status}'`))
		}
		if (window.id != tab.windowId) {
			throw (new Error(`window.id(${window.id}) != tab.windowId(${tab.windowId})`))
		}
		return !isValidTab(tab)
	})

	return true // !badTab
}

export function isValidState(state: IState) {
	const badWindow = Object.entries(state.windows)
		.find(
		([key, window]: [string | number, IWindow]) => {
			if (key != window.id) { throw (new Error(`key:${key} != windowId:${window.id}`)) }
			return !isValidWindow(window)
		},
	)
	return !badWindow
}
