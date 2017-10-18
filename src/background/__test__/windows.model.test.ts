import { should } from 'fuse-test-runner'
import { windowReducers } from '../windows.model'
import { createState, createTab, createWindow, isValidState } from './model.tests'

export class WindowModelTest {
	public async 'should create one window'() {
		let prevState = createState([])

		const windowWith1Tab = createWindow(1, 1)
		prevState = windowReducers.onCreated(windowWith1Tab)(prevState)

		should(prevState)
			.deepEqual(createState([createWindow(1, 1)]))
		should(isValidState(prevState)).beTrue()

		const windowWithSomeTabs = createWindow([
			createTab(100, 0, 2),
			createTab(101, 1, 2),
			createTab(102, 2, 2),
		], 2)
		prevState = windowReducers.onCreated(windowWithSomeTabs)(prevState)
		should(prevState)
			.deepEqual(createState([windowWith1Tab, windowWithSomeTabs]))
		should(isValidState(prevState)).beTrue()

		// TODO: what should happen when we create an already existing window?
	}

	public async 'should remove one window'() {
		// unsaved
		let prevState = createState([
			createWindow(1, 1),
			createWindow(1, 2, { status: 'saved' }),
		])
		// should remove a normal window
		prevState = windowReducers.onRemoved(1)(prevState)
		should(prevState)
			.deepEqual(createState([createWindow(1, 2, { status: 'saved' })]))
		should(isValidState(prevState)).beTrue()

		// should re-id a saved window, and mark as saved, and not remove
		// TODO: mock id creation
		prevState = windowReducers.onRemoved(2)(prevState)
		should(Object.values(prevState.windows)).haveLength(1)
		should(isValidState(prevState)).beTrue()
	}

	/*
	  handled by app
	  public async 'should open a saved window'() {
		  let prevState = createState([
			  createWindow(1, 100),
			  createWindow(1, 'asdf', { status: 'saved' }),
		  ])

		  const originalTab = createTab(201, 0, 'asdf', 'http://google.com', { status: 'saved' })
		  const savedTab = createTab(201, 0, 200, createRestoreUrl(originalTab), { status: 'saved' })
		  const restoredWindow = createWindow([savedTab], 200)

		  // should remove the window with the old random id
		  // and replace with browser-provided id
		  // tabs should be updated as well
		  prevState = windowReducers.onCreated(restoredWindow)(prevState)
		  should(Object.entries(prevState.windows)).haveLength(2)
		  should(prevState.windows[200]).deepEqual(restoredWindow)
		   should(isValidState(prevState)).beTrue()
	  }

	  public async 'should open a new tab in a new window'() {
		  chrome.tabs.create.yields([1, 2])
		  should(chrome.tabs.create.notCalled).beOkay()

		  const savedUnopenedTab = { ...defaultTab }
		  await restoreTab(savedUnopenedTab)
		  should(chrome.tabs.create.calledOnce).beOkay()
		  // should(chrome.tabs.create.withArgs({ url, focused: true, type: 'normal' }).calledOnce)
		  //		.beOkay()
	  }
	*/
}
