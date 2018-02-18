import { browser } from '../browser'
export const navigationTarget = {
	NEW_WINDOW: 'new-window',
	NEW_TAB: 'new-tab',
	CURRENT_TAB: 'current-tab',
}

/**
 * Navigate user
 * @param {String} url
 * @param {String} [target]
 * @returns {*}
 */

interface IMeta {
	// internal id of the container
	uuid?: string
	suspended: boolean
	opened: boolean
}

export interface ITab extends browser.tabs.Tab, IMeta { }

const container: IContainer = {
	windowId: 1,
	isOpen: false,
	tabs: [],
}

export function restoreTab(parent: IContainer, tab: idx) {
	if (internalTab.isOpen) { return }

	let tabOptions: browser.tabs.createProperties
	if (parent.opened) {
		tabOptions = { ...internalTab, windowId }
		// parent.id
		// open tab in container.windowId
	} else {
		tabOptions = { ...internalTab, windowId }
		// open tab in new window
		// assign container the windowId: windowId
	}

	return browser
		.tabs
		.create(tabOptions)
		.then((tab: browser.tabs.Tab) => {
			const newTab = {
				...tab,
				uuid: internalTab.uuid,
				opened: true,
				suspended: false,
			}
		})
}
