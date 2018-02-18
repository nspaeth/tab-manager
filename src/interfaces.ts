// https://gist.github.com/NaridaL/0f79614cf5b1a8aa0d48d2dc43f60209
/**
 * for literal unions
 * @example Sub<'Y' | 'X', 'X'> // === 'Y'
 */
export type Sub<O extends string, D extends string>
	= {[K in O]: (Record<D, never> & Record<string, K>)[K]}[O]

/**
 * Remove the keys represented by the string union type D from the object type O.
 *
 * @example Dissoc<{a: number, b: string}, 'a'> // === {b: string}
 * @example Dissoc<{a: number, b: string}, keyof {a: number}> // === {b: string}
 */
export type Dissoc<O, D extends string> = Pick<O, Sub<keyof O, D>>

import { IMessage } from 'cycle-web-extensions'
export type MessageType = string // 'app' | 'tabs' | 'windows'
export type IMessage = IMessage

export type statuses = 'saved' | 'active'
export interface IMeta<Status = statuses> {
	status: Status
	keywords?: string[]
}

export type ITab<Status = statuses> = Dissoc<browser.tabs.Tab, 'id' | 'url'> & {
	id: string | number
	meta: IMeta<Status>
	url: string,
}

// type IWindow = browser.windows.Window & { meta: Meta, tabs: ITab[] }
// TODO: meta should always be merged, not replaced
// type Window = browser.windows.Window

export type IWindow<Status = statuses> = Dissoc<browser.windows.Window, 'id' | 'tabs'> & {
	id: string | number
	tabs: Array<ITab<Status>> // ITab<Status>[]
	meta: IMeta<Status>,
}
