# safety-net

a toolset for adding safety to your asynchronous functional pipelines

This module attempts to offer the same general API as `handrail` (for dealing with synchronous logical disjunctions / Eithers) but to model asynchronous operations (using the excellent [fluture](https://www.npmjs.com/package/fluture) library) instead.

Here's the mapping of APIs:

`handrail` => `safety-net`

-   `rail` => `anchor`
-   `handrail` =>  `safety-net`
-   `guideRail` => `tether`

Given the asynchronous goals of this library, `multiRail` doesn't make as much sense, as chaining over the resulting values is problematic (when you can instead just add a clause to the `tether` API)

-   `multiRail` => null

## Install

    yarn add safety-net -S

or

    npm i safety-net -S

### API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

#### anchor

Add safety to your pipelines!

**Parameters**

-   `assertion` **[function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** boolean-returning function
-   `wrongPath` **[function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** function invoked if the inputs are bad
-   `input` **any** any input

Returns **(GuidedRight | GuidedLeft)** Left / Right -wrapped value

#### bimap

**Parameters**

-   `rejectionMap` **[function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** do something if function receives a rejection
-   `resolutionMap` **[function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** do something if function receives a resolution
-   `future` **Future** a Future(value)

Returns **Future** a mapped future

#### safetyNet

**Parameters**

-   `assertion` **[function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** a function to test the input with
-   `wrongPath` **[function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** a function to prepare data before it passes into the Left path
-   `rightPath` **[function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** a function to modify after it passes into the Right path
-   `input` **any** any input

Returns **(GuidedLeft | GuidedRight)** a Future

#### tether

tie multiple assertions some input

**Parameters**

-   `anchors` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;functions>** an array of [assertion, failCase] pairs
-   `goodPath` **[function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** what to do if things go well
-   `input` **any** whatever

Returns **(GuidedLeft | GuidedRight)** a Future
