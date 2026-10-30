import { PacketType } from '@/constants/PacketType'
import { WebsocketState } from '@/constants/WebsocketState'

const isDebugEnabled = process.env.NODE_ENV === 'development'
const MAX_RETRY_ATTEMPTS = 3
const RETRY_INTERVAL_MS = 5000
const DEFAULT_TELEMETRY_PORT = 8765

function debugLog (...args: unknown[]) {
  if (isDebugEnabled) console.log(...args)
}

export interface RealtimePacket {
  packetType?: PacketType
  data: Record<string, unknown>
}

export type RealtimeDataListener = (packet: RealtimePacket) => void

export default class RealtimeDataBuilder {
  // eslint-disable-next-line no-use-before-define
  private static instance?: RealtimeDataBuilder

  protected ws: WebSocket | null = null
  protected hostname = window.location.hostname
  protected port = DEFAULT_TELEMETRY_PORT
  listeners: RealtimeDataListener[] = []
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

    this.ws?.close()
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const ws = new WebSocket(`${protocol}://${hostname}:${port}`)
    this.ws = ws

    ws.onmessage = (message) => {
      try {
        const data = JSON.parse(message.data) as RealtimePacket
        if (data.packetType === undefined) return
        this.listeners.forEach((listener) => listener(data))
      } catch (e: unknown) {
        debugLog('Error parsing realtime telemetry packet:', e, message.data)
      }
    }

    if (!this.retryHandler) this.setupRetryHandler()
  }

  disconnect () {
    if (this.retryHandler) clearInterval(this.retryHandler)
    this.retryHandler = undefined
    this.retries = 0
    this.ws?.close()
    this.ws = null
  }

  setupRetryHandler () {
    this.retryHandler = setInterval(() => {
      if (this.retries >= MAX_RETRY_ATTEMPTS) {
        clearInterval(this.retryHandler)
        this.retryHandler = undefined
        return
      }
      if (this.ws?.readyState !== WebsocketState.ESTABLISHED) {
        this.retry()
        debugLog(
          `Retry WS connection attempt ${this.retries}/${MAX_RETRY_ATTEMPTS}`
        )
      } else {
        this.retries = 0
      }
    }, RETRY_INTERVAL_MS)
  }

  addListener (listener: RealtimeDataListener) {
    this.listeners.push(listener)
    return listener
  }

  removeListener (listener: RealtimeDataListener) {
    const index = this.listeners.indexOf(listener)
    if (index === -1) return
    this.listeners.splice(index, 1)
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
