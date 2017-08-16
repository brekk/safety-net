# safety-net

a toolset for adding safety to your asynchronous functional pipelines

This module attempts to offer the same general API as `handrail` (for dealing with synchronous logical disjunctions / Eithers) but to model asynchronous operations (using the excellent [fluture](https://www.npmjs.com/package/fluture) library) instead.

Here's the mapping of APIs:

`handrail` => `safety-net`

* `rail` => `anchor`
* `handrail` =>  `safety-net`
* `guideRail` => `tether`

Given the asynchronous goals of this library, `multiRail` doesn't make as much sense, as chaining over the resulting values is problematic (when you can instead just add a clause to the `tether` API)
* `multiRail` => null

## Install

    yarn add safety-net -S

or

    npm i safety-net -S

### API
