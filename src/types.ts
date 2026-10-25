/**
 * A tuple type that represents a rest parameter of any type.
 * This type can be used to define a function parameter that accepts any number of arguments of any type.
 */
export type AnyRest = [...args: unknown[]]

/**
 * A utility type that resolves to a specific type based on the provided keys and event map.
 *
 * @template K The key representing the event name.
 * @template T The event map type.
 *
 * If `T` extends `DefaultEventMap`, it resolves to `AnyRest`.
 * Otherwise, if `K` is a key in `T`, it resolves to the type of the event arguments for that key.
 * If `K` is not a key in `T`, it resolves to `never`.
 */
export type Args<K, T> = T extends DefaultEventMap ? AnyRest : K extends keyof T ? T[K] : never

/**
 * Represents a default event map where each event name (key) is associated with a tuple containing a single element of type `never`.
 *
 */
export type DefaultEventMap = Record<string, [never]>

/**
 * A map of event names to their respective argument types.
 *
 * This type is used to define the structure of events and their associated data.
 * Each key in the map represents an event name, and the value is an array of
 * argument types that the event handler will receive when the event is emitted.
 */
export type EventsMap<T> = Record<keyof T, unknown[]> | DefaultEventMap

/**
 * A wrapper interface for a listener that should be invoked only once.
 *
 * @template T The type of the events map.
 * @template K The type of the event key, defaults to the keys of the events map.
 *
 * @param args The arguments to be passed to the listener.
 * @returns The result of the listener execution, which can be a value or a promise.
 *
 * @property {Listener<T, K>} listener The actual listener function that will be invoked.
 */
export interface OnceListenerWrapper<T extends EventsMap<T>, K extends keyof T = keyof T> {
	// oxlint-disable-next-line typescript/no-redundant-type-constituents
	(...args: Args<K, T>): unknown | Promise<unknown>
	/** The actual listener function that will be invoked. */
	listener: Listener<T, K>
}

/**
 * A specialized Map interface for managing "once" listeners in an event emitter.
 *
 * @template T The type of the events map.
 * @template K The keys of the events map, defaulting to all keys of T.
 */
export interface OnceListenersMap<T extends EventsMap<T>, K extends keyof T = keyof T> extends Map<
	K,
	OnceListenerWrapper<T, K>[]
> {
	/**
	 * Executes a provided function once per each key/value pair in the Map, in insertion order.
	 *
	 */
	forEach<K extends keyof T>(
		callbackfn: (
			value: OnceListenerWrapper<T, K>[],
			key: K,
			map: Map<K, OnceListenerWrapper<T, K>[]>,
		) => void,
		thisArg?: unknown,
	): void
	/**
	 * Returns a specified element from the Map object. If the value that is associated to the provided key is an object, then you will get a reference to that object and any change made to that object will effectively modify it inside the Map.
	 * @returns Returns the element associated with the specified key. If no element is associated with the specified key, undefined is returned.
	 */
	get<K extends keyof T>(key: K): OnceListenerWrapper<T, K>[] | undefined
	/**
	 * Adds a new element with a specified key and value to the Map. If an element with the same key already exists, the element will be updated.
	 */
	set<K extends keyof T>(key: K, value: OnceListenerWrapper<T, K>[]): this
}

/**
 * A custom function that transform caught `Error` to something else.
 *
 * @param error The caught `Error`.
 * @returns The transformed `error`.
 */
export type TransformErrorHandler = (error: unknown) => unknown

/**
 * Options for configuring the EventEmitter.
 *
 */
export interface EventEmitterOptions<T extends EventsMap<T> = DefaultEventMap> {
	/**
	 * Indicates whether the EventEmitter should capture and handle promise rejections.
	 * If set to true, the EventEmitter will automatically capture and handle any promise rejections
	 * that occur within event listeners.
	 *
	 * @default false
	 */
	captureRejections?: boolean
	/**
	 * A custom event name used to emit the captured rejection.
	 *
	 * @default 'error'
	 */
	capturedRejectionEvent?: keyof T
	/**
	 * A custom function that transform caught `Error` to something else.
	 *
	 * @param error The caught `Error`.
	 * @returns The transformed `error`.
	 */
	transformError?: TransformErrorHandler
}

/**
 * Type definition for an event handler function.
 *
 * @template T The event map type that defines the events and their corresponding argument types.
 * @template K The specific event key within the event map. Defaults to any key of the event map.
 *
 * @param args The arguments passed to the event handler, corresponding to the event key.
 */
export type Listener<T extends EventsMap<T>, K extends keyof T = keyof T> = (
	...args: Args<K, T>
	// oxlint-disable-next-line typescript/no-redundant-type-constituents
) => unknown | Promise<unknown>
