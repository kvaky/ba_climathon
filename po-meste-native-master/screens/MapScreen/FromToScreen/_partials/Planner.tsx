import Text from '@components/Text'
import { Feather, Ionicons } from '@expo/vector-icons'
import BottomSheet, { TouchableOpacity } from '@gorhom/bottom-sheet'
import {
  DateTimeFormatter,
  Duration,
  Instant,
  LocalDateTime,
} from '@js-joda/core'
import { useNavigation } from '@react-navigation/native'
import * as Location from 'expo-location'
import i18n from 'i18n-js'
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  InteractionManager,
  Platform,
  SectionList,
  StyleSheet,
  Switch,
  View,
} from 'react-native'
import {
  GooglePlaceDetail,
  GooglePlacesAutocompleteRef,
} from 'react-native-google-places-autocomplete'
import { useQueries } from 'react-query'

import {
  aggregateBicycleLegs,
  colors,
  favoriteDataSchema,
  FAVORITE_DATA_INDEX,
  getMinMaxDuration,
  getMinMaxPrice,
  getPriceFromItinerary,
  getTripPlanner,
  OtpData,
  OtpPlannerProps,
  s,
} from '@utils'

import { ErrorView } from '@components'
import DateTimePicker, { DateTimePickerRef } from '@components/DateTimePicker'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { GlobalStateContext } from '@state/GlobalStateProvider'
import {
  FavoriteData,
  GooglePlaceDataCorrected,
  ItinerariesWithProvider,
  MicromobilityProvider,
  ScheduleType,
  TravelModes,
  TravelModesOtpApi,
  VehicleData,
} from '@types'
import defaultFavoriteData from '../../defaultFavoriteData.json'

const vehiclesDefault: VehicleData[] = [
  {
    mode: TravelModes.mhd,
    icon: MhdSvg,
    estimatedTimeMin: undefined,
    estimatedTimeMax: undefined,
    priceMin: undefined,
    priceMax: undefined,
  },
  {
    mode: TravelModes.bicycle,
    icon: CyclingSvg,
    estimatedTimeMin: undefined,
    estimatedTimeMax: undefined,
    priceMin: undefined,
    priceMax: undefined,
  },
  {
    mode: TravelModes.scooter,
    icon: ScooterSvg,
    estimatedTimeMin: undefined,
    estimatedTimeMax: undefined,
    priceMin: undefined,
    priceMax: undefined,
  },
  {
    mode: TravelModes.walk,
    icon: WalkingSvg,
    estimatedTimeMin: undefined,
    estimatedTimeMax: undefined,
    priceMin: undefined,
    priceMax: undefined,
  },
]

interface ElementsProps {
  isLoading: boolean
  data?: OtpPlannerProps
  provider?: MicromobilityProvider
  error?: any
  refetch?: () => unknown
}

enum SectionKey {
  transit = 'transit',
  multimodal = 'multimodal',
  myBike = 'myBike',
  rentedBike = 'rentedBike',
  myScooter = 'myScooter',
  rentedScooter = 'rentedScooter',
  walk = 'walk',
}

import SearchFromToScreen from '@screens/MapScreen/SearchFromToScreen'

import FromToSelector from './FromToSelector'
import TripMiniature from './TripMiniature'
import VehicleSelector from './VehicleSelector'

import { Portal } from '@gorhom/portal'
import CyclingSvg from '@icons/vehicles/cycling.svg'
import MhdSvg from '@icons/vehicles/mhd.svg'
import ScooterSvg from '@icons/vehicles/scooter.svg'
import WalkingSvg from '@icons/walking.svg'

import WheelchairSvg from '@icons/wheelchair.svg'

interface PlannerProps {
  from: { name: string; latitude: number; longitude: number }
  to: { name: string; latitude: number; longitude: number }
}

