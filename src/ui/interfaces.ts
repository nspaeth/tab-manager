import { DOMSource, VNode } from '@cycle/dom'
import { IMessagesSource } from 'cycle-web-extensions'
import { Stream } from 'xstream'

export interface IDriverSources {
	DOM: DOMSource
	windows: IMessagesSource // IWindowDriver
	tabs: IMessagesSource // ITabDriver
	messages: IMessagesSource, // IMessagesDriver,
}

export type DriverSinks = Partial<{
	DOM: Stream<VNode>
	windows: IMessagesSource // IWindowDriver
	tabs: IMessagesSource // ITabDriver
	messages: IMessagesSource, // IMessagesDriver,
}>

export type Component = (s: IDriverSources) => DriverSinks

import { IMessage, IMeta, ITab, IWindow } from '../interfaces'
export { IMessage, IMeta, ITab, IWindow }
