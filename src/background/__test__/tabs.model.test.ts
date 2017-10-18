import { should } from 'fuse-test-runner'
import { tabReducers } from '../tabs.model'
import { createState, createTab, createWindow, isValidState } from './model.tests'

export class TabModelTest {
	public async 'should create new tab'() {
		let prevState = createState([
			createWindow([createTab(102, 0, 100)], 100),
			// createWindow(1, 100)
		])
		// in existing window
		// insert into the beginning
		prevState = tabReducers.onCreated(createTab(103, 0, 100))(prevState)
		should(Object.entries(prevState.windows)).haveLength(1)
		should(isValidState(prevState)).beTrue()
		should(prevState.windows[100].tabs)
			.beOkay()
			.beArray()
			.haveLength(2)
		should(prevState.windows[100].tabs.map(tab => tab.id)).deepEqual([103, 102])

		// into the middle
		prevState = tabReducers.onCreated(createTab(104, 1, 100))(prevState)
		should(Object.entries(prevState.windows)).haveLength(1)
		should(isValidState(prevState)).beTrue()
		should(prevState.windows[100].tabs)
			.beOkay()
			.beArray()
			.haveLength(3)
		should(prevState.windows[100].tabs.map(tab => tab.id)).deepEqual([103, 104, 102])

		// into the end
		prevState = tabReducers.onCreated(createTab(105, 3, 100))(prevState)
		should(Object.entries(prevState.windows)).haveLength(1)
		should(isValidState(prevState)).beTrue()
		should(prevState.windows[100].tabs)
			.beOkay()
			.beArray()
			.haveLength(4)
		should(prevState.windows[100].tabs.map(tab => tab.id)).deepEqual([103, 104, 102, 105])
	}

	public async 'should remove unsaved tab'() {
		let prevState = createState([
			createWindow(5, 100),
			// createWindow(1, 100)
		])
		// in an active window
		// from beginning
		prevState = tabReducers.onRemoved(101)(prevState)
		should(isValidState(prevState)).beTrue()
		should(prevState.windows[100].tabs).beArray().haveLength(4)
		should(prevState.windows[100].tabs.map(tab => tab.id)).deepEqual([102, 103, 104, 105])

		// from end
		prevState = tabReducers.onRemoved(105)(prevState)
		should(isValidState(prevState)).beTrue()
		should(prevState.windows[100].tabs).beArray().haveLength(3)
		should(prevState.windows[100].tabs.map(tab => tab.id)).deepEqual([102, 103, 104])

		// non-existent
		prevState = tabReducers.onRemoved(105)(prevState)
		should(isValidState(prevState)).beTrue()
		should(prevState.windows[100].tabs).beArray().haveLength(3)
		should(prevState.windows[100].tabs.map(tab => tab.id)).deepEqual([102, 103, 104])

		// from middle
		prevState = tabReducers.onRemoved(103)(prevState)
		should(isValidState(prevState)).beTrue()
		should(prevState.windows[100].tabs).beArray().haveLength(2)
		should(prevState.windows[100].tabs.map(tab => tab.id)).deepEqual([102, 104])
	}

	public async 'should not remove saved tab'() {
		let prevState = createState([
			createWindow(
				[createTab(101, 0, 100, 'http://google.com', { status: 'saved' })],
				100,
				{ status: 'saved' },
			),
		])
		prevState = tabReducers.onRemoved(101)(prevState)
		should(isValidState(prevState)).beTrue()
		should(prevState.windows[100].tabs).beArray().haveLength(1)
		should(prevState.windows[100].tabs[0].meta.status).equal('saved')
	}

