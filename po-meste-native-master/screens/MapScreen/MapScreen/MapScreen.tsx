import Text from '@components/Text'
import BottomSheet from '@gorhom/bottom-sheet'
import { useNetInfo } from '@react-native-community/netinfo'
import { useIsFocused } from '@react-navigation/core'
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
  Animated,
  ImageURISource,
  Platform,
  StyleSheet,
  View,
} from 'react-native'
import MapView, { Marker, Region, Geojson } from 'react-native-maps'

import {
  useHealthData,
  useRekolaData,
  useSlovnaftbajkData,
  useTierData,
  useHeatData,
} from '@hooks'

import {
  BOTTOM_VEHICLE_BAR_HEIGHT_ALL,
  ErrorView,
  LoadingView,
  VehicleBar,
} from '@components'

import { GlobalStateContext } from '@state/GlobalStateProvider'

import { useZseChargersData } from '@hooks'
import {
  BikeProvider,
  IconType,
  MicromobilityProvider,
  VehicleType,
  ZoomLevel,
} from '@types'
import {
  ChargerStationProps,
  FreeBikeStatusProps,
  FreeBikeStatusScooterProps,
  getMapPinSize,
  getZoomLevel,
  LocalitiesProps,
  mapStyles,
  MhdStopProps,
  s,
  StationMicromobilityProps,
} from '@utils'

import { BOTTOM_TAB_NAVIGATOR_HEIGHT } from '@components/navigation/TabBar'

import SearchBar from './_partials/SearchBar'
import StationChargerInfo from './_partials/StationChargerInfo'
import StationMhdInfo from './_partials/StationMhdInfo'
import StationMicromobilityInfo from './_partials/StationMicromobilityInfo'

import CurrentLocationButton from '@components/CurrentLocationButton'
import { colors } from '@utils'

import * as SplashScreen from 'expo-splash-screen'

import BoltSmallIcon from '@icons/map/bolt/no-icon.svg'
import BoltIcon from '@icons/map/bolt/with-icon.svg'
import MhdSmallIcon from '@icons/map/mhd/no-icon.svg'
import MhdIcon from '@icons/map/mhd/with-icon.svg'
import RekolaSmallIcon from '@icons/map/rekola/no-icon.svg'
import RekolaIcon from '@icons/map/rekola/with-icon.svg'
import SlovnaftbajkSmallIcon from '@icons/map/slovnaftbajk/no-icon.svg'
import SlovnaftbajkIcon from '@icons/map/slovnaftbajk/with-icon.svg'
import TierSmallIcon from '@icons/map/tier/no-icon.svg'
import TierIcon from '@icons/map/tier/with-icon.svg'
import ZseSmallIcon from '@icons/map/zse/no-icon.svg'
import ZseIcon from '@icons/map/zse/with-icon.svg'
import { Polygon, SvgProps } from 'react-native-svg'

const VEHICLE_BAR_SHEET_HEIGHT_COLLAPSED = BOTTOM_TAB_NAVIGATOR_HEIGHT + 70
const VEHICLE_BAR_SHEET_HEIGHT_EXPANDED = BOTTOM_TAB_NAVIGATOR_HEIGHT + 195 // + 195 for 2 rows

const SPACING = 7.5

//#region icons

type markerIcon = {
  xs: ImageURISource
  sm: ImageURISource
  md: ImageURISource
  lg: ImageURISource
}

