import { EventEmitter, type Listener } from '@/index'

interface MyEvents
{
	event			: [ message: string ]
	event2			: [ never ]
	erroredEvent	: [ message: string ]
	error			: [ error: Error ]
}

type OnEventListener = Listener<MyEvents, 'event'>


describe( 'EventEmitter', () => {
	let emitter: EventEmitter<MyEvents>

	beforeEach( () => {
		emitter = new EventEmitter<MyEvents>()
	} )


	afterEach( () => {
		emitter.removeAllListeners()
	} )


	it( 'handles errors with captureRejections', () => {
		const errorEmitter		= new EventEmitter<MyEvents>( { captureRejections: true } )
		const mockErrorCallback	= jest.fn()

		errorEmitter.on( 'error', mockErrorCallback )
		errorEmitter.on( 'erroredEvent', () => {
			throw new Error( 'Test error' )
		} )
		errorEmitter.emit( 'erroredEvent', 'Hello, World!' )

		expect( mockErrorCallback )
			.toHaveBeenCalledWith( expect.any( Error ) )
	} )


	it( 'handles errors with captureRejections and async listeners', async () => {
		const errorEmitter		= new EventEmitter<MyEvents>( { captureRejections: true } )
		const mockErrorCallback	= jest.fn()

		errorEmitter.on( 'error', mockErrorCallback )
		errorEmitter.on( 'erroredEvent', async () => {
			throw new Error( 'Test error' )
		} )
		errorEmitter.emit( 'erroredEvent', 'Hello, World!' )

		/**
		 * await for testing purposes.
		 * 
		 * if we skip this step, the Jest assert will run before the Error is thrown, resulting in a failing test.
		 */
		await new Promise<void>( resolve => resolve() )

		expect( mockErrorCallback )
			.toHaveBeenCalledWith( expect.any( Error ) )
	} )


	it( 'doesn\'t emit `error` event with `captureRejections` when an error is thrown in an `error` event listener avoiding infinite loop', () => {

		let mockErrorCallback

		const callback = () => {
			
			const errorEmitter = new EventEmitter<MyEvents>( { captureRejections: true } )
			
			errorEmitter.on( 'erroredEvent', () => {
				throw new Error( 'Test error' )
			} )
			mockErrorCallback = jest.fn( error => {
				throw new Error( 'Re-thrown error', { cause: error } )
			} )

			errorEmitter.on( 'error', mockErrorCallback )
			errorEmitter.emit( 'erroredEvent', 'Hello, World!' )	

		}

		try {
			callback()
		} catch ( err ) {
			const error = err as Error
			expect( error ).toEqual( new Error( 'Re-thrown error', { cause: new Error( 'Test error' ) } ) )
			expect( mockErrorCallback )
				.toHaveBeenCalledTimes( 1 )
		}
		
	} )


	it( 're-throws errors when captureRejections is `false` or not set', () => {
		
		const errorEmitter		= new EventEmitter<MyEvents>()
		const mockErrorCallback	= jest.fn()
		errorEmitter.on( 'error', mockErrorCallback )
		errorEmitter.on( 'erroredEvent', () => {
			throw new Error( 'Test error' )
		} )

		expect( () => errorEmitter.emit( 'erroredEvent', 'Hello, World!' ) )
			.toThrow( 'Test error' )
	} )


	const actWarningEmit = () => {
		const max = emitter.getMaxListeners()
		const times = max + 1
		const iterations = times === Infinity || times === -Infinity ? 1 : times

		for ( let index = 0; index <= iterations; index++ ) {
			emitter.on( 'event', () => {} )
		}

		const id		= 'MaxListenersExceededWarning'
		const message	= (
			'Possible EventEmitter memory leak detected. '
			+ `${ max + 1 } event listeners added to [EventEmitter]. `
			+ `MaxListeners is ${ emitter.getMaxListeners() }. Use emitter.setMaxListeners() to increase limit`
		)

		return { id, message }
	}
	

	it( 'emits a process warning when listeners exceed the max listeners count', () => {
		const warnSpy = jest.spyOn( process, 'emitWarning' ).mockImplementation()
		
		emitter.setMaxListeners( 1 )
		const { id, message } = actWarningEmit()
		expect( warnSpy ).toHaveBeenCalledWith( message, id )
		warnSpy.mockRestore()
	} )


	it( 'emits a console warning when process is not defined and listeners exceed the max listeners count', () => {
		const originalProcess = global.process
		// @ts-expect-error testing `console.wanr`
		delete global.process
		const warnSpy = jest.spyOn( console, 'warn' ).mockImplementation()

		emitter.setMaxListeners( 1 )
		const { id, message } = actWarningEmit()

		expect( warnSpy ).toHaveBeenCalledWith( expect.objectContaining( {
			id		: id,
			message	: expect.stringContaining( message )
		} ) )

		warnSpy.mockRestore()
		global.process = originalProcess
	} )


	it( 'doesn\'t emit any warning if `maxListeners` is set to `0` or `Infinity`', () => {
		const warnSpy = jest.spyOn( process, 'emitWarning' ).mockImplementation()
		emitter[ 'emitMaxListenersExceeded' ]( 'event' )
		expect( warnSpy ).not.toHaveBeenCalled()
		warnSpy.mockRestore()
	} )
	
	
	it( 'doesn\'t emit any warning if `emitMaxListenersExceeded` get called when no listener has been registered for the given event', () => {
		const warnSpy = jest.spyOn( process, 'emitWarning' ).mockImplementation()
		emitter.setMaxListeners( 0 )
		actWarningEmit()
		emitter.setMaxListeners( Infinity )
		actWarningEmit()
		expect( warnSpy ).not.toHaveBeenCalled()
		warnSpy.mockRestore()
	} )

	
	describe( 'EventEmitter.on()', () => {
		it( 'registers events correctly', () => {
			emitter.on( 'event', () => {} )
			expect( emitter.listenerCount( 'event' ) )
				.toBe( 1 )
		} )


		it( 'registers multiple events', () => {
			emitter.on( 'event', () => {} )
			emitter.on( 'event', () => {} )
			emitter.on( 'event', () => {} )
			expect( emitter.listenerCount( 'event' ) )
				.toBe( 3 )
		} )


		it( 'has alias EventEmitter.addListener()', () => {
			emitter.addListener( 'event', () => {} )
			expect( emitter.listenerCount( 'event' ) )
				.toBe( 1 )
		} )
	} )


	describe( 'EventEmitter.emit()', () => {
		it( 'emits events', () => {
			const mockCallback = jest.fn( ( message => {
				expect( typeof message ).toBe( 'string' )
			} ) as OnEventListener )
	
			emitter.on( 'event', mockCallback )
			emitter.emit( 'event', 'Hello, World!' )
			expect( mockCallback ).toHaveBeenCalledWith( 'Hello, World!' )
		} )


		it( 'executes all listeners in order as they\'ve been registered', () => {
			const executionOrder: string[] = []
			const mockCallback1 = jest.fn( () => executionOrder.push( 'mockCallback1' ) )
			const mockCallback2 = jest.fn( () => executionOrder.push( 'mockCallback2' ) )

			emitter.on( 'event', mockCallback1 )
			emitter.on( 'event', mockCallback2 )
			emitter.emit( 'event', 'Hello, World!' )
			expect( mockCallback1 ).toHaveBeenCalledWith( 'Hello, World!' )
			expect( mockCallback2 ).toHaveBeenCalledWith( 'Hello, World!' )
			expect( executionOrder ).toEqual( [ 'mockCallback1', 'mockCallback2' ] )
		} )
	} )


	describe( 'EventEmitter.once()', () => {
		it( 'handles once listeners', () => {
			const mockCallback = jest.fn()
			emitter.once( 'event', mockCallback )
			emitter.emit( 'event', 'Hello, World!' )
			emitter.emit( 'event', 'Hello again!' )
			expect( mockCallback ).toHaveBeenCalledTimes( 1 )
			expect( mockCallback ).toHaveBeenCalledWith( 'Hello, World!' )
		} )
	} )


	describe( 'EventEmitter.off()', () => {
		it( 'removes listeners', () => {
			const mockCallback = jest.fn()
			emitter.on( 'event', mockCallback )
			emitter.off( 'event', mockCallback )
			emitter.emit( 'event', 'Hello, World!' )
			expect( mockCallback ).not.toHaveBeenCalled()
		} )


		it( 'skips logic and return this of no listener has been added', () => {
			expect( emitter.off( 'event', () => {} ) )
				.toBeInstanceOf( EventEmitter )
		} )


		it( 'has alias EventEmitter.removeListener()', () => {
			const callback = () => {}
			emitter.on( 'event', callback )
			emitter.removeListener( 'event', callback )
			expect( emitter.listenerCount( 'event' ) )
				.toBe( 0 )
		} )
	} )


	describe( 'EventEmitter.prepend()', () => {
		it( 'add a listener on top of listeners array', () => {
			const executionOrder: string[] = []
			const mockCallback1 = jest.fn( () => executionOrder.push( 'mockCallback1' ) )
			const mockCallback2 = jest.fn( () => executionOrder.push( 'mockCallback2' ) )

			emitter.on( 'event', mockCallback1 )
			emitter.prepend( 'event', mockCallback2 )
			emitter.emit( 'event', 'Hello, World!' )
			
			expect( executionOrder ).toEqual( [ 'mockCallback2', 'mockCallback1' ] )
		} )


		it( 'creates a new listeners array if it doesn\'t exists yet', () => {
			const mockCallback1 = jest.fn( () => {} )
			emitter.prepend( 'event', mockCallback1 )
			expect( emitter.listeners( 'event' ) ).toEqual( [ mockCallback1 ] )
		} )


		it( 'has EventEmitter.prependListener() alias', () => {
			const executionOrder: string[] = []
			const mockCallback1 = jest.fn( () => executionOrder.push( 'mockCallback1' ) )
			const mockCallback2 = jest.fn( () => executionOrder.push( 'mockCallback2' ) )

			emitter.on( 'event', mockCallback1 )
			emitter.prependListener( 'event', mockCallback2 )
			emitter.emit( 'event', 'Hello, World!' )
			expect( executionOrder ).toEqual( [ 'mockCallback2', 'mockCallback1' ] )
		} )
	} )
	
	
	describe( 'EventEmitter.prependOnce()', () => {
		it( 'add a listener on top of once listeners array', () => {
			const executionOrder: string[] = []
			const mockCallback1 = jest.fn( () => executionOrder.push( 'mockCallback1' ) )
			const mockCallback2 = jest.fn( () => executionOrder.push( 'mockCallback2' ) )

			emitter.once( 'event', mockCallback1 )
			emitter.prependOnce( 'event', mockCallback2 )
			emitter.emit( 'event', 'Hello, World!' )
			emitter.emit( 'event', 'Hello, again!' )

			expect( executionOrder ).toEqual( [ 'mockCallback2', 'mockCallback1' ] )
			expect( mockCallback2 ).toHaveBeenCalledTimes( 1 )
			expect( mockCallback1 ).toHaveBeenCalledTimes( 1 )
		} )


		it( 'has EventEmitter.prependOnceListener() alias', () => {
			const executionOrder: string[] = []
			const mockCallback1 = jest.fn( () => executionOrder.push( 'mockCallback1' ) )
			const mockCallback2 = jest.fn( () => executionOrder.push( 'mockCallback2' ) )

			emitter.once( 'event', mockCallback1 )
			emitter.prependOnceListener( 'event', mockCallback2 )
			emitter.emit( 'event', 'Hello, World!' )
			emitter.emit( 'event', 'Hello, again!' )

			expect( executionOrder ).toEqual( [ 'mockCallback2', 'mockCallback1' ] )
			expect( mockCallback2 ).toHaveBeenCalledTimes( 1 )
			expect( mockCallback1 ).toHaveBeenCalledTimes( 1 )
		} )
	} )

	
	describe( 'EventEmitter.removeAllListeners()', () => {
		it( 'removes all listeners', () => {
			const mockCallback = jest.fn()
			emitter.on( 'event', mockCallback )
			emitter.on( 'event', mockCallback )
			emitter.on( 'event', mockCallback )
			emitter.on( 'event2', mockCallback )
			emitter.on( 'event2', mockCallback )

			emitter.removeAllListeners()
			expect( emitter.listenerCount( 'event' ) ).toBe( 0 )
			expect( emitter.listenerCount( 'event2' ) ).toBe( 0 )
		} )


		it( 'removes all listeners for a specific event', () => {
			const mockCallback = jest.fn()
			emitter.on( 'event', mockCallback )
			emitter.on( 'event', mockCallback )
			emitter.on( 'event', mockCallback )
			emitter.on( 'event2', mockCallback )
			emitter.on( 'event2', mockCallback )

			emitter.removeAllListeners( 'event' )
			expect( emitter.listenerCount( 'event' ) ).toBe( 0 )
			expect( emitter.listenerCount( 'event2' ) ).toBe( 2 )
		} )


		it( 'removes all listeners for a specific event and listener', () => {
			const mockCallback = jest.fn()
			const mockCallback2 = jest.fn()
			emitter.on( 'event', mockCallback )
			emitter.on( 'event', mockCallback2 )
			emitter.once( 'event', mockCallback2 )
			emitter.on( 'event2', mockCallback )
			emitter.on( 'event2', mockCallback )

			emitter.removeAllListeners( 'event', mockCallback2 )
			expect( emitter.listenerCount( 'event' ) ).toBe( 1 )
			expect( emitter.listenerCount( 'event2' ) ).toBe( 2 )
		} )
	} )


	describe( 'EventEmitter.listenerCount()', () => {
		it( 'returns the correct listener count', () => {
			const mockCallback = jest.fn()
			emitter.on( 'event', mockCallback )
			expect( emitter.listenerCount( 'event' ) ).toBe( 1 )
			emitter.off( 'event', mockCallback )
			expect( emitter.listenerCount( 'event' ) ).toBe( 0 )
		} )


		it( 'returns the count of event listeners for a specific listener callback', () => {
			const callback = () => {}
			const callback2 = () => {}

			emitter.on( 'event', callback ) // 1
			emitter.once( 'event', callback ) // 2

			expect( emitter.listenerCount( 'event', callback ) ).toBe( 2 )

			emitter.on( 'event', callback2 ) // 1
			emitter.once( 'event', callback2 ) // 2
			emitter.once( 'event', callback2 ) // 3

			expect( emitter.listenerCount( 'event', callback2 ) ).toBe( 3 )

			// call `off` `n` times more than it needs.
			emitter.off( 'event', callback ) // removes 2
			emitter.off( 'event', callback ) // removes 1
			emitter.off( 'event', callback ) // nothing to remove

			emitter.off( 'event', callback2 ) // removes 3

			expect( emitter.listenerCount( 'event', callback ) ).toBe( 0 )
			expect( emitter.listenerCount( 'event', callback2 ) ).toBe( 2 )
		} )
	} )


	describe( 'EventEmitter.eventNames()', () => {
		it( 'returns the correct event names list', () => {
			emitter.on( 'event', jest.fn() )
			emitter.on( 'event2', jest.fn() )
			expect( emitter.eventNames() ).toEqual( [ 'event', 'event2' ] )
		} )
	} )


	describe( 'EventEmitter.listeners()', () => {
		it( 'returns a copy of the original listeners array', () => {
			const callback1 = () => {}
			emitter.on( 'event', callback1 )
			emitter.once( 'event', callback1 )
			expect( emitter.listeners( 'event' ) ).toEqual( [ callback1, callback1 ] )
		} )
	} )


	describe( 'EventEmitter.rawListeners()', () => {
		it( 'returns a copy of listeners array', () => {
			const callback1 = () => {}
			emitter.on( 'event', callback1 )
			emitter.once( 'event', callback1 )
			const listeners = emitter.rawListeners( 'event' )
			const listener1 = listeners.at( 0 )
			const listener2 = listeners.at( 1 )
			expect( listener1 ).toBe( callback1 )
			expect( listener2 ).not.toBe( callback1 )
			expect( 'listener' in listener2! ).toBe( true )

			if ( listener2 ) {
				if ( 'listener' in listener2 ) {
					expect( listener2.listener ).toBe( callback1 )
				}
			}
		} )

		it( 'returns an empty array if no listener has been added', () => {
			expect( emitter.listeners( 'event' ).length ).toBe( 0 )
		} )
	} )


	describe( 'EventEmitter.setMaxListeners()', () => {
		it( 'set custom suggested max listener in the current instance', () => {
			emitter.setMaxListeners( 100 )
			expect( emitter.getMaxListeners() ).toBe( 100 )
		} )
	} )


	describe( 'EventEmitter.defaultMaxListeners', () => {
		it( 'can be set to edit MaxListeners in all EventEmitter instances created after this set', () => {
			const defaultMaxListeners = EventEmitter.defaultMaxListeners
			EventEmitter.defaultMaxListeners = 99
			const emitter1 = new EventEmitter()
			const emitter2 = new EventEmitter()
			expect( emitter1.getMaxListeners() ).toBe( 99 )
			expect( emitter2.getMaxListeners() ).toBe( 99 )
			EventEmitter.defaultMaxListeners = defaultMaxListeners
		} )


		it( 'throws a RangeError if set to a negative value', () => {
			const defaultMaxListeners = EventEmitter.defaultMaxListeners
			EventEmitter.defaultMaxListeners = -100
			expect( () => new EventEmitter() ).toThrow( 'The value of "defaultMaxListeners" is out of range. It must be >= 0. Received -100' )
			EventEmitter.defaultMaxListeners = defaultMaxListeners
		} )
	} )


	describe( 'EventEmitter.getMaxListeners()', () => {
		it( 'returns the max suggested listeners', () => {
			expect( emitter.getMaxListeners() ).toBe( EventEmitter.defaultMaxListeners )
		} )


		it( 'returns the max listeners set by EventEmitter.setMaxListeners()', () => {
			emitter.setMaxListeners( 100 )
			expect( emitter.getMaxListeners() ).toBe( 100 )
		} )
	} )
} )