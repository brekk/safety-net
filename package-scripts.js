const {curry} = require(`f-utility`)
const utils = require(`nps-utils`)
const {version} = require(`./package.json`)

const prepend = curry((toPrepend, file) => `echo "${toPrepend} $(cat ${file})" > ${file}`)
const append = curry((toAppend, file) => `echo "${toAppend}" >> ${file}`)
const createWithText = curry((text, file) => `echo "${text}" > ${file}`)
const {
  concurrent: all,
  series,
  mkdirp
} = utils
const {
  nps: allNPS
} = all
const COSTFILE = `./costs`
const MINIFIED = `./dist/safety-net.min.js`
const MINIFIED_BROWSER = `./dist/safety-net.browser.min.js`

const filterSpecs = (stringify = false) => ([
  `jayin "${stringify ? `JSON.stringify(` : ``}_.toPairs(x)`,
  `.map(([k, v]) => ([k,`,
  `_.map(v, (y) => y.indexOf('node_modules') > -1 ? y.substr(y.indexOf('node_modules') + 13) : y)`,
  `]))`,
  `.filter(([k, v]) => !(k.indexOf('spec') > -1))`,
  `.filter(([k, v]) => !(k.indexOf('scss') > -1))`,
  `.filter(([k, v]) => !(k.indexOf('css') > -1))`,
  `.reduce((agg, [k, v]) => Object.assign({}, agg, {[k]: v}), {})${stringify ? `, null, 2)` : ``}"`
].join(``))

module.exports = {
  scripts: {
    build: {
      description: `do a per file conversion from /src to /lib`,
      // script: `nps build.rollup`,
      script: `nps build.rollup`,
      // babel: {
      //   description: `convert files`,
      //   script: `babel src -d lib --ignore *.spec.js`
      // },
      rollup: {
        description: `generate with rollup`,
        script: series(
          mkdirp(`dist`),
          `rollup -c config/commonjs.js`,
          `browserify --node -s safety-net ${MINIFIED} > ${MINIFIED_BROWSER}`,
          prepend(`/* safety-net v.${version} */`, MINIFIED),
          prepend(`/* safety-net v.${version} */`, MINIFIED_BROWSER)
        )
      }
    },
    cost: {
      description: `regenerate the costfile`,
      script: series(
        createWithText(`safetyNet cost`, COSTFILE),
        append(`\`cost-of-modules --no-install --yarn\``, COSTFILE),
        `cat ./costs`
      )
    },
    documentation: {
      description: `generate documentation`,
      script: `documentation build src/safety-net.js -f html -o docs`
    },
    dependencies: {
      check: {
        script: `depcheck`,
        description: `check dependencies`
      },
      graph: {
        script: `madge src --json | ${filterSpecs(false)} | madge --stdin --image dependencies.svg`,
        description: `generate a visual dependency graph`
      },
      dot: {
        script: `madge src --json | ${filterSpecs(false)} | madge --stdin --dot > dependencies.gv`,
        description: `generate a visual dependency graph in DOT format`
      }
    },
    lint: {
      description: `lint the javascript files`,
      script: `eslint src/**`
    },
    mkdir: {
      coverage: `mkdirp coverage`,
      description: `generate a coverage directory`
    },
    care: {
      description: `the tasks auto-run before commits`,
      script: allNPS(`build`, `test`, `cost`, `regenerate`)
    },
    publish: {
      description: `the tasks to run at publish-time`,
      script: allNPS(`build`, `regenerate`)
    },
    test: {
      description: `run lint and tests`,
      script: allNPS(`lint`, `test.covered`),
      covered: {
        description: `run covered tests`,
        script: `jest src/*.spec.js --coverage --coveragePathIgnorePatterns test-helpers.js`
      },
      log: {
        description: `run tests and save logfile`,
        script: `nps test.covered > test-output.log`
      }
    },
    regenerate: {
      description: `regenerate readme`,
      script: series(`nps regenerate.addAPI`, `nps dependencies.graph`),
      // readme: {
      //   description: `run ljs2 against example.literate.js to get our README.md file`,
      //   script: `ljs2 example.literate.js -o README.md`
      // },
      addAPI: {
        description: `add API docs to the README`,
        script: `documentation readme -s "API" src/index.js`
      }
    }
  }
}