const markerIcons: { [index: string]: markerIcon } = {
  mhd: {
    xs: require('@icons/map/mhd/xs.png'),
    sm: require('@icons/map/mhd/sm.png'),
    md: require('@icons/map/mhd/md.png'),
    lg: require('@icons/map/mhd/lg.png'),
  },
  tier: {
    xs: require('@icons/map/tier/xs.png'),
    sm: require('@icons/map/tier/sm.png'),
    md: require('@icons/map/tier/md.png'),
    lg: require('@icons/map/tier/lg.png'),
  },
  slovnaftbajk: {
    xs: require('@icons/map/slovnaftbajk/xs.png'),
    sm: require('@icons/map/slovnaftbajk/sm.png'),
    md: require('@icons/map/slovnaftbajk/md.png'),
    lg: require('@icons/map/slovnaftbajk/lg.png'),
  },
  rekola: {
    xs: require('@icons/map/rekola/xs.png'),
    sm: require('@icons/map/rekola/sm.png'),
    md: require('@icons/map/rekola/md.png'),
    lg: require('@icons/map/rekola/lg.png'),
  },
  zse: {
    xs: require('@icons/map/zse/xs.png'),
    sm: require('@icons/map/zse/sm.png'),
    md: require('@icons/map/zse/md.png'),
    lg: require('@icons/map/zse/lg.png'),
  },
  bolt: {
    xs: require('@icons/map/bolt/xs.png'),
    sm: require('@icons/map/bolt/sm.png'),
    md: require('@icons/map/bolt/md.png'),
    lg: require('@icons/map/bolt/lg.png'),
  },
}

// const iosIcons: { [index: string]: markerIcon } = {
//   mhd: {
//     xs: require('@icons/map-ios/mhd/xs.png'),
//     sm: require('@icons/map-ios/mhd/sm.png'),
//     md: require('@icons/map-ios/mhd/md.png'),
//     lg: require('@icons/map-ios/mhd/lg.png'),
//   },
//   tier: {
//     xs: require('@icons/map-ios/tier/xs.png'),
//     sm: require('@icons/map-ios/tier/sm.png'),
//     md: require('@icons/map-ios/tier/md.png'),
//     lg: require('@icons/map-ios/tier/lg.png'),
//   },
//   slovnaftbajk: {
//     xs: require('@icons/map-ios/slovnaftbajk/xs.png'),
//     sm: require('@icons/map-ios/slovnaftbajk/sm.png'),
//     md: require('@icons/map-ios/slovnaftbajk/md.png'),
//     lg: require('@icons/map-ios/slovnaftbajk/lg.png'),
//   },
//   rekola: {
//     xs: require('@icons/map-ios/rekola/xs.png'),
//     sm: require('@icons/map-ios/rekola/sm.png'),
//     md: require('@icons/map-ios/rekola/md.png'),
//     lg: require('@icons/map-ios/rekola/lg.png'),
//   },
//   zse: {
//     xs: require('@icons/map-ios/zse/xs.png'),
//     sm: require('@icons/map-ios/zse/sm.png'),
//     md: require('@icons/map-ios/zse/md.png'),
//     lg: require('@icons/map-ios/zse/lg.png'),
//   },
//   bolt: {
//     xs: require('@icons/map-ios/bolt/xs.png'),
//     sm: require('@icons/map-ios/bolt/sm.png'),
//     md: require('@icons/map-ios/bolt/md.png'),
//     lg: require('@icons/map-ios/bolt/lg.png'),
//   },
// }

//#endregion icons

const myPlace = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [17.10, 48.15],
            [17.12, 48.18],
            [17.14, 48.11],
          ]
        ]
      },
      "properties": {
        "prop0": "value0",
        "prop1": { "this": "that" }
      }
    }
  ]
}


