/* global test */
import Future from 'fluture'
import {reject as notFilter, isFunction} from 'f-utility'
import {t} from './test-helpers'
// import {trace} from 'xtrace'
// import K from 'ramda/src/always'
// import identity from 'ramda/src/identity'
import * as X from './index'

const zort = (x) => x.sort() // eslint-disable-line fp/no-mutating-methods

const SN = `safetyNet -`

/* eslint-disable fp/no-unused-expression */
test(`${SN} published module should have access to all keys`, () => {
  t.deepEqual(
    zort(
      Object.keys(X)
    ),
    zort(
      [
        `GuidedLeft`,
        `GuidedRight`,
        `anchor`,
        `ap`,
        `bimap`,
        `chain`,
        `fold`,
        `fork`,
        `guided`,
        `tether`,
        `version`,
        `map`,
        `safetyNet`
      ]
    )
  )
  t.deepEqual(
    Object.keys(notFilter(isFunction, X)),
    [`version`]
  )
})

test(`${SN} JSON.parse`, (done) => {
  t.plan(4)
  t.is(typeof X, `object`)
  t.is(typeof X.safetyNet, `function`)
  t.throws(
    () => {
      JSON.parse(``)
    },
    `Unexpected end of JSON input`
  )
  const errorFunction = (x) => {
    return new Future((reject) => {
      setTimeout(() => {
        reject(`Expected json, but got: ${x}`)
      }, 100)
    })
  }
  const safeParse = X.safetyNet(
    (input) => (
      typeof input === `string` &&
      input.length > 1 &&
      input[0] === `{` &&
      input[input.length - 1] === `}`
    ),
    errorFunction,
    JSON.parse
  )
  const fail = (v) => {
    t.deepEqual(v, `Expected json, but got: !`)
  }
  safeParse(`!`).fork(fail, (e) => {
    // this should be an error case, b/c `!` is not valid json
    t.falsy(e)
  })
  // t.deepEqual(safeParse(`{}`), GuidedRight({}))
  safeParse(`{"cool": "bananas"}`).fork((e) => {
    t.falsy(e)
  }, (v) => {
    t.deepEqual(v, {cool: `bananas`})
    done()
  })
})

const unscrupulousBartender = (raw) => {
  const user = {...raw}
  /* eslint-disable fp/no-mutation */
  /* eslint-disable fp/no-mutating-methods */
  user.cash -= 5
  user.beverages = user.beverages || []
  user.beverages.push(`beer`)
  /* eslint-enable fp/no-mutation */
  /* eslint-enable fp/no-mutating-methods */
  return user
}

// let's establish our basic expectations
const usersShouldBe21 = ({age}) => {
  return age > 20
}
const usersShouldHaveCashToCoverABeer = (user) => {
  const {cash} = user
  return (cash - 5 >= 0)
}

// and the errors we have
const warnYoungsters = (user) => {
  return `Expected ${user.name} to be 21!`
}
const warnWouldBeDebtors = (user) => {
  return `Expected ${user.name} to have at least 5 dollars!`
}

const cashAndAgeSafeBartender = X.tether(
  [
    [usersShouldBe21, warnYoungsters],
    [usersShouldHaveCashToCoverABeer, warnWouldBeDebtors]
  ],
  unscrupulousBartender
)
const resetUsers = () => ({
  alice: {name: `alice`, cash: 15, age: 22},
  jimmy: {name: `jimmy`, cash: 20, age: 20}
})

test(`${SN} literate example - jimmy`, (done) => {
  t.plan(1)
  const {jimmy} = resetUsers()
  t.rejectsF(cashAndAgeSafeBartender(jimmy), (x) => {
    t.is(x, `Expected jimmy to be 21!`)
    done()
  })
})

test(`${SN} literate example - alice`, (done) => {
  t.plan(1)
  const {alice} = resetUsers()
  const alice1 = cashAndAgeSafeBartender(alice)
  t.resolvesF(alice1, (x) => {
    t.deepEqual(x, {
      age: 22,
      beverages: [`beer`],
      cash: 10,
      name: `alice`
    })
    done()
  })
})
test(`${SN} literate example - alice2`, (done) => {
  t.plan(1)
  const alice1 = {
    age: 22,
    beverages: [`beer`],
    cash: 10,
    name: `alice`
  }
  const alice2 = cashAndAgeSafeBartender(alice1)
  t.resolvesF(alice2, (x) => {
    t.deepEqual(x, {
      age: 22,
      beverages: [`beer`, `beer`],
      cash: 5,
      name: `alice`
    })
    done()
  })
})
test(`${SN} literate example - alice3`, (done) => {
  t.plan(1)
  const alice2 = {
    age: 22,
    beverages: [`beer`, `beer`],
    cash: 5,
    name: `alice`
  }
  const alice3 = cashAndAgeSafeBartender(alice2)
  t.resolvesF(alice3, (x) => {
    t.deepEqual(x, {
      age: 22,
      beverages: [`beer`, `beer`, `beer`],
      cash: 0,
      name: `alice`
    })
    done()
  })
})

test(`${SN} literate example - alice4`, (done) => {
  t.plan(1)
  const alice3 = {
    age: 22,
    beverages: [`beer`, `beer`, `beer`],
    cash: 0,
    name: `alice`
  }
  const alice4 = cashAndAgeSafeBartender(alice3)
  alice4.fork((x) => {
    t.is(x, `Expected alice to have at least 5 dollars!`)
    done()
  }, (e) => {
    console.log(`this shouldn't print`, e)
    t.truthy(false)
  })
})

test(`${SN} literate example - future(alice)`, (done) => {
  t.plan(1)
  const alice3 = Future.of({
    age: 22,
    beverages: [`beer`, `beer`, `beer`],
    cash: 0,
    name: `alice`
  })
  const alice4 = cashAndAgeSafeBartender(alice3)
  alice4.fork((x) => {
    t.is(x, `Expected alice to have at least 5 dollars!`)
    done()
  }, (e) => {
    console.log(`this shouldn't print`, e)
    t.truthy(false)
  })
})

/* eslint-enable fp/no-unused-expression */
