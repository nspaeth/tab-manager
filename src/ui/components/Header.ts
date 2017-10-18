import { table, td, th, tr, VNode } from '@cycle/dom'
import { StateSource } from 'cycle-onionify'
import { Stream } from 'xstream'
import { DriverSinks, IDriverSources, IWindow } from '../interfaces'

type Window = browser.windows.Window
export interface IState {
	windows: Window[]
}

export type Reducer = (prev: IState) => IState // | undefined
export type Sources = IDriverSources & { onion: StateSource<IState> }
export type Sinks = DriverSinks // & { onion: Stream<Reducer> }

export function main(sources: Sources): Sinks {
	const vdom$: Stream<VNode> = view(sources)

	return {
		DOM: vdom$,
	}
}

const statsTableStyle = {
	display: 'inline-table',
}

function view(sources: Sources): Stream<VNode> {
	const state$: Stream<IState> = sources.onion.state$

	return state$.map(
		({ windows }: any) => {
			const activeWindows = Object.values(windows)
				.filter((window: IWindow) => window.meta.status === 'active')
			const savedWindows = Object.values(windows)
				.filter((window: IWindow) => window.meta.status === 'saved')
			const activeTabsLength = activeWindows
				.reduce((tabs: number, window: any) => tabs + window.tabs.length, 0)
			const savedTabsLength = savedWindows
				.reduce((tabs: number, window: any) => tabs + window.tabs.length, 0)

			return table({ style: statsTableStyle }, [
				tr([th([]), th(['Active']), th(['Saved']), th(['All'])]),
				tr([td(['Windows']),
						td([activeWindows.length]),
						td([savedWindows.length]),
						td([activeWindows.length + savedWindows.length]),
					]),
				tr([td(['Tabs']),
						td([activeTabsLength]),
						td([savedTabsLength]),
						td([activeTabsLength + savedTabsLength]),
					]),
			])
		})
}
