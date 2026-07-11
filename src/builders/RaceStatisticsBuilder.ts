import { Laptime } from './LaptimeBuilder'
import StatisticsBuilder, { Driver, Medals } from './StatisticsBuilder'

export interface RaceStatsLike {
  trackId: string
  trackVariant: string
  times: Laptime[]
  winnerDriverId: string | null
}

export interface DetailCountItem {
  id: string
  label: string
  count: number
  imageUrl?: string
}

export interface YearlyHeadToHeadItem {
  year: number
  wins: number
  losses: number
}

export interface HeadToHeadItem {
  opponentId: string
  opponentName: string
  wins: number
  losses: number
  yearlyRecords: YearlyHeadToHeadItem[]
}

export interface DriverRaceTotalRow {
  driverId: string
  driverName: string
  rank: string
  totalRaces: number
  wonRaces: number
  winRateLabel: string
  mostWonTrackLabel: string
  mostWonCarLabel: string
  mostWonCarImage: string
  topWonTracks: DetailCountItem[]
  topWonCars: DetailCountItem[]
  headToHead: HeadToHeadItem[]
}

export interface BuildDriverRaceTotalsArgs {
  races: RaceStatsLike[]
  resolveDriver: (driverId: string) => Driver | undefined
  resolveTrackName: (trackId: string) => string
  resolveCar: (carId: string) => { name: string, imageUrl?: string } | undefined
  compareLaptimes: (left: string, right: string) => number
}

interface HeadToHeadScore {
  wins: number
  losses: number
  yearlyRecords: Record<number, { wins: number, losses: number }>
}

function maxByCount (data: Record<string, number>) {
  const entries = Object.entries(data)
  if (!entries.length) return ''
  return entries.sort((a, b) => b[1] - a[1])[0][0]
}

function topCounts (
  data: Record<string, number>,
  resolveLabel: (id: string) => string,
  max: number,
  resolveImage?: (id: string) => string
): DetailCountItem[] {
  return Object.entries(data)
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([id, count]) => ({
      id,
      label: resolveLabel(id),
      count,
      imageUrl: resolveImage ? resolveImage(id) : ''
    }))
}

function getRaceYear (race: RaceStatsLike) {
  const firstTime = race.times[0]
  return new Date(firstTime?.date || 0).getFullYear()
}

function getOrCreateHeadToHeadScore (
  result: Record<string, Record<string, HeadToHeadScore>>,
  driverId: string,
  opponentId: string
) {
  if (!result[driverId]) result[driverId] = {}
  if (!result[driverId][opponentId]) {
    result[driverId][opponentId] = {
      wins: 0,
      losses: 0,
      yearlyRecords: {}
    }
  }

  return result[driverId][opponentId]
}

function buildHeadToHead (races: RaceStatsLike[]) {
  const result = {} as Record<string, Record<string, HeadToHeadScore>>

  races.forEach((race) => {
    if (!race.winnerDriverId) return

    const participants = Array.from(new Set(race.times.map(x => x.driverId)))
    if (participants.length < 2) return
    const raceYear = getRaceYear(race)

    participants.forEach((driverId) => {
      participants
        .filter(opponentId => opponentId !== driverId)
        .forEach((opponentId) => {
          const score = getOrCreateHeadToHeadScore(result, driverId, opponentId)
          if (!score.yearlyRecords[raceYear]) {
            score.yearlyRecords[raceYear] = { wins: 0, losses: 0 }
          }

          if (race.winnerDriverId === driverId) {
            score.wins += 1
            score.yearlyRecords[raceYear].wins += 1
          } else if (race.winnerDriverId === opponentId) {
            score.losses += 1
            score.yearlyRecords[raceYear].losses += 1
          }
        })
    })
  })

  return result
}

function buildRaceMedals (races: RaceStatsLike[], compareLaptimes: (left: string, right: string) => number): Medals[] {
  const maxSavedPlaces = 7
  const medalsByDriver = {} as Record<string, Medals>
  const statisticsBuilder = StatisticsBuilder.getInstance()

  races.forEach(race => {
    const ranked = [...race.times].sort((a, b) => compareLaptimes(a.laptime, b.laptime))
    const distinctDrivers = statisticsBuilder.handleDistinct(ranked).map(x => x.driverId)
      .slice(0, maxSavedPlaces)

    distinctDrivers.forEach((driverId, index) => {
      if (!medalsByDriver[driverId]) {
        medalsByDriver[driverId] = { driverId, places: new Array(maxSavedPlaces).fill(0) }
      }
      medalsByDriver[driverId].places[index] += 1
    })
  })

  return Object.values(medalsByDriver)
    .sort((a, b) => StatisticsBuilder.getInstance().calculatePoints(b) - StatisticsBuilder.getInstance().calculatePoints(a))
}

