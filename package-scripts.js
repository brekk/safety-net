const germs = require(`germs`)
const {name} = require(`./package.json`)

module.exports = germs.build(name, {
  test: {
    description: `run all tests with coverage`,
    script: [
      `jest src/*.spec.js --coverage`,
      `--coveragePathIgnorePatterns safety-net.js test-helpers.js node_modules/common-tags/*`
    ].join(` `)
  }
})