export default function MapScreen() {
  const netInfo = useNetInfo()
  const vehiclesContext = useContext(GlobalStateContext)
  // TODO handle loading / error
  const {
    data: dataMhd,
    isLoading: isLoadingMhd,
    errors: errorsMhd,
    refetch: refetchMhd,
  } = vehiclesContext.mhdStopsData
  const {
    data: dataTier,
    isLoading: isLoadingTier,
    refetch: refetchTier,
    errors: errorsTier,
  } = useTierData()
  const {
    data: dataZseChargers,
    isLoading: isLoadingZseChargers,
    errors: errorsZseChargers,
    refetch: refetchZseChargers,
  } = useZseChargersData()
  const {
    data: dataMergedRekola,
    isLoading: isLoadingRekola,
    error: errorsRekola,
    refetch: refetchRekola,
  } = useRekolaData()
  const {
    data: dataMergedSlovnaftbajk,
    isLoading: isLoadingSlovnaftbajk,
    error: errorsSlovnaftbajk,
    refetch: refetchSlovnaftbajk,
  } = useSlovnaftbajkData()
  const {
    data: dataBolt,
    isLoading: isLoadingBolt,
    errors: errorsBolt,
    refetch: refetchBolt,
  } = vehiclesContext.boltData
  const { data: healthData, error: healthError } = useHealthData()
  const providerStatus = healthData?.dependencyResponseStatus

  const [isMhdErrorOpen, setIsMhdErrorOpen] = useState(false)
  const [isTierErrorOpen, setIsTierErrorOpen] = useState(false)
  const [isZseErrorOpen, setIsZseErrorOpen] = useState(false)
  const [isRekolaErrorOpen, setIsRekolaErrorOpen] = useState(false)
  const [isSlovnaftbajkErrorOpen, setIsSlovnaftbajkErrorOpen] = useState(false)
  const [isBoltErrorOpen, setIsBoltErrorOpen] = useState(false)

  const mapRef = useRef<MapView>(null)

  const [selectedMicromobilityStation, setSelectedBikeStation] = useState<
    StationMicromobilityProps | FreeBikeStatusProps | undefined
  >(undefined)
  const [selectedMicromobilityProvider, setSelectedMicromobilityProvider] =
    useState<MicromobilityProvider | undefined>(undefined)
  const [selectedMhdStation, setSelectedMhdStation] = useState<
    MhdStopProps | undefined
  >(undefined)
  const [selectedChargerStation, setSelectedChargerStation] = useState<
    ChargerStationProps | undefined
  >(undefined)
  const [region, setRegion] = useState<Region | null>({
    latitude: 48.1512015,
    longitude: 17.1110118,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  })
  // useful on Android, where the elevation shadow causes incorrect ordering of elements
  const [showCurrentLocationButton, setShowCurrentLocationButton] =
    useState(true)

  const [animateToLocation, setAnimateToLocation] = useState(true)
  useEffect(() => {
    if (vehiclesContext.location?.coords && animateToLocation) {
      setAnimateToLocation(false)
      mapRef.current?.animateCamera({
        center: vehiclesContext.location?.coords,
        zoom: 17,
        // TODO altitude needs to be set for Apple maps
        // https://github.com/react-native-maps/react-native-maps/blob/master/docs/mapview.md#types part camera
        altitude: undefined,
      })
    }
  }, [vehiclesContext.location, animateToLocation])

  const [vehicleSheetIndex, setVehicleSheetIndex] = useState(1)

  const bottomSheetRef = useRef<BottomSheet>(null)
  const vehicleSheetRef = useRef<BottomSheet>(null)

  const bottomSheetSnapPoints = useMemo(() => {
    if (selectedMicromobilityStation) {
      return [415]
    } else {
      return [415, '95%']
    }
  }, [selectedMicromobilityStation, selectedMhdStation, selectedChargerStation])

  const isFocused = useIsFocused()

  const mockData = { "type": "FeatureCollection", "features": [{ "id": "0", "type": "Feature", "properties": {}, "geometry": { "type": "Polygon", "coordinates": [[[17.106, 48.147], [17.107, 48.149],  [17.108, 48.150], [17.109, 48.148], [17.106, 48.147]]]}}]}
  const vec2Copy = (out, a) => {
    out[0] = a[0]
    out[1] = a[1]
    return out
  }
  
  const chaikingSmooth = (input, output) => {
    if (!Array.isArray(output))
        output = []

    if (input.length>0)
        output.push(vec2Copy([0, 0], input[0]))
    for (var i=0; i<input.length-1; i++) {
        var p0 = input[i]
        var p1 = input[i+1]
        var p0x = p0[0],
            p0y = p0[1],
            p1x = p1[0],
            p1y = p1[1]

        var Q = [ 0.75 * p0x + 0.25 * p1x, 0.75 * p0y + 0.25 * p1y ]
        var R = [ 0.25 * p0x + 0.75 * p1x, 0.25 * p0y + 0.75 * p1y ]
        output.push(Q)
        output.push(R)
    }
    if (input.length > 1)
        output.push(vec2Copy([0, 0], input[ input.length-1 ]))
    return output
  }
  
  const smoothOutPolygons = (geojsonData) => {
    const smoothGeojsonData = geojsonData
    smoothGeojsonData.features = smoothGeojsonData.features.map((polygon) => {
      const newPolygon = polygon
      const newCoordinates = [chaikingSmooth(polygon.geometry.coordinates[0], null)]
      const newGeometry = polygon.geometry
      newGeometry.coordinates = newCoordinates
      newPolygon.geometry = newGeometry
      return newPolygon
    })
    return smoothGeojsonData
  }

  const [heatData, setHeatData] = useState(null);

  useEffect(() => {
    // Define a function to fetch data
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8000');
        const result = await response.json();
        setHeatData(result);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    // Call the function when the component mounts
    fetchData();
  }, []); // Empty dependency array means this effect runs once when the component mounts

  const refetch = useCallback(() => {
    refetchTier()
    // TODO add SlovnaftbajkData rekola, zseChargers
  }, [refetchTier])

  useEffect(() => {
    if (isFocused) {
      refetch()
    }
  }, [isFocused])

  useEffect(() => {
    if (
      selectedMhdStation ||
      selectedMicromobilityStation ||
      selectedChargerStation
    ) {
      vehicleSheetRef.current?.snapToIndex(0)
      bottomSheetRef.current?.snapToIndex(0)
    } else {
      bottomSheetRef.current?.snapToIndex(-1)
    }
  }, [
    selectedMhdStation,
    selectedMicromobilityStation,
    selectedChargerStation,
    bottomSheetRef,
  ])

  const handleSheetClose = () => {
    operateBottomSheet({})
  }

  const zoomLevel = getZoomLevel(region)

  const getSizedIcon = (Icon: React.FC<SvgProps>) => {
    const size = getMapPinSize(zoomLevel)
    return <Icon width={size} height={size} />
  }

  const getIosIcon = (name: IconType) => {
    let icon: React.FC<SvgProps>
    switch (name) {
      case IconType.mhd:
        icon = zoomLevel < ZoomLevel.md ? MhdSmallIcon : MhdIcon
        break
      case IconType.bolt:
        icon = zoomLevel < ZoomLevel.md ? BoltSmallIcon : BoltIcon
        break
      case IconType.tier:
        icon = zoomLevel < ZoomLevel.md ? TierSmallIcon : TierIcon
        break
      case IconType.slovnaftbajk:
        icon =
          zoomLevel < ZoomLevel.md ? SlovnaftbajkSmallIcon : SlovnaftbajkIcon
        break
      case IconType.rekola:
        icon = zoomLevel < ZoomLevel.md ? RekolaSmallIcon : RekolaIcon
        break
      case IconType.zse:
        icon = zoomLevel < ZoomLevel.md ? ZseSmallIcon : ZseIcon
        break
    }
    return getSizedIcon(icon)
  }

  const operateBottomSheet = ({
    charger,
    micromobilityStation,
    micromobilityProvider,
    mhd,
  }: {
    charger?: ChargerStationProps
    micromobilityStation?: StationMicromobilityProps | FreeBikeStatusProps
    micromobilityProvider?: MicromobilityProvider
    mhd?: MhdStopProps
  }) => {
    if (zoomLevel > ZoomLevel.xs) {
      setSelectedChargerStation(charger)
      setSelectedBikeStation(micromobilityStation)
      setSelectedMicromobilityProvider(micromobilityProvider)
      setSelectedMhdStation(mhd)
    }
  }

  const getIcon = useCallback(
    (name: IconType) => {
      const icons = markerIcons[name]
      switch (getZoomLevel(region)) {
        case ZoomLevel.xs:
          return icons.xs
        case ZoomLevel.sm:
          return icons.sm
        case ZoomLevel.md:
          return icons.md
        case ZoomLevel.lg:
          return icons.lg
        default:
          return icons.xs
      }
    },
    [region]
  )

  const filterInView = useCallback(
    (pointLat: number, pointLon: number, region: Region) => {
      const latOk =
        pointLat > region.latitude - region.latitudeDelta / 2 &&
        pointLat < region.latitude + region.latitudeDelta / 2
      const lonOk =
        pointLon > region.longitude - region.longitudeDelta / 2 &&
        pointLon < region.longitude + region.longitudeDelta / 2
      return latOk && lonOk
    },
    []
  )

  const filterMhdInView = useCallback(
    (data: MhdStopProps[]) => {
      if (region) {
        const inRange = data.filter((stop) => {
          return filterInView(
            parseFloat(stop.gpsLat),
            parseFloat(stop.gpsLon),
            region
          )
        })
        return inRange
      }
      return []
    },
    [filterInView, region]
  )

  const filterBikeInView = useCallback(
    (data: StationMicromobilityProps[]) => {
      if (region && Array.isArray(data)) {
        const inRange = data.filter((stop) => {
          if (stop.lat && stop.lon) {
            return filterInView(stop.lat, stop.lon, region)
          }
          return false
        })
        return inRange
      }
      return []
    },
    [filterInView, region]
  )

  const filterScootersInView = useCallback(
    (data: FreeBikeStatusScooterProps[]) => {
      if (region) {
        const inRange = data.filter((stop) => {
          if (stop.lat && stop.lon) {
            return filterInView(stop.lat, stop.lon, region)
          }
          return false
        })
        return inRange
      }
      return []
    },
    [filterInView, region]
  )

  const filterZseChargersInView = useCallback(
    (data: LocalitiesProps) => {
      if (region && data) {
        const inRange = data.filter((stop) => {
          if (stop?.coordinates.latitude && stop?.coordinates.longitude) {
            return filterInView(
              stop?.coordinates.latitude,
              stop?.coordinates.longitude,
              region
            )
          }
          return false
        })
        return inRange
      }
      return []
    },
    [filterInView, region]
  )

  const renderStations = useCallback(
    (data: StationMicromobilityProps[], bikeProvider: BikeProvider) => {
      return filterBikeInView(data).reduce<JSX.Element[]>(
        (accumulator, station) => {
          if (station.lat && station.lon && station.station_id) {
            const marker = (
              <Marker
                key={station.station_id}
                coordinate={{ latitude: station.lat, longitude: station.lon }}
                tracksViewChanges={false}
                onPress={() =>
                  operateBottomSheet({
                    micromobilityStation: station,
                    micromobilityProvider:
                      bikeProvider === BikeProvider.rekola
                        ? MicromobilityProvider.rekola
                        : MicromobilityProvider.slovnaftbajk,
                  })
                }
                icon={
                  bikeProvider === BikeProvider.rekola
                    ? getIcon(IconType.rekola)
                    : bikeProvider === BikeProvider.slovnaftbajk
                    ? getIcon(IconType.slovnaftbajk)
                    : undefined
                }
              >
                {Platform.OS === 'ios' &&
                  getIosIcon(
                    bikeProvider === BikeProvider.rekola
                      ? IconType.rekola
                      : IconType.slovnaftbajk
                  )}
              </Marker>
            )
            return accumulator.concat(marker)
          }
          return accumulator
        },
        []
      )
    },
    [filterBikeInView, getIcon]
  )

  const dataError = (
    isLoading: boolean,
    errors: any,
    refetch: () => unknown,
    dismiss: () => void,
    errorMessage: string
  ) => {
    if (!isLoading) {
      return (
        <ErrorView
          errorMessage={errorMessage}
          error={errors}
          action={refetch}
          dismiss={dismiss}
          styleWrapper={{ position: 'absolute', top: 100 }}
        />
      )
    }
  }

  useEffect(() => setIsMhdErrorOpen(!!errorsMhd), [errorsMhd])
  useEffect(() => setIsTierErrorOpen(!!errorsTier), [errorsTier])
  useEffect(() => setIsZseErrorOpen(!!errorsZseChargers), [errorsZseChargers])
  useEffect(() => setIsRekolaErrorOpen(!!errorsRekola), [errorsRekola])
  useEffect(
    () => setIsSlovnaftbajkErrorOpen(!!errorsSlovnaftbajk),
    [errorsSlovnaftbajk]
  )

  const filterScooterAmount = (scooter: FreeBikeStatusProps, index: number) =>
    zoomLevel === ZoomLevel.xs ? index % 3 === 0 : true
  const filterMhdAmount = (mhdStop: MhdStopProps) =>
    zoomLevel === ZoomLevel.xs ? mhdStop.platform === 'A' : true

  const moveAnim = useRef(new Animated.Value(0)).current
  const moveCurrentLocationIcon = (index: number) => {
    Animated.timing(moveAnim, {
      toValue:
        index === 0
          ? VEHICLE_BAR_SHEET_HEIGHT_EXPANDED -
            VEHICLE_BAR_SHEET_HEIGHT_COLLAPSED
          : 0,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        {...mapStyles}
        style={styles.map}
        onRegionChangeComplete={(region) => setRegion(region)}
        showsUserLocation
        showsMyLocationButton={false}
        mapPadding={{
          bottom: BOTTOM_VEHICLE_BAR_HEIGHT_ALL + 5,
          top: 80,
          right: 0,
          left: 0,
        }}
        onMapLoaded={() => SplashScreen.hideAsync()}
      >
        {
          heatData && <Geojson
          geojson={heatData}
          strokeColor="rgba(255, 0, 0, 0.5)"
          fillColor="rgba(255, 0, 0, 0.3)"
          strokeWidth={4}
        >
        </Geojson>}
        {vehiclesContext.vehicleTypes?.find(
          (vehicleType) => vehicleType.id === VehicleType.mhd
        )?.show &&
          dataMhd?.stops &&
          filterMhdInView(dataMhd.stops)
            .filter(filterMhdAmount)
            .map((stop) => (
              <Marker
                key={stop.id}
                coordinate={{
                  latitude: parseFloat(stop.gpsLat),
                  longitude: parseFloat(stop.gpsLon),
                }}
                tracksViewChanges
                onPress={() => operateBottomSheet({ mhd: stop })}
                icon={getIcon(IconType.mhd)}
              >
                {Platform.OS === 'ios' && (
                  <View
                    style={{
                      height:
                        getMapPinSize(zoomLevel) +
                        (zoomLevel === ZoomLevel.lg ? 6 : 0),
                    }}
                  >
                    {getIosIcon(IconType.mhd)}
                    {stop.platform && zoomLevel === ZoomLevel.lg && (
                      <View
                        style={[
                          markerLabelStyles.container,
                          markerLabelStyles.iosContainer,
                        ]}
                      >
                        <Text style={markerLabelStyles.label}>
                          {stop.platform}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
                {stop.platform &&
                  zoomLevel === ZoomLevel.lg &&
                  Platform.OS !== 'ios' && (
                    <View style={markerLabelStyles.container}>
                      <Text style={markerLabelStyles.label}>
                        {stop.platform}
                      </Text>
                    </View>
                  )}
              </Marker>
            ))}
        {vehiclesContext.vehicleTypes?.find(
          (vehicleType) => vehicleType.id === VehicleType.scooter
        )?.show &&
          dataTier &&
          filterScootersInView(dataTier.bikes)
            .filter(filterScooterAmount)
            .map((vehicle) => {
              return (
                <Marker
                  key={vehicle.bike_id}
                  coordinate={{ latitude: vehicle.lat, longitude: vehicle.lon }}
                  tracksViewChanges={false}
                  onPress={() =>
                    operateBottomSheet({
                      micromobilityStation: vehicle,
                      micromobilityProvider: MicromobilityProvider.tier,
                    })
                  }
                  icon={getIcon(IconType.tier)}
                >
                  {Platform.OS === 'ios' && getIosIcon(IconType.tier)}
                </Marker>
              )
            })}
        {vehiclesContext.vehicleTypes?.find(
          (vehicleType) => vehicleType.id === VehicleType.scooter
        )?.show &&
          dataBolt &&
          filterScootersInView(dataBolt.bikes)
            .filter(filterScooterAmount)
            .map((vehicle) => {
              return (
                <Marker
                  key={vehicle.bike_id}
                  coordinate={{ latitude: vehicle.lat, longitude: vehicle.lon }}
                  tracksViewChanges={false}
                  onPress={() =>
                    operateBottomSheet({
                      micromobilityStation: vehicle,
                      micromobilityProvider: MicromobilityProvider.bolt,
                    })
                  }
                  icon={getIcon(IconType.bolt)}
                >
                  {Platform.OS === 'ios' && getIosIcon(IconType.bolt)}
                </Marker>
              )
            })}

        {vehiclesContext.vehicleTypes?.find(
          (vehicleType) => vehicleType.id === VehicleType.bicycle
        )?.show &&
          dataMergedRekola &&
          renderStations(dataMergedRekola, BikeProvider.rekola)}
        {vehiclesContext.vehicleTypes?.find(
          (vehicleType) => vehicleType.id === VehicleType.bicycle
        )?.show &&
          dataMergedSlovnaftbajk &&
          renderStations(dataMergedSlovnaftbajk, BikeProvider.slovnaftbajk)}
        {vehiclesContext.vehicleTypes?.find(
          (vehicleType) => vehicleType.id === VehicleType.chargers
        )?.show &&
          dataZseChargers &&
          filterZseChargersInView(dataZseChargers).reduce<JSX.Element[]>(
            (accumulator, charger) => {
              if (
                charger.coordinates.latitude &&
                charger.coordinates.longitude
              ) {
                const marker = (
                  <Marker
                    key={charger.id}
                    coordinate={{
                      latitude: charger.coordinates.latitude,
                      longitude: charger.coordinates.longitude,
                    }}
                    tracksViewChanges={false}
                    icon={getIcon(IconType.zse)}
                    onPress={() => operateBottomSheet({ charger })}
                  >
                    {Platform.OS === 'ios' && getIosIcon(IconType.zse)}
                  </Marker>
                )
                return accumulator.concat(marker)
              } else return accumulator
            },
            []
          )}
      </MapView>
      {(!netInfo.isConnected ||
        isLoadingMhd ||
        (isLoadingRekola && providerStatus?.rekola === 200) ||
        (isLoadingSlovnaftbajk && providerStatus?.slovnaftbajk === 200) ||
        (isLoadingTier && providerStatus?.tier === 200) ||
        (isLoadingZseChargers && providerStatus?.zse === 200) ||
        (isLoadingBolt && providerStatus?.bolt === 200)) && (
        <LoadingView fullscreen iconWidth={80} iconHeight={80} />
      )}
      <SearchBar />
      {isMhdErrorOpen &&
        dataError(
          isLoadingMhd,
          errorsMhd,
          () => {
            refetchMhd()
            setIsMhdErrorOpen(false)
          },
          () => setIsMhdErrorOpen(false),
          i18n.t('components.ErrorView.errors.dataProvider', {
            provider: 'MHD',
          })
        )}
      {isRekolaErrorOpen &&
        dataError(
          isLoadingRekola,
          errorsRekola,
          () => {
            refetchRekola()
            setIsRekolaErrorOpen(false)
          },
          () => setIsRekolaErrorOpen(false),
          i18n.t('components.ErrorView.errors.dataProvider', {
            provider: 'Rekola',
          })
        )}
      {isSlovnaftbajkErrorOpen &&
        dataError(
          isLoadingSlovnaftbajk,
          errorsSlovnaftbajk,
          () => {
            refetchSlovnaftbajk()
            setIsSlovnaftbajkErrorOpen(false)
          },
          () => setIsSlovnaftbajkErrorOpen(false),
          i18n.t('components.ErrorView.errors.dataProvider', {
            provider: 'SlovnaftBAJK',
          })
        )}
      {isTierErrorOpen &&
        dataError(
          isLoadingTier,
          errorsTier,
          () => {
            refetchTier()
            setIsTierErrorOpen(false)
          },
          () => setIsTierErrorOpen(false),
          i18n.t('components.ErrorView.errors.dataProvider', {
            provider: 'TIER',
          })
        )}
      {isZseErrorOpen &&
        dataError(
          isLoadingZseChargers,
          errorsZseChargers,
          () => {
            refetchZseChargers()
            setIsZseErrorOpen(false)
          },
          () => setIsZseErrorOpen(false),
          i18n.t('components.ErrorView.errors.dataProvider', {
            provider: 'ZSE',
          })
        )}
      {isBoltErrorOpen &&
        dataError(
          isLoadingBolt,
          errorsBolt,
          () => {
            refetchBolt()
            setIsBoltErrorOpen(false)
          },
          () => setIsBoltErrorOpen(false),
          i18n.t('components.ErrorView.errors.dataProvider', {
            provider: 'Bolt',
          })
        )}

      {showCurrentLocationButton && (
        <Animated.View
          style={{
            transform: [{ translateY: moveAnim }],
            position: 'absolute',
            right: 20,
            bottom: VEHICLE_BAR_SHEET_HEIGHT_EXPANDED + 70,
          }}
        >
          <CurrentLocationButton mapRef={mapRef} />
        </Animated.View>
      )}
      <BottomSheet
        ref={vehicleSheetRef}
        style={{ zIndex: 2, ...s.shadow }}
        handleIndicatorStyle={{ ...s.handleStyle, marginBottom: 0 }}
        index={1}
        snapPoints={[
          VEHICLE_BAR_SHEET_HEIGHT_COLLAPSED,
          VEHICLE_BAR_SHEET_HEIGHT_EXPANDED,
        ]}
        onChange={(index) => {
          setVehicleSheetIndex(index)
          moveCurrentLocationIcon(index)
        }}
      >
        <VehicleBar />
      </BottomSheet>
      <BottomSheet
        handleIndicatorStyle={s.handleStyle}
        ref={bottomSheetRef}
        style={{ zIndex: 1, ...s.shadow, elevation: 7 }}
        index={-1}
        snapPoints={bottomSheetSnapPoints}
        enablePanDownToClose
        onClose={handleSheetClose}
        onAnimate={(fromIndex, toIndex) => {
          if (toIndex === -1) {
            setShowCurrentLocationButton(true)
          } else {
            setShowCurrentLocationButton(false)
          }
        }}
      >
        {selectedChargerStation ? (
          <StationChargerInfo
            name={selectedChargerStation.name}
            openingTimes={selectedChargerStation.opening_times}
            numberOfParkingSpaces={
              selectedChargerStation.number_of_parking_spaces
            }
            connectors={selectedChargerStation.connectors}
          />
        ) : selectedMicromobilityStation && selectedMicromobilityProvider ? (
          <StationMicromobilityInfo
            station={selectedMicromobilityStation}
            provider={selectedMicromobilityProvider}
          />
        ) : selectedMhdStation ? (
          <StationMhdInfo station={selectedMhdStation} />
        ) : null}
      </BottomSheet>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: BOTTOM_TAB_NAVIGATOR_HEIGHT,
  },
})

export const markerLabelStyles = StyleSheet.create({
  container: {
    marginLeft: 5.5,
    marginTop: 18,
    backgroundColor: 'white',
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: 2,
    paddingHorizontal: 3,
    paddingTop: 1,
  },
  iosContainer: {
    marginTop: 0,
    alignItems: 'center',
    position: 'absolute',
    top: 16,
    left: -1,
    zIndex: 2,
  },
  label: {
    fontWeight: '700',
    fontSize: 8,
    lineHeight: 8,
    textAlignVertical: 'bottom',
  },
})
