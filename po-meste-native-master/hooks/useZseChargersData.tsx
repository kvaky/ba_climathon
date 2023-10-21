import { useMemo, useState } from 'react'
import { useQuery } from 'react-query'

import AsyncStorage from '@react-native-async-storage/async-storage'
import { useNetInfo } from '@react-native-community/netinfo'
import { getCachedStops } from '@utils/utils'
import { getChargersStops } from '../utils/api'
import { apiZseChargers } from '../utils/validation'

export default function useZseChargersData() {
  const netInfo = useNetInfo()
  const [validationErrors, setValidationErrors] = useState()
  const { data, isLoading, error, refetch } = useQuery(
    'getChargersStops',
    getChargersStops,
    { enabled: netInfo.isConnected ?? false }
  )
  const { data: cachedData } = useQuery('getCachedChargerStops', () =>
    getCachedStops('chargerStops')
  )

  const validatedZseChargers = useMemo(() => {
    if (data == null) return cachedData
    try {
      const chargerStops = apiZseChargers.validateSync(data)
      AsyncStorage.setItem('chargerStops', JSON.stringify(chargerStops))
      return chargerStops
    } catch (e: any) {
      setValidationErrors(e.errors)
      console.log(e)
    }
  }, [data, cachedData])

  return {
    data: validatedZseChargers?.localities,
    isLoading,
    errors: error || validationErrors,
    refetch: () => (netInfo.isConnected ? refetch() : null),
  }
}
