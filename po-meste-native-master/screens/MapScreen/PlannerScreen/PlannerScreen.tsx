import BottomSheet from '@gorhom/bottom-sheet'
import { StackScreenProps } from '@react-navigation/stack'
import googlePolyline from 'google-polyline'
import React, { useMemo, useRef, useState } from 'react'
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native'
import MapView, { Marker, Polyline } from 'react-native-maps'

import {
  BOTTOM_TAB_NAVIGATOR_HEIGHT,
  BOTTOM_VEHICLE_BAR_HEIGHT_ALL,
} from '@components'
import { LegModes, MapParamList } from '@types'
import {
  aggregateBicycleLegs,
  colors,
  getColor,
  getHeaderBgColor,
  getProviderFromStationId,
  hexToRgba,
  mapStyles,
  modeColors,
} from '@utils'

import { TextItinerary } from './_partials/TextItinerary'

import CurrentLocationButton from '@components/CurrentLocationButton'
import CircleIcon from '@icons/map/circle.svg'
import MapPinIcon from '@icons/map/pin.svg'

/* eslint-disable @typescript-eslint/no-var-requires */
const circleLarge = require('@icons/map/circle.png')
const circleSmall = require('@icons/map/circle.png')
/* eslint-enable @typescript-eslint/no-var-requires */

export default function PlannerScreen({
  route,
}: StackScreenProps<MapParamList, 'PlannerScreen'>) {
  const mapRef = useRef<MapView | null>(null)
  const [sheetIndex, setSheetIndex] = useState(1)
  const { provider, legs, isScooter, travelMode, toPlace, fromPlace, price } =
    route.params
  const bottomSheetSnapPoints = [
    BOTTOM_VEHICLE_BAR_HEIGHT_ALL + 30,
    '60%',
    '95%',
  ]
  const { height } = useWindowDimensions()
  // keep this in sync with the middle bottomSheetSnapPoint percentage
  const middleSnapPointMapPadding = 0.5 * (height - BOTTOM_TAB_NAVIGATOR_HEIGHT) // TODO add top bar to the equation instead of rounding down to 0.5
  const bottomMapPaddingForSheeptSnapPoints = [
    BOTTOM_VEHICLE_BAR_HEIGHT_ALL + 30,
    middleSnapPointMapPadding,
    middleSnapPointMapPadding,
  ]

  const allMarkers = useMemo(
    () =>
      legs?.flatMap((leg) => {
        if (leg.legGeometry.points) {
          const latLngs = googlePolyline.decode(leg.legGeometry.points)
          return latLngs.map((point) => ({
            latitude: point[0],
            longitude: point[1],
          }))
        }
        return []
      }),
    [legs]
  )

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        {...mapStyles}
        onLayout={() => mapRef.current?.fitToCoordinates(allMarkers)}
        showsUserLocation
        showsMyLocationButton={false}
        mapPadding={{
          // this tells it not to render anything interesting under the bottom sheet
          // needs finetuning but as a quick hack does the job
          bottom: bottomMapPaddingForSheeptSnapPoints[sheetIndex],
          top: 0,
          right: 0,
          left: 0,
        }}
      >
        <Marker
          coordinate={allMarkers[0]}
          icon={Platform.OS === 'ios' ? circleSmall : circleLarge}
        >
          {Platform.OS === 'ios' && <CircleIcon width={10} height={10} />}
        </Marker>
        {legs?.reduce<JSX.Element[]>((accumulator, leg, index) => {
          if (leg.legGeometry.points) {
            const latlngs = googlePolyline.decode(leg.legGeometry.points)
            const color = hexToRgba(
              Platform.OS === 'ios' &&
                (leg.mode === LegModes.bus ||
                  leg.mode === LegModes.tram ||
                  leg.mode === LegModes.trolleybus) &&
                leg.routeColor === '898989'
                ? colors.primary
                : leg.rentedBike
                ? getColor(
                    provider ?? getProviderFromStationId(leg.from.bikeShareId)
                  )
                : leg.routeColor
                ? `#${leg.routeColor}`
                : modeColors[leg.mode || 'DEFAULT'],
              Platform.OS === 'ios' ? 0.8 : 0.6
            )
            const marker = (
              <Polyline
                key={index}
                coordinates={latlngs.map((point) => ({
                  latitude: point[0],
                  longitude: point[1],
                }))}
                lineDashPattern={
                  leg.mode === LegModes.walk ? [10, 5] : undefined
                }
                strokeColor={color}
                strokeWidth={3}
              />
            )
            return accumulator.concat(marker)
          }
          return accumulator
        }, [])}
        <Marker
          coordinate={allMarkers[allMarkers.length - 1]}
          icon={require('@icons/map/pin.png')}
        >
          {Platform.OS === 'ios' && <MapPinIcon width={16} height={16} />}
        </Marker>
      </MapView>
      {Platform.select({ ios: true, android: true }) && (
        <CurrentLocationButton mapRef={mapRef} style={styles.currentLocation} />
      )}
      <BottomSheet
        index={1}
        snapPoints={bottomSheetSnapPoints}
        onChange={setSheetIndex}
        handleIndicatorStyle={{
          backgroundColor: 'rgba(69, 69, 69, 0.3)',
          width: 66,
          height: 4,
          marginTop: 4,
        }}
        handleStyle={{
          paddingTop: 14,
          paddingBottom: 10,
        }}
        backgroundStyle={{
          backgroundColor: getHeaderBgColor(travelMode, provider),
        }}
      >
        <TextItinerary
          legs={aggregateBicycleLegs(legs)}
          provider={provider}
          isScooter={isScooter}
          travelMode={travelMode}
          fromPlace={fromPlace}
          toPlace={toPlace}
          price={price}
        />
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
    bottom: 0,
  },
  currentLocation: {
    position: 'absolute',
    top: 10,
    right: 20,
  },
})
