import { WebsocketState } from '@/constants/WebsocketState'

const MAX_RETRY_ATTEMPTS = 3

export type RealtimeDataListener = (message: MessageEvent<any>) => any;

export default class RealtimeDataBuilder {
  // eslint-disable-next-line no-use-before-define
  private static instance?: RealtimeDataBuilder

  protected ws: WebSocket | null = null
  protected hostname = window.location.hostname
  protected port = 8765
  listeners: Function[] = []
  protected retryHandler?: number
  protected retries = 0

  static getInstance (): RealtimeDataBuilder {
    if (!RealtimeDataBuilder.instance) {
      RealtimeDataBuilder.instance = new RealtimeDataBuilder()
    }
    return RealtimeDataBuilder.instance
  }

  connect (hostname: string, port: number) {
    this.hostname = hostname
    this.port = port
    this.ws = new WebSocket(`ws://${hostname}:${port}`)
    this.ws.onmessage = (message) => {
      try {
        const data = JSON.parse(message.data)
        if (data.packetType === undefined) return
        // console.log('Packet type: ', data)
        this.listeners.forEach((x) => x(data))
      } catch (e: unknown) {
        console.log('Error: ', (e as SyntaxError).message, message)
      }
    }

    if (!this.retryHandler) this.setupRetryHandler()
  }

  disconnect () {
    clearInterval(this.retryHandler)
    this.ws!.close()
  }

  setupRetryHandler () {
    this.retryHandler = setInterval(() => {
      if (this.retries >= MAX_RETRY_ATTEMPTS) {
        clearInterval(this.retryHandler)
        return
      }
      if (this.ws!.readyState !== WebsocketState.ESTABLISHED) {
        this.retry()
        console.log(
          `Retry WS connection attempt ${this.retries}/${MAX_RETRY_ATTEMPTS}`
        )
      } else {
        this.retries = 0
      }
    }, 5000)
  }

  addListener (listener: RealtimeDataListener) {
    this.listeners.push(listener)
    return listener
  }

  removeListener (listener: Function) {
    this.listeners.splice(this.listeners.indexOf(listener), 1)
  }

  retry () {
    this.connect(this.hostname, this.port)
    this.retries++
  }

  getWebsocketState () {
    return this.ws ? this.ws.readyState : WebsocketState.NOT_YET_ESTABLISHED
  }

  getHostname () {
    return this.hostname
  }
}
