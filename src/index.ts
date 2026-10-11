import type {
	Args,
	DefaultEventMap,
	EventsMap,
	OnceListenersMap,
	OnceListenerWrapper,
	EventEmitterOptions,
	Listener,
	TransformErrorHandler,
} from '@/types'

export type * from '@/types'

/**
 * The `EventEmitter` class provides a mechanism to handle events and their listeners.
 * It allows you to register event listeners, emit events, and manage the listeners for those events.
 *
 * This class is an exact implementation of the `EventEmitter` class from '@alessiofrittoli/event-emitter'
 * but it is supported on different environments like 'Browser', 'Edge Runtime' and 'Node.js' of course.
 *
 * @template T The type representing the events.
 *
 * @example
 * ```ts
 * import { EventEmitter } from '@alessiofrittoli/event-emitter'
 *
 * interface MyEvents
 * {
 *   event1: [ string ]
 *   event2: [ number, boolean ]
 * }
 *
 * const emitter = new EventEmitter<MyEvents>()
 *
 * emitter.on( 'event1', arg1 => {
 * 	console.log( `event1 received with arg: ${ arg1 }` )
 * } )
 *
 * emitter.emit( 'event1', 'Hello, World!' )
 * ```
 */
export class EventEmitter<T extends EventsMap<T> = DefaultEventMap> {
	/**
	 * By default, a maximum of `10` listeners can be registered for any single
	 * event. This limit can be changed for individual `EventEmitter` instances
	 * using the `emitter.setMaxListeners( n )` method. To change the default
	 * for _all_`EventEmitter` instances, the `EventEmitter.defaultMaxListeners` property
	 * can be used. If this value is not a positive number, a `RangeError` is thrown.
	 *
	 * Take caution when setting the `EventEmitter.defaultMaxListeners` because the
	 * change affects _all_ `EventEmitter` instances, including those created before
	 * the change is made. However, calling `emitter.setMaxListeners( n )` still has
	 * precedence over `EventEmitter.defaultMaxListeners`.
	 *
	 * This is not a hard limit. The `EventEmitter` instance will allow
	 * more listeners to be added but will output a trace warning to stderr indicating
	 * that a "possible EventEmitter memory leak" has been detected. For any single
	 * `EventEmitter`, the `emitter.getMaxListeners()` and `emitter.setMaxListeners()` methods can be used to
	 * temporarily avoid this warning:
	 *
	 * ```ts
	 * import { EventEmitter } from '@alessiofrittoli/event-emitter'
	 * const emitter = new EventEmitter()
	 * emitter.setMaxListeners( emitter.getMaxListeners() + 1 )
	 * emitter.once( 'event', () => {
	 *   // do stuff
	 *   emitter.setMaxListeners( Math.max( emitter.getMaxListeners() - 1, 0 ) )
	 * } )
	 * ```
	 *
	 * The `--trace-warnings` command-line flag can be used to display the
	 * stack trace for such warnings.
	 *
	 * The emitted warning can be inspected with `process.on( 'warning' )` and will
	 * have the additional `emitter`, `type`, and `count` properties, referring to
	 * the event emitter instance, the event's name and the number of attached
	 * listeners, respectively.
	 * Its `name` property is set to `'MaxListenersExceededWarning'`
	 */
	public static defaultMaxListeners = 10

	/**
	 * The maximum number of listeners that can be registered for an event.
	 * This value is initialized to the default maximum number of listeners
	 * defined by the EventEmitter class.
	 */
	private maxListeners: number = EventEmitter.defaultMaxListeners

	/**
	 * A map of event names to their respective listeners.
	 *
	 * @template T - An interface that defines the event names and their corresponding payload types.
	 * @property {Object.<keyof T, (Listener<T, K> | OnceListenerWrapper<T, K>)[]>} events An object where
	 * the keys are event names (from the interface T) and the values are arrays of listeners.
	 * Each listener can either be a regular listener or a once listener wrapper (those registered with `.once()` method).
	 */
	private events: {
		[K in keyof T]?: (Listener<T, K> | OnceListenerWrapper<T, K>)[]
	} = {}

	/**
	 * A map that tracks whether a warning has been emitted for each key in the type `T`.
	 * The keys are of type `keyof T` and the values are optional booleans.
	 * If a key's value is `true`, it indicates that a warning has already been emitted for that key.
	 */
	private warningEmitted: {
		[K in keyof T]?: boolean
	} = {}

