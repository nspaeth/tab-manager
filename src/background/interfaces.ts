import { Stream } from 'xstream'
import { DriverSinks, IDriverSources } from './drivers'

import { StateSource } from 'cycle-onionify'

export interface IState {
	count: number
	windows: { [k: string]: IWindow }
	recentlyClosed: ITab[]
}

export type ReducerFactory = (...payload: any[]) => Reducer
export interface IReducerFactoryMap { [k: string]: ReducerFactory }

export type Reducer = (prev?: IState) => IState // | undefined
export type Sources = IDriverSources & { onion: StateSource<IState> }
export type Sinks = DriverSinks & { onion: Stream<Reducer> } // & { count: Stream<any> }

import { IMessage, IMeta, ITab, IWindow } from '../interfaces'
export { IMessage, IMeta, ITab, IWindow }
