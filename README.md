<h1 align="center">Event Emitter 🔊</h1>
<h2 align="center">
  Cross-env TypeScript Event Emitter
</h2>
<p align="center">
A cross-environment implementation of an <code>EventEmitter</code> that works seamlessly in <strong>Node.js</strong>, <strong>Edge Runtime</strong> (such as Next.js middleware), and <strong>browser</strong> environments. The <code>EventEmitter</code> class provides a mechanism to handle events and their listeners. It allows you to register event listeners, emit events, and manage the listeners for those events.
</p>
<p align="center">
  <a href="https://npmjs.org/package/@alessiofrittoli/event-emitter">
    <img src="https://img.shields.io/npm/v/@alessiofrittoli/event-emitter" alt="Latest version"/>
  </a>
  <a href="https://coveralls.io/github/alessiofrittoli/exception">
    <img src="https://coveralls.io/repos/github/alessiofrittoli/exception/badge.svg" alt="Test coverage"/>
  </a>
  <a href="https://socket.dev/npm/package/@alessiofrittoli/event-emitter/overview">
    <img src="https://socket.dev/api/badge/npm/package/@alessiofrittoli/event-emitter" alt="Socket Security score"/>
  </a>
  <a href="https://npmjs.org/package/@alessiofrittoli/event-emitter">
    <img src="https://img.shields.io/npm/dm/@alessiofrittoli/event-emitter.svg" alt="npm downloads"/>
  </a>
  <a href="https://bundlephobia.com/package/@alessiofrittoli/event-emitter">
    <img src="https://badgen.net/bundlephobia/dependency-count/@alessiofrittoli/event-emitter" alt="Dependencies"/>
  </a>
  <a href="https://libraries.io/npm/%40alessiofrittoli%2Fexception">
    <img src="https://img.shields.io/librariesio/release/npm/@alessiofrittoli/event-emitter" alt="Dependencies status"/>
  </a>
</p>
<p align="center">
  <a href="https://bundlephobia.com/package/@alessiofrittoli/event-emitter">
    <img src="https://badgen.net/bundlephobia/min/@alessiofrittoli/event-emitter" alt="minified"/>
  </a>
  <a href="https://bundlephobia.com/package/@alessiofrittoli/event-emitter">
    <img src="https://badgen.net/bundlephobia/minzip/@alessiofrittoli/event-emitter" alt="minizipped"/>
  </a>
  <a href="https://bundlephobia.com/package/@alessiofrittoli/event-emitter">
    <img src="https://badgen.net/bundlephobia/tree-shaking/@alessiofrittoli/event-emitter" alt="Tree shakable"/>
  </a>
</p>
<p align="center">
  <a href="https://github.com/sponsors/alessiofrittoli">
    <img src="https://img.shields.io/static/v1?label=Fund%20this%20package&message=%E2%9D%A4&logo=GitHub&color=%23DB61A2" alt="Fund this package"/>
  </a>
</p>

[sponsor-badge]: https://img.shields.io/static/v1?label=Fund%20this%20package&message=%E2%9D%A4&logo=GitHub&color=%23DB61A2
[sponsor-url]: https://github.com/sponsors/alessiofrittoli

### Table of Content

