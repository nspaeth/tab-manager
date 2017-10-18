import isolate from '@cycle/isolate'
import { run } from '@cycle/run'
import onionify, { StateSource } from 'cycle-onionify'
import xs, { Stream } from 'xstream'
import { mkDrivers } from './drivers'
import { Component, DriverSinks, IDriverSources } from './interfaces'
import { Home, initialState as initialViewState, IState as IHomeState } from './views'

interface IState {
	showIncognito: boolean
	home: IHomeState,
}

export type Reducer = (prev?: IState) => IState // | undefined
export type Sources = IDriverSources & { onion: StateSource<IState> }
export type Sinks = DriverSinks & { onion: Stream<Reducer> }

const initialState = {
	showIncognito: false,
	home: initialViewState,
}

// TODO: This intermediate 'App' component is probably unnecessary. Just show the view?
export function App(sources: Sources): Sinks {
	const initReducer$ = xs.of((prevState: IState): IState => !prevState ? initialState : prevState)
	const isolatedHome = isolate(Home, 'home')(sources) as Sinks
	const onion$ = xs.merge(
		initReducer$,
		isolatedHome.onion,
	)
	return {
		messages: isolatedHome.messages,
		DOM: isolatedHome.DOM,
		onion: onion$,
	}
}

// Don't need to store state here for now; everything is stored
// by the background script. Keeping this around in case storing
// parts of UI state becomes necessary in the future.
// declare interface IStorageifyOptions {
// 	key: string
// 	serialize(state: any): string
// 	deserialize(stateStr: string): any
// }
// import { serializeKeys } from './utils'
// const main: Component = onionify(
// 	storageify(App, {
// 		key: 'cycle-spa-state',
// 		serialize: serializeKeys('windows'),
// 	}),
// )

const main: Component = onionify(App)
run(main as any, mkDrivers())
