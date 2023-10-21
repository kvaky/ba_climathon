import LoadingView from '@components/LoadingView'
import { NAVIGATION_HEADER_HEIGHT } from '@components/navigation/Header'
import { TAB_BAR_LARGE_HEIGHT } from '@components/TabView'
import Text from '@components/Text'
import BottomSheet, { TouchableOpacity } from '@gorhom/bottom-sheet'
import ArrowRightSvg from '@icons/arrow-right.svg'
import SearchSvg from '@icons/search.svg'
import MhdStopSvg from '@icons/stop-sign.svg'
import { markerLabelStyles } from '@screens/MapScreen/MapScreen/MapScreen'
import StationMhdInfo from '@screens/MapScreen/MapScreen/_partials/StationMhdInfo'
import { GlobalStateContext } from '@state/GlobalStateProvider'
import { ZoomLevel } from '@types'
import { getMhdStopStatusData } from '@utils/api'
import { s } from '@utils/globalStyles'
import { colors, mapStyles } from '@utils/theme'
import { getMapPinSize, getZoomLevel } from '@utils/utils'
import { MhdStopProps } from '@utils/validation'
import i18n from 'i18n-js'
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native'
import { AutocompleteDropdown } from 'react-native-autocomplete-dropdown'
import { ScrollView } from 'react-native-gesture-handler'
import MapView, { Marker, Region } from 'react-native-maps'
import { useQuery } from 'react-query'
import StopPlatformCard from './_partials/StopPlatformCard'

import MhdSmallIcon from '@icons/map/mhd/no-icon.svg'
import MhdInactiveIcon from '@icons/map/mhd/with-icon-inactive.svg'
import MhdIcon from '@icons/map/mhd/with-icon.svg'

const MAP_HEIGHT = 200

type UniqueStop = {
  id: string
  title: string
}

const icons = {
  active: {
    xs: require('@icons/map/mhd/xs.png'),
    sm: require('@icons/map/mhd/sm.png'),
    md: require('@icons/map/mhd/md.png'),
    lg: require('@icons/map/mhd/lg.png'),
  },
  inactive: {
    xs: require('@icons/map/mhd/xs.png'),
    sm: require('@icons/map/mhd/sm.png'),
    md: require('@icons/map/mhd/md-inactive.png'),
    lg: require('@icons/map/mhd/lg-inactive.png'),
  },
}

