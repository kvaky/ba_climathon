import { useNetInfo } from '@react-native-community/netinfo'
import { useMemo, useState } from 'react'
import { useQuery } from 'react-query'
import { getTierFreeBikeStatus } from '../utils/api'
import { apiFreeBikeStatusScooter } from '../utils/validation'
import JSONH from '../vendor/jsonh/jsonh'

export default function useTierData() {
  const netInfo = useNetInfo()
  const [validationErrors, setValidationErrors] = useState()
  const { data, isLoading, error, refetch } = useQuery(
    'getTierFreeBikeStatus',
    getTierFreeBikeStatus,
    { enabled: netInfo.isConnected ?? false }
  )

  const validatedTier = useMemo(() => {
    if (data) {
      try {
        const validatedStationInformation =
          apiFreeBikeStatusScooter.validateSync({
            data: {
              bikes: JSONH.unpack(data.data.bikes),
            },
          }).data
        return validatedStationInformation
      } catch (e: any) {
        setValidationErrors(e.errors)
        console.log(e)
      }
    }
  }, [data])

  return {
    data: validatedTier,
    isLoading: isLoading,
    errors: error || validationErrors,
    refetch: () => (netInfo.isConnected ? refetch() : null),
  }
}
