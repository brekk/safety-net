/* global test */
import {Future, reject} from 'fluture'
import {random, prop, K, pipe, I as identity} from 'f-utility'
import {t} from './test-helpers'
import {
  GuidedRight,
  GuidedLeft,
  anchor,
  safetyNet,
  fork,
  tether
} from './index'

/* eslint-disable fp/no-mutation */
random.keyValue = (x = 10) => (
  [random.word(x), random.floorMin(1, x)]
)
/* eslint-enable fp/no-mutation */

/* eslint-disable fp/no-unused-expression */

test(`GuidedRight should behave like Future.of given non-Future inputs`, (done) => {
  t.plan(3)
  const input = random.word(10)
  const r = GuidedRight(input)
  const r2 = GuidedRight(GuidedLeft(`error: wrapper`))
  const r3 = GuidedRight(GuidedRight(input))
  t.resolvesF(r, (g) => {
    t.is(g, input)
  })
  t.rejectsF(r2, (g) => {
    t.is(g, `error: wrapper`)
  })
  t.resolvesF(r3, (g) => {
    t.is(g, input)
    done()
  })
})

test(`anchor should Rightify a good input`, (done) => {
  t.plan(2)
  const input = random.keyValue(5)
  const [k, v] = input
  const assertion = (x) => !!x[k]
  const rationale = K(`this function won't ever do anything`)
  const inputObject = {
    [k]: v,
    xxx: `coolpants`
  }
  const good = anchor(assertion, rationale, inputObject)
  t.deepEqual(good, GuidedRight(inputObject))
  return fork(
    (e) => {
      // this shouldn't ever be here
      t.falsy(e)
    },
    (r) => {
      t.is(r[k], v)
      done()
    },
    good
  )
})

test(`anchor should Leftify a bad input`, (done) => {
  t.plan(2)
  const input = random.keyValue(5)
  const [k, v] = input
  const assertion = pipe(prop(`yyy`), (x) => !!x)
  const pseudo = random.word(10)
  const errorString = `Random error: ${pseudo}`
  const rationale = K(errorString)
  const inputObject = {
    [k]: v,
    xxx: `coolpants`
  }
  const bad = anchor(assertion, rationale, inputObject)
  t.deepEqual(bad, GuidedLeft(errorString))
  return fork(
    (l) => {
      t.is(l, rationale())
      done()
    },
    () => {
      // this shouldn't ever run
      t.falsy(true)
    },
    bad
  )
})
test(`anchor should Leftify a null input`, (done) => {
  t.plan(1)
  const bad = anchor(K(true), K(`shit`), null)
  fork((x) => {
    t.is(x.message, `anchor: Expected to be given non-null input.`)
    done()
  }, () => t.truthy(false), bad)
})

test(`anchor should fail with a Left when assertion is not a function`, () => {
  const badSafety = anchor({}, identity, `whatever`)
  t.deepEqual(badSafety, reject(`anchor: Expected assertion to be function.`))
  // t.is(messenger(badSafety), `anchor: Expected assertion to be function.`)
})
test(`anchor should fail with a Left when wrongPath is not a function`, () => {
  const badDivider = anchor(identity, {}, `whatever`)
  t.deepEqual(badDivider, reject(`anchor: Expected wrongPath to be function.`))
})
test(`anchor should fail with a Left when assertion and wrongPath are not functions`, () => {
  const dumbInputs = anchor({}, {}, `whatever`)
  t.deepEqual(
    dumbInputs,
    reject(`anchor: Expected assertion, wrongPath to be functions.`)
  )
})

test(`safetyNet should allow for adding simple anchors to a given function`, (done) => {
  t.plan(2)
  const input = random.keyValue(5)
  const [k, v] = input
  const hasTripleYProperty = (x) => (x && x.yyy)
  const addAThousand = (x) => {
    const y = {...x}
    y.yyy += 1000 // eslint-disable-line fp/no-mutation
    return y
  }
  const input1 = {
    [k]: v,
    xxx: `coolpants`
  }
  const input2 = {
    xxx: `zipzops`,
    yyy: random.floorMin(1, 1e3)
  }
  const badObject = {
    ugh: `crapdammit ` + random.word(4)
  }
  const safeFunction = safetyNet(
    hasTripleYProperty,
    (x) => ({...badObject, ...x}),
    addAThousand
  )
  const good = safeFunction(input2)
  good.fork(
    (e) => t.falsy(e),
    (inner) => {
      const newnew = {...input2}
      newnew.yyy += 1000
      t.deepEqual(newnew, inner)
    }
  )
  const bad = safeFunction(input1)
  bad.fork(
    (inner) => {
      const newnew = {...input1, ...badObject}
      t.deepEqual(newnew, inner)
      done()
    },
    (e) => t.falsy(e)
  )
})

