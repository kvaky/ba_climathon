import { useNetInfo } from '@react-native-community/netinfo'
import * as Sentry from '@sentry/react-native'
import { getHealth } from '@utils/api'
import * as Location from 'expo-location'
import i18n from 'i18n-js'
import { useCallback, useEffect, useState } from 'react'
import {
  Alert,
  AlertButton,
  AlertOptions,
  Linking,
  Platform,
} from 'react-native'
import { useQuery } from 'react-query'

export const nativeAlert = (
  message?: string | false,
  buttons?: AlertButton[] | undefined,
  options?: AlertOptions | undefined
) => {
  if (message) {
    if (Platform.OS === 'android') {
      Alert.alert('', message, buttons, options)
    } else {
      Alert.alert(message, undefined, buttons, options)
    }
  }
}

export const useLocationWithPermision = () => {
  const [isDenied, setIsDenied] = useState(false)
  const [location, setLocation] = useState<Location.LocationObject>()
  useEffect(() => {
    getLocationWithPermission(false)
  }, [])
  const getLocation = useCallback(
    async (reask = false) => {
      if (isDenied && !reask) return null
      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest,
        })
        setLocation(location)
        return location
      } catch (e: any) {
        const { code } = e
        if (code === 'E_LOCATION_SETTINGS_UNSATISFIED') {
          //TODO Handle denied location permission
          setIsDenied(true)
          console.log('Denied location permission')
        } else {
          Sentry.captureException(e)
        }
        return null
      }
    },
    [isDenied]
  )

  const openAppSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:')
    } else {
      Linking.openSettings()
    }
  }

  const getLocationWithPermission = useCallback(
    async (shouldAlert: boolean, reask = false) => {
      const { status } = await Location.requestForegroundPermissionsAsync()

      if (status !== Location.PermissionStatus.GRANTED) {
        if (shouldAlert) {
          nativeAlert(i18n.t('common.permissionLocation'), [
            {
              text: i18n.t('common.openSettings'),
              onPress: () => openAppSettings(),
            },
            {
              text: i18n.t('common.cancelLocationPermission'),
              onPress: undefined,
            },
          ])
        }
      } else {
        return getLocation(reask)
      }
      return
    },
    [getLocation]
  )
  return { getLocationWithPermission, location }
}

export const useHealthData = () => {
  const netInfo = useNetInfo()
  const isConnected = netInfo.isConnected ?? false
  const { data, error } = useQuery('getHealth', getHealth, {
    enabled: isConnected,
  }) as {
    data?: {
      dependencyResponseStatus: {
        rekola: number
        tier: number
        slovnaftbajk: number
        zse: number
        bolt: number
      }
    }
    error?: any
  }
  if (error && isConnected)
    Sentry.captureException(error, {
      extra: {
        exceptionType: 'health error',
        rawData: JSON.stringify(error),
      },
    })
  return {
    data,
    error,
  }
}
