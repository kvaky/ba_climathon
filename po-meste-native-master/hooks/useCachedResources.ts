import { Ionicons } from '@expo/vector-icons'
import * as Font from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import * as React from 'react'
import { Platform } from 'react-native'

export default function useCachedResources() {
  const [isLoadingComplete, setLoadingComplete] = React.useState(false)

  // Load any resources or data that we need prior to rendering the app
  React.useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        SplashScreen.preventAutoHideAsync()

        // Load fonts
        await Font.loadAsync({
          ...Ionicons.font,
          'space-mono': require('@fonts/SpaceMono-Regular.ttf'),
          'work-sans': require('@fonts/WorkSans-Regular.ttf'),
          'work-sans-bold': require('@fonts/WorkSans-Bold.ttf'),
          'work-sans-medium': require('@fonts/WorkSans-Medium.ttf'),
        })
      } catch (e) {
        // We might want to provide this error information to an error reporting service
        console.warn(e)
      } finally {
        if (Platform.OS === 'ios') SplashScreen.hideAsync()
        setLoadingComplete(true)
      }
    }

    loadResourcesAndDataAsync()
  }, [])

  return isLoadingComplete
}
