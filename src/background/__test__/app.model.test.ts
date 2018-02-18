import { should } from 'fuse-test-runner'
import { appReducers } from '../app.model'
import { createState, createWindow, isValidState } from './model.tests'

export class AppModelTest {
	public async 'should move tab within window'() {}
	public async 'should move tab between 2 active windows'() {}
	public async 'should move tab between 2 saved windows'() {}
	public async 'should move tab from active window to saved window'() {}
	public async 'should move tab from saved window to active window'() {}
	public async 'should move tab from window to nothing creates new window'() {}
	public async 'should save window and all tabs'() {
		let prevState = createState([
			createWindow(3, 200, { status: 'active' }),
			createWindow(3, 300, { status: 'saved' }),
			createWindow(3, 400, { status: 'active' }),
		])

		// save non-existent window should do nothing
		prevState = appReducers.saveWindow(500)(prevState)
		should(isValidState(prevState)).beTrue()
		should(prevState.windows[300].tabs).haveLength(3)
		should(prevState.windows[200].tabs).haveLength(3)
		should(Object.entries(prevState.windows)).haveLength(3)
		should(prevState.windows[200].meta.status).equal('active')
		should(prevState.windows[300].meta.status).equal('saved')
		should(prevState.windows[400].meta.status).equal('active')

		// save already saved window should do nothing
		prevState = appReducers.saveWindow(300)(prevState)
		should(isValidState(prevState)).beTrue()
		should(prevState.windows[300].tabs).haveLength(3)
		should(prevState.windows[200].tabs).haveLength(3)
		should(Object.entries(prevState.windows)).haveLength(3)
		should(prevState.windows[200].meta.status).equal('active')
		should(prevState.windows[300].meta.status).equal('saved')
		should(prevState.windows[400].meta.status).equal('active')

		// unsaved window should become saved
		prevState = appReducers.saveWindow(200)(prevState)
		should(isValidState(prevState)).beTrue()
		should(prevState.windows[300].tabs).haveLength(3)
		should(prevState.windows[200].tabs).haveLength(3)
		should(Object.entries(prevState.windows)).haveLength(3)
		should(prevState.windows[200].meta.status).equal('saved')
		should(prevState.windows[300].meta.status).equal('saved')
		should(prevState.windows[400].meta.status).equal('active')
	}

	public async 'should restore window and all tabs'() {
		let prevState = createState([
			createWindow(3, 200, { status: 'saved' }),
			createWindow(3, 300, { status: 'saved' }),
			createWindow(3, 400, { status: 'active' }),
		])

		// restoring non-existent window should do nothing
		prevState = appReducers.restoreWindow(500)(prevState)
		should(isValidState(prevState)).beTrue()
		should(prevState.windows[300].tabs).haveLength(3)
		should(prevState.windows[200].tabs).haveLength(3)
		should(Object.entries(prevState.windows)).haveLength(3)
		should(prevState.windows[200].meta.status).equal('saved')
		should(prevState.windows[300].meta.status).equal('saved')
		should(prevState.windows[400].meta.status).equal('active')

		// restoring already active window should do nothing
		prevState = appReducers.restoreWindow(400)(prevState)
		should(isValidState(prevState)).beTrue()
		should(prevState.windows[300].tabs).haveLength(3)
		should(prevState.windows[200].tabs).haveLength(3)
		should(Object.entries(prevState.windows)).haveLength(3)
		should(prevState.windows[200].meta.status).equal('saved')
		should(prevState.windows[300].meta.status).equal('saved')
		should(prevState.windows[400].meta.status).equal('active')

		// saved window should become active
		prevState = appReducers.restoreWindow(300)(prevState)
		should(isValidState(prevState)).beTrue()
		should(prevState.windows[300].tabs).haveLength(3)
		should(prevState.windows[200].tabs).haveLength(3)
		should(Object.entries(prevState.windows)).haveLength(3)
		should(prevState.windows[200].meta.status).equal('saved')
		should(prevState.windows[300].meta.status).equal('active')
		should(prevState.windows[400].meta.status).equal('active')
	}

	public async 'should completely remove window'() {
		// remove window, whether saved or not
		let prevState = createState([
			createWindow(3, 200, { status: 'saved' }),
			createWindow(3, 300, { status: 'saved' }),
			createWindow(3, 400, { status: 'active' }),
			createWindow(3, 500, { status: 'active' }),
		])

		// destroying non-existent window should do nothing
		prevState = appReducers.destroyWindow(100)(prevState)
		should(isValidState(prevState)).beTrue()
		should(Object.entries(prevState.windows)).haveLength(4)
		should(prevState.windows[200].meta.status).equal('saved')
		should(prevState.windows[300].meta.status).equal('saved')
		should(prevState.windows[400].meta.status).equal('active')
		should(prevState.windows[500].meta.status).equal('active')

		// restoring already active window should do nothing
		prevState = appReducers.destroyWindow(400)(prevState)
		should(isValidState(prevState)).beTrue()
		should(Object.entries(prevState.windows)).haveLength(3)
		should(prevState.windows[200].meta.status).equal('saved')
		should(prevState.windows[300].meta.status).equal('saved')
		should(prevState.windows[500].meta.status).equal('active')

		// saved window should become active
		prevState = appReducers.destroyWindow(300)(prevState)
		should(isValidState(prevState)).beTrue()
		should(Object.entries(prevState.windows)).haveLength(2)
		should(prevState.windows[200].meta.status).equal('saved')
		should(prevState.windows[500].meta.status).equal('active')
	}

	public async 'should completely remove a tab'() {
		// remove tab, whether saved or not
		let prevState = createState([
			createWindow(3, 200, { status: 'saved' }),
			createWindow(3, 500, { status: 'active' }),
		])

		// destroying non-existent tab should do nothing
		prevState = appReducers.destroyTab(205)(prevState)
		should(isValidState(prevState)).beTrue()
		should(Object.entries(prevState.windows)).haveLength(2)
		should(prevState.windows[200].tabs.map(tab => tab.id)).deepEqual([201, 202, 203])
		should(prevState.windows[500].meta.status).equal('active')
		should(prevState.windows[500].tabs).haveLength(3)

		// remove middle tab
		prevState = appReducers.destroyTab(202)(prevState)
		should(isValidState(prevState)).beTrue()
		should(Object.entries(prevState.windows)).haveLength(2)
		should(prevState.windows[200].tabs.map(tab => tab.id)).deepEqual([201, 203])
		should(prevState.windows[200].meta.status).equal('saved')
		should(prevState.windows[500].meta.status).equal('active')
		should(prevState.windows[500].tabs).haveLength(3)

		// remove last tab
		prevState = appReducers.destroyTab(203)(prevState)
		should(isValidState(prevState)).beTrue()
		should(Object.entries(prevState.windows)).haveLength(2)
		should(prevState.windows[200].tabs.map(tab => tab.id)).deepEqual([201])
		should(prevState.windows[200].meta.status).equal('saved')
		should(prevState.windows[500].meta.status).equal('active')
		should(prevState.windows[500].tabs).haveLength(3)

		// remove only tab should also remove window
		// in this don't wait for onRemoved to be called by browser
		// because it might be a saved window that doesn't have a browser
		// window to close
		prevState = appReducers.destroyTab(201)(prevState)
		should(isValidState(prevState)).beTrue()
		should(Object.entries(prevState.windows)).haveLength(1)
		should(prevState.windows[500].meta.status).equal('active')
		should(prevState.windows[500].tabs).haveLength(3)
	}
}
