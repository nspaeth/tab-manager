import { IMeta, IState, ITab, IWindow } from '../interfaces'
const keyBy = require('lodash/keyBy')

const chrome = require('sinon-chrome')
declare var global: any
global.chrome = chrome

export function createState(windows: IWindow[]): IState {
	return {
		count: 0,
		recentlyClosed: [],
		windows: keyBy(windows, 'id'),
	}
}

export function createTab(
	id = 100, index = 0, windowId = 1,
	url = 'http://test.com', meta: IMeta = { status: 'active' },
): ITab {
	return {
		url,
		active: false,
		favIconUrl: 'chrome://favicon/' + url,
		highlighted: false,
		incognito: false,
		pinned: false,
		selected: false,
		meta,
		id,
		windowId,
		index,
	}
}
const defaultUrl = 'http://example.com'
export function createWindow(
	tabs: null | number | ITab[] = null,
	windowId: number | string = 1,
	meta: IMeta = { status: 'active' },
): IWindow {
	const id = parseInt(windowId as string)
	let tabsArray
	if (tabs === null) {
		tabsArray = [createTab(id + 1, 0, id, defaultUrl, meta)]
	} else if (typeof tabs === 'number') {
		tabsArray = (new Array(tabs)).fill(1)
			.map((val, key: number) => createTab(id + key + 1, key, id, 'defaultUrl', meta))
	} else {
		tabsArray = tabs
	}

	return {
		id: windowId, meta,
		tabs: tabsArray,
		incognito: false,
		focused: false,
		alwaysOnTop: false,
	}
}

import { isValidState, isValidTab, isValidWindow } from '../model'
export { isValidState, isValidTab, isValidWindow }
