import BoltVehicleIconSvg from '@images/bolt-vehicle-icon.svg'
import RekoloVehicleIconSvg from '@images/rekolo-vehicle-icon.svg'
import SlovnaftbajkVehicleIconSvg from '@images/slovnaftbajk-vehicle-icon.svg'
import TierVehicleIconSvg from '@images/tier-vehicle-icon.svg'
import { MicromobilityProvider } from '@types'
import React from 'react'

export const getMicromobilityImage = (
  provider: MicromobilityProvider,
  height?: number,
  width?: number
) => {
  switch (provider) {
    case MicromobilityProvider.rekola:
      return <RekoloVehicleIconSvg height={height ?? 91} width={width ?? 140} />
    case MicromobilityProvider.slovnaftbajk:
      return (
        <SlovnaftbajkVehicleIconSvg
          height={height ?? 126.8}
          width={width ?? 140}
        />
      )
    case MicromobilityProvider.tier:
      return <TierVehicleIconSvg height={height ?? 122} width={width ?? 140} />
    case MicromobilityProvider.bolt:
      return <BoltVehicleIconSvg height={height ?? 118} width={width ?? 136} />
    default:
      return undefined
  }
}
