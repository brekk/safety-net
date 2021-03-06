import {curry, pipe} from 'f-utility'
import {GuidedLeft} from './future/guided-left'
import {GuidedRight} from './future/guided-right'
import {expectFunctionProps} from './errors/expect-function-props'
import {rejectNonFunctions} from './assertions/reject-non-functions'

/**
 * @method safeRailInputs
 * @param {Object} inputs - an object of inputs
 * @return {string[]} array of strings
 * @private
 */
const safeRailInputs = pipe(
  rejectNonFunctions,
  Object.keys
)

/**
 * Add safety to your pipelines!
 * @method anchor
 * @param {function} assertion - boolean-returning function
 * @param {function} wrongPath - function invoked if the inputs are bad
 * @param {*} input - any input
 * @returns {GuidedRight|GuidedLeft} Left / Right -wrapped value
 * @public
 */
export const anchor = curry(
  function ＸＸＸanchor(assertion, wrongPath, input) {
    if (input == null) {
      return GuidedLeft(new Error(`anchor: Expected to be given non-null input.`))
    }
    const issues = safeRailInputs({assertion, wrongPath})
    if (issues.length > 0) {
      return GuidedLeft(expectFunctionProps(`anchor`, issues))
    }
    return (
      assertion(input) ?
      GuidedRight :
      pipe(wrongPath, GuidedLeft)
    )(input)
  }
)
