import {
  getSlovnaftbajkStationInformation,
  getSlovnaftbajkStationStatus,
} from '../utils/api'

import useStationData from './useStationsData'

export default function useSlovnaftbajkData() {
  return useStationData({
    stationInformationQueryKey: 'getSlovnaftbajkStationInformation',
    getStationInformation: getSlovnaftbajkStationInformation,
    stationStatusQueryKey: 'getSlovnaftbajkStationStatus',
    getStationStatus: getSlovnaftbajkStationStatus,
  })
}
