import Future from 'fluture'
import {map, pipe, I, curry, fork} from 'f-utility'
// import {sideEffect} from 'xtrace'
import {anchor} from './anchor'
import {allPropsAreFunctions} from './assertions/all-props-are-functions'
import {rejectNonFunctions} from './assertions/reject-non-functions'
import {judgeObject} from './assertions/judge-object'
import {expectFunctionProps} from './errors/expect-function-props'
// const xtrace = sideEffect(console.log)

/**
 * @method safeWarn
 * @param {string} scope - scope input for potential warning
 * @param {*} input - anything
 * @returns {*} any
 * @private
 */
const safeWarn = curry((scope, input) => judgeObject({
  deliberation: I,
  jury: expectFunctionProps(scope),
  law: rejectNonFunctions,
  input
}))
/**
 * @method safetyNet
 * @param {function} assertion - a function to test the input with
 * @param {function} wrongPath - a function to prepare data before it passes into the Left path
 * @param {function} rightPath - a function to modify after it passes into the Right path
 * @param {*} input - any input
 * @returns {GuidedLeft|GuidedRight} a Future
 * @public
 */
export const safetyNet = curry(
  (assertion, wrongPath, rightPath, input) => new Future((reject, resolve) => {
    const expectations = {assertion, wrongPath, rightPath}
    if (!allPropsAreFunctions(expectations)) {
      return reject(safeWarn(`safetyNet`, expectations))
    }
    return pipe(
      // xtrace(`input`, I),
      anchor(assertion, wrongPath),
      // xtrace(`anchored`, (x) => x._value),
      map(rightPath),
      // xtrace(`chained?`, (x) => x._spawn._value),
      fork(reject, resolve)
    )(input)
  })
)
