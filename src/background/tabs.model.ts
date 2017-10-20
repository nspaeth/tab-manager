import { MetafyTab } from '../utils'
import { IReducerFactoryMap, IState, ITab, IWindow } from './interfaces'
import { insertAt, moveArrayItem, randomId, reindexTabs } from './utils'
const find = require('lodash/find')

export const tabReducers: IReducerFactoryMap = {
	onCreated: (tab: browser.tabs.Tab) => (prevState: IState): IState => {
		const window = prevState.windows[tab.windowId]
		// if !window, it is likely a new window, so let window.onCreated handle it
		if (!window) { return prevState }

		return {
			...prevState,
			windows: {
				...prevState.windows,
				[tab.windowId]: {
					...window,
					tabs: reindexTabs(insertAt(window.tabs!, tab.index, MetafyTab(tab))),
				},
			},
		}
	},
	onActivated: (activateInfo: { tabId: number, windowId: number }) =>
		(prevState: IState): IState => {
			const oldWindow = prevState.windows[activateInfo.windowId]
			if (!oldWindow) { return prevState }
			return {
				...prevState,
				windows: {
					...prevState.windows,
					[oldWindow.id]: {
						...oldWindow,
						tabs: reindexTabs(
							oldWindow.tabs.map(
								(tab: ITab) => ({ ...tab, active: activateInfo.tabId === tab.id }),
							)),
					},
				},
			}
		},
	onHighlighted: (highlightedTabInfo: { tabIds: Array<number | string>, windowId: number }) =>
		(prevState: IState): IState => {
			const oldWindow = prevState.windows[highlightedTabInfo.windowId]
			if (!oldWindow) { return prevState }
			return {
				...prevState,
				windows: {
					...prevState.windows,
					[oldWindow.id]: {
						...oldWindow,
						tabs: reindexTabs(
							oldWindow.tabs.map(
								(tab: ITab) => ({ ...tab, highlighted: highlightedTabInfo.tabIds.includes(tab.id) }),
							)),
					},
				},
			}
		},
	onRemoved: (tabId: number) => (prevState: IState): IState => {
		const oldWindow: IWindow = find(
			prevState.windows,
			(window: IWindow) => window.tabs.find((tab: ITab) => tab.id === tabId),
		)

		if (!oldWindow) { return prevState } // TODO: can this happen? is this an error?
		const tabs = reindexTabs(oldWindow.tabs.reduce(
			(acc: ITab[], tab: ITab) =>
				(tab.id === tabId
					? (tab.meta.status === 'saved' ? [...acc, { ...tab, id: randomId() }] : acc)
					: [...acc, tab]), []))

		return {
			// TODO: queue closed tabs to recentlyClosed
			// TODO: don't removeTabs where tab.meta.status === 'saved' || 'saving';
			// instead update state and id
			...prevState,
			// recentlyClosed: (prevState.recentlyClosed || []).push(payload),
			windows: {
				...prevState.windows,
				[oldWindow.id]: { ...oldWindow, tabs },
			},
		}
	},
	onUpdated: (tabId: number, changeInfo: Partial<ITab>, updatedTab: ITab) =>
		(prevState: IState): IState => {
			const window = prevState.windows[updatedTab.windowId]
			const updated = MetafyTab(updatedTab)
			return {
				...prevState,
				windows: {
					...prevState.windows,
					[updatedTab.windowId]: {
						...window,
						tabs: reindexTabs(window.tabs.map(
							(tab: ITab) => tab.id === updated.id ? updated : tab,
						)),
					},
				},
			}
		},
	onAttached: (tabId, attachInfo) => (prevState: IState): IState => {
		const oldWindow = find(prevState.windows,
			(window: IWindow) =>
				!!window.tabs.find((x: ITab) => x.id === tabId),
		)
		if (!oldWindow) { return prevState }
		const tab: ITab = find(oldWindow.tabs, (x: ITab) => x.id === tabId)
		const newWindow = prevState.windows[attachInfo.newWindowId]

		const attachedTab = {
			...tab,
			windowId: attachInfo.newWindowId,
			index: attachInfo.index,
			// TODO: make sure the tab gets closed if dragged from an active windowId
			// after drag&drop is implemented
			// TODO: should this be done in onCreated?
			meta: { ...tab.meta, status: newWindow.meta.status },
		}
		return tabReducers.onCreated(attachedTab)(prevState)
	},
	onDetached: (tabId, detachInfo) => (prevState: IState): IState => {
		// hopefully onAttached is guaranteed to be called first(?), otherwise this tab is lost
		// consider creating an 'orphaned tabs' field?
		const oldWindow = prevState.windows[detachInfo.oldWindowId]
		if (!oldWindow) { return prevState }

		const detachedWindow = {
			...oldWindow,
			tabs: reindexTabs(oldWindow.tabs.filter((tab: ITab) => tab.id !== tabId)),
			// tabs: reindexTabs(oldWindow.tabs.filter(
			// 	(tab: ITab) => tab.id !== tabId || tab.status === 'saved')),
		}

		// if (detachedWindow.meta.status === 'saved') { return prevState }

		return ({
			...prevState,
			windows: {
				...prevState.windows,
				[detachInfo.oldWindowId]: detachedWindow,
			},
		})
	},
	onMoved: (tabId: number, moveInfo: IMoveInfo) => (prevState: IState): IState => {
		const { windowId, toIndex, fromIndex } = moveInfo
		const window = prevState.windows[windowId]
		if (!window) { return prevState }
		return {
			...prevState,
			windows: {
				...prevState.windows,
				[window.id]: {
					...window,
					tabs: reindexTabs(moveArrayItem(window.tabs, fromIndex, toIndex)),
				},
			},
		}
	},
}

interface IMoveInfo {
	windowId: number
	fromIndex: number
	toIndex: number
}
