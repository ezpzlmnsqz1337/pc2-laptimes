import { EventEmitter } from 'events'

/**
 * Class that routes events across application
 */
export class EventBus extends EventEmitter {}

const eb = new EventBus()
eb.setMaxListeners(100)
export default eb
