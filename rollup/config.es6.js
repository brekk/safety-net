const path = require(`path`)
const pkg = require(`../package.json`)
const {bundle} = require(`germs`)

const external = (
  pkg && pkg.dependencies ?
    Object.keys(pkg.dependencies) :
    []
)

const local = (x) => path.resolve(__dirname, x)

module.exports = bundle({
  name: pkg.name,
  external,
  input: `src/index.js`,
  alias: {
    [`@safety-net`]: local(`../src`),
    [`@assertions`]: local(`../src/assertions`),
    [`@future`]: local(`../src/future`),
    [`@errors`]: local(`../src/errors`)
  },
  output: {
    file: `./${pkg.name}.mjs`,
    format: `es`
  }
})
