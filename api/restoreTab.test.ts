import { should } from 'fuse-test-runner'
import { browser, chrome } from '../browser'

import { ITab, navigate, navigationTarget, restoreTab } from './restoreTab'
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

export class RestoreTabTest {
	public async 'should restore saved unopened tab'() {
		chrome.tabs.create.yields([1, 2])
		should(chrome.tabs.create.notCalled).beOkay()

		const savedUnopenedTab = { ...defaultTab }
		await restoreTab(savedUnopenedTab)
		should(chrome.tabs.create.calledOnce).beOkay()
		// should(chrome.tabs.create.withArgs({ url, focused: true, type: 'normal' }).calledOnce)
		//  	.beOkay()
	}
}
