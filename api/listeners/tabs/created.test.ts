import { should } from 'fuse-test-runner'
import { browser, chrome } from '../../browser'

import { ITab } from './restoreTab'
declare var global: any

const defaultTab: ITab = {
	url: 'http://example.com',
	index: 0,
	active: false,
	highlighted: false,
	incognito: false,
	pinned: false,
	selected: false,
	suspended: false,
	opened: false,
	windowId: 1,
}

export class TabCreatedTest {
	public async 'existing tab created in new window'() {
		// chrome.tabs.onCreated.dispatch({})
	}
	public async 'existing tab created in existing window'() {
		// chrome.tabs.onCreated.dispatch({})
	}
	public async 'new tab created in new window'() {
		// chrome.tabs.onCreated.dispatch({})
	}
	public async 'new tab created in existing window'() {
		// chrome.tabs.onCreated.dispatch({})
	}
	public async 'tab created in new window'() {
		// chrome.tabs.onCreated.dispatch({})
	}
}
