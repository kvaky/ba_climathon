import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useCallback,
  useState,
} from 'react'
import { SvgProps } from 'react-native-svg'

import {
  loadPreferredLanguageFromAsyncStorage,
  savePreferredLanguageToAsyncStorage,
} from '@utils/localization'
import * as ExpoLocalization from 'expo-localization'
import i18n from 'i18n-js'

import { PreferredLanguage, VehicleType } from '@types'

import { useLocationWithPermision } from '@hooks/miscHooks'
import useBoltData from '@hooks/useBoltData'
import useMhdData from '@hooks/useMhdStopsData'
import BicyclesChosen from '@icons/map-filters/bicycles-filter-chosen.svg'
import BicyclesUnchosen from '@icons/map-filters/bicycles-filter-unchosen.svg'
import CarsChosen from '@icons/map-filters/cars-filter-chosen.svg'
import CarsSoon from '@icons/map-filters/cars-filter-soon.svg'
import CarsUnchosen from '@icons/map-filters/cars-filter-unchosen.svg'
import ChargersChosen from '@icons/map-filters/chargers-filter-chosen.svg'
import ChargersUnchosen from '@icons/map-filters/chargers-filter-unchosen.svg'
import MhdChosenSvg from '@icons/map-filters/mhd-filter-chosen.svg'
import MhdUnchosenSvg from '@icons/map-filters/mhd-filter-unchosen.svg'
import MotorScooterChosen from '@icons/map-filters/motor-scooters-filter-chosen.svg'
import MotorScooterSoon from '@icons/map-filters/motor-scooters-filter-soon.svg'
import MotorScooterUnchosen from '@icons/map-filters/motor-scooters-filter-unchosen.svg'
import ScooterChosen from '@icons/map-filters/scooters-filter-chosen.svg'
import ScooterUnchosen from '@icons/map-filters/scooters-filter-unchosen.svg'
import { NetInfoState, useNetInfo } from '@react-native-community/netinfo'
import { ApiFreeBikeStatusScooter, ApiMhdStops } from '@utils/validation'
import { LocationObject } from 'expo-location'
import { QueryObserverResult } from 'react-query'

interface Props {
  children: React.ReactNode
}

interface ContextProps {
  preferredLanguage: PreferredLanguage
  changePreferredLanguage: (lang: PreferredLanguage) => void
  vehicleTypes: VehicleProps[]
  setVehicleTypes: Dispatch<SetStateAction<VehicleProps[]>>
  timeLineNumber?: string
  setTimeLineNumber: React.Dispatch<React.SetStateAction<string | undefined>>
  isFeedbackSent: boolean
  setFeedbackSent: Dispatch<SetStateAction<boolean>>
  getLocationWithPermission: (
    shouldAlert: boolean,
    reask?: boolean
  ) => Promise<LocationObject | null | undefined>
  location: LocationObject | undefined
  mhdStopsData: {
    data: ApiMhdStops
    isLoading: boolean
    errors: unknown
    refetch: () => Promise<QueryObserverResult<ApiMhdStops, unknown>> | null
  }
  boltData: {
    data?: ApiFreeBikeStatusScooter['data']
    isLoading: boolean
    errors: unknown
    refetch: () => Promise<
      QueryObserverResult<ApiFreeBikeStatusScooter, unknown>
    > | null
  }
  netInfo: NetInfoState
}

export interface VehicleProps {
  id: string
  show: boolean
  icon: (show: boolean) => React.FC<SvgProps>
  soonIcon?: React.FC<SvgProps>
}

export const GlobalStateContext = createContext({} as ContextProps)

export default function GlobalStateProvider({ children }: Props) {
  const [preferredLanguage, setPreferredLanguage] = useState<PreferredLanguage>(
    PreferredLanguage.auto
  )

  loadPreferredLanguageFromAsyncStorage().then((langugage) => {
    changePreferredLanguage(langugage)
  })

  const changePreferredLanguage = useCallback(
    (language: PreferredLanguage) => {
      savePreferredLanguageToAsyncStorage(language)
      setPreferredLanguage(language)
      i18n.locale =
        language == PreferredLanguage.auto
          ? ExpoLocalization.locale?.split('-')[0]
          : language
    },
    [setPreferredLanguage]
  )

  const { getLocationWithPermission, location } = useLocationWithPermision()

  const [timeLineNumber, setTimeLineNumber] = useState<string>()

  const [vehicleTypes, setVehicleTypes] = useState<VehicleProps[]>([
    {
      id: VehicleType.mhd,
      show: true,
      icon: (show) => (show ? MhdChosenSvg : MhdUnchosenSvg),
    },
    {
      id: VehicleType.bicycle,
      show: true,
      icon: (show) => (show ? BicyclesChosen : BicyclesUnchosen),
    },
    {
      id: VehicleType.scooter,
      show: true,
      icon: (show) => (show ? ScooterChosen : ScooterUnchosen),
    },
    {
      id: VehicleType.chargers,
      show: true,
      icon: (show) => (show ? ChargersChosen : ChargersUnchosen),
    },
    {
      id: VehicleType.motorScooters,
      show: true,
      icon: (show) => (show ? MotorScooterChosen : MotorScooterUnchosen),
      soonIcon: MotorScooterSoon,
    },
    {
      id: VehicleType.cars,
      show: true,
      icon: (show) => (show ? CarsChosen : CarsUnchosen),
      soonIcon: CarsSoon,
    },
  ])

  const [isFeedbackSent, setFeedbackSent] = useState(false)

  const mhdStopsData = useMhdData()

  const boltData = useBoltData()

  const netInfo = useNetInfo()

  return (
    <GlobalStateContext.Provider
      value={{
        preferredLanguage,
        changePreferredLanguage,
        vehicleTypes,
        setVehicleTypes,
        timeLineNumber,
        setTimeLineNumber,
        isFeedbackSent,
        setFeedbackSent,
        getLocationWithPermission,
        location,
        mhdStopsData,
        boltData,
        netInfo,
      }}
    >
      {children}
    </GlobalStateContext.Provider>
  )
}
