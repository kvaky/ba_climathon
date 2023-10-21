import { useMemo, useState } from 'react'
import { useQuery } from 'react-query'

import { useNetInfo } from '@react-native-community/netinfo'
import { getCachedStops, getLatestDataset, setCachedStops } from '@utils/utils'
import { getHealth, getMhdStops } from '../utils/api'
import { apiMhdStops } from '../utils/validation'

/**
 * A hook that provides **mhdStops** with caching, it works in the following way:
 * - if there is no connection to the internet, the cached data is returned
 * - checks the `/health` endpoint for `latestDataset` number and if it matches the cached one, returns the cached data
 * - if this does not match, fetches the **mhdStops** from the server
 */
export default function useMhdData() {
  const netInfo = useNetInfo()
  const isConnected = netInfo.isConnected ?? false
  const [validationErrors, setValidationErrors] = useState()
  const [hasFetched, setHasFetched] = useState(false)
  const { data: cachedData } = useQuery('getCachedMhdStops', () =>
    getCachedStops('mhdStops')
  )
  const { data: healthData, error: healthError } = useQuery(
    'getHealth',
    getHealth,
    {
      enabled: isConnected,
    }
  )
  const { data: latestDatasetData } = useQuery(
    'getLastDataSet',
    getLatestDataset
  )
  const { data, isLoading, error, refetch } = useQuery(
    ['getMhdStops', healthData, latestDatasetData, healthError],
    getMhdStops,
    {
      enabled:
        isConnected &&
        !hasFetched &&
        ((healthData != undefined &&
          latestDatasetData !== undefined &&
          healthData?.latestDataset !== latestDatasetData) ||
          healthError != null),
    }
  )

  const validatedMhdStops = useMemo(() => {
    if (data == undefined) return cachedData
    try {
      setHasFetched(true)
      const mhdStops = {
        stops: apiMhdStops
          .validateSync(data)
          .stops?.filter((stop) => !!stop.platform),
      }
      setCachedStops('mhdStops', mhdStops, healthData?.latestDataset)
      return mhdStops
    } catch (e: any) {
      setValidationErrors(e.errors)
      console.log(e)
    }
  }, [data, cachedData, healthData, latestDatasetData])

  return {
    data: validatedMhdStops,
    isLoading,
    errors: error || validationErrors,
    refetch: () => (isConnected ? refetch() : null),
  }
}
