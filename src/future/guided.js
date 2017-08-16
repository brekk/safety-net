import {curry} from 'f-utility'
import {isFuture} from 'fluture'

export const guided = curry(function guide(direction, x) {
  return (
    isFuture(x) ?
    x :
    direction(x)
  )
})
