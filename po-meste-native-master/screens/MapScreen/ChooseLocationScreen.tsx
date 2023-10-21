import Text from '@components/Text'
import { useNavigation } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import i18n from 'i18n-js'
import React, { useEffect, useRef, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import MapView, { Region } from 'react-native-maps'

import { Button } from '@components'
import { MapParamList } from '@types'
import { colors, googlePlacesReverseGeocode, mapStyles, s } from '@utils'

import MarkerSvg from '@icons/map-pin-marker.svg'

const REVERSE_GEOCODING_DEBOUNCE = 200 //ms

export default function ChooseLocation({
  route,
}: StackScreenProps<MapParamList, 'ChooseLocationScreen'>) {
  const fromNavigation = route?.params?.fromNavigation
  const toNavigation = route?.params?.toNavigation
  const fromCoordsName = route?.params?.fromCoordsName
  const toCoordsName = route?.params?.toCoordsName

  const navigation = useNavigation()

  const ref = useRef<MapView>(null)
  const [region, setRegion] = useState<Region>()
  const [placeName, setPlaceName] = useState('')
  const [debounceTimeout, setDebouceTimeout] = useState<NodeJS.Timeout>()

  useEffect(() => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout)
    }
    setDebouceTimeout(
      setTimeout(() => {
        if (region) {
          googlePlacesReverseGeocode(
            region.latitude,
            region.longitude,
            (results) => {
              if (results.length === 0) {
                setPlaceName(
                  `${region.latitude.toFixed(5)},${region.latitude.toFixed(5)}`
                )
              }
              const bestResult = results[0]
              setPlaceName(
                `${bestResult.formatted_address.slice(
                  0,
                  bestResult.formatted_address.indexOf(',')
                )}`
              )
            }
          )
        }
      }, REVERSE_GEOCODING_DEBOUNCE)
    )
    return () => {
      if (debounceTimeout) clearTimeout(debounceTimeout)
    }
  }, [region])

  return (
    <View style={styles.container}>
      <View style={styles.mapWrapper}>
        <MapView
          ref={ref}
          style={styles.map}
          {...mapStyles}
          initialRegion={
            (route?.params?.latitude &&
              route?.params?.longitude && {
                latitude: route?.params?.latitude,
                longitude: route?.params?.longitude,
                latitudeDelta: 0.0461,
                longitudeDelta: 0.02105,
              }) ||
            mapStyles.initialRegion
          }
          onRegionChange={(region) => {
            setRegion(region)
          }}
        />
        <View style={styles.markerWrapper} pointerEvents="none">
          <MarkerSvg fill={colors.primary} width={32} height={32} />
        </View>
      </View>
      <View style={styles.sheet}>
        <Text>
          {i18n.t(
            'screens.ChooseLocationScreen.moveTheMapAndSelectTheDesiredPoint'
          )}
        </Text>
        <View style={styles.addressWrapper}>
          <MarkerSvg fill={colors.black} width={20} height={20} />
          <Text style={styles.addressText}>{placeName}</Text>
        </View>
        <Button
          style={styles.confirm}
          title={i18n.t('screens.ChooseLocationScreen.confirmLocation')}
          onPress={() => {
            const naviagtionInstructions = {
              latitude: region?.latitude,
              longitude: region?.longitude,
              name: placeName,
            }
            navigation.navigate(
              'FromToScreen' as never,
              {
                from: fromNavigation ? naviagtionInstructions : fromCoordsName,
                to: toNavigation ? naviagtionInstructions : toCoordsName,
              } as never
            )
          }}
        ></Button>
      </View>
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
  markerWrapper: {
    display: 'flex',
    position: 'absolute',
    marginTop: '50%',
    marginLeft: '50%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheet: {
    ...s.shadow,
    flex: 1,
    backgroundColor: colors.white,
    marginTop: -7,
    width: '100%',
    display: 'flex',
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 80,
    alignItems: 'center',
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
  },
  addressWrapper: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    marginVertical: 20,
  },
  addressText: {
    marginLeft: 5,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  confirm: {},
  mapWrapper: {
    position: 'relative',
    display: 'flex',
    width: '100%',
    flex: 2,
    backgroundColor: 'yellow',
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
})
