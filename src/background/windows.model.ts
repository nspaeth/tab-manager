import { extensionUrl, MetafyWindow, urlMatcher } from '../utils'
import { IReducerFactoryMap, IState, IWindow } from './interfaces'
import { randomId } from './utils'
const merge = require('lodash/merge')
const mapValues = require('lodash/mapValues')
const keyBy = require('lodash/keyBy')
const omit = require('lodash/omit')

export const windowReducers: IReducerFactoryMap = {
	// TODO: merge prevState.windows, new windows, include meta field on windows and tabs
	allWindows: (windows: IWindow[]) => (prevState: IState): IState => ({
		...prevState,
		windows: mapValues(merge(prevState.windows, keyBy(windows, 'id')), MetafyWindow),
	}),
	// TODO: add meta field to new windows
	onCreated: (window: browser.windows.Window) => (prevState: IState): IState => {
		const newWindow = MetafyWindow(window)
		const isRestoring = newWindow.tabs
			.find(tab => !!(tab.url.match('' + extensionUrl + '(.*?)/')))

		if (isRestoring) {
			const match = urlMatcher.exec(newWindow.tabs[0].url)
			if (match instanceof Array) {
				const [_, oldWindowId, _url] = match
				return {
					...prevState,
					windows: {
						...omit(prevState.windows, oldWindowId),
						[window.id!]: newWindow,
					},
				}
			}
		}
		// update windowId of each Tab,
		// update remove oldWindowId from windows
		// merge newWindow with oldWindow

		return {
			...prevState,
			windows: {
				...prevState.windows,
				[window.id!]: newWindow,
			},
		}
	},
	onRemoved: (windowId: number) => (prevState: IState): IState => {
		const window = prevState.windows[windowId]
		if (!window) { return prevState }
		const windows = omit(prevState.windows, windowId)
		if (window.meta.status !== 'saved') { return { ...prevState, windows } }

		const uuid = randomId()
		return {
			...prevState,
			windows: {
				...windows,
				[uuid]: {
					...window,
					id: uuid,
					meta: { status: 'saved' },
					tabs: [...window.tabs.map(tab => ({ ...tab, windowId: uuid, meta: { status: 'saved' } }))],
				},
			},
		}
		// const windows = {...prevState.windows, }
		// const windows = prevState.windows.map(
		// 		(window: IWindow) =>
		// 				window.id !== windowId
		// 				? window
		// 				: (window.meta.status === 'saved' ? {
		// 						...window,
		// 						// give it a new id so we can still refer to it w/o colliding with browser ids
		// 						id: uuid,
		// 						// mark it as saved (should already be so?, TODO: 'saving' -> 'saved' ?)
		// 						meta: {status: 'saved'},
		// 						// update the windowIds on the tabs
		// 						tabs: [...window.tabs.map(tab => ({...tab, windowId: uuid, meta: {status: 'saved'}}))]
		// 				} : undefined)
		// ).filter((window: IWindow) => !!window)

		// return {
		// 		...prevState,
		// 		windows,
		// }
	},
	onFocusChanged: (windowId: any) => (prevState: IState): IState => {
		// const toFocus = prevState.windows.find((window) => window.id === windowId)
		const toFocus = prevState.windows[windowId]

		// ignore special windows
		if (!toFocus || toFocus.type !== 'normal') { return prevState }
		return {
			...prevState,
			windows: {
				...prevState.windows,
				[windowId]: { ...toFocus, focused: true },
			},
		}
	},
}
