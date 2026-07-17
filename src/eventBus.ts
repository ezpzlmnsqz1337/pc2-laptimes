import { EventEmitter } from 'events'

const eb = new EventEmitter()
eb.setMaxListeners(100)
export default eb
