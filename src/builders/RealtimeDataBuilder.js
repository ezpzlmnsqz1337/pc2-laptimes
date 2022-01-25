import WebsocketState from '@/constants/WebsocketState'

const MAX_RETRY_ATTEMPTS = 3

export default class RealtimeDataBuilder {
    static instance

    constructor () {
      this.ws = null
      this.hostname = 'localhost'
      this.port = 8765
      this.listeners = []
      this.retryHandler = null
      this.retries = 0
    }

    static getInstance () {
      if (!RealtimeDataBuilder.instance) {
        RealtimeDataBuilder.instance = new RealtimeDataBuilder()
      }
      return RealtimeDataBuilder.instance
    }

    connect (hostname, port) {
      this.hostname = hostname
      this.port = port
      this.ws = new WebSocket(`ws://${hostname}:${port}`)
      this.ws.onmessage = message => this.listeners.forEach(x => x(message))

      if (!this.retryHandler) this.setupRetryHandler()
    }

    setupRetryHandler () {
      this.retryHandler = setInterval(() => {
        if (this.retries >= MAX_RETRY_ATTEMPTS) {
          clearInterval(this.retryHandler)
          return
        }
        if (this.ws.readyState !== WebsocketState.ESTABLISHED) {
          this.retry()
          console.log(`Retry WS connection attempt ${this.retries}/${MAX_RETRY_ATTEMPTS}`)
        } else {
          this.retries = 0
        }
      }, 5000)
    }

    addListener (listener) {
      if (!listener || typeof listener !== 'function') return
      this.listeners.push(listener)
    }

    removeListener (listener) {
      console.log(listener)
    }

    retry () {
      this.connect(this.hostname, this.port)
      this.retries++
    }

    getWebsocketState () {
      return this.ws ? this.ws.readyState : WebsocketState.NOT_YET_ESTABLISHED
    }
}
