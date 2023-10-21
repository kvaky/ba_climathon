import CurrentLocationSvg from '@icons/current-location.svg'
import { GlobalStateContext } from '@state/GlobalStateProvider'
import { s } from '@utils/globalStyles'
import { colors } from '@utils/theme'
import { LocationObject } from 'expo-location'
import React, { RefObject, useCallback, useContext } from 'react'
import {
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native'
import MapView from 'react-native-maps'

interface CurrentLocationButtonProps {
  mapRef: RefObject<MapView>
  style?: StyleProp<ViewStyle>
}

const moveMapToCurrentLocationAsync = async (
  mapRef: RefObject<MapView>,
  location?: LocationObject,
  permisionDeniedCallback?: () => Promise<LocationObject | undefined | null>
) => {
  let hasFetchedLocation = false,
    currentLocation
  if (location) {
    currentLocation = location
  } else if (permisionDeniedCallback) {
    currentLocation = await permisionDeniedCallback()
    hasFetchedLocation = true
  }
  if (currentLocation) {
    mapRef.current?.animateCamera({
      center: currentLocation.coords,
      zoom: 17,
      // TODO altitude needs to be set for Apple maps
      // https://github.com/react-native-maps/react-native-maps/blob/master/docs/mapview.md#types part camera
      altitude: undefined,
    })
  } //for when the user quickly walks and the location has to be refreshed
  if (!hasFetchedLocation && permisionDeniedCallback) {
    permisionDeniedCallback()
  }
}

const CurrentLocationButton = ({
  mapRef,
  style,
}: CurrentLocationButtonProps) => {
  const { getLocationWithPermission, location } = useContext(GlobalStateContext)

  const moveMapToCurrentLocation = useCallback(
    async (
      location?: LocationObject,
      permisionDeniedCallback?: () => Promise<LocationObject | undefined | null>
    ) =>
      moveMapToCurrentLocationAsync(mapRef, location, permisionDeniedCallback),
    []
  )

  return (
    <View style={[styles.currentLocation, style]}>
      <TouchableOpacity
        onPress={() =>
          moveMapToCurrentLocation(location, () =>
            getLocationWithPermission(true, true)
          )
        }
      >
        <CurrentLocationSvg fill={colors.primary} width={30} height={30} />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  currentLocation: {
    position: 'absolute',
    right: 20,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 25,
    ...s.shadow,
    elevation: 7,
  },
})

export default CurrentLocationButton
