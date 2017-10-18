import { makeDOMDriver } from '@cycle/dom'
import { timeDriver } from '@cycle/time'
const browser = require('webextension-polyfill')
declare var window: any
window.browser = browser

// TODO: PR to add missing typings
const storageDriver = require('@cycle/storage').default
import { makeMessagesDriver } from 'cycle-web-extensions'

export function mkDrivers() {
	return {
		DOM: makeDOMDriver('#app'),
		messages: makeMessagesDriver({ shouldInitiate: true }),
		time: timeDriver,
		storage: storageDriver,
	}
}
