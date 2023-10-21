import {
  DateTimeFormatter,
  LocalDate,
  LocalDateTime,
  ZonedDateTime,
  ZoneId,
} from '@js-joda/core'
import '@js-joda/timezone'
import * as Sentry from '@sentry/react-native'
import {
  GooglePlacesResult,
  LegModes,
  MicromobilityProvider,
  TravelModesOtpApi,
} from '@types'
import Constants from 'expo-constants'
import i18n from 'i18n-js'
import qs from 'qs'
import { API_ERROR_TEXT } from './constants'
import {
  apiMhdGrafikon,
  apiMhdStopStatus,
  apiMhdTrip,
  apiOtpPlanner,
} from './validation'

const host = 'planner.bratislava.sk'
const dataHostUrl = `https://live.${host}`
const mhdDataHostUrl = 'https://live.planner.dev.bratislava.sk'
const otpPlannerUrl = `https://api.${host}/otp/routers/default/plan` // TODO use otp.planner.bratislava.sk

// we should throw throwables only, so it's useful to extend Error class to contain useful info
// export class ApiError extends Error {
//   // status: number
//   // response: Response
//   constructor(response: Response) {
//     super('No status text') // TODO response.statusText returns null which throw nasty error
//     // this.status = response.status || 0
//     // this.response = response
//     this.name = 'ApiError'
//   }
// }

const formatTimestamp = (date: Date) => {
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const seconds = date.getSeconds()
  return `${hours < 10 ? '0' + hours : hours}:${
    minutes < 10 ? '0' + minutes : minutes
  }:${seconds < 10 ? '0' + seconds : seconds}`
}

// helper with a common fetch pattern for json endpoints & baked in host
const fetchJsonFromApi = async (path: string, options?: RequestInit) => {
  // leaving this console.log here because it is very important to keep track of fetches
  const response = await fetch(
    `${
      path.startsWith('/mhd') && path.includes('grafikon')
        ? mhdDataHostUrl
        : dataHostUrl
    }${path}`,
    options
  )
  const responseLength = response.headers.get('content-length')
  console.log(
    '%s\x1b[95m%s\x1b[0m%s',
    `[${formatTimestamp(new Date())}] `,
    `Fetched from '${path}'`,
    response.ok
      ? responseLength && ` (size: ${+responseLength / 1000} kB)`
      : ' (failed)'
  )
  if (response.ok) {
    return response.json()
  } else {
    Sentry.setExtra('responseManual', response)
    throw new Error(API_ERROR_TEXT)
  }
}

const fetchJsonFromOtpApi = async (plannerAddress: string, path: string) => {
  console.log(
    '%s\x1b[95m%s\x1b[0m',
    `[${formatTimestamp(new Date())}] `,
    `Fetched from '${plannerAddress}${path}'`
  )
  const response = await fetch(`${plannerAddress}${path}`)
  if (response.ok) {
    return response.json()
  } else {
    Sentry.setExtra('responseManual', response)
    throw new Error(API_ERROR_TEXT)
  }
}

//for testing purposes
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const getHealth = async () => {
  const health = await fetchJsonFromApi('/health')
  return health
}

export const getMhdStops = async () => {
  console.log('\x1b[92m%s\x1b[0m', 'fetching mhdStop data')
  return fetchJsonFromApi('/mhd/stops')
  //return new Promise((resolve) => resolve(require('./mhdStops.json')))
}
export const getMhdStopStatusData = async (id: string) =>
  apiMhdStopStatus.validateSync(await fetchJsonFromApi(`/mhd/stop/${id}`))

export const getMhdTrip = async (id: string) =>
  apiMhdTrip.validateSync(await fetchJsonFromApi(`/mhd/trip/${id}`))

// TODO do every query like they do it on Discovery channel, sorry, like this, validate immediately
export const getMhdGrafikon = async (
  stopId: string,
  lineNumber: string,
  date?: LocalDate
) => {
  let data = ''
  if (date) {
    data = qs.stringify(
      {
        date: date.format(DateTimeFormatter.ISO_LOCAL_DATE),
      },
      { addQueryPrefix: true }
    )
  }
  return apiMhdGrafikon.validateSync(
    await fetchJsonFromApi(`/mhd/stop/${stopId}/grafikon/${lineNumber}${data}`)
  )
}

export const getRekolaStationInformation = () =>
  fetchJsonFromApi('/rekola/station_information.json')
export const getRekolaStationStatus = () =>
  fetchJsonFromApi('/rekola/station_status.json')