test(`safetyNet should fail if assertion is not a function`, () => {
  t.plan(1)
  const x = safetyNet({}, identity, identity, `whatever`)
  t.rejectsF(x, (e) => t.is(e, `safetyNet: Expected assertion to be function.`))
})
test(`safetyNet should fail if wrongPath is not a function`, () => {
  t.plan(1)
  const y = safetyNet(identity, {}, identity, `whatever`)
  t.rejectsF(y, (e) => t.is(e, `safetyNet: Expected wrongPath to be function.`))
})
test(`safetyNet should fail if rightPath is not a function`, () => {
  t.plan(1)
  const z = safetyNet(identity, identity, {}, `whatever`)
  t.rejectsF(z, (e) => t.is(e, `safetyNet: Expected rightPath to be function.`))
})
test(
  `safetyNet should fail with multiple assertions when there are multiple failures: 1`,
  () => {
    t.plan(1)
    const a = safetyNet({}, {}, {}, `whatever`)
    t.rejectsF(a,
      (e) => t.is(e, `safetyNet: Expected assertion, wrongPath, rightPath to be functions.`)
    )
  }
)
test(
  `safetyNet should fail with multiple assertions when there are multiple failures: 2`,
  () => {
    const b = safetyNet(identity, {}, {}, `whatever`)
    t.rejectsF(b, (e) => t.is(e, `safetyNet: Expected wrongPath, rightPath to be functions.`))
  }
)
test(
  `safetyNet should fail with multiple assertions when there are multiple failures: 3`,
  () => {
    const c = safetyNet({}, identity, {}, `whatever`)
    t.rejectsF(c, (e) => t.is(e, `safetyNet: Expected assertion, rightPath to be functions.`))
  }
)
test(
  `safetyNet should fail with multiple assertions when there are multiple failures: 4`,
  () => {
    const d = safetyNet({}, {}, identity, `whatever`)
    t.rejectsF(d, (e) => t.is(e, `safetyNet: Expected assertion, wrongPath to be functions.`))
  }
)

test(`tether should allow for multiple assertions at a single callsite`, (done) => {
  t.plan(4)
  const anchors = [
    [({age}) => age > 20, ({name}) => `Expected ${name} to be 21.`],
    [({cash}) => cash - 5 >= 0, ({name}) => `Expected ${name} to have cash.`],
    [({hair = `black`}) => hair === `black`, ({name}) => `Expected ${name} to have black hair.`]
  ]
  const goodPath = (user) => {
    /* eslint-disable fp/no-mutation */
    /* eslint-disable fp/no-mutating-methods */
    user.cash -= 5
    user.beverages = user.beverages || []
    user.beverages.push(`beer`)
    /* eslint-enable fp/no-mutation */
    /* eslint-enable fp/no-mutating-methods */
    return user
  }
  const alice = {
    name: `alice`,
    cash: 5,
    age: 25
  }
  const jimmy = {
    name: `jimmy`,
    cash: 10,
    age: 15
  }
  const redHead = {
    name: `redhead`,
    cash: 20,
    age: 40,
    hair: `red`
  }
  const testCase = tether(anchors, goodPath)
  fork(
    console.warn,
    (e) => {
      t.deepEqual(e, {name: `alice`, cash: 0, beverages: [`beer`], age: 25})
    },
    testCase(alice)
  )
  fork(
    (e) => {
      t.is(e, `Expected alice to have cash.`)
    },
    console.warn,
    testCase({...alice, cash: 0})
  )
  fork(
    (e) => {
      t.is(e, `Expected jimmy to be 21.`)
    },
    console.warn,
    testCase(jimmy)
  )
  fork(
    (e) => {
      t.is(e, `Expected redhead to have black hair.`)
      done()
    },
    console.warn,
    testCase(redHead)
  )
})

test(
  `tether should allow for multiple assertions at a single callsite, and deal with async`,
  (done) => {
    t.plan(5)
    const anchors = [
      [({age}) => age > 20, ({name}) => (`Expected ${name} to be 21.`)],
      [({cash}) => cash - 5 >= 0, ({name}) => (`Expected ${name} to have cash.`)],
      [({hair = `black`}) => hair === `black`, ({name}) => (`Expected ${name} to have black hair.`)]
    ]
    const goodPath = (raw) => {
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
    const alice = {
      name: `alice`,
      cash: 5,
      age: 25
    }
    const jimmy = {
      name: `jimmy`,
      cash: 10,
      age: 15
    }
    const redHead = {
      name: `redhead`,
      cash: 20,
      age: 40,
      hair: `red`
    }
    const testCase = tether(anchors, goodPath)
    fork(
      console.warn,
      (e) => {
        t.deepEqual(e, {name: `alice`, cash: 0, beverages: [`beer`], age: 25})
      },
      testCase(alice)
    )
    fork(
      console.warn,
      (e) => {
        t.deepEqual(e, {name: `alice`, cash: 0, beverages: [`beer`], age: 25})
      },
      testCase(Future.of(alice))
    )
    fork(
      (e) => {
        t.is(e, `Expected alice to have cash.`)
      },
      console.warn,
      testCase({...alice, cash: 0})
    )
    fork(
      (e) => {
        t.is(e, `Expected jimmy to be 21.`)
      },
      console.warn,
      testCase(jimmy)
    )
    fork(
      (e) => {
        t.is(e, `Expected redhead to have black hair.`)
        done()
      },
      console.warn,
      testCase(redHead)
    )
  }
)

/* eslint-enable fp/no-unused-expression */
