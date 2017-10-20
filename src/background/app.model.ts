import { IReducerFactoryMap, IState, ITab, IWindow } from './interfaces'
import { randomId, reindexTabs } from './utils'

const find = require('lodash/find')
const omit = require('lodash/omit')

export const appReducers: IReducerFactoryMap = {
	saveWindow: windowId => (prevState: IState): IState => {
		// const uuid = uuidv4()
		const window = prevState.windows[windowId]
		if (!window) { return prevState }

		const uuid = randomId()
		const savedWindow = {
			...window,
			id: uuid,
			meta: { status: 'saved' },
			// id: uuid,
			// also save tabs:
			tabs: window.tabs.map((tab: ITab) => ({ ...tab, windowId: uuid, meta: { status: 'saved' } })),
		}

		return {
			...prevState,
			windows: {
				...omit(prevState.windows, windowId),
				[uuid]: savedWindow,
			},
		}
	},
	restoreWindow: windowId => (prevState: IState): IState => {
		const window = prevState.windows[windowId]
		if (!window) { return prevState }
		return {
			...prevState,
			windows: {
				...prevState.windows,
				[windowId]: {
					...window,
					meta: { status: 'active' },
					// also restore tabs:
					tabs: window.tabs.map((tab: ITab) => ({ ...tab, meta: { status: 'active' } })),
				},
			},
		}
	},
	destroyWindow: windowId => (prevState: IState): IState => ({
		...prevState,
		windows: omit(prevState.windows, windowId),
	}),
	destroyTab: tabId => (prevState: IState): IState => {
		const oldWindow: IWindow = find(
			prevState.windows,
			(window: IWindow) => window.tabs.find((tab: ITab) => tab.id === tabId),
		)

		if (!oldWindow) { return prevState } // TODO: can this happen? is this an error?
		const tabs = reindexTabs(oldWindow.tabs.filter((tab: ITab) => tab.id !== tabId))
		if (tabs.length === 0) {
			return {
				...prevState,
				windows: omit(prevState.windows, oldWindow.id),
			}
		}

		return {
			// TODO: queue closed tabs to recentlyClosed
			...prevState,
			// recentlyClosed: (prevState.recentlyClosed || []).push(payload),
			windows: {
				...prevState.windows,
				[oldWindow.id]: { ...oldWindow, tabs },
			},
		}
	},
	increment: payload => (prevState: IState): IState => ({
		...prevState,
		count: prevState.count + (payload || 1),
	}),
}
