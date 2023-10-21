import {
  getRekolaStationInformation,
  getRekolaStationStatus,
} from '../utils/api'

import useStationData from './useStationsData'

export default function useRekolaData() {
  return useStationData({
    stationInformationQueryKey: 'getRekolaStationInformation',
    getStationInformation: getRekolaStationInformation,
    stationStatusQueryKey: 'getRekolaStationStatus',
    getStationStatus: getRekolaStationStatus,
  })
}