export default class RaceStatisticsBuilder {
  static buildDriverRaceTotals ({
    races,
    resolveDriver,
    resolveTrackName,
    resolveCar,
    compareLaptimes
  }: BuildDriverRaceTotalsArgs): DriverRaceTotalRow[] {
    const winners = races.filter(race => race.winnerDriverId)
    const totalByDriver = races.reduce((acc, race) => {
      for (const time of race.times) {
        acc[time.driverId] = (acc[time.driverId] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    const winsByDriver = winners.reduce((acc, race) => {
      if (race.winnerDriverId) {
        acc[race.winnerDriverId] = (acc[race.winnerDriverId] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    const wonTracksByDriver = winners.reduce((acc, race) => {
      if (!race.winnerDriverId) return acc
      if (!acc[race.winnerDriverId]) acc[race.winnerDriverId] = {}
      acc[race.winnerDriverId][race.trackId] = (acc[race.winnerDriverId][race.trackId] || 0) + 1
      return acc
    }, {} as Record<string, Record<string, number>>)

    const wonCarsByDriver = winners.reduce((acc, race) => {
      if (!race.winnerDriverId) return acc
      const winnerTime = race.times.find(time => time.driverId === race.winnerDriverId)
      if (!winnerTime) return acc
      if (!acc[race.winnerDriverId]) acc[race.winnerDriverId] = {}
      acc[race.winnerDriverId][winnerTime.carId] = (acc[race.winnerDriverId][winnerTime.carId] || 0) + 1
      return acc
    }, {} as Record<string, Record<string, number>>)

    const headToHeadByDriver = buildHeadToHead(races)
    const medals = buildRaceMedals(races, compareLaptimes)
    const totalRaces = Object.keys(totalByDriver)
      .map(driverId => ({
        driver: resolveDriver(driverId),
        races: totalByDriver[driverId]
      }))
      .filter((entry): entry is { driver: Driver, races: number } => !!entry.driver)
      .sort((a, b) => b.races - a.races)

    const statisticsBuilder = StatisticsBuilder.getInstance()

    return Object.keys(totalByDriver)
      .map((driverId) => {
        const driver = resolveDriver(driverId)
        const wonTracks = wonTracksByDriver[driverId] || {}
        const wonCars = wonCarsByDriver[driverId] || {}
        const bestTrackId = maxByCount(wonTracks)
        const bestCarId = maxByCount(wonCars)
        const bestCar = bestCarId ? resolveCar(bestCarId) : null
        const bestCarImage = bestCar?.imageUrl ? `images/${bestCar.imageUrl}` : ''
        const totalRacesForDriver = totalByDriver[driverId]
        const wonRacesForDriver = winsByDriver[driverId] || 0
        const winRate = totalRacesForDriver > 0
          ? (wonRacesForDriver / totalRacesForDriver) * 100
          : 0

        const topWonTracks = topCounts(wonTracks, trackId => resolveTrackName(trackId), 5)
        const topWonCars = topCounts(
          wonCars,
          carId => resolveCar(carId)?.name || 'Unknown',
          5,
          carId => {
            const imageUrl = resolveCar(carId)?.imageUrl || ''
            return imageUrl ? `images/${imageUrl}` : ''
          }
        )

        const headToHead = Object.entries(headToHeadByDriver[driverId] || {})
          .map(([opponentId, score]) => ({
            opponentId,
            opponentName: resolveDriver(opponentId)?.name || 'Unknown',
            wins: score.wins,
            losses: score.losses,
            yearlyRecords: Object.entries(score.yearlyRecords)
              .map(([year, yearlyScore]) => ({
                year: parseInt(year),
                wins: yearlyScore.wins,
                losses: yearlyScore.losses
              }))
              .sort((a, b) => b.year - a.year)
          }))
          .sort((a, b) => b.wins - a.wins || b.losses - a.losses || a.opponentName.localeCompare(b.opponentName))

        return {
          driverId,
          driverName: driver?.name || 'Unknown',
          rank: driver ? statisticsBuilder.getRank(driver, totalRaces as any, medals) as unknown as string : '',
          totalRaces: totalRacesForDriver,
          wonRaces: wonRacesForDriver,
          winRateLabel: `${winRate.toFixed(1)}%`,
          mostWonTrackLabel: bestTrackId ? `${resolveTrackName(bestTrackId)} (${wonTracks[bestTrackId]})` : '-',
          mostWonCarLabel: bestCarId ? `${resolveCar(bestCarId)?.name || 'Unknown'} (${wonCars[bestCarId]})` : '-',
          mostWonCarImage: bestCarImage,
          topWonTracks,
          topWonCars,
          headToHead
        }
      })
      .sort((a, b) => b.wonRaces - a.wonRaces || b.totalRaces - a.totalRaces || a.driverName.localeCompare(b.driverName))
  }
}
