import LaptimeBuilder, { Laptime } from './LaptimeBuilder'

export const RACE_GROUP_WINDOW_MS = 5 * 60 * 1000

export interface Race {
  uid: string
  trackId: string
  trackVariant: string
  startDate: number
  endDate: number
  times: Laptime[]
  winnerDriverId: string | null
}

function buildRaceUid (times: Laptime[]) {
  const sortedTimeIds = [...times].map(x => x.uid).sort()
    .join('|')
  const first = times[0]
  return `${first.trackId}|${first.trackVariant || ''}|${first.date}|${sortedTimeIds}`
}

function toRace (times: Laptime[], laptimeBuilder: LaptimeBuilder): Race {
  const ranked = [...times].sort((a, b) => laptimeBuilder.compareLaptimes(a.laptime, b.laptime))
  const first = times[0]
  const last = times[times.length - 1]

  return {
    uid: buildRaceUid(times),
    trackId: first.trackId,
    trackVariant: first.trackVariant,
    startDate: first.date,
    endDate: last.date,
    times,
    winnerDriverId: ranked.length > 1 ? ranked[0].driverId : null
  }
}

function canAppendToRace (session: Laptime[], candidate: Laptime) {
  if (session.length <= 0) return true
  const first = session[0]

  if (first.trackId !== candidate.trackId) return false
  if (first.trackVariant !== candidate.trackVariant) return false
  if ((candidate.date - first.date) > RACE_GROUP_WINDOW_MS) return false
  if (session.some(x => x.driverId === candidate.driverId)) return false

  return true
}

export default class RaceBuilder {
  static buildRacesFromTimes (times: Laptime[]): Race[] {
    if (!times.length) return []

    const sorted = [...times].sort((a, b) => {
      return a.trackId.localeCompare(b.trackId) ||
        (a.trackVariant || '').localeCompare(b.trackVariant || '') ||
        a.date - b.date
    })

    const laptimeBuilder = LaptimeBuilder.getInstance()
    const races: Race[] = []
    let session: Laptime[] = []

    for (const time of sorted) {
      if (session.length <= 0) {
        session = [time]
        continue
      }

      if (canAppendToRace(session, time)) {
        session.push(time)
        continue
      }

      races.push(toRace(session, laptimeBuilder))
      session = [time]
    }

    if (session.length > 0) {
      races.push(toRace(session, laptimeBuilder))
    }

    return races
  }
}
