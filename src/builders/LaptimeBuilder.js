const SECONDS_LENGTH = 2
const MILLISECONDS_LENGTH = 3

export default class LaptimeBuilder {
    static instance

    static getInstance () {
      if (!LaptimeBuilder.instance) {
        LaptimeBuilder.instance = new LaptimeBuilder()
      }
      return LaptimeBuilder.instance
    }

    compareLaptimes (laptime1, laptime2) {
      return this.laptimeToDate(laptime1).getTime() - this.laptimeToDate(laptime2).getTime()
    }

    dateToLaptime (date) {
      const [m, s, ms] = [date.getMinutes(), date.getSeconds(), date.getMilliseconds()].map(x => String(x))
      return `${m}:${s.padStart(SECONDS_LENGTH, '0')}.${ms.padStart(MILLISECONDS_LENGTH, '0')}`
    }

    laptimeToDate (laptime) {
      const pattern = /^(\d{1,2}):(\d{2})\.(\d{3})$/

      const l1 = laptime.match(pattern)
      if (!l1) return
      return new Date(parseInt(l1[1]) * 60 * 1000 + parseInt(l1[2]) * 1000 + parseInt(l1[3]))
    }

    getLaptimeDiff (laptime1, laptime2) {
      const time1 = this.laptimeToDate(laptime1)
      const time2 = this.laptimeToDate(laptime2)

      const diff = new Date(time2.getTime() - time1.getTime())

      return `+ ${this.dateToLaptime(diff)}`
    }

    isLaptimeValid (minutes, seconds, milliseconds) {
      const pattern = /^(\d{1,2}):(\d{2})\.(\d{3})$/
      let [m, s, ms] = [minutes, seconds, milliseconds].map(x => String(x))
      // check not set
      if ((!minutes.length > 0 || seconds.length !== SECONDS_LENGTH || milliseconds.length !== MILLISECONDS_LENGTH)) return false
      if (!`${minutes}:${seconds}.${milliseconds}`.match(pattern)) return false

      ;[m, s, ms] = [m, s, ms].map(x => parseInt(x))

      // check greater than zero
      if ((m < 0 || s < 0 || ms < 0)) return false
      // check in range
      if (s >= 60 || ms >= 1000) return false

      return true
    }

    laptimeFromComponents (minutes, seconds, milliseconds) {
      return this.dateToLaptime(new Date(
        parseInt(minutes) * 60 * 1000 +
        parseInt(seconds) * 1000 +
        parseInt(milliseconds)
      ))
    }
}