export default function Planner(props: PlannerProps) {
  const { from: fromProp, to: toProp } = props

  const [interactionsFinished, setInteractionsFinished] = useState(false)

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      loadFavoriteData(setFavoriteData)
      setInteractionsFinished(true)
    })
  }, [])

  const fromPropCoordinates = useMemo(
    () =>
      (fromProp?.latitude !== undefined &&
        fromProp?.longitude !== undefined && {
          latitude: fromProp?.latitude,
          longitude: fromProp?.longitude,
        }) ||
      undefined,
    [fromProp]
  )

  const toPropCoordinates = useMemo(
    () =>
      (toProp?.latitude !== undefined &&
        toProp?.longitude !== undefined && {
          latitude: toProp?.latitude,
          longitude: toProp?.longitude,
        }) ||
      undefined,
    [toProp]
  )

  const fromPropName = fromProp?.name
  const toPropName = toProp?.name

  const { setFeedbackSent, getLocationWithPermission, location } =
    useContext(GlobalStateContext)

  const navigation = useNavigation()
  const [fromCoordinates, setFromCoordinates] = useState(fromPropCoordinates)
  const [fromName, setFromName] = useState<string | undefined>(fromPropName)
  const [toCoordinates, setToCoordinates] = useState(toPropCoordinates)

  const [toName, setToName] = useState<string | undefined>(toPropName)

  const fromRef = useRef<GooglePlacesAutocompleteRef | null>(null)
  const toRef = useRef<GooglePlacesAutocompleteRef | null>(null)
  const fromBottomSheetRef = useRef<BottomSheet>(null)
  const toBottomSheetRef = useRef<BottomSheet>(null)
  const datetimeSheetRef = useRef<BottomSheet>(null)
  const datetimePickerRef = useRef<DateTimePickerRef>(null)

  const [vehicles, setVehicles] = useState<VehicleData[]>(vehiclesDefault)

  const [selectedVehicle, setSelectedVehicle] = useState<TravelModes>(
    TravelModes.mhd
  )

  const [scheduledTime, setScheduledTime] = useState<ScheduleType>(
    ScheduleType.departure
  )

  const [dateTime, setDateTime] = useState(LocalDateTime.now())

  const [accessibleOnly, setAccessibleOnly] = useState(false)

  //#region "Favorites"
  const [favoriteData, setFavoriteData] = useState<FavoriteData>(
    defaultFavoriteData as any
  )
  const saveFavoriteData = (data: FavoriteData) => {
    if (favoriteData) {
      AsyncStorage.setItem(FAVORITE_DATA_INDEX, JSON.stringify(data))
    }
  }
  const loadFavoriteData = async (onLoad: (data: FavoriteData) => void) => {
    const favoriteDataString = await AsyncStorage.getItem(FAVORITE_DATA_INDEX)
    if (!favoriteDataString) return
    try {
      const validatedFavoriteData = favoriteDataSchema.validateSync(
        JSON.parse(favoriteDataString)
      ) as never as FavoriteData
      onLoad(validatedFavoriteData)
    } catch (e: any) {
      console.log(e.message)
      // overwrites favoriteData with the default data
      saveFavoriteData(favoriteData)
    }
  }
  //#endregion "Favorites"

  const [locationPermisionError, setLocationPermisionError] =
    useState<string>('')
  const [fromGeocode, setFromGeocode] = useState<
    Location.LocationGeocodedAddress[] | null
  >(null)
  const [toGeocode, setToGeocode] = useState<
    Location.LocationGeocodedAddress[] | null
  >(null)

  const [
    mhdQuery,
    multimodalQuery,
    myBikeQuery,
    myScooterQuery,
    rekolaQuery,
    slovnaftbajkQuery,
    tierQuery,
    boltQuery,
    walkQuery,
  ] = useQueries([
    {
      queryKey: [
        'getOtpDataMhd',
        fromCoordinates,
        toCoordinates,
        dateTime,
        scheduledTime,
        accessibleOnly,
      ],
      queryFn: async () => {
        if (!fromCoordinates || !toCoordinates) return
        const mhdData = await getTripPlanner({
          from: `${fromCoordinates.latitude},${fromCoordinates.longitude}`,
          to: `${toCoordinates.latitude},${toCoordinates.longitude}`,
          dateTime,
          arriveBy: scheduledTime === ScheduleType.arrival,
          mode: TravelModesOtpApi.transit,
          accessibleOnly,
        })
        return mhdData
      },
      enabled: fromCoordinates && toCoordinates ? true : false,
    },
    {
      queryKey: [
        'getOtpDataMultimodal',
        fromCoordinates,
        toCoordinates,
        dateTime,
        scheduledTime,
        accessibleOnly,
      ],
      queryFn: async () => {
        if (!fromCoordinates || !toCoordinates) return
        const multimodalData = await getTripPlanner({
          from: `${fromCoordinates.latitude},${fromCoordinates.longitude}`,
          to: `${toCoordinates.latitude},${toCoordinates.longitude}`,
          dateTime,
          arriveBy: scheduledTime === ScheduleType.arrival,
          mode: TravelModesOtpApi.multimodal,
          accessibleOnly,
        })
        return multimodalData
      },
      enabled: fromCoordinates && toCoordinates ? true : false,
    },
    {
      queryKey: [
        'getOtpDataMyBike',
        fromCoordinates,
        toCoordinates,
        dateTime,
        scheduledTime,
      ],
      queryFn: () =>
        fromCoordinates &&
        toCoordinates &&
        getTripPlanner({
          from: `${fromCoordinates.latitude},${fromCoordinates.longitude}`,
          to: `${toCoordinates.latitude},${toCoordinates.longitude}`,
          dateTime,
          arriveBy: scheduledTime === ScheduleType.arrival,
          mode: TravelModesOtpApi.bicycle,
          accessibleOnly,
        }),
      enabled: fromCoordinates && toCoordinates ? true : false,
    },
    {
      queryKey: [
        'getOtpDataMyScooter',
        fromCoordinates,
        toCoordinates,
        dateTime,
        scheduledTime,
      ],
      queryFn: () =>
        fromCoordinates &&
        toCoordinates &&
        getTripPlanner({
          from: `${fromCoordinates.latitude},${fromCoordinates.longitude}`,
          to: `${toCoordinates.latitude},${toCoordinates.longitude}`,
          dateTime,
          arriveBy: scheduledTime === ScheduleType.arrival,
          mode: TravelModesOtpApi.bicycle,
          accessibleOnly,
        }),
      enabled: fromCoordinates && toCoordinates ? true : false,
    },
    {
      queryKey: [
        'getOtpRekolaData',
        fromCoordinates,
        toCoordinates,
        dateTime,
        scheduledTime,
      ],
      queryFn: () =>
        fromCoordinates &&
        toCoordinates &&
        getTripPlanner({
          from: `${fromCoordinates.latitude},${fromCoordinates.longitude}`,
          to: `${toCoordinates.latitude},${toCoordinates.longitude}`,
          dateTime,
          arriveBy: scheduledTime === ScheduleType.arrival,
          mode: TravelModesOtpApi.rented,
          provider: MicromobilityProvider.rekola,
          accessibleOnly,
        }),
      enabled: fromCoordinates && toCoordinates ? true : false,
    },
    {
      queryKey: [
        'getOtpSlovnaftbajkData',
        fromCoordinates,
        toCoordinates,
        dateTime,
        scheduledTime,
      ],
      queryFn: () =>
        fromCoordinates &&
        toCoordinates &&
        getTripPlanner({
          from: `${fromCoordinates.latitude},${fromCoordinates.longitude}`,
          to: `${toCoordinates.latitude},${toCoordinates.longitude}`,
          dateTime,
          arriveBy: scheduledTime === ScheduleType.arrival,
          mode: TravelModesOtpApi.rented,
          provider: MicromobilityProvider.slovnaftbajk,
          accessibleOnly,
        }),
      enabled: fromCoordinates && toCoordinates ? true : false,
    },
    {
      queryKey: [
        'getOtpTierData',
        fromCoordinates,
        toCoordinates,
        dateTime,
        scheduledTime,
      ],
      queryFn: () =>
        fromCoordinates &&
        toCoordinates &&
        getTripPlanner({
          from: `${fromCoordinates.latitude},${fromCoordinates.longitude}`,
          to: `${toCoordinates.latitude},${toCoordinates.longitude}`,
          dateTime,
          arriveBy: scheduledTime === ScheduleType.arrival,
          mode: TravelModesOtpApi.rented,
          provider: MicromobilityProvider.tier,
          accessibleOnly,
        }),
      enabled: fromCoordinates && toCoordinates ? true : false,
    },
    {
      queryKey: [
        'getOtpBoltData',
        fromCoordinates,
        toCoordinates,
        dateTime,
        scheduledTime,
      ],
      queryFn: () =>
        fromCoordinates &&
        toCoordinates &&
        getTripPlanner({
          from: `${fromCoordinates.latitude},${fromCoordinates.longitude}`,
          to: `${toCoordinates.latitude},${toCoordinates.longitude}`,
          dateTime,
          arriveBy: scheduledTime === ScheduleType.arrival,
          mode: TravelModesOtpApi.rented,
          provider: MicromobilityProvider.bolt,
          accessibleOnly,
        }),
      enabled: fromCoordinates && toCoordinates ? true : false,
    },
    {
      queryKey: [
        'getOtpDataWalk',
        fromCoordinates,
        toCoordinates,
        dateTime,
        scheduledTime,
      ],
      queryFn: () =>
        fromCoordinates &&
        toCoordinates &&
        getTripPlanner({
          from: `${fromCoordinates.latitude},${fromCoordinates.longitude}`,
          to: `${toCoordinates.latitude},${toCoordinates.longitude}`,
          dateTime,
          arriveBy: scheduledTime === ScheduleType.arrival,
          mode: TravelModesOtpApi.walk,
          accessibleOnly,
        }),
      enabled: fromCoordinates && toCoordinates ? true : false,
    },
  ])

  useEffect(() => {
    setFromCoordinates(fromPropCoordinates)
    setFromName(fromPropName)
  }, [fromPropName, fromPropCoordinates, setFromCoordinates, setFromName])

  useEffect(() => {
    setToCoordinates(toPropCoordinates)
    setToName(toPropName)
  }, [toPropName, toPropCoordinates, setToCoordinates, setToName])

  const getAdjustedVehicleData = (
    minDuration: number,
    maxDuration: number,
    minPrice: number,
    maxPrice: number,
    oldVehicles: VehicleData[],
    travelMode: TravelModes
  ) => {
    return oldVehicles.map((vehiclesType) => {
      if (vehiclesType.mode === travelMode) {
        return {
          ...vehiclesType,
          estimatedTimeMin:
            minDuration !== Infinity ? Math.round(minDuration / 60) : undefined,
          estimatedTimeMax:
            maxDuration !== -Infinity
              ? Math.round(maxDuration / 60)
              : undefined,
          priceMin: minPrice !== Infinity ? minPrice : undefined,
          priceMax: maxPrice !== -Infinity ? maxPrice : undefined,
        }
      } else {
        return vehiclesType
      }
    })
  }

  const adjustMinMaxTravelTime = useCallback(
    (itineraries: ItinerariesWithProvider[], travelMode: TravelModes) => {
      const { min: minDuration, max: maxDuration } =
        getMinMaxDuration(itineraries)
      const { min: minPrice, max: maxPrice } = getMinMaxPrice(
        itineraries,
        travelMode
      )

      setVehicles((oldVehicles) =>
        getAdjustedVehicleData(
          minDuration,
          maxDuration,
          minPrice,
          maxPrice,
          oldVehicles,
          travelMode
        )
      )
    },
    []
  )

  useEffect(() => {
    adjustMinMaxTravelTime(
      [
        slovnaftbajkQuery.data?.plan?.itineraries
          ? {
              itineraries: slovnaftbajkQuery.data?.plan?.itineraries,
              provider: MicromobilityProvider.slovnaftbajk,
            }
          : { itineraries: [] },
        rekolaQuery.data?.plan?.itineraries
          ? {
              itineraries: rekolaQuery.data?.plan?.itineraries,
              provider: MicromobilityProvider.rekola,
            }
          : { itineraries: [] },
        myBikeQuery.data?.plan?.itineraries
          ? {
              itineraries: myBikeQuery.data?.plan?.itineraries,
            }
          : { itineraries: [] },
      ],
      TravelModes.bicycle
    )
  }, [
    slovnaftbajkQuery.data,
    rekolaQuery.data,
    myBikeQuery.data,
    adjustMinMaxTravelTime,
  ])

  useEffect(() => {
    adjustMinMaxTravelTime(
      [
        tierQuery.data?.plan?.itineraries
          ? {
              itineraries: tierQuery.data?.plan?.itineraries,
              provider: MicromobilityProvider.tier,
            }
          : { itineraries: [] },
        myScooterQuery.data?.plan?.itineraries
          ? {
              itineraries: myScooterQuery.data?.plan?.itineraries,
            }
          : { itineraries: [] },
        boltQuery.data?.plan?.itineraries
          ? {
              itineraries: boltQuery.data?.plan?.itineraries,
              provider: MicromobilityProvider.bolt,
            }
          : { itineraries: [] },
      ],
      TravelModes.scooter
    )
  }, [
    tierQuery.data,
    myScooterQuery.data,
    boltQuery.data,
    adjustMinMaxTravelTime,
  ])

  useEffect(() => {
    adjustMinMaxTravelTime(
      [
        mhdQuery.data?.plan?.itineraries
          ? {
              itineraries: mhdQuery.data?.plan?.itineraries,
            }
          : { itineraries: [] },
      ],
      TravelModes.mhd
    )
  }, [adjustMinMaxTravelTime, mhdQuery.data])

  useEffect(() => {
    adjustMinMaxTravelTime(
      [
        walkQuery.data?.plan?.itineraries
          ? { itineraries: walkQuery.data?.plan?.itineraries }
          : { itineraries: [] },
      ],
      TravelModes.walk
    )
  }, [adjustMinMaxTravelTime, walkQuery.data])

  const getGeocodeAsync = useCallback(
    async (
      location: { latitude: number; longitude: number },
      setGeocode: (locatoion: Location.LocationGeocodedAddress[]) => void
    ) => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        setLocationPermisionError('Permission to access location was denied')
        return
      }

      const geocode = await Location.reverseGeocodeAsync(location)
      setGeocode(geocode)
    },
    [setLocationPermisionError]
  )

  const getNameFromGeocode = useCallback((geocode) => {
    if (geocode && geocode?.length > 0) {
      const { name, street } = geocode[0]
      return street && name
        ? `${street} ${name}`
        : street
        ? street
        : name
        ? name
        : ''
    }
  }, [])

  useEffect(() => {
    if (fromGeocode) {
      setFromName(getNameFromGeocode(fromGeocode))
    }
  }, [setFromName, fromGeocode, getNameFromGeocode])

  useEffect(() => {
    if (toGeocode) {
      setToName(getNameFromGeocode(toGeocode))
    }
  }, [setToName, toGeocode, getNameFromGeocode])

  useEffect(() => {
    toRef.current?.setAddressText(toName || '')
  }, [toRef, toName])

  useEffect(() => {
    if (location) {
      setFromName(i18n.t('screens.FromToScreen.Planner.currentPosition'))
      setFromCoordinates(location.coords)
    }
  }, [])

  const getLocationAsync = useCallback(
    async (
      setCoordinates: (location: {
        latitude: number
        longitude: number
      }) => void,
      reask: boolean
    ) => {
      // slow location getting for iOS, use only the pre-loaded location,
      // this quick fix removes reloading the current location after 10 seconds after Planner render
      if (!reask && Platform.OS === 'ios') return
      const currentLocation = await getLocationWithPermission(true, reask)
      if (currentLocation) {
        setCoordinates(currentLocation.coords)
        setFromName(i18n.t('screens.FromToScreen.Planner.currentPosition'))
      }
    },
    [getLocationWithPermission]
  )

  const onGooglePlaceChosen = (
    details: GooglePlaceDetail | null = null,
    setCoordinates: React.Dispatch<
      React.SetStateAction<
        | {
            latitude: number
            longitude: number
          }
        | undefined
      >
    >
  ) => {
    if (details?.geometry.location.lat && details?.geometry.location.lng) {
      const localNow = LocalDateTime.now()
      setDateTime(localNow)
      datetimePickerRef.current?.setDate(localNow)
      setCoordinates({
        latitude: details?.geometry.location.lat,
        longitude: details?.geometry.location.lng,
      })
    }
  }

  const onGooglePlaceFromChosen = useCallback(
    (
      data: GooglePlaceDataCorrected,
      details: GooglePlaceDetail | null = null
    ) => {
      setFromName(data.description)
      onGooglePlaceChosen(details, setFromCoordinates)
      fromBottomSheetRef?.current?.close()
    },
    []
  )

  const onGooglePlaceToChosen = useCallback(
    (
      data: GooglePlaceDataCorrected,
      details: GooglePlaceDetail | null = null
    ) => {
      setToName(data.description)
      onGooglePlaceChosen(details, setToCoordinates)
      toBottomSheetRef?.current?.close()
    },
    []
  )

  const handlePositiveFeedback = () => {
    setFeedbackSent(true)
  }

  const onVehicleChange = (mode: TravelModes) => {
    setSelectedVehicle(mode)
  }

  const onSwitchPlacesPress = useCallback(() => {
    const fromNameAlt = fromName
    const fromCoordinatesAlt = fromCoordinates

    const toNameAlt = toName
    const toCoordinatesAlt = toCoordinates

    setFromName(toNameAlt)
    setFromCoordinates(toCoordinatesAlt)

    setToName(fromNameAlt)
    setToCoordinates(fromCoordinatesAlt)
  }, [fromCoordinates, fromName, toCoordinates, toName])

  const getMyLocation = useCallback(
    (reask = false) => {
      fromBottomSheetRef?.current?.close()
      getLocationAsync(setFromCoordinates, reask)
    },
    [getLocationAsync]
  )

  const setLocationFromMapFrom = useCallback(() => {
    navigation.navigate(
      'ChooseLocationScreen' as never,
      {
        latitude: fromCoordinates?.latitude,
        longitude: fromCoordinates?.longitude,
        fromNavigation: true,
        fromCoordsName: { ...fromCoordinates, name: fromName },
        toCoordsName: { ...toCoordinates, name: toName },
      } as never
    )
    fromBottomSheetRef?.current?.close()
  }, [fromCoordinates, navigation, toCoordinates, fromName, toName])

  const setLocationFromMapTo = useCallback(() => {
    navigation.navigate(
      'ChooseLocationScreen' as never,
      {
        latitude: toCoordinates?.latitude,
        longitude: toCoordinates?.longitude,
        toNavigation: true,
        fromCoordsName: { ...fromCoordinates, name: fromName },
        toCoordsName: { ...toCoordinates, name: toName },
      } as never
    )
    toBottomSheetRef?.current?.close()
  }, [fromCoordinates, navigation, toCoordinates, fromName, toName])

  const renderError = ({
    error,
    errorType,
    provider,
    action,
  }: {
    error?: any
    errorType: 'dataPlannerTrip' | 'plannerNoRoute' | 'plannerUnsupportedArea'
    provider?: MicromobilityProvider | 'MHD'
    action?: () => void
  }) => {
    return (
      <ErrorView
        error={error}
        errorMessage={i18n.t(`components.ErrorView.errors.${errorType}`, {
          provider: provider ? ` ${provider}` : '',
        })}
        action={action}
        plainStyle
      />
    )
  }

  const hideSchedulePicker = () => {
    datetimeSheetRef.current?.close()
  }

  const handleConfirm = (date: Date) => {
    const utcTimestamp = Instant.parse(date.toISOString()) //'1989-08-16T00:00:00.000Z'
    const localDateTime = LocalDateTime.ofInstant(utcTimestamp)

    setDateTime(localDateTime)
    hideSchedulePicker()
  }

  const showSchedulePicker = () => {
    datetimeSheetRef.current?.snapToIndex(0)
  }

  const handleOptionChange = (scheduleTime: ScheduleType) => {
    setScheduledTime(scheduleTime)
  }

  const isDateTimeNow =
    Duration.between(dateTime, LocalDateTime.now())
      .abs()
      .compareTo(Duration.ofMinutes(1)) === -1
  const dateTimeToPrint = isDateTimeNow
    ? i18n.t('common.now')
    : dateTime.format(DateTimeFormatter.ofPattern('dd.MM. HH:mm'))

  const getLoading = (itineraryType: SectionKey) => {
    switch (itineraryType) {
      case SectionKey.transit:
        return mhdQuery.isLoading ? <TripMiniature isLoading /> : null
      case SectionKey.multimodal:
        return multimodalQuery.isLoading ? <TripMiniature isLoading /> : null
      case SectionKey.myBike:
        return myBikeQuery.isLoading ? <TripMiniature isLoading /> : null
      case SectionKey.rentedBike:
        return (
          <>
            {slovnaftbajkQuery.isLoading ? <TripMiniature isLoading /> : null}
            {rekolaQuery.isLoading ? <TripMiniature isLoading /> : null}
          </>
        )
      case SectionKey.myScooter:
        return myScooterQuery.isLoading ? <TripMiniature isLoading /> : null
      case SectionKey.rentedScooter:
        return (
          <>
            {tierQuery.isLoading ? <TripMiniature isLoading /> : null}
            {boltQuery.isLoading ? <TripMiniature isLoading /> : null}
          </>
        )
      case SectionKey.walk:
        return walkQuery.isLoading ? <TripMiniature isLoading /> : null
    }
  }

  const getErrorComponent = (itineraryType: SectionKey) => {
    const errors: {
      error: any
      refetch: () => void
      data?: OtpData
      provider?: MicromobilityProvider | 'MHD'
    }[] = []
    switch (itineraryType) {
      case SectionKey.transit:
        errors.push({
          ...mhdQuery,
          provider: 'MHD',
        })
        break
      case SectionKey.multimodal:
        errors.push({
          ...multimodalQuery,
        })
        break
      case SectionKey.myBike:
        errors.push({
          ...myBikeQuery,
        })
        break
      case SectionKey.rentedBike:
        errors.push({
          ...slovnaftbajkQuery,
          provider: MicromobilityProvider.slovnaftbajk,
        })
        errors.push({
          ...rekolaQuery,
          provider: MicromobilityProvider.rekola,
        })
        break
      case SectionKey.myScooter:
        errors.push({
          ...myScooterQuery,
        })
        break
      case SectionKey.rentedScooter:
        errors.push({
          ...tierQuery,
          provider: MicromobilityProvider.tier,
        })
        errors.push({
          ...boltQuery,
          provider: MicromobilityProvider.bolt,
        })
        break
      case SectionKey.walk:
        errors.push({
          ...walkQuery,
        })
        break
    }

    if (errors.length === 0) return null

    return (
      <>
        {errors.map(({ error, refetch, data, provider }, index) => (
          <View
            key={index}
            style={{
              justifyContent: 'center',
            }}
          >
            {error &&
              renderError({
                error: error,
                errorType: 'dataPlannerTrip',
                provider,
                action: refetch,
              })}
            {data &&
              data.plan?.itineraries?.length === 0 &&
              renderError({ errorType: 'plannerNoRoute', provider })}
          </View>
        ))}
      </>
    )
  }

  const sections =
    selectedVehicle === TravelModes.mhd
      ? [
          {
            title: i18n.t('screens.FromToScreen.Planner.transit'),
            key: SectionKey.transit,
            data: mhdQuery.data?.plan?.itineraries ?? [],
          },
          {
            title:
              'Multimodálna doprava' ??
              i18n.t('screens.FromToScreen.Planner.transit'),
            key: SectionKey.multimodal,
            data: multimodalQuery.data?.plan?.itineraries ?? [],
          },
        ]
      : selectedVehicle === TravelModes.bicycle
      ? [
          {
            title: i18n.t('screens.FromToScreen.Planner.myBike'),
            key: SectionKey.myBike,
            data: myBikeQuery.data?.plan?.itineraries ?? [],
          },
          {
            title: i18n.t('screens.FromToScreen.Planner.rentedBike'),
            key: SectionKey.rentedBike,
            data:
              slovnaftbajkQuery.data?.plan?.itineraries?.concat(
                rekolaQuery.data?.plan?.itineraries ?? []
              ) ?? [],
          },
        ]
      : selectedVehicle === TravelModes.scooter
      ? [
          {
            title: i18n.t('screens.FromToScreen.Planner.myScooter'),
            key: SectionKey.myScooter,
            data: myScooterQuery.data?.plan?.itineraries ?? [],
          },
          {
            title: i18n.t('screens.FromToScreen.Planner.rentedScooter'),
            key: SectionKey.rentedScooter,
            data:
              tierQuery.data?.plan?.itineraries?.concat(
                boltQuery.data?.plan?.itineraries ?? []
              ) ?? [],
          },
        ]
      : selectedVehicle === TravelModes.walk
      ? [
          {
            title: i18n.t('screens.FromToScreen.Planner.walk'),
            key: SectionKey.walk,
            data: walkQuery.data?.plan?.itineraries ?? [],
          },
        ]
      : []

  const ListHeader = (
    <>
      <View style={styles.header}>
        <FromToSelector
          onFromPlacePress={() => {
            fromBottomSheetRef?.current?.snapToIndex(0)
            fromRef?.current?.focus()
          }}
          onToPlacePress={() => {
            toBottomSheetRef?.current?.snapToIndex(0)
            toRef?.current?.focus()
          }}
          fromPlaceText={
            fromName ||
            (fromProp?.latitude !== undefined &&
            fromProp?.longitude !== undefined
              ? `${fromProp.latitude}, ${fromProp.longitude}`
              : undefined)
          }
          toPlaceText={
            toName ||
            (toProp?.latitude !== undefined && toProp?.longitude !== undefined
              ? `${toProp.latitude}, ${toProp.longitude}`
              : undefined)
          }
          fromPlaceTextPlaceholder={i18n.t(
            'screens.FromToScreen.Planner.fromPlaceholder'
          )}
          toPlaceTextPlaceholder={i18n.t(
            'screens.FromToScreen.Planner.toPlaceholder'
          )}
          onSwitchPlacesPress={onSwitchPlacesPress}
        />
        <View style={styles.schedulingContainer}>
          <View style={[styles.row, { justifyContent: 'space-between' }]}>
            <View
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignContent: 'center',
              }}
            >
              <TouchableOpacity
                onPress={showSchedulePicker}
                style={[
                  styles.row,
                  {
                    justifyContent: 'flex-start',
                  },
                ]}
              >
                <Feather name="clock" size={20} style={styles.schedulingIcon} />
                <Text style={styles.schedulingText}>
                  {scheduledTime === ScheduleType.departure &&
                    i18n.t('screens.FromToScreen.Planner.departure', {
                      time: dateTimeToPrint,
                    })}
                  {scheduledTime === ScheduleType.arrival &&
                    i18n.t('screens.FromToScreen.Planner.arrival', {
                      time: dateTimeToPrint,
                    })}
                </Text>
                <Ionicons
                  size={15}
                  style={styles.ionicon}
                  name="chevron-down"
                />
              </TouchableOpacity>
            </View>
            <View
              style={[
                styles.row,
                {
                  paddingLeft: 20,
                  justifyContent: 'flex-end',
                  flex: 1,
                },
              ]}
            >
              <View
                style={[
                  styles.row,
                  { flex: 0, position: 'relative', left: 12 },
                ]}
              >
                <WheelchairSvg
                  fill={colors.white}
                  width={20}
                  height={20}
                  style={styles.schedulingIcon}
                />
                <Text style={styles.schedulingText}>
                  {i18n.t('screens.FromToScreen.Planner.accessibleVehicles')}
                </Text>
              </View>
              <Switch
                trackColor={{
                  false: colors.switchGray,
                  true: colors.switchGreen,
                }}
                thumbColor={colors.white}
                ios_backgroundColor={colors.switchGray}
                onValueChange={(value) => setAccessibleOnly(value)}
                value={accessibleOnly}
                style={{
                  flex: 0,
                  marginLeft: Platform.select({
                    ios: 10,
                    android: 0,
                  }),
                }}
              />
            </View>
          </View>
        </View>
      </View>
      <View>
        <VehicleSelector
          vehicles={vehicles}
          onVehicleChange={onVehicleChange}
          selectedVehicle={selectedVehicle}
        />
      </View>
    </>
  )

  const renderHeader = (sectionKey: SectionKey) => {
    switch (sectionKey) {
      case SectionKey.transit:
        return mhdQuery.isFetched || mhdQuery.isLoading
      case SectionKey.multimodal:
        return multimodalQuery.isFetched || multimodalQuery.isLoading
      case SectionKey.myBike:
        return myBikeQuery.isFetched || myBikeQuery.isLoading
      case SectionKey.rentedBike:
        return (
          rekolaQuery.isFetched ||
          slovnaftbajkQuery.isFetched ||
          rekolaQuery.isLoading ||
          slovnaftbajkQuery.isLoading
        )
      case SectionKey.myScooter:
        return myScooterQuery.isFetched || myScooterQuery.isLoading
      case SectionKey.rentedScooter:
        return (
          tierQuery.isFetched ||
          tierQuery.isLoading ||
          boltQuery.isFetched ||
          boltQuery.isLoading
        )
      case SectionKey.walk:
        return walkQuery.isFetched || walkQuery.isLoading
    }
  }

  return (
    <View style={styles.outerContainer}>
      <SectionList
        sections={sections}
        style={styles.sectionList}
        contentContainerStyle={styles.sectionListContainer}
        ListHeaderComponent={ListHeader}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) => {
          const Loading = getLoading(section.key as SectionKey)
          return (
            <View>
              {renderHeader(section.key as SectionKey) && (
                <Text style={[styles.textSizeBig, { marginHorizontal: 20 }]}>
                  {section.title}
                </Text>
              )}
              {Loading}
            </View>
          )
        }}
        renderItem={({ item, section, index }) => {
          const key = section.key as SectionKey
          const provider =
            key === SectionKey.rentedBike
              ? index === 0
                ? MicromobilityProvider.slovnaftbajk
                : MicromobilityProvider.rekola
              : key === SectionKey.rentedScooter
              ? index === 0
                ? MicromobilityProvider.tier
                : MicromobilityProvider.bolt
              : undefined
          return (
            <TripMiniature
              onPress={() =>
                navigation.navigate(
                  'PlannerScreen' as never,
                  {
                    legs: item.legs,
                    isScooter:
                      key === SectionKey.myScooter ||
                      key === SectionKey.rentedScooter,
                    travelMode: selectedVehicle,
                    fromPlace: fromName,
                    toPlace: toName,
                    price: getPriceFromItinerary(
                      item,
                      selectedVehicle,
                      provider
                    ),
                    provider: provider,
                  } as never
                )
              }
              duration={Math.round(item.duration / 60)}
              departureDateTime={LocalDateTime.ofInstant(
                Instant.ofEpochMilli(item.startTime)
              )}
              arriveDateTime={LocalDateTime.ofInstant(
                Instant.ofEpochMilli(item.endTime)
              )}
              legs={item.legs ? aggregateBicycleLegs(item.legs) : undefined}
              isScooter={
                key === SectionKey.myScooter || key === SectionKey.rentedScooter
              }
              isMultimodal={key === SectionKey.multimodal}
              provider={provider}
            />
          )
        }}
        renderSectionFooter={({ section }) => {
          return getErrorComponent(section.key as SectionKey)
        }}
      />
      <Portal hostName="MapScreen">
        <SearchFromToScreen
          sheetRef={fromBottomSheetRef}
          getMyLocation={getMyLocation}
          onGooglePlaceChosen={onGooglePlaceFromChosen}
          googleInputRef={fromRef}
          setLocationFromMap={setLocationFromMapFrom}
          inputPlaceholder={i18n.t(
            'screens.FromToScreen.Planner.fromPlaceholder'
          )}
          initialSnapIndex={-1}
          favoriteData={favoriteData}
          setFavoriteData={setFavoriteData}
        />
        <SearchFromToScreen
          sheetRef={toBottomSheetRef}
          onGooglePlaceChosen={onGooglePlaceToChosen}
          googleInputRef={toRef}
          setLocationFromMap={setLocationFromMapTo}
          inputPlaceholder={i18n.t(
            'screens.FromToScreen.Planner.toPlaceholder'
          )}
          initialSnapIndex={-1}
          favoriteData={favoriteData}
          setFavoriteData={setFavoriteData}
        />
      </Portal>
      {interactionsFinished && (
        <BottomSheet
          handleIndicatorStyle={s.handleStyle}
          snapPoints={[400]}
          index={-1}
          enablePanDownToClose
          ref={datetimeSheetRef}
        >
          <DateTimePicker
            onConfirm={handleConfirm}
            onScheduleTypeChange={handleOptionChange}
            ref={datetimePickerRef}
          />
        </BottomSheet>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    height: '100%',
  },
  textSizeBig: {
    color: colors.darkText,
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginVertical: 12,
  },
  ionicon: {
    alignSelf: 'center',
    color: colors.white,
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
  },
  schedulingContainer: {
    marginTop: 0,
    paddingVertical: 12,
  },
  schedulingText: {
    color: colors.white,
    marginHorizontal: 6,
    ...s.textSmall,
  },
  schedulingIcon: {
    color: colors.white,
    alignSelf: 'center',
    position: 'relative',
    top: -1,
  },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  sectionList: {
    minWidth: '100%',
    flex: 1,
  },
  sectionListContainer: {
    minHeight: '100%',
    paddingBottom: 65,
  },
})
