import { useNetInfo } from '@react-native-community/netinfo'
import { getBoltFreeBikeStatus } from '@utils/api'
import { useMemo, useState } from 'react'
import { useQuery } from 'react-query'
import { apiFreeBikeStatusScooter } from '../utils/validation'
import JSONH from '../vendor/jsonh/jsonh'

export default function useBoltData() {
  const netInfo = useNetInfo()
  const [validationErrors, setValidationErrors] = useState()
  const { data, isLoading, error, refetch } = useQuery(
    'getBoltFreeBikeStatus',
    getBoltFreeBikeStatus,
    { enabled: netInfo.isConnected ?? false }
  )

  const validatedBolt = useMemo(() => {
    if (data) {
      try {
        const validatedStationInformation =
          apiFreeBikeStatusScooter.validateSync({
            data: {
              rental_uris: data.data.rental_uris,
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
    data: validatedBolt,
    isLoading: isLoading,
    errors: error || validationErrors,
    refetch: () => (netInfo.isConnected ? refetch() : null),
  }
}
