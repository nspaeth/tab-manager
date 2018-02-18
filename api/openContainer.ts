import { browser } from '../browser'

interface IMeta {
	// internal id of the container
	uuid?: string
	suspended: boolean
	opened: boolean
}

// suspendTab: keep the tab open, but unload its contents
// resumeTab: reload tab contents of an open but suspended tab
// saveTab: close the Tab but keep it in the TabStore
// restoreTab: restore a tab from the TabStore
// deleteTab: permenantly delete a tab from the TabStore, and close it if it is open

export interface IContainer extends browser.windows.Window, IMeta { }

import { restoreTab } from './restoreTab'
// const restoreTab = (tab: any) => { }
export function restoreContainer(container: IContainer) {
	container.tabs.map((_, index) => restoreTab(container, index))
	// const container: IContainer = {
	// 	windowId: 1,
	// 	isOpen: false,
	// 	tabs: [],
	// }

	if (container.isOpen) {
		container.id
		// open tab in container.windowId
	} else {
		// open tab in new window
		// assign container the windowId
		//
	}
	// update internal tab:
	// - mark as open
	// - update tab id
}