	/**
	 * A map to store event handlers that should be called only once.
	 * The key is the original event handler, and the value is the wrapped event handler
	 * that ensures the event is handled only once.
	 */
	private onceListeners: OnceListenersMap<T> = new Map()

	/**
	 * Indicates whether the event emitter should capture and handle promise rejections.
	 * When set to `true`, the event emitter will automatically handle any promise rejections
	 * that occur during event handling, preventing unhandled promise rejection warnings.
	 */
	private captureRejections: boolean

	/**
	 * The event name used to emit the captured rejection.
	 *
	 */
	private capturedRejectionEvent: keyof T | 'error'

	/**
	 * A custom function that transform caught `Error` to something else.
	 *
	 * @param error The caught `Error`.
	 * @returns The transformed `error`.
	 */
	private transformError?: TransformErrorHandler

	/**
	 * Indicates whether the event emitter is paused or not.
	 *
	 */
	protected _eventsPaused: boolean = false
	/**
	 * Indicates whether the event emitter is paused or not.
	 *
	 */
	public get eventsPaused(): typeof this._eventsPaused {
		return this._eventsPaused
	}

	protected set eventsPaused(value: typeof this._eventsPaused) {
		this._eventsPaused = value
	}

	/**
	 * A map of paused events.
	 *
	 */
	protected _pausedEvents?: Partial<Record<keyof T, boolean>> = undefined
	/**
	 * A map of paused events.
	 *
	 */
	public get pausedEvents(): typeof this._pausedEvents {
		return this._pausedEvents
	}

	protected set pausedEvents(value: typeof this._pausedEvents) {
		this._pausedEvents = value
	}

	/**
	 * Creates a new instance of EventEmitter.
	 *
	 * @param options An object defining custom configurations. See {@link EventEmitterOptions} for more info.
	 */
	public constructor(options: EventEmitterOptions<T> = {}) {
		const { captureRejections = false, capturedRejectionEvent = 'error', transformError } = options

		this.captureRejections = captureRejections
		this.capturedRejectionEvent = capturedRejectionEvent
		this.transformError = transformError

		if (this.maxListeners < 0) {
			throw new RangeError(
				`The value of "defaultMaxListeners" is out of range. It must be >= 0. Received ${this.maxListeners}`,
			)
		}
	}

	/**
	 * Synchronously calls each of the listeners registered for the event named `event`, in the order they were registered, passing the supplied arguments
	 * to each.
	 *
	 * Returns `true` if the event had listeners, `false` otherwise.
	 *
	 * ```ts
	 * import { EventEmitter } from '@alessiofrittoli/event-emitter'
	 * const myEmitter = new EventEmitter()
	 *
	 * // First listener
	 * myEmitter.on( 'event', function firstListener() {
	 *   console.log( 'Helloooo! first listener' )
	 * } )
	 *
	 * // Second listener
	 * myEmitter.on( 'event', function secondListener( arg1, arg2 ) {
	 *   console.log( `event with parameters ${ arg1 }, ${ arg2 } in second listener` )
	 * } )
	 *
	 * // Third listener
	 * myEmitter.on( 'event', function thirdListener( ...args ) {
	 *   const parameters = args.join( ', ' )
	 *   console.log( `event with parameters ${ parameters } in third listener` )
	 * } )
	 *
	 * console.log( myEmitter.listeners( 'event' ) )
	 *
	 * myEmitter.emit( 'event', 1, 2, 3, 4, 5 )
	 *
	 * // Prints:
	 * // [
	 * //   [Function: firstListener],
	 * //   [Function: secondListener],
	 * //   [Function: thirdListener]
	 * // ]
	 * // Helloooo! first listener
	 * // event with parameters 1, 2 in second listener
	 * // event with parameters 1, 2, 3, 4, 5 in third listener
	 * ```
	 */
	public emit<K extends keyof T>(event: K, ...args: Args<K, T>): boolean {
		if (!this.events[event]) return false

		/**
		 * Indicates that the event has been resumed via `EventEmitter.resumeEvents( event )`.
		 *
		 */
		const eventHasBeenResumed =
			this.pausedEvents && event in this.pausedEvents && !this.pausedEvents[event]

		/**
		 * Do not emit if all events have been paused and the event hasn't been resumed.
		 *
		 */
		if (this.eventsPaused && !eventHasBeenResumed) {
			return false
		}

		/**
		 * Do not emit if the event has been paused.
		 *
		 */
		if (this.pausedEvents?.[event]) {
			return false
		}

		this.events[event].forEach(listener => {
			try {
				const result = listener(...args)
				if (
					this.captureRejections &&
					result instanceof Promise &&
					event !== this.capturedRejectionEvent
				) {
					result.catch(error =>
						this.emit(
							this.capturedRejectionEvent as K,
							...([this.transformError?.(error) || error] as Args<K, T>),
						),
					)
				}
			} catch (error) {
				if (this.captureRejections && event !== this.capturedRejectionEvent) {
					this.emit(
						this.capturedRejectionEvent as K,
						...([this.transformError?.(error) || error] as Args<K, T>),
					)
				} else {
					throw this.transformError?.(error) || error
				}
			}
		})

		return true
	}

