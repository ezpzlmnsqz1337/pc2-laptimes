export default class LightsBuilder {
    static instance

    static getInstance () {
      if (!LightsBuilder.instance) {
        LightsBuilder.instance = new LightsBuilder()
      }
      return LightsBuilder.instance
    }

    async setLightsColor (url, lightId, colorHex, brightness) {
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

    async setLightsPower (url, lightId, power) {
      const data = { id: lightId, power }

      await fetch(`${url}/api/power`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
    }
}
