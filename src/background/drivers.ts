const browser = require('webextension-polyfill')
declare var window: any
window.browser = browser
import { timeDriver } from '@cycle/time'
const storageDriver = require('@cycle/storage').default // TODO PR to add missing typings

import {
	IMessagesSource,
	makeMessagesDriver,
	makeTabDriver,
	makeWindowDriver,
} from 'cycle-web-extensions'

export function makeDrivers() {
	return {
		messages: makeMessagesDriver({ shouldInitiate: false }),
		windows: makeWindowDriver({ createListeners: true }),
		tabs: makeTabDriver({ createListeners: true }),
		time: timeDriver,
		storage: storageDriver,
	}
}

export interface IDriverSources {
	windows: IMessagesSource // IWindowDriver
	tabs: IMessagesSource // ITabDriver
	messages: IMessagesSource
}

export type DriverSinks = Partial<{
	windows: IMessagesSource // IMessagesSink // IWindowDriver
	tabs: IMessagesSource // IMessagesSink // ITabDriver
	messages: IMessagesSource, // IMessagesSink
}>

export type Component = (s: IDriverSources) => DriverSinks
