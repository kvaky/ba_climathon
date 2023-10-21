import {
  ChargersProvider,
  FavoritePlace,
  FavoriteStop,
  LegModes,
  MicromobilityProvider,
  MobilityProvider,
  TransitVehicleType,
  TravelModes,
  TravelModesOtpApi,
  ZoomLevel,
} from '@types'
import i18n from 'i18n-js'
import _ from 'lodash'
import AppLink from 'react-native-app-link'
import { ValidationError } from 'yup'
import { API_ERROR_TEXT, LATEST_DATASET_INDEX } from './constants'
import { colors } from './theme'
import { LegProps } from './validation'

import BoltSvg from '@icons/bolt.svg'
import RekoloSvg from '@icons/rekolo.svg'
import SlovnaftbajkSvg from '@icons/slovnaftbajk.svg'
import TierSvg from '@icons/tier.svg'
import BusSvg from '@icons/vehicles/bus.svg'
import CyclingSvg from '@icons/vehicles/cycling.svg'
import ScooterSvg from '@icons/vehicles/scooter.svg'
import TramSvg from '@icons/vehicles/tram.svg'
import TrolleybusSvg from '@icons/vehicles/trolleybus.svg'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'expo-modules-core'
import { Region } from 'react-native-maps'

export const presentPrice = (price: number /* in cents */) => {
  return i18n.t('common.presentPrice', { price: (price / 100).toFixed(2) })
}

export const dateStringRegex =
  /^(?:[2]\d\d\d)-(?:[0]\d|1[012])-(?:0[1-9]|[12]\d|3[01])$/
export const timeStringRegex =
  /^(?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d)$/
