export default class LightsBuilder {
    static instance: LightsBuilder

    static getInstance () {
      if (!LightsBuilder.instance) {
        LightsBuilder.instance = new LightsBuilder()
      }
      return LightsBuilder.instance
    }

    async setLightsColor (url: string, lightId: string, colorHex: string, brightness: number) {
      const data = {
        id: lightId,
        color: colorHex,
        brightness
      }

      await fetch(`${url}/api/color`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
    }

    async setLightsPower (url: string, lightId: string, power: boolean) {
      const data = { id: lightId, power }

      await fetch(`${url}/api/power`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
    }
}
