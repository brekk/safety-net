import {isFuture, Future} from 'fluture'
import {chain, map, curry} from 'f-utility'

const syncCase = curry((anchors, input) => new Future((reject, resolve) => {
  for (let a = 0; a < anchors.length; a++) {
    let [assertion, fail] = anchors[a]
    if (!assertion(input)) {
      return reject(fail(input))
    }
  }
  return resolve(input)
}))

const asyncCase = curry((anchors, input) => new Future((reject, resolve) => {
  for (let a = 0; a < anchors.length; a++) {
    let [assertion, fail] = anchors[a]
    if (!assertion(input)) {
      return reject(fail(input))
    }
  }
  return resolve(input)
}))

/**
 * tie multiple assertions some input
 * @method tether
 * @param {functions[]} anchors - an array of [assertion, failCase] pairs
 * @param {function} goodPath - what to do if things go well
 * @param {*} input - whatever
 * @returns {GuidedLeft|GuidedRight} - a Future
 * @public
 */
export const tether = curry(
  function _tether(anchors, goodPath, input) {
    return map(goodPath, (
      isFuture(input) ?
      chain(asyncCase(anchors), input) :
      syncCase(anchors, input)
    ))
  }
)
