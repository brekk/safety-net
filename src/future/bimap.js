import {e2} from 'entrust'

/**
 * @method bimap
 * @param {function} rejectionMap - do something if function receives a rejection
 * @param {function} resolutionMap - do something if function receives a resolution
 * @param {Future} future - a Future(value)
 * @returns {Future} a mapped future
 * @public
 */
export const bimap = e2(`bimap`)