	/**
	 * Adds the `listener` function to the end of the listeners array for the event
	 * named `event`. No checks are made to see if the `listener` has already
	 * been added. Multiple calls passing the same combination of `event` and
	 * `listener` will result in the `listener` being added, and called, multiple times.
	 *
	 * ```ts
	 * server.on( 'connection', stream => {
	 *   console.log( 'someone connected!' )
	 * } )
	 * ```
	 *
	 * Returns a reference to the `EventEmitter`, so that calls can be chained.
	 *
	 * By default, event listeners are invoked in the order they are added. The `emitter.prependListener()` method can be used as an alternative to add the
	 * event listener to the beginning of the listeners array.
	 *
	 * ```ts
	 * import { EventEmitter } from '@alessiofrittoli/event-emitter'
	 * const myEE = new EventEmitter()
	 * myEE.on( 'foo', () => console.log( 'a' ) )
	 * myEE.prependListener( 'foo', () => console.log( 'b' ) )
	 * myEE.emit( 'foo' )
	 * // Prints:
	 * //   b
	 * //   a
	 * ```
	 * @param event The name of the event.
	 * @param listener The callback function
	 */
	public on<K extends keyof T>(event: K, listener: Listener<T, K>): this {
		this.events[event] ||= []
		this.events[event].push(listener)

		return this.emitMaxListenersExceeded(event)
	}

	/**
	 * Adds the `listener` function to the _beginning_ of the listeners array for the
	 * event named `event`. No checks are made to see if the `listener` has
	 * already been added. Multiple calls passing the same combination of `event`
	 * and `listener` will result in the `listener` being added, and called, multiple times.
	 *
	 * ```ts
	 * server.prependListener( 'connection', stream => {
	 * 	console.log( 'someone connected!' )
	 * } )
	 * ```
	 *
	 * Returns a reference to the `EventEmitter`, so that calls can be chained.
	 *
	 * @param event The name of the event.
	 * @param listener The callback function
	 */
	public prepend<K extends keyof T>(event: K, listener: Listener<T, K>): this {
		this.events[event] ||= []
		this.events[event].unshift(listener)

		return this.emitMaxListenersExceeded(event)
	}

	/**
	 * Adds a **one-time** `listener` function for the event named `event`. The
	 * next time `event` is triggered, this listener is removed and then invoked.
	 *
	 * ```ts
	 * server.once( 'connection', stream => {
	 * 	console.log( 'Ah, we have our first user!' )
	 * } )
	 * ```
	 *
	 * Returns a reference to the `EventEmitter`, so that calls can be chained.
	 *
	 * By default, event listeners are invoked in the order they are added. The `emitter.prependOnceListener()` method can be used as an alternative to add the
	 * event listener to the beginning of the listeners array.
	 *
	 * ```ts
	 * import { EventEmitter } from '@alessiofrittoli/event-emitter'
	 * const myEE = new EventEmitter()
	 * myEE.once( 'foo', () => console.log( 'a' ) )
	 * myEE.prependOnceListener( 'foo', () => console.log( 'b' ) )
	 * myEE.emit( 'foo' )
	 * // Prints:
	 * //   b
	 * //   a
	 * ```
	 * @param event The name of the event.
	 * @param listener The callback function
	 */
	public once<K extends keyof T>(event: K, listener: Listener<T, K>): this {
		return this.on(event, this.createOnceWrapper(event, listener))
	}