const SearchMhd = () => {
  const globalContext = useContext(GlobalStateContext)
  const stopsData: MhdStopProps[] = globalContext.mhdStopsData?.data?.stops
  const uniqueStopNames = Array.from(
    new Set(stopsData.map((stop: MhdStopProps) => stop.name))
  )
  const uniqueStops: UniqueStop[] = uniqueStopNames.map((stopName, index) => ({
    id: index + '',
    title: stopName,
  }))
  const mapRef = useRef<MapView>(null)
  const bottomSheetRef = useRef<BottomSheet>(null)
  const [chosenStop, setChosenStop] = useState<UniqueStop>()
  const [suggestions, setSuggestions] = useState<UniqueStop[]>([])
  const [stopPlatforms, setStopPlatforms] = useState<MhdStopProps[]>([])
  const [region, setRegion] = useState<Region | null>({
    latitude: 48.1512015,
    longitude: 17.1110118,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  })
  const [chosenPlatform, setChosenPlatform] = useState<MhdStopProps>()
  const [mapHeight, setMapHeight] = useState<string | number>(MAP_HEIGHT)
  const dimensions = useWindowDimensions()

  const stopStatuses = useQuery(
    [
      'searchMhdGetMhdStopStatusData',
      stopPlatforms.length > 0 ? stopPlatforms[0].name : 'Loading',
    ],
    async () => {
      const result = await Promise.all(
        stopPlatforms.map((stop) => getMhdStopStatusData(stop.id))
      )
      return result
    }
  )

  const getIcon = (active: boolean) => {
    const iconsSubset = icons[active ? 'active' : 'inactive']
    switch (getZoomLevel(region)) {
      case ZoomLevel.xs:
        return iconsSubset.xs
      case ZoomLevel.sm:
        return iconsSubset.sm
      case ZoomLevel.md:
        return iconsSubset.md
      case ZoomLevel.lg:
        return iconsSubset.lg
      default:
        return undefined
    }
  }

  const getIosIcon = (active: boolean) => {
    const size = getMapPinSize(getZoomLevel(region))
    const sizeProps = { width: size, height: size }
    switch (getZoomLevel(region)) {
      case ZoomLevel.xs:
      case ZoomLevel.sm:
        return <MhdSmallIcon {...sizeProps} />
      case ZoomLevel.md:
      case ZoomLevel.lg:
        return active ? (
          <MhdIcon {...sizeProps} />
        ) : (
          <MhdInactiveIcon {...sizeProps} />
        )
      default:
        return null
    }
  }

  useEffect(() => {
    const chosenStopPlatforms = (
      globalContext.mhdStopsData.data?.stops as MhdStopProps[]
    )
      ?.filter((stop) => stop.name === chosenStop?.title)
      .sort((a, b) =>
        a.platform && b.platform && a.platform > b.platform ? 1 : -1
      )
    setStopPlatforms(chosenStopPlatforms)
  }, [setStopPlatforms, chosenStop, globalContext.mhdStopsData.data?.stops])

  useEffect(() => {
    animateToPlatforms()
  }, [stopPlatforms])

  const renderPlatforms = useCallback(() => {
    if (!stopPlatforms || stopPlatforms.length === 0) return null
    return stopPlatforms.map((stop, index) => (
      <StopPlatformCard
        key={stop.id}
        stop={stop}
        stopStatus={stopStatuses?.data ? stopStatuses.data[index] : undefined}
        onPress={() => {
          setChosenPlatform(stop)
          setMapHeight('100%')
        }}
      />
    ))
  }, [stopPlatforms, stopStatuses])

  const fitToCoordinates = () => {
    mapRef.current?.fitToCoordinates(
      stopPlatforms.map((stop) => ({
        latitude: Number.parseFloat(stop.gpsLat),
        longitude: Number.parseFloat(stop.gpsLon),
      })),
      {
        edgePadding: {
          top: 10,
          bottom: 10,
          right: 10,
          left: 10,
        },
        animated: true,
      }
    )
  }

  const animateToPlatforms = (iosAnimate = true) => {
    if (stopPlatforms.length === 0) {
      return
    }
    if (Platform.OS === 'android' || !iosAnimate) {
      fitToCoordinates()
      return
    }
    const center = stopPlatforms.reduce(
      (prev, stop) => ({
        latitude:
          (prev.latitude + Number.parseFloat(stop.gpsLat)) /
          (prev.latitude === 0 ? 1 : 2),
        longitude:
          (prev.longitude + Number.parseFloat(stop.gpsLon)) /
          (prev.latitude === 0 ? 1 : 2),
      }),
      { latitude: 0, longitude: 0 }
    )
    mapRef.current?.animateCamera({ center }, { duration: 1000 })
    setTimeout(fitToCoordinates, 1000)
  }

  const handleBottomSheetClose = () => {
    setChosenPlatform(undefined)
    setMapHeight(MAP_HEIGHT)
  }

  const handleMarkerPress = (stop: MhdStopProps) => {
    setChosenPlatform(stop)
  }

  const handleBackButtonPress = () => {
    setChosenPlatform(undefined)
    setMapHeight(MAP_HEIGHT)
    bottomSheetRef.current?.close()
  }

  const mapPadding =
    mapHeight === '100%'
      ? {
          bottom:
            dimensions.height / 2 -
            TAB_BAR_LARGE_HEIGHT -
            NAVIGATION_HEADER_HEIGHT +
            30,
          top: 60,
          right: 20,
          left: 20,
        }
      : {
          bottom: Platform.OS === 'ios' ? 10 : 0,
          top: Platform.OS === 'ios' ? 20 : 50,
          right: 0,
          left: 0,
        }

  return (
    <View style={styles.container}>
      <View
        style={styles.mapWrapper}
        pointerEvents={chosenPlatform ? 'auto' : 'none'}
      >
        <MapView
          ref={mapRef}
          style={{ height: mapHeight }}
          {...mapStyles}
          onRegionChangeComplete={(region) => setRegion(region)}
          showsMyLocationButton={false}
          mapPadding={mapPadding}
          onLayout={() => animateToPlatforms(false)}
        >
          {stopPlatforms &&
            stopPlatforms.map((stop) => (
              <Marker
                key={stop.id}
                coordinate={{
                  latitude: parseFloat(stop.gpsLat),
                  longitude: parseFloat(stop.gpsLon),
                }}
                tracksViewChanges
                icon={getIcon(
                  chosenPlatform ? stop.id === chosenPlatform?.id : true
                )}
                style={{ zIndex: stop.id === chosenPlatform?.id ? 2 : 1 }}
                onPress={(event) => {
                  event.stopPropagation()
                  handleMarkerPress(stop)
                }}
              >
                {Platform.OS === 'ios' && (
                  <View
                    style={{
                      height:
                        getMapPinSize(getZoomLevel(region)) +
                        (getZoomLevel(region) === ZoomLevel.lg ? 6 : 0),
                    }}
                  >
                    {getIosIcon(
                      chosenPlatform ? stop.id === chosenPlatform?.id : true
                    )}
                    {stop.platform && getZoomLevel(region) === ZoomLevel.lg && (
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
                  getZoomLevel(region) === ZoomLevel.lg &&
                  Platform.OS === 'android' && (
                    <View style={markerLabelStyles.container}>
                      <Text style={markerLabelStyles.label}>
                        {stop.platform}
                      </Text>
                    </View>
                  )}
              </Marker>
            ))}
        </MapView>
      </View>
      <View style={styles.searchContainer}>
        <View style={[styles.inputWrapper, { zIndex: 2 }]}>
          <SearchSvg
            width={20}
            height={20}
            fill={colors.mediumGray}
            style={styles.searchIcon}
          />
          <AutocompleteDropdown
            direction={Platform.select({ ios: 'down' })}
            dataSet={suggestions}
            onSelectItem={(item) => {
              item &&
                setChosenStop(uniqueStops.find((stop) => item.id === stop.id))
            }}
            onChangeText={(text) => {
              if (text.length > 1)
                setSuggestions(
                  uniqueStops.filter((stop) =>
                    stop.title
                      .normalize('NFD')
                      .replace(/[\u0300-\u036f]/g, '')
                      .toLowerCase()
                      .includes(
                        text
                          .normalize('NFD')
                          .replace(/[\u0300-\u036f]/g, '')
                          .toLowerCase()
                      )
                  )
                )
              else {
                setSuggestions([])
              }
            }}
            useFilter={false} // set false to prevent rerender twice
            textInputProps={{
              placeholder: i18n.t('screens.FromToScreen.SearchMhd.stopName'),
              autoCorrect: false,
              autoCapitalize: 'none',
              style: autocompleteStyles.textInput,
            }}
            rightButtonsContainerStyle={autocompleteStyles.rightButtonContainer}
            inputContainerStyle={autocompleteStyles.inputContainer}
            suggestionsListContainerStyle={{
              backgroundColor: colors.white,
            }}
            containerStyle={autocompleteStyles.container}
            renderItem={(item) => (
              <View style={{ padding: 15, flexDirection: 'row' }}>
                <MhdStopSvg
                  width={16}
                  height={16}
                  fill={colors.mediumGray}
                  style={{ marginRight: 10 }}
                />
                <Text>{item.title}</Text>
              </View>
            )}
            clearOnFocus
            onFocus={() => setSuggestions([])}
            inputHeight={50}
            showChevron={false}
            closeOnBlur={false}
            EmptyResultComponent={<View />}
          />
        </View>
        {stopPlatforms && (
          <>
            {stopStatuses.isLoading && (
              <LoadingView
                stylesOuter={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  zIndex: 2,
                }}
                iconWidth={80}
                iconHeight={80}
              />
            )}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 20,
                paddingTop: 5,
                paddingBottom: MAP_HEIGHT + 20,
              }}
              style={{}}
            >
              {renderPlatforms()}
            </ScrollView>
          </>
        )}
      </View>
      {chosenPlatform && (
        <BottomSheet
          snapPoints={['50%', '95%']}
          handleIndicatorStyle={s.handleStyle}
          index={0}
          enablePanDownToClose
          onClose={() => handleBottomSheetClose()}
          ref={bottomSheetRef}
        >
          <StationMhdInfo station={chosenPlatform} />
        </BottomSheet>
      )}
      {chosenPlatform && (
        <View style={styles.backButtonContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackButtonPress}
          >
            <ArrowRightSvg
              width={20}
              height={20}
              fill={colors.primary}
              style={{ transform: [{ rotate: '180deg' }] }}
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    height: '100%',
  },
  mapWrapper: {},
  searchContainer: {
    backgroundColor: colors.white,
    height: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    padding: 20,
  },
  searchIcon: {
    position: 'absolute',
    zIndex: 2,
    top: 38,
    left: 40,
  },
  backButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    backgroundColor: colors.white,
    width: 50,
    height: 50,
    elevation: 7,
    ...s.shadow,
  },
  backButtonContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
})

const autocompleteStyles = StyleSheet.create({
  textInput: {
    backgroundColor: colors.white,
    borderRadius: 30,
    letterSpacing: 0.5,
    color: colors.black,
    paddingHorizontal: 15,
    paddingLeft: 36,
    ...s.fontNormal,
  },
  rightButtonContainer: {
    right: 8,
    height: 30,
    alignSelf: 'center',
  },
  inputContainer: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderRadius: 30,
    borderColor: colors.mediumGray,
    paddingHorizontal: 18,
  },
  container: { flexGrow: 1, flexShrink: 1 },
})

export default SearchMhd
