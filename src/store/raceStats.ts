import { Laptime } from '@/builders/LaptimeBuilder'
import StatisticsBuilder, { Driver, Medals } from '@/builders/StatisticsBuilder'

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

export interface HeadToHeadItem {
  opponentId: string
  opponentName: string
  wins: number
  losses: number
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

interface BuildDriverRaceTotalsArgs {
  races: RaceStatsLike[]
  resolveDriver: (driverId: string) => Driver | undefined
  resolveTrackName: (trackId: string) => string
  resolveCar: (carId: string) => { name: string, imageUrl?: string } | undefined
  compareLaptimes: (left: string, right: string) => number
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

function buildHeadToHead (races: RaceStatsLike[]) {
  const result = {} as Record<string, Record<string, { wins: number, losses: number }>>

  races.forEach((race) => {
    if (!race.winnerDriverId) return

    const participants = Array.from(new Set(race.times.map(x => x.driverId)))
    if (participants.length < 2) return

    participants.forEach((driverId) => {
      participants
        .filter(opponentId => opponentId !== driverId)
        .forEach((opponentId) => {
          if (!result[driverId]) result[driverId] = {}
          if (!result[driverId][opponentId]) {
            result[driverId][opponentId] = { wins: 0, losses: 0 }
          }

          if (race.winnerDriverId === driverId) {
            result[driverId][opponentId].wins += 1
          } else if (race.winnerDriverId === opponentId) {
            result[driverId][opponentId].losses += 1
          }
        })
    })
  })

  return result
}

function buildRaceMedals (races: RaceStatsLike[], compareLaptimes: (left: string, right: string) => number): Medals[] {
  const MAX_SAVED_PLACES = 7
  const medalsByDriver = {} as Record<string, Medals>
  const sb = StatisticsBuilder.getInstance()

  races.forEach(race => {
    const ranked = [...race.times].sort((a, b) => compareLaptimes(a.laptime, b.laptime))
    const distinctDrivers = sb.handleDistinct(ranked).map(x => x.driverId)
      .slice(0, MAX_SAVED_PLACES)

    distinctDrivers.forEach((driverId, index) => {
      if (!medalsByDriver[driverId]) {
        medalsByDriver[driverId] = { driverId, places: new Array(MAX_SAVED_PLACES).fill(0) }
      }
      medalsByDriver[driverId].places[index] += 1
    })
  })

  return Object.values(medalsByDriver)
    .sort((a, b) => StatisticsBuilder.getInstance().calculatePoints(b) - StatisticsBuilder.getInstance().calculatePoints(a))
}

export function buildDriverRaceTotals ({
  races,
  resolveDriver,
  resolveTrackName,
  resolveCar,
  compareLaptimes
}: BuildDriverRaceTotalsArgs): DriverRaceTotalRow[] {
  const winners = races.filter(r => r.winnerDriverId)
  const totalByDriver = races.reduce((acc, race) => {
    for (const t of race.times) {
      acc[t.driverId] = (acc[t.driverId] || 0) + 1
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
    const winnerTime = race.times.find(x => x.driverId === race.winnerDriverId)
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

  const sb = StatisticsBuilder.getInstance()

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

      const topWonTracks = topCounts(
        wonTracks,
        (trackId) => resolveTrackName(trackId),
        5
      )

      const topWonCars = topCounts(
        wonCars,
        (carId) => resolveCar(carId)?.name || 'Unknown',
        5,
        (carId) => {
          const imageUrl = resolveCar(carId)?.imageUrl || ''
          return imageUrl ? `images/${imageUrl}` : ''
        }
      )

      const headToHead = Object.entries(headToHeadByDriver[driverId] || {})
        .map(([opponentId, score]) => ({
          opponentId,
          opponentName: resolveDriver(opponentId)?.name || 'Unknown',
          wins: score.wins,
          losses: score.losses
        }))
        .sort((a, b) => b.wins - a.wins || b.losses - a.losses || a.opponentName.localeCompare(b.opponentName))

      return {
        driverId,
        driverName: driver?.name || 'Unknown',
        rank: driver ? sb.getRank(driver, totalRaces as any, medals) as unknown as string : '',
        totalRaces: totalRacesForDriver,
        wonRaces: wonRacesForDriver,
        winRateLabel: `${winRate.toFixed(1)}%`,
        mostWonTrackLabel: bestTrackId
          ? `${resolveTrackName(bestTrackId)} (${wonTracks[bestTrackId]})`
          : '-',
        mostWonCarLabel: bestCarId
          ? `${resolveCar(bestCarId)?.name || 'Unknown'} (${wonCars[bestCarId]})`
          : '-',
        mostWonCarImage: bestCarImage,
        topWonTracks,
        topWonCars,
        headToHead
      }
    })
    .sort((a, b) => b.wonRaces - a.wonRaces || b.totalRaces - a.totalRaces || a.driverName.localeCompare(b.driverName))
}