	/**
	 * Adds a **one-time**`listener` function for the event named `event` to the _beginning_ of the listeners array. The next time `event` is triggered, this
	 * listener is removed, and then invoked.
	 *
	 * ```ts
	 * server.prependOnceListener( 'connection', stream => {
	 * 	console.log( 'Ah, we have our first user!' )
	 * } )
	 * ```
	 *
	 * Returns a reference to the `EventEmitter`, so that calls can be chained.
	 *
	 * @param event The name of the event.
	 * @param listener The callback function
	 */
	public prependOnce<K extends keyof T>(event: K, listener: Listener<T, K>): this {
		return this.prepend(event, this.createOnceWrapper(event, listener))
	}

	/**
	 * Removes the specified `listener` from the listener array for the event named `event`.
	 *
	 * ```ts
	 * const callback = stream => {
	 * 	console.log( 'someone connected!' )
	 * }
	 * server.on( 'connection', callback )
	 * // ...
	 * server.off( 'connection', callback )
	 * ```
	 *
	 * `off()` will remove, at most, one instance of a listener from the
	 * listener array. If any single listener has been added multiple times to the
	 * listener array for the specified `event`, then `off()` must be
	 * called multiple times to remove each instance.
	 *
	 * Once an event is emitted, all listeners attached to it at the
	 * time of emitting are called in order. This implies that any `off()` or `removeAllListeners()` calls _after_ emitting and _before_ the last listener finishes execution
	 * will not remove them from `emit()` in progress. Subsequent events behave as expected.
	 *
	 * ```ts
	 * import { EventEmitter } from '@alessiofrittoli/event-emitter'
	 * class MyEmitter extends EventEmitter {}
	 * const myEmitter = new MyEmitter()
	 *
	 * const callbackA = () => {
	 * 	console.log( 'A' );
	 * 	myEmitter.off( 'event', callbackB )
	 * }
	 *
	 * const callbackB = () => {
	 * 	console.log( 'B' )
	 * }
	 *
	 * myEmitter.on( 'event', callbackA )
	 * myEmitter.on( 'event', callbackB )
	 *
	 * // `callbackA` removes listener `callbackB` but it will still be called.
	 * // Internal listener array at time of emit: [callbackA, callbackB]
	 * myEmitter.emit( 'event' )
	 * // Prints:
	 * //	A
	 * //	B
	 *
	 * // callbackB is now removed.
	 * // Internal listener array [callbackA]
	 * myEmitter.emit( 'event' )
	 * // Prints:
	 * //	A
	 * ```
	 *
	 * Because listeners are managed using an internal array, calling this will
	 * change the position indices of any listener registered _after_ the listener
	 * being removed. This will not impact the order in which listeners are called,
	 * but it means that any copies of the listener array as returned by
	 * the `emitter.listeners()` method will need to be recreated.
	 *
	 * When a single function has been added as a handler multiple times for a single
	 * event (as in the example below), `off()` will remove the most
	 * recently added instance. In the example the `once( 'ping' )` listener is removed:
	 *
	 * ```ts
	 * import { EventEmitter } from '@alessiofrittoli/event-emitter'
	 * const ee = new EventEmitter()
	 *
	 * function pong() {
	 * 	console.log( 'pong' )
	 * }
	 *
	 * ee.on( 'ping', pong )
	 * ee.once( 'ping', pong )
	 * ee.off( 'ping', pong )
	 *
	 * ee.emit( 'ping' )
	 * ee.emit( 'ping' )
	 * ```
	 *
	 * Returns a reference to the `EventEmitter`, so that calls can be chained.
	 */
	public off<K extends keyof T>(event: K, listener: Listener<T, K>): this {
		if (!this.events[event]) return this

		const onceListeners = this.onceListeners.get(event) || []
		const onceWrappers = onceListeners.filter(wrapper => wrapper.listener === listener)
		const originalListener = onceWrappers?.pop() || listener
		const popped = onceListeners.filter(wrapper => wrapper !== originalListener)
		this.events[event] = this.events[event].filter(l => l !== originalListener)

		if (this.events[event].length <= 0) delete this.events[event]

		if (popped.length <= 0) {
			this.onceListeners.delete(event)
		} else {
			this.onceListeners.set(event, popped)
		}

		return this
	}