	public async 'should attach tab to window'() {
		let prevState = createState([
			createWindow(1, 100),
			createWindow(3, 200, { status: 'saved' }),
			createWindow(3, 300, { status: 'active' }),
		])

		// attach to end
		prevState = tabReducers.onAttached(301, { newWindowId: 100, index: 1 })(prevState)
		should(isValidState(prevState)).beTrue()
		should(Object.entries(prevState.windows)).haveLength(3)
		// attached Window should increase
		should(prevState.windows[100].tabs).haveLength(2)
		// previous window should still have tab until onDetached
		should(prevState.windows[300].tabs).haveLength(3)
		should(prevState.windows[100].tabs.map(tab => tab.id)).deepEqual([101, 301])

		// attach to middle
		prevState = tabReducers.onAttached(302, { newWindowId: 100, index: 1 })(prevState)
		should(isValidState(prevState)).beTrue()
		should(Object.entries(prevState.windows)).haveLength(3)
		should(prevState.windows[100].tabs).haveLength(3)
		should(prevState.windows[300].tabs).haveLength(3)

		// attach to middle
		prevState = tabReducers.onAttached(303, { newWindowId: 100, index: 0 })(prevState)
		should(isValidState(prevState)).beTrue()
		should(Object.entries(prevState.windows)).haveLength(3)
		should(prevState.windows[100].tabs).haveLength(4)
		should(prevState.windows[300].tabs).haveLength(3)
		should(prevState.windows[100].tabs.map(tab => tab.id)).deepEqual([303, 101, 302, 301])

		// attach to saved
		prevState = tabReducers.onAttached(101, { newWindowId: 200, index: 0 })(prevState)
		should(isValidState(prevState)).beTrue()
		should(Object.entries(prevState.windows)).haveLength(3)
		should(prevState.windows[100].tabs).haveLength(4)
		should(prevState.windows[300].tabs).haveLength(3)
		should(prevState.windows[200].tabs.map(tab => tab.id)).deepEqual([101, 201, 202, 203])
	}

	public async 'should detach tab'() {
		let prevState = createState([
			createWindow(3, 100, { status: 'saved' }),
			createWindow(3, 200, { status: 'active' }),
			createWindow(3, 300, { status: 'active' }),
		])

		// detach from wrong window should do nothing
		prevState = tabReducers.onDetached(302, { oldWindowId: 200 })(prevState)
		should(isValidState(prevState)).beTrue()
		should(prevState.windows[300].tabs).haveLength(3)
		should(prevState.windows[200].tabs).haveLength(3)
		should(Object.entries(prevState.windows)).haveLength(3)

		// detach from middle of 300
		prevState = tabReducers.onDetached(302, { oldWindowId: 300 })(prevState)
		should(isValidState(prevState)).beTrue()
		// detached window should have fewer tabs
		should(prevState.windows[300].tabs).haveLength(2)
		// should not have detached tab
		should(prevState.windows[300].tabs.map(tab => tab.id).includes(302)).beFalse()
		// other windows shouldn't be affected
		should(prevState.windows[200].tabs).haveLength(3)
		should(Object.entries(prevState.windows)).haveLength(3)

		// detach from end of 300
		prevState = tabReducers.onDetached(303, { oldWindowId: 300 })(prevState)
		should(isValidState(prevState)).beTrue()
		// detached window should have fewer tabs
		should(prevState.windows[300].tabs).haveLength(1)
		// should not have detached tab
		should(prevState.windows[300].tabs.map(tab => tab.id).includes(303) ||
			prevState.windows[300].tabs.map(tab => tab.id).includes(302)).beFalse()
		// other windows shouldn't be affected
		should(Object.entries(prevState.windows)).haveLength(3)
		should(prevState.windows[200].tabs).haveLength(3)

		// from beginning of 200
		prevState = tabReducers.onDetached(201, { oldWindowId: 200 })(prevState)
		should(isValidState(prevState)).beTrue()
		// detached window should have fewer tabs
		should(prevState.windows[200].tabs).haveLength(2)
		// should not have detached tab
		should(prevState.windows[200].tabs.map(tab => tab.id).includes(201)).beFalse()
		// other windows shouldn't be affected
		should(prevState.windows[300].tabs).haveLength(1)
		should(Object.entries(prevState.windows)).haveLength(3)

		// last tab of 300
		prevState = tabReducers.onDetached(301, { oldWindowId: 300 })(prevState)
		should(isValidState(prevState)).beTrue()
		// detached window should have fewer tabs
		should(prevState.windows[300].tabs).haveLength(0)
		// should not have detached tab
		should(prevState.windows[300].tabs.map(tab => tab.id).includes(302)).beFalse()
		// other windows shouldn't be affected
		// window shouldn't be removed until window.onRemoved
		should(prevState.windows[200].tabs).haveLength(2)
		should(Object.entries(prevState.windows)).haveLength(3)

		// // from saved window -- should this even work?
		// // --- save causes remove & detach (when we don't want to detach),
		// // --- but D&D would also cause detach (which we do want)
		// // TODO: make save fire first, and detach always runs
		prevState = tabReducers.onDetached(101, { oldWindowId: 100 })(prevState)
		should(isValidState(prevState)).beTrue()
		// detached window should have fewer tabs
		should(prevState.windows[100].tabs).haveLength(2)
		// should not have detached tab
		should(prevState.windows[100].tabs.map(tab => tab.id).includes(101)).beFalse()
		// other windows shouldn't be affected
		// window shouldn't be removed until window.onRemoved

		should(Object.entries(prevState.windows)).haveLength(3)
	}