export const getSlovnaftbajkStationInformation = () =>
  fetchJsonFromApi('/slovnaftbajk/station_information.json')
export const getSlovnaftbajkStationStatus = () =>
  fetchJsonFromApi('/slovnaftbajk/station_status.json')

export const getTierFreeBikeStatus = () =>
  fetchJsonFromApi('/tier/free_bike_status_compressed.json')
//new Promise((resolve) => resolve(require('./tierDemoData.json')))

export const getBoltFreeBikeStatus = () =>
  fetchJsonFromApi('/bolt/free_bike_status_compressed.json')
//new Promise((resolve) => resolve(require('./boltDemoData.json')))

export const getChargersStops = async () => fetchJsonFromApi('/zse')

export const getTripPlanner = async ({
  from,
  to,
  dateTime,
  arriveBy,
  mode = TravelModesOtpApi.transit,
  provider,
  accessibleOnly = false,
}: {
  from: string
  to: string
  dateTime: LocalDateTime
  arriveBy: boolean
  mode: TravelModesOtpApi
  provider?: MicromobilityProvider
  accessibleOnly: boolean
}) => {
  if (
    provider === MicromobilityProvider.tier ||
    provider === MicromobilityProvider.bolt
  ) {
    dateTime = dateTime.plusHours(24)
  }
  const zonedTime = ZonedDateTime.of(dateTime, ZoneId.of('Europe/Bratislava'))

  const data = qs.stringify(
    {
      fromPlace: from,
      toPlace: to,
      time: zonedTime.format(DateTimeFormatter.ISO_OFFSET_DATE_TIME),
      mode: mode,
      maxWalkDistance: mode === TravelModesOtpApi.walk ? 10000.0 : 1000.0, // was '4828.032'
      walkReluctance: 7.0, // Note: maxWalkDistance does not do much anymore, we have to use this
      arriveBy: arriveBy,
      wheelchair: accessibleOnly,
      debugItineraryFilter: accessibleOnly.toString(),
      locale: 'en',
      numItineraries: mode === TravelModesOtpApi.multimodal ? undefined : 6,
      allowedVehicleRentalNetworks: provider?.toLowerCase(),
    },
    { addQueryPrefix: true }
  )

  const validatedData = apiOtpPlanner.validateSync(
    await fetchJsonFromOtpApi(otpPlannerUrl, data)
  )

  const filteredTrips = validatedData.plan.itineraries?.filter(
    (tripChoice, index) => {
      const shouldBeExcluded =
        (provider &&
          tripChoice.legs?.findIndex((leg) =>
            mode === TravelModesOtpApi.rented
              ? leg.mode === LegModes.bicycle || leg.mode === LegModes.scooter
              : true
          ) === -1) ||
        (mode === TravelModesOtpApi.transit &&
          index === 0 &&
          tripChoice.legs?.findIndex(
            (leg) =>
              leg.mode === LegModes.bus ||
              leg.mode === LegModes.tram ||
              leg.mode === LegModes.trolleybus
          ) === -1) ||
        (mode === TravelModesOtpApi.multimodal &&
          (tripChoice.legs?.findIndex(
            (leg) =>
              leg.mode === LegModes.bus ||
              leg.mode === LegModes.tram ||
              leg.mode === LegModes.trolleybus
          ) === -1 ||
            tripChoice.legs?.findIndex(
              (leg) =>
                leg.mode === LegModes.bicycle || leg.mode === LegModes.scooter
            ) === -1))
      return !shouldBeExcluded
    }
  )

  validatedData.plan.itineraries =
    mode === TravelModesOtpApi.multimodal || mode === TravelModesOtpApi.transit
      ? filteredTrips?.slice(0, 5)
      : filteredTrips

  return validatedData
}

export const googlePlacesReverseGeocode = (
  lat: number,
  lng: number,
  onSucess: (results: GooglePlacesResult[]) => void,
  onError?: (error: any) => void
) => {
  const url =
    'https://maps.google.com/maps/api/geocode/json?' +
    new URLSearchParams({
      key: Constants?.manifest?.extra?.googlePlacesApiKeyUnlocked,
      latlng: `${lat},${lng}`,
      language: i18n.currentLocale() ?? 'sk',
    })
  fetch(url)
    .then((res) => res.json())
    .then((json: { results: GooglePlacesResult[] }) => {
      if (Array.isArray(json.results)) {
        onSucess(json.results)
      }
    })
    .catch((error) => onError && onError(error))
}