	/**
	 * Removes all listeners, or those of the specified `event`.
	 *
	 * It is bad practice to remove listeners added elsewhere in the code,
	 * particularly when the `EventEmitter` instance was created by some other
	 * component or module (e.g. sockets or file streams).
	 *
	 * Returns a reference to the `EventEmitter`, so that calls can be chained.
	 */
	public removeAllListeners<K extends keyof T>(event?: K, listener?: Listener<T, K>): this {
		if (event) {
			if (listener) {
				this.rawListeners(event).map(l => {
					if (l === listener || ('listener' in l && l.listener === listener)) {
						this.off(event, listener)
					}
				})
				return this
			}

			delete this.events[event]
			this.onceListeners.delete(event)
			return this
		}
		this.events = {}
		this.onceListeners.clear()
		return this
	}

	/** --- Miscellaneous --- */

	/**
	 * Pause events.
	 *
	 * @returns A reference to the `EventEmitter`, so that calls can be chained.
	 */
	public pauseEvents<K extends keyof T>(event?: K): this {
		if (event) {
			this.pausedEvents ||= {}
			this.pausedEvents[event] = true
			return this
		}

		this.eventsPaused = true
		this.pausedEvents = undefined

		return this
	}

	/**
	 * Resume events.
	 *
	 * @returns A reference to the `EventEmitter`, so that calls can be chained.
	 */
	public resumeEvents<K extends keyof T>(event?: K): this {
		if (event) {
			this.pausedEvents ||= {}
			this.pausedEvents[event] = false
			return this
		}

		this.eventsPaused = false
		this.pausedEvents = undefined

		return this
	}

	/**
	 * Returns an array listing the events for which the emitter has registered listeners.
	 *
	 * ```ts
	 * import { EventEmitter } from '@alessiofrittoli/event-emitter'
	 *
	 * const myEE = new EventEmitter()
	 * myEE.on( 'foo', () => {} )
	 * myEE.on( 'bar', () => {} )
	 *
	 * console.log( myEE.eventNames() )
	 * // Prints: [ 'foo', 'bar' ]
	 * ```
	 */
	public eventNames(): (keyof T)[] {
		return Object.keys(this.events) as (keyof T)[]
	}

	/**
	 * By default `EventEmitter`s will print a warning if more than `10` listeners are
	 * added for a particular event. This is a useful default that helps finding
	 * memory leaks. The `emitter.setMaxListeners()` method allows the limit to be
	 * modified for this specific `EventEmitter` instance. The value can be set to `Infinity` (or `0`) to indicate an unlimited number of listeners.
	 *
	 * Returns a reference to the `EventEmitter`, so that calls can be chained.
	 */
	public setMaxListeners(n: number): this {
		this.maxListeners = n
		return this
	}

	/**
	 * Returns the current max listener value for the `EventEmitter` which is either
	 * set by `emitter.setMaxListeners(n)` or defaults to {@link defaultMaxListeners}.
	 */
	public getMaxListeners(): number {
		return this.maxListeners
	}

	/**
	 * Returns the number of listeners listening for the event named `event`.
	 * If `listener` is provided, it will return how many times the listener is found
	 * in the list of the listeners of the event.
	 *
	 * @param event The name of the event being listened for
	 * @param listener The event handler function
	 */
	public listenerCount<K extends keyof T>(event: K, listener?: Listener<T, K>): number {
		return !this.events[event]
			? 0
			: !listener
				? this.events[event].length
				: this.events[event].filter(
						l => l === listener || ('listener' in l && l.listener === listener),
					).length
	}

	/**
	 * Returns a copy of the array of listeners for the event named `event`.
	 *
	 * ```ts
	 * server.on( 'connection', stream => {
	 * 	console.log( 'someone connected!' )
	 * } )
	 * console.log( server.listeners( 'connection' ) )
	 * // Prints: [ [Function (anonymous)] ]
	 * ```
	 */
	public listeners<K extends keyof T>(event: K): Listener<T, K>[] {
		return this.rawListeners(event).map(listener =>
			'listener' in listener ? listener.listener : listener,
		)
	}

