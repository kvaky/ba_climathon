import AsyncStorage from '@react-native-async-storage/async-storage'
import { PreferredLanguage } from '@types'

export const loadPreferredLanguageFromAsyncStorage =
  async (): Promise<PreferredLanguage> => {
    try {
      const value = await AsyncStorage.getItem('preferred-language')
      if (
        value !== null &&
        (value == PreferredLanguage.auto ||
          value == PreferredLanguage.en ||
          value == PreferredLanguage.sk)
      ) {
        return value
      }
    } catch (e) {
      console.error('ERROR: Load preferred language')
      return PreferredLanguage.auto
    }
    return PreferredLanguage.auto
  }

export const savePreferredLanguageToAsyncStorage = async (
  language: PreferredLanguage
) => {
  try {
    await AsyncStorage.setItem('preferred-language', language)
  } catch (e) {
    console.error('ERROR: Save preferred language')
  }
}