export const colorRegex = /^([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/
export const validateTime = (time: string) => {
  if (!time.match(timeStringRegex)) return 'errEmailNotValid'
  return null
}

export const getOtpTravelMode = (mode: TravelModes) => {
  switch (mode) {
    case TravelModes.mhd:
      return TravelModesOtpApi.transit
    case TravelModes.bicycle:
      return TravelModesOtpApi.bicycle
    case TravelModes.scooter:
      return TravelModesOtpApi.bicycle
    case TravelModes.walk:
      return TravelModesOtpApi.walk
    default:
      return TravelModesOtpApi.transit
  }
}

export const getProviderName = (provider: MicromobilityProvider) => {
  switch (provider) {
    case MicromobilityProvider.rekola:
      return i18n.t('common.providerNames.rekola')
    case MicromobilityProvider.tier:
      return i18n.t('common.providerNames.tier')
    case MicromobilityProvider.slovnaftbajk:
      return i18n.t('common.providerNames.slovnaftbajk')
    case MicromobilityProvider.bolt:
      return i18n.t('common.providerNames.bolt')
    default:
      return undefined
  }
}

export const getIcon = (
  provider?: MicromobilityProvider,
  isScooter?: boolean
) => {
  switch (provider) {
    case MicromobilityProvider.rekola:
      return RekoloSvg
    case MicromobilityProvider.slovnaftbajk:
      return SlovnaftbajkSvg
    case MicromobilityProvider.tier:
      return TierSvg
    case MicromobilityProvider.bolt:
      return BoltSvg
    default:
      return isScooter ? ScooterSvg : CyclingSvg
  }
}

export const getProviderFromStationId = (stationId?: string) => {
  if (stationId) {
    const parsedStationId = Number.parseInt(stationId)
    //OTP does not return the provider in the trip response, has to be picked based on station_id
    //TODO: find other way, we could get all station ids from the live api and compare, this would be safe in case the providers would change their id format
    return Number.isNaN(parsedStationId)
      ? stationId.match(
          /[\d|a-f]{8}-[\d|a-f]{4}-[\d|a-f]{4}-[\d|a-f]{4}-[\d|a-f]{12}/
        )
        ? MicromobilityProvider.bolt
        : MicromobilityProvider.tier
      : parsedStationId < 200
      ? MicromobilityProvider.slovnaftbajk
      : MicromobilityProvider.rekola
  }
}

export const openProviderApp = async (provider: MicromobilityProvider) => {
  switch (provider) {
    case MicromobilityProvider.rekola:
      await AppLink.openInStore({
        appName: 'Rekola',
        appStoreId: 888759232,
        appStoreLocale: 'sk',
        playStoreId: 'cz.rekola.app',
      })
      break
    case MicromobilityProvider.slovnaftbajk:
      await AppLink.openInStore({
        appName: 'slovnaftbajk',
        appStoreId: 1364531772,
        appStoreLocale: 'sk',
        playStoreId: 'hu.cycleme.slovnaftbajk',
      })
      break
    case MicromobilityProvider.tier:
      await AppLink.openInStore({
        appName: 'tier',
        appStoreId: 1436140272,
        appStoreLocale: 'sk',
        playStoreId: 'com.tier.app',
      })
      break
  }
}

export const getColor = (provider?: MobilityProvider) => {
  switch (provider) {
    case MicromobilityProvider.rekola:
      return colors.rekolaColor
    case MicromobilityProvider.slovnaftbajk:
      return colors.slovnaftColor
    case MicromobilityProvider.tier:
      return colors.tierColor
    case MicromobilityProvider.bolt:
      return colors.boltColor
    case ChargersProvider.zse:
      return colors.zseColor
    default:
      return colors.primary
  }
}

export const getTextColor = (provider: MobilityProvider) => {
  switch (provider) {
    case MicromobilityProvider.rekola:
    case MicromobilityProvider.bolt:
    case ChargersProvider.zse:
      return colors.white
    default:
      return colors.darkText
  }
}

export const getVehicle = (
  vehicletype?: TransitVehicleType,
  lineNumber?: string
) => {
  switch (vehicletype) {
    case TransitVehicleType.trolleybus:
      return TrolleybusSvg
    case TransitVehicleType.tram:
      return TramSvg
    case TransitVehicleType.bus:
      return BusSvg
    default:
      return BusSvg
  }
}

export const hexToRgba = (color: string, alpha: number) => {
  //match valid hex color formats: #RRGGBB or #RGB
  if (!color.match(/^#[a-fA-F0-9]{3}$|^#[a-fA-F0-9]{6}$/)) return undefined

  const r = color.length === 4 ? color[1].repeat(2) : color.substr(1, 2)
  const g = color.length === 4 ? color[2].repeat(2) : color.substr(3, 2)
  const b = color.length === 4 ? color[3].repeat(2) : color.substr(5, 2)
  const result = `rgba(${parseInt(r, 16)}, ${parseInt(g, 16)}, ${parseInt(
    b,
    16
  )}, ${alpha})`
  return result
}

export const aggregateBicycleLegs = (legs: LegProps[]) => {
  const tripContainsBicycle = legs.findIndex(
    (leg) => leg.mode === LegModes.bicycle
  )
  const filterWalksBetweenBicycles = legs.filter((leg, index) => {
    return !(
      tripContainsBicycle > -1 &&
      leg.mode === LegModes.walk &&
      index > 0 &&
      index < legs.length - 1 &&
      leg.duration &&
      leg.duration < 60
    )
  })
  const connectBicycleLegs = filterWalksBetweenBicycles.reduce(
    (connected: LegProps[], currentLeg) => {
      const previousLeg = connected[connected.length - 1]
      if (
        connected.length &&
        previousLeg.mode === LegModes.bicycle &&
        currentLeg.mode === LegModes.bicycle &&
        previousLeg.duration !== undefined &&
        previousLeg.distance !== undefined
      ) {
        previousLeg.duration += currentLeg.duration || 0
        previousLeg.distance += currentLeg.distance || 0
        previousLeg.endTime = currentLeg.endTime
      } else connected.push(_.cloneDeep(currentLeg))
      return connected
    },
    []
  )
  return connectBicycleLegs
}

export const isValidationError = (error: any) =>
  error instanceof ValidationError

export const isApiError = (error: any) =>
  error instanceof Error && error.message === API_ERROR_TEXT

export const isNetworkError = (error: any) =>
  error instanceof Error && error.message === 'Network request failed'

/** Not used as of now */
export const getCachedStopsWithDeprecation = async (
  index: string,
  hoursUntilDeprecated = 24
) => {
  const timestampString = await AsyncStorage.getItem(`${index}Timestamp`)
  if (timestampString != null) {
    const timestamp = new Date(timestampString)
    const timeDifferenceInHours =
      Math.abs(new Date().getTime() - timestamp.getTime()) / 36e5
    if (timeDifferenceInHours > hoursUntilDeprecated) {
      AsyncStorage.removeItem(index)
      return null
    }
  }
  const cachedStops = await AsyncStorage.getItem(index)
  if (cachedStops == null) return null
  return JSON.parse(cachedStops)
}

export const getCachedStops = async (index: string) => {
  const cachedStops = await AsyncStorage.getItem(index)
  if (cachedStops == null) return null
  return JSON.parse(cachedStops)
}

export const setCachedStops = async (
  index: string,
  data: any,
  dataset?: string
) => {
  AsyncStorage.setItem(index, JSON.stringify(data))
  if (dataset) setLatestDataset(dataset)
}

export const getLatestDataset = async () => {
  const latestDataSet = await AsyncStorage.getItem(LATEST_DATASET_INDEX)
  return latestDataSet
}

export const setLatestDataset = async (newDataSetNumber: string) => {
  AsyncStorage.setItem(LATEST_DATASET_INDEX, newDataSetNumber)
}
export const getHeaderBgColor = (
  travelMode: TravelModes,
  provider?: MicromobilityProvider
) => {
  if (provider) return getColor(provider)
  else if (travelMode === TravelModes.mhd) return colors.primary
  else return colors.ownVehicleHeaderColor
}

const MIN_DELTA_FOR_XS_MARKER = 0.05
const MIN_DELTA_FOR_SM_MARKER = 0.03
const MIN_DELTA_FOR_MD_MARKER = 0.01

export const getZoomLevel = (region: Region | null) => {
  const latDelta = region?.latitudeDelta
  const multiplier = Platform.select({ ios: 1, android: 1 })
  if (latDelta) {
    return latDelta >= MIN_DELTA_FOR_XS_MARKER * multiplier
      ? ZoomLevel.xs
      : latDelta >= MIN_DELTA_FOR_SM_MARKER * multiplier
      ? ZoomLevel.sm
      : latDelta >= MIN_DELTA_FOR_MD_MARKER * multiplier
      ? ZoomLevel.md
      : ZoomLevel.lg
  }
  return ZoomLevel.xs
}

export const isFavoritePlace = (
  obj: FavoritePlace | FavoriteStop | null | undefined
): obj is FavoritePlace => (obj ? 'id' in obj : false)

export const getShortAddress = (fullAddress: string) =>
  /[0-9]{2}\.[0-9]{5,}/.test(fullAddress)
    ? fullAddress
    : fullAddress.slice(
        0,
        fullAddress.indexOf(',') === -1 ? undefined : fullAddress.indexOf(',')
      )

export const padTimeToTwoDigits = (time: number): string =>
  time < 10 ? `0${time}` : time + ''

export const getMapPinSize = (zoomLevel: ZoomLevel): number => {
  switch (zoomLevel) {
    case ZoomLevel.xs:
      return 4
    case ZoomLevel.sm:
      return 8
    case ZoomLevel.md:
      return 16
    case ZoomLevel.lg:
      return 22
  }
}