	/**
	 * Returns a copy of the array of listeners for the event named `event`,
	 * including any wrappers (such as those created by `.once()`).
	 *
	 * ```ts
	 * import { EventEmitter } from '@alessiofrittoli/event-emitter';
	 * const emitter = new EventEmitter()
	 * emitter.once( 'log', () => console.log( 'log once' ) )
	 *
	 * // Returns a new Array with a function `onceWrapper` which has a property
	 * // `listener` which contains the original listener bound above
	 * const listeners = emitter.rawListeners( 'log' )
	 * const logFnWrapper = listeners[ 0 ]
	 *
	 * // Logs "log once" to the console and does not unbind the `once` event
	 * 'listener' in logFnWrapper && logFnWrapper.listener()
	 *
	 * // Logs "log once" to the console and removes the listener
	 * logFnWrapper()
	 *
	 * emitter.on( 'log', () => console.log( 'log persistently' ) )
	 * // Will return a new Array with a single function bound by `.on()` above
	 * const newListeners = emitter.rawListeners( 'log' )
	 *
	 * // Logs "log persistently" twice
	 * newListeners[ 0 ]()
	 * emitter.emit( 'log' )
	 * ```
	 */
	public rawListeners<K extends keyof T>(event: K): (Listener<T, K> | OnceListenerWrapper<T, K>)[] {
		return this.events[event] ? [...this.events[event]] : []
	}

	/**
	 * Creates a wrapper function for a given event listener that ensures the listener is only called once.
	 * The wrapper function will automatically remove the listener after it has been called.
	 *
	 * @template K The type of the event key.
	 * @param event The event to listen for.
	 * @param listener The event handler function to be called once.
	 * @returns The wrapper function that will call the listener and then remove itself.
	 */
	private createOnceWrapper<K extends keyof T>(
		event: K,
		listener: Listener<T, K>,
	): OnceListenerWrapper<T, K> {
		const onceWrapper: OnceListenerWrapper<T, K> = (...args) => {
			this.off(event, onceWrapper)
			listener(...args)
		}
		onceWrapper.listener = listener

		const onceEventListeners = this.onceListeners.get(event) || []
		onceEventListeners.push(onceWrapper)
		this.onceListeners.set(event, onceEventListeners)

		return onceWrapper
	}

	/**
	 * Emits a warning if the number of listeners for a given event exceeds the maximum allowed listeners.
	 *
	 * @template K The type of the event key.
	 * @param event The event for which to check the number of listeners.
	 * @returns Returns a reference to the `EventEmitter`, so that calls can be chained.
	 *
	 * @remarks
	 * This method checks if the number of listeners for the specified event exceeds the `maxListeners` limit.
	 * If the limit is exceeded, a warning is emitted using `process.emitWarning`.
	 * The warning is emitted only once per event to avoid spamming the console.
	 *
	 * The method performs the following checks before emitting a warning:
	 * - `maxListeners` is not zero.
	 * - `maxListeners` is not `Infinity`.
	 * - A warning has not already been emitted for the event.
	 * - The event has listeners.
	 * - The number of listeners for the event exceeds `maxListeners`.
	 *
	 * If any of these conditions are not met, the method returns early without emitting a warning.
	 */
	private emitMaxListenersExceeded<K extends keyof T>(event: K): this {
		if (this.maxListeners === 0) return this
		if (this.maxListeners === Infinity) return this
		if (this.warningEmitted[event]) return this
		if (!this.events[event]) return this
		if (this.events[event].length <= this.maxListeners) return this

		this.warningEmitted[event] = true

		const id = 'MaxListenersExceededWarning'
		const message =
			'Possible EventEmitter memory leak detected. ' +
			`${this.events[event].length} ${String(event)} listeners added to [${this.constructor.name}]. ` +
			`MaxListeners is ${this.maxListeners}. Use emitter.setMaxListeners() to increase limit`

		if (typeof process !== 'undefined') {
			process.emitWarning(message, id)
			return this
		}

		console.warn({ id, message })

		return this
	}

	/** --- Aliases --- */

	/**
	 * Alias for `emitter.on( event, listener )`.
	 *
	 */
	public addListener<K extends keyof T>(event: K, listener: Listener<T, K>): this {
		return this.on(event, listener)
	}

	/**
	 * Alias for `emitter.prepend( event, listener )`.
	 *
	 */
	public prependListener<K extends keyof T>(event: K, listener: Listener<T, K>): this {
		return this.prepend(event, listener)
	}

	/**
	 * Alias for `emitter.prependOnce( event, listener )`.
	 *
	 */
	public prependOnceListener<K extends keyof T>(event: K, listener: Listener<T, K>): this {
		return this.prependOnce(event, listener)
	}

	/**
	 * Alias for `emitter.off( event, listener )`.
	 *
	 */
	public removeListener<K extends keyof T>(event: K, listener: Listener<T, K>): this {
		return this.off(event, listener)
	}
}