- [Getting started](#getting-started)
- [Development](#development)
  - [Local development](#local-development)
  - [Production build](#production-build)
  - [Unit tests](#unit-tests)
    - [Run tests with coverage](#run-tests-with-coverage)
  - [Contributing](#contributing)
  - [Security](#security)
- [API Reference](#api-reference)
  - [`EventEmitter` Class](#eventemitter-class)
    - [Constructor](#constructor)
    - [Properties](#properties)
    - [Methods](#methods)
  - [Types](#types)
  - [Examples](#examples)
- [Credits](#made-with-)

---

### Getting started

Run the following command to start using `event-emitter` in your projects:

```bash
npm i @alessiofrittoli/event-emitter
```

or using `pnpm`

```bash
pnpm i @alessiofrittoli/event-emitter
```

---

### Development

Run the following to start development

```shell
nvm use

pnpm i
```

#### Local development

Run the following

```shell
pnpm dev
```

This will generate unminified output code, sourcemaps and will enable source file watcher.

---

#### Production build

Run the following to create a local production build

```shell
pnpm build
```

This will generate minified output code without sourcemaps.

---

#### Unit tests

Run all the defined test suites by running the following:

```shell
# Run tests and watch file changes.
pnpm test:watch

# Run tests in a CI environment.
pnpm test:ci
```

---

##### Run tests with coverage

An HTTP server is then started to serve coverage files from `./coverage` folder.

⚠️ You may see a blank page the first time you run this command. Simply refresh the browser to see the updates.

```shell
pnpm test:coverage:serve
```

---

#### Contributing

Contributions are truly welcome!

Please refer to the [Contributing Doc](./CONTRIBUTING.md) for more information on how to start contributing to this project.

Help keep this project up to date with [GitHub Sponsor][sponsor-url].

[![GitHub Sponsor][sponsor-badge]][sponsor-url]

---

#### Security

If you believe you have found a security vulnerability, we encourage you to **_responsibly disclose this and NOT open a public issue_**. We will investigate all legitimate reports. Email `security@alessiofrittoli.it` to disclose any security vulnerabilities.

---

### API Reference

#### `EventEmitter` Class

##### Constructor

```ts
new EventEmitter<T>( options?: EventEmitterOptions )
```

<details>
<summary>Parameters</summary>

| Parameter                        | Type                    | Default   | Description                                                                                              |
| -------------------------------- | ----------------------- | --------- | -------------------------------------------------------------------------------------------------------- |
| `options`                        | `EventEmitterOptions`   | -         | Optional configuration object for the emitter instance.                                                  |
| `options.captureRejections`      | `boolean`               | `false`   | If set to `true`, captures and handles promise rejections in listeners.                                  |
| `options.capturedRejectionEvent` | `string`                | `'error'` | The event name used to emit captured errors and rejections when `captureRejections` is set to `true`.    |
| `options.transformError`         | `TransformErrorHandler` | -         | A custom function that transforms a caught error before it gets emitted (or re-thrown, if not captured). |

</details>

---

##### Properties

###### `EventEmitter.eventsPaused`

Type: `boolean` (read-only)

Indicates whether all events have been paused via `EventEmitter.pauseEvents()`.

---

###### `EventEmitter.pausedEvents`

Type: `Partial<Record<keyof T, boolean>> | undefined` (read-only)

A map of events individually paused (`true`) or resumed (`false`) via `EventEmitter.pauseEvents( event )` and `EventEmitter.resumeEvents( event )`.

It is reset to `undefined` when `EventEmitter.pauseEvents()` or `EventEmitter.resumeEvents()` are called without an `event` name.

---

##### Methods

###### `EventEmitter.emit()`

Emits an event to all registered listeners.

<details>
<summary>Parameters</summary>

| Parameter | Type         | Description                            |
| --------- | ------------ | -------------------------------------- |
| `event`   | `K`          | The event name to emit.                |
| `args`    | `Args<K, T>` | The arguments passed to the listeners. |

</details>

---

<details>
<summary>Returns</summary>

Type: `boolean`

- `true` if the event had listeners and has been emitted.
- `false` if the event had no listeners or if it has been paused (see [`EventEmitter.pauseEvents()`](#eventemitterpauseevents)).

</details>

---

###### `EventEmitter.on()`

Adds a listener for the specified event.

<details>
<summary>Parameters</summary>

| Parameter  | Type             | Description                                             |
| ---------- | ---------------- | ------------------------------------------------------- |
| `event`    | `K`              | The event name to listen for.                           |
| `listener` | `Listener<T, K>` | The listener function called when the event is emitted. |

</details>

---

<details>
<summary>Returns</summary>

Type: `EventEmitter`

The current `EventEmitter` instance so that calls can be chained.

</details>

---

###### `EventEmitter.addListener()`

Alias for `EventEmitter.on( event, listener )`.

---

###### `EventEmitter.prepend()`

Adds a listener to the beginning of the listener array for the specified event.

<details>
<summary>Parameters</summary>

| Parameter  | Type             | Description                                             |
| ---------- | ---------------- | ------------------------------------------------------- |
| `event`    | `K`              | The event name to listen for.                           |
| `listener` | `Listener<T, K>` | The listener function called when the event is emitted. |

</details>

---

<details>
<summary>Returns</summary>

Type: `EventEmitter`

The current `EventEmitter` instance so that calls can be chained.

</details>

---

###### `EventEmitter.prependListener()`

Alias for `EventEmitter.prepend( event, listener )`.

---

###### `EventEmitter.once()`

Adds a one-time listener for the specified event. Even if the event is emitted multiple times, listeners registered with `.once()` method will only get called one single time.

<details>
<summary>Parameters</summary>

| Parameter  | Type             | Description                                             |
| ---------- | ---------------- | ------------------------------------------------------- |
| `event`    | `K`              | The event name to listen for.                           |
| `listener` | `Listener<T, K>` | The listener function called when the event is emitted. |

</details>

---

<details>
<summary>Returns</summary>

Type: `EventEmitter`

The current `EventEmitter` instance so that calls can be chained.

</details>

---

###### `EventEmitter.prependOnce()`

Adds a one-time listener to the beginning of the listener array for the specified event.

<details>
<summary>Parameters</summary>

| Parameter  | Type             | Description                                             |
| ---------- | ---------------- | ------------------------------------------------------- |
| `event`    | `K`              | The event name to listen for.                           |
| `listener` | `Listener<T, K>` | The listener function called when the event is emitted. |

</details>

---

<details>
<summary>Returns</summary>

Type: `EventEmitter`

The current `EventEmitter` instance so that calls can be chained.

</details>

---

###### `EventEmitter.prependOnceListener()`

Alias for `EventEmitter.prependOnce( event, listener )`.

---

###### `EventEmitter.off()`

Removes a listener for the specified event.

<details>
<summary>Parameters</summary>

| Parameter  | Type             | Description                                             |
| ---------- | ---------------- | ------------------------------------------------------- |
| `event`    | `K`              | The event name to remove the listener from.             |
| `listener` | `Listener<T, K>` | The listener function to remove from the given `event`. |

</details>

---

<details>
<summary>Returns</summary>

Type: `EventEmitter`

The current `EventEmitter` instance so that calls can be chained.

</details>

---

###### `EventEmitter.removeListener()`

Alias for `EventEmitter.off( event, listener )`.

---

###### `EventEmitter.pauseEvents()`

Pauses all events or a specific event.

While paused, calls to `EventEmitter.emit()` are ignored (listeners are not called and `false` is returned). Emitted events are not queued, so they won't be dispatched once resumed.

- When called without an `event`, all events get paused and any previously paused/resumed single event state is reset.
- When called with an `event`, only that event gets paused.

<details>
<summary>Parameters</summary>

| Parameter | Type | Description                                                            |
| --------- | ---- | ---------------------------------------------------------------------- |
| `event`   | `K`  | (Optional) The event name to pause. If omitted, all events are paused. |

</details>

---

<details>
<summary>Returns</summary>

Type: `EventEmitter`

The current `EventEmitter` instance so that calls can be chained.

</details>

---

###### `EventEmitter.resumeEvents()`

Resumes all events or a specific event.

- When called without an `event`, all events get resumed and any previously paused/resumed single event state is reset.
- When called with an `event`, only that event gets resumed. This also works when all events have been paused via `EventEmitter.pauseEvents()`, allowing you to selectively resume single events.

<details>
<summary>Parameters</summary>

| Parameter | Type | Description                                                              |
| --------- | ---- | ------------------------------------------------------------------------ |
| `event`   | `K`  | (Optional) The event name to resume. If omitted, all events are resumed. |

</details>

---

<details>
<summary>Returns</summary>

Type: `EventEmitter`

The current `EventEmitter` instance so that calls can be chained.

</details>

---

###### `EventEmitter.removeAllListeners()`

Removes all listeners for a specified event or all events.

<details>
<summary>Parameters</summary>

| Parameter  | Type             | Description                                         |
| ---------- | ---------------- | --------------------------------------------------- |
| `event`    | `K`              | (Optional) The event name to remove listeners from. |
| `listener` | `Listener<T, K>` | (Optional) The listener function to remove.         |

</details>

---

<details>
<summary>Returns</summary>

Type: `EventEmitter`

The current `EventEmitter` instance so that calls can be chained.

</details>

---

###### `EventEmitter.getMaxListeners()`

Gets the current maximum number of listeners. Default: `EventEmitter.defaultMaxListeners` (10).

<details>
<summary>Returns</summary>

Type `number`

The current maximum number of listeners.

</details>

---

###### `EventEmitter.setMaxListeners()`

Sets the maximum number of listeners allowed for each event.

By default, a maximum of `10` listeners can be registered for any single event. This limit can be changed for individual `EventEmitter` instances using the `EventEmitter.setMaxListeners( n )` method.

This is not a hard limit. The `EventEmitter` instance will allow more listeners to be added but will output a trace warning to stderr indicating that a "possible EventEmitter memory leak" has been detected.

<details>
<summary>Parameters</summary>

| Parameter | Type     | Description                      |
| --------- | -------- | -------------------------------- |
| `n`       | `number` | The maximum number of listeners. |

</details>

---

<details>
<summary>Returns</summary>

Type: `EventEmitter`

The current `EventEmitter` instance so that calls can be chained.

</details>

---

###### `EventEmitter.listenerCount()`

Gets the number of listeners for the specified event.

<details>
<summary>Parameters</summary>

| Parameter  | Type             | Description                                              |
| ---------- | ---------------- | -------------------------------------------------------- |
| `event`    | `K`              | The event name to check the listeners for.               |
| `listener` | `Listener<T, K>` | (Optional) The specific listener to count (if provided). |

</details>

---

<details>
<summary>Returns</summary>

Type: `number`

The number of listeners for the specified event and optionally for the given listener.

</details>

---

###### `EventEmitter.listeners()`

Returns a list of listeners for the specified event.

<details>
<summary>Parameters</summary>

| Parameter | Type | Description                          |
| --------- | ---- | ------------------------------------ |
| `event`   | `K`  | The event name to get listeners for. |

</details>

---

<details>
<summary>Returns</summary>

Type: `( Listener<T, K> )[]`

An array of registered listeners. Even if the listener is registered using the `.once()` method, the actual listener is returned instead of the `OnceListenerWrapper<T, K>`.

</details>

---

###### `EventEmitter.rawListeners()`

Returns a copy of the array of listeners for the specified event, including any wrappers (such as those created by `.once()`).

<details>
<summary>Parameters</summary>

| Parameter | Type | Description                          |
| --------- | ---- | ------------------------------------ |
| `event`   | `K`  | The event name to get listeners for. |

</details>

---

<details>
<summary>Returns</summary>

Type: `( Listener<T, K> | OnceListenerWrapper<T, K> )[]`

An array of registered listener callback.

If a listener has been registered using the `.once()` method a `OnceListenerWrapper<T, K>` is returned. In that case the original listener can be retrieved through the `listener` property.

</details>

---

###### `EventEmitter.eventNames()`

Returns a list of all event names.

<details>
<summary>Returns</summary>

Type: `( keyof T )[]`

An array of registered event names.

</details>

---

#### Types

##### `EventEmitterOptions`

Options for configuring the `EventEmitter`.

<details>
<summary>Properties</summary>

| Property                 | Type                    | Default          | Description                                                                                              |
| ------------------------ | ----------------------- | ---------------- | -------------------------------------------------------------------------------------------------------- |
| `captureRejections`      | `boolean`               | `false`          | If set to true, captures and handles promise rejections in listeners.                                    |
| `capturedRejectionEvent` | `string`                | `'error'`        | The event name used to emit captured errors and rejections.                                              |
| `transformError`         | `TransformErrorHandler` | `error => error` | A custom function that transforms a caught error before it gets emitted (or re-thrown, if not captured). |

</details>

---

##### `TransformErrorHandler`

A custom function that transforms a caught error into something else.

```ts
type TransformErrorHandler = (error: unknown) => unknown
```

<details>
<summary>Parameters</summary>

| Parameter | Type      | Description       |
| --------- | --------- | ----------------- |
| `error`   | `unknown` | The caught error. |

</details>

---

<details>
<summary>Returns</summary>

Type: `unknown`

The transformed error.

</details>

---

##### `Listener<T, K>`

Defines the type of a listener function.

<details>
<summary>Properties</summary>

| Proeprty | Type         | Description                                                      |
| -------- | ------------ | ---------------------------------------------------------------- |
| `args`   | `Args<K, T>` | Arguments passed to the listener corresponding to the event key. |

</details>

---

##### `OnceListenerWrapper<T, K>`

A wrapper for listeners that should be invoked only once.

<details>
<summary>Properties</summary>

| Proeprty   | Type             | Description                                                      |
| ---------- | ---------------- | ---------------------------------------------------------------- |
| `args`     | `Args<K, T>`     | Arguments passed to the listener corresponding to the event key. |
| `listener` | `Listener<T, K>` | The actual listener function to be invoked.                      |

</details>

---

##### `Args<K, T>`

A utility type that resolves to a specific type based on the provided keys and event map.

---

#### Examples

##### Defining custom types

<details>

<summary>Details</summary>

```ts
import type { Listener } from '@alessiofrittoli/event-emitter'

// Define an event map for your EventEmitter
interface MyEvents {
  greet: [name: string] // The 'greet' event takes a string argument
  farewell: [name: Error] // The 'farewell' event also takes a string argument
  error: [error: Error] // The 'error' event takes an Error argument
}

// Optionally define listeners types
type OnGreetEventListener = Listener<MyEvents, 'greet'>
type OnFarewellEventListener = Listener<MyEvents, 'farewell'>
type OnErrorEventListener = Listener<MyEvents, 'error'>
```

</details>

---

##### Emitting and Listening events

<details>
<summary>Declaring listeners</summary>

```ts
const greetListener: OnGreetEventListener = name => {
  console.log(`Hello, ${name}!`)
}

const farewellListener: OnFarewellEventListener = name => {
  console.log(`Goodbye, ${name}!`)
}

const errorListener: OnErrorEventListener = error => {
  console.error('Something went wrong.', error.message)
}
```

</details>

---

<details>
<summary>Registering listeners and emitting events</summary>

```ts
import { EventEmitter } from '@alessiofrittoli/event-emitter'

const emitter = new EventEmitter<MyEvents>()

// Attach listeners
emitter.on('greet', greetListener)
emitter.on('farewell', farewellListener)
emitter.on('error', errorListener)

// Emit events
emitter.emit('greet', 'Foo')
emitter.emit('farewell', 'Bar')
emitter.emit('error', new Error('An error occured.'))
```

</details>

---

##### One-time events listeners

<details>

<summary>Details</summary>

```ts
const emitter = new EventEmitter<MyEvents>()

// Define a listener for the 'greet' event that should only be called once
const greetOnceListener: OnGreetEventListener = name => {
  console.log(`Once Hello, ${name}!`)
}

emitter.once('greet', greetOnceListener)

// Emit the event
emitter.emit('greet', 'Foo')
// `greetOnceListener` won't be called anymore, as the listener was removed after the first call.
emitter.emit('greet', 'Bob')
```

</details>

---

##### Error Handling with `captureRejections`

<details>

<summary>Details</summary>

```ts
const emitter = new EventEmitter<MyEvents>({ captureRejections: true })

const greetListener: OnGreetEventListener = name => {
  if (name === 'He-Who-Must-Not-Be-Named') {
    throw new Error('nooose!')
  }
  console.log(`Howdy, ${name}!`)
}

const errorListener: OnErrorEventListener = error => {
  console.error('Caught your', error.message)
}

// Add listeners
emitter.on('greet', greetListener)
emitter.on('error', errorListener)

// Emit events
emitter.emit('greet', 'Foo')
emitter.emit('greet', 'He-Who-Must-Not-Be-Named')
```

</details>

---

##### Custom captured rejection event

By default, captured errors and rejections are emitted through the `error` event. Use the `capturedRejectionEvent` option to emit them through a different event.

<details>

<summary>Details</summary>

```ts
interface MyEvents {
  greet: [name: string]
  failure: [error: Error]
}

const emitter = new EventEmitter<MyEvents>({
  captureRejections: true,
  capturedRejectionEvent: 'failure',
})

emitter.on('greet', async name => {
  throw new Error(`Cannot greet ${name}.`)
})

emitter.on('failure', error => {
  console.error('Caught', error.message)
})

emitter.emit('greet', 'Foo')
// Outputs: Caught Cannot greet Foo.
```

</details>

---

##### Transforming caught errors

Use the `transformError` option to transform caught errors before they get emitted through the captured rejection event.

When `captureRejections` is not enabled, the transformed error is thrown instead.

<details>

<summary>Details</summary>

```ts
class GreetError extends Error {
  constructor(public readonly cause: unknown) {
    super('Greet failed.')
  }
}

interface MyEvents {
  greet: [name: string]
  error: [error: GreetError]
}

const emitter = new EventEmitter<MyEvents>({
  captureRejections: true,
  transformError: error => new GreetError(error),
})

emitter.on('greet', () => {
  throw new Error('nooose!')
})

emitter.on('error', error => {
  console.error(error.message, error.cause)
})

emitter.emit('greet', 'Foo')
// Outputs: Greet failed. Error: nooose!
```

</details>

---

##### Pausing and resuming events

<details>
<summary>Pause and resume all events</summary>

```ts
const emitter = new EventEmitter<MyEvents>().on('greet', greetListener).on('farewell', farewellListener)

emitter.pauseEvents()

console.log(emitter.eventsPaused) // Outputs: `true`
console.log(emitter.emit('greet', 'Foo')) // Outputs: `false` - `greetListener` is not called.

emitter.resumeEvents()

console.log(emitter.eventsPaused) // Outputs: `false`
console.log(emitter.emit('greet', 'Foo')) // Outputs: `true` - `greetListener` is called.
```

</details>

---

<details>
<summary>Pause and resume a specific event</summary>

```ts
const emitter = new EventEmitter<MyEvents>()
  .on('greet', greetListener)
  .on('farewell', farewellListener)
  .pauseEvents('greet')

emitter.emit('greet', 'Foo') // `greetListener` is not called.
emitter.emit('farewell', 'Foo') // `farewellListener` is called.

emitter.resumeEvents('greet')

emitter.emit('greet', 'Foo') // `greetListener` is called.
```

</details>

---

<details>
<summary>Pause all events except some</summary>

```ts
const emitter = new EventEmitter<MyEvents>()
  .on('greet', greetListener)
  .on('farewell', farewellListener)
  .pauseEvents()
  .resumeEvents('farewell')

console.log(emitter.pausedEvents) // Outputs: `{ farewell: false }`

emitter.emit('greet', 'Foo') // `greetListener` is not called.
emitter.emit('farewell', 'Foo') // `farewellListener` is called.
```

</details>

---

##### Managing Max Listeners

<details>

<summary>Details</summary>

```ts
const emitter = new EventEmitter<MyEvents>().setMaxListeners(1)

const greetListener1: OnGreetEventListener = name => {
  console.log(`Hello, ${name}!`)
}

const greetListener2: OnGreetEventListener = name => {
  console.log(`Hi, ${name}!`)
}

const greetListener3: OnGreetEventListener = name => {
  console.log(`Howdy, ${name}!`)
}

// Attach listeners
emitter.on('greet', greetListener1)
emitter.on('greet', greetListener2) // This will trigger a warning but it will get executed anyway.
emitter.on('greet', greetListener3) // This won't trigger a warning. Warnings are emitted once.

emitter.emit('greet', 'Foo')
// Output:
// Hello, Foo!
// Hi, Foo!
// Howdy, Foo!
```

</details>

---

##### Using `prepend` and `prependOnce`

<details>

<summary>Details</summary>

```ts
const emitter = new EventEmitter<MyEvents>()

// Attach listeners
emitter.on('greet', name => {
  console.log(`A: Hello! Better late than never ${name}.`)
})
emitter.prepend('greet', name => {
  console.log(`B: Hello, ${name}!`)
})
emitter.prependOnce('greet', name => {
  console.log(`C: Once Hello, ${name}! I won't say hello to you, Bar.`)
})

// Emit events
emitter.emit('greet', 'Foo')
emitter.emit('greet', 'Bar')
// Outputs:
// C: Once Hello, Foo! I won't say hello to you, Bar.
// B: Hello, Foo!
// A: Hello! Better late than never Foo.
// B: Hello, Bar!
// A: Hello! Better late than never Bar.
```

</details>

---

##### Retrieve listeners count

<details>
<summary>Get listeners count for a specific event</summary>

```ts
const emitter = new EventEmitter<MyEvents>()
  .on('greet', () => {})
  .on('greet', () => {})
  .on('farewell', () => {})

console.log(emitter.listenerCount('greet')) // Outputs: `2`
console.log(emitter.listenerCount('farewell')) // Outputs: `1`
console.log(emitter.listenerCount('error')) // Outputs: `0`
```

</details>

---

<details>
<summary>Get listeners count for a specific event and listener</summary>

```ts
const callback1 = () => {}
const callback2 = () => {}

const emitter = new EventEmitter<MyEvents>()
  .on('greet', callback1)
  .on('greet', callback1)
  .on('greet', callback2)

console.log(emitter.listenerCount('greet', callback1)) // Outputs: `2`
console.log(emitter.listenerCount('greet', callback2)) // Outputs: `1`
```

</details>

---

##### Retrieve registered listeners

<details>
<summary>Get registerd listeners array</summary>

We register `callback2` with `EventEmitter.once()` to verify that we correctly get the original `callback2` instead of the `onceWrapper` function in the returning array.

```ts
const callback1 = () => {}
const callback2 = () => {}

const emitter = new EventEmitter<MyEvents>()
  .on('greet', callback1)
  .once('greet', callback2)
  .on('farewell', callback1)
const functions = emitter.listeners('greet') // Listener<MyEvents, 'greet'>[]

console.log(functions)
// Outputs: `[ [Function: callback1], [Function: callback2] ]`

functions.map(listener => {
  listener() // manually execute the listener.
})
```

</details>

---

<details>
<summary>Get registerd raw listeners array</summary>

Again we register `callback2` with `EventEmitter.once()` to verify that we correctly get the `onceWrapper` function instead of the original `callback2` listener in the returning array.

```ts
const callback1 = () => {}
const callback2 = () => {}

const emitter = new EventEmitter<MyEvents>()
  .on('greet', callback1)
  .once('greet', callback2)
  .on('farewell', callback1)

const functions = emitter.rawListeners('greet') // ( Listener<MyEvents, 'greet'> | OnceListenerWrapper<MyEvents, 'greet'> )[]

console.log(functions)
// Outputs: `[ [Function: callback1], [Function: onceWrapper] { listener: [Function: callback2] } ]`

functions.map(callback => {
  /** Manually execute the listener. If this is a `onceWrapper` function, it will remove the listener from the listeners array and then execute the original listener function. */
  callback()

  /** Or execute the original listener without removing it from the listeners array. */
  if ('listener' in callback) {
    callback.listener()
  }
})
```

</details>

---

##### Batch removing listeners

<details>
<summary>Remove all attached listeners to every registered event</summary>

```ts
const emitter = new EventEmitter<MyEvents>()
  .on('greet', () => {})
  .once('greet', () => {})
  .on('farewell', () => {})

console.log(emitter.listenerCount('greet')) // Outputs: `2`
console.log(emitter.listenerCount('farewell')) // Outputs: `1`
console.log(emitter.listenerCount('error')) // Outputs: `0`

emitter.removeAllListeners()

console.log(emitter.listenerCount('greet')) // Outputs: `0`
console.log(emitter.listenerCount('farewell')) // Outputs: `0`
console.log(emitter.listenerCount('error')) // Outputs: `0`
```

</details>

---

<details>
<summary>Remove all attached listeners to a specific event</summary>

```ts
const emitter = new EventEmitter<MyEvents>()
  .on('greet', () => {})
  .once('greet', () => {})
  .on('farewell', () => {})
  .removeAllListeners('greet')

console.log(emitter.listenerCount('greet')) // Outputs: `0`
console.log(emitter.listenerCount('farewell')) // Outputs: `1`
console.log(emitter.listenerCount('error')) // Outputs: `0`
```

</details>

---

<details>
<summary>Remove specifc listeners attached to a specific event</summary>

```ts
const callback1 = () => {}
const callback2 = () => {}

const emitter = new EventEmitter<MyEvents>()
  .on('greet', callback1)
  .once('greet', callback1)
  .once('greet', callback2)
  .on('farewell', callback1)
  .removeAllListeners('greet', callback1)

console.log(emitter.listenerCount('greet')) // Outputs: `1`
console.log(emitter.listenerCount('farewell')) // Outputs: `1`
console.log(emitter.listenerCount('error')) // Outputs: `0`
```

</details>

---

### Made with ☕

<table style='display:flex;gap:20px;'>
  <tbody>
    <tr>
      <td>
        <img alt="avatar" src='https://avatars.githubusercontent.com/u/35973186' style='width:60px;border-radius:50%;object-fit:contain;'>
      </td>
      <td>
        <table style='display:flex;gap:2px;flex-direction:column;'>
          <tbody>
              <tr>
                <td>
                  <a href='https://github.com/alessiofrittoli' target='_blank' rel='noopener'>Alessio Frittoli</a>
                </td>
              </tr>
              <tr>
                <td>
                  <small>
                    <a href='https://alessiofrittoli.it' target='_blank' rel='noopener'>https://alessiofrittoli.it</a> |
                    <a href='mailto:info@alessiofrittoli.it' target='_blank' rel='noopener'>info@alessiofrittoli.it</a>
                  </small>
                </td>
              </tr>
          </tbody>
        </table>
      </td>
    </tr>
  </tbody>
</table>
