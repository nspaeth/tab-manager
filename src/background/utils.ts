import { ITab } from './interfaces'

const sampleSize = require('lodash/sampleSize')

const letters = 'abcdefghijklmrstuvwlyxABCDEFGHIJKLMNOPQRSTUVWXYZ'
const safeChars = letters + '1234567890!$-_' // *-_.,|`~^"\''
export function randomId() {
	return sampleSize(1, letters).concat(sampleSize(safeChars, 7)).join('')
}

export function insertAt<T>(arr: T[], idx: number, item: T) {
	return [...arr.slice(0, idx), item, ...arr.slice(idx, arr.length)]
}

export const reindexTabs = (tabs: ITab[]) => tabs.map((tab, idx) => ({ ...tab, index: idx }))

export function replaceMatching<T>(arr: T[], matchFn: any, replacement: T) {
	return arr.map((value, key) => matchFn(value, key) ? replacement : value)
}

export function moveArrayItem<T>(arr: T[], fromIndex: number, toIndex: number): T[] {
	arr.splice(toIndex, 0, arr.splice(fromIndex, 1)[0])
	return arr
}
