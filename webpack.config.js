module.exports = {
  resolve: {
    extensions: [`.js`, `.json`],
    modules: [
      `${__dirname}/node_modules`
    ],
    alias: {
      "@safety-net": `${__dirname}`,
      "@assertions": `${__dirname}/src/assertions`,
      "@future": `${__dirname}/src/future`,
      "@errors": `${__dirname}/src/errors`
    }
  }
}
