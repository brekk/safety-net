import {promise} from 'fluture'
import {curry} from 'katsu-curry'

/* global expect */
export const t = {
  plan: (x) => expect.assertions(x),
  is: (a, b) => expect(a).toBe(b),
  not: (a, b) => expect(a).not.toBe(b),
  deepEqual: (a, b) => expect(a).toEqual(b),
  notDeepEqual: (a, b) => expect(a).not.toEqual(b),
  truthy: (x) => expect(x).toBeTruthy(),
  true: (x) => expect(x).toBe(true),
  falsy: (x) => expect(x).toBeFalsy(),
  false: (x) => expect(x).toBe(false),
  throws: (x, y) => expect(x).toThrow(y)
}

t.rejectsF = curry((x, bad) => (
  promise(x.bimap(bad, (e) => { throw new Error(`Expected to be in the fail path: ${e}`) }))
))
t.resolvesF = curry((x, good) => (
  promise(x).then(good).catch((e) => { throw new Error(`Expected to be in the good path: ${e}`) })
))