	public async 'should detach tab from inactive window'() {
		// should(false).beTrue()
	}

	public async 'should move tab within window'() {
		let prevState = createState([
			createWindow(3, 200, { status: 'active' }),
			createWindow(3, 300, { status: 'active' }),
		])

		// move from wrong window should do nothing
		prevState = tabReducers.onMoved(302, { windowId: 200, fromIndex: 1, toIndex: 2 })(prevState)
		should(isValidState(prevState)).beTrue()
		should(prevState.windows[300].tabs).haveLength(3)
		should(prevState.windows[200].tabs).haveLength(3)
		should(Object.entries(prevState.windows)).haveLength(2)
		should(prevState.windows[300].tabs.map(tab => tab.id)).deepEqual([301, 302, 303])

		// move to same position should do nothing
		prevState = tabReducers.onMoved(302, { windowId: 300, fromIndex: 1, toIndex: 1 })(prevState)
		should(isValidState(prevState)).beTrue()
		should(prevState.windows[300].tabs).haveLength(3)
		should(prevState.windows[200].tabs).haveLength(3)
		should(Object.entries(prevState.windows)).haveLength(2)
		should(prevState.windows[300].tabs.map(tab => tab.id)).deepEqual([301, 302, 303])

		// move to back, from front
		prevState = tabReducers.onMoved(301, { windowId: 300, fromIndex: 0, toIndex: 2 })(prevState)
		should(isValidState(prevState)).beTrue()
		should(prevState.windows[300].tabs).haveLength(3)
		should(prevState.windows[200].tabs).haveLength(3)
		should(Object.entries(prevState.windows)).haveLength(2)
		should(prevState.windows[300].tabs.map(tab => tab.id)).deepEqual([302, 303, 301])

		// move to front, from back
		prevState = tabReducers.onMoved(301, { windowId: 300, fromIndex: 2, toIndex: 0 })(prevState)
		should(isValidState(prevState)).beTrue()
		should(prevState.windows[300].tabs).haveLength(3)
		should(prevState.windows[200].tabs).haveLength(3)
		should(Object.entries(prevState.windows)).haveLength(2)
		should(prevState.windows[300].tabs.map(tab => tab.id)).deepEqual([301, 302, 303])

		// move front to middle
		prevState = tabReducers.onMoved(301, { windowId: 300, fromIndex: 0, toIndex: 1 })(prevState)
		should(isValidState(prevState)).beTrue()
		should(prevState.windows[300].tabs).haveLength(3)
		should(prevState.windows[200].tabs).haveLength(3)
		should(Object.entries(prevState.windows)).haveLength(2)
		should(prevState.windows[300].tabs.map(tab => tab.id)).deepEqual([302, 301, 303])

		// move from middle to front
		prevState = tabReducers.onMoved(301, { windowId: 300, fromIndex: 1, toIndex: 0 })(prevState)
		should(isValidState(prevState)).beTrue()
		should(prevState.windows[300].tabs).haveLength(3)
		should(prevState.windows[200].tabs).haveLength(3)
		should(Object.entries(prevState.windows)).haveLength(2)
		should(prevState.windows[300].tabs.map(tab => tab.id)).deepEqual([301, 302, 303])
	}
}
