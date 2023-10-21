import ChevronRightIconSVG from '@icons/chevron-right-small.svg'
import { GlobalStateContext } from '@state/GlobalStateProvider'
import {
  ChargersProvider,
  MicromobilityProvider,
  MobilityProvider,
} from '@types'
import { getColor, getTextColor } from '@utils/utils'
import {
  FreeBikeStatusProps,
  StationMicromobilityProps,
} from '@utils/validation'
import i18n from 'i18n-js'
import React, { useContext } from 'react'
import { Platform } from 'react-native'
import AppLink from 'react-native-app-link'
import Button from './Button'

interface ProviderButtonProps {
  provider: MobilityProvider
  station?: StationMicromobilityProps | FreeBikeStatusProps
}

const ProviderButton = ({ provider, station }: ProviderButtonProps) => {
  const buttonTitle =
    provider === MicromobilityProvider.rekola
      ? 'Rekola'
      : provider === MicromobilityProvider.slovnaftbajk
      ? 'Bajk'
      : provider === MicromobilityProvider.tier
      ? 'Tier'
      : provider === MicromobilityProvider.bolt
      ? 'Bolt'
      : provider === ChargersProvider.zse
      ? 'Bolt'
      : ''

  const { boltData } = useContext(GlobalStateContext)

  return (
    <Button
      contentStyle={{ backgroundColor: getColor(provider) }}
      titleStyle={[{ color: getTextColor(provider) }, { fontWeight: 'bold' }]}
      onPress={() => {
        switch (provider) {
          case MicromobilityProvider.rekola:
            AppLink.openInStore({
              appName: 'Rekola',
              appStoreId: 888759232,
              appStoreLocale: 'sk',
              playStoreId: 'cz.rekola.app',
            })
              .then()
              .catch()
            break
          case MicromobilityProvider.slovnaftbajk:
            AppLink.openInStore({
              appName: 'slovnaftbajk',
              appStoreId: 1364531772,
              appStoreLocale: 'sk',
              playStoreId: 'hu.cycleme.slovnaftbajk',
            })
              .then()
              .catch()
            break
          case MicromobilityProvider.tier:
            AppLink.openInStore({
              appName: 'tier',
              appStoreId: 1436140272,
              appStoreLocale: 'sk',
              playStoreId: 'com.tier.app',
            })
              .then()
              .catch()
            break
          case MicromobilityProvider.bolt:
            AppLink.maybeOpenURL(
              Platform.select({
                android: boltData.data?.rental_uris?.android.replace(
                  '{{id}}',
                  station?.bike_id ?? ''
                ),
                ios: boltData.data?.rental_uris?.ios.replace(
                  '{{id}}',
                  station?.bike_id ?? ''
                ),
              }) ?? '',
              {
                appName: 'bolt',
                appStoreId: 675033630,
                appStoreLocale: 'sk',
                playStoreId: 'ee.mtakso.client',
              }
            )
            break
          case ChargersProvider.zse:
            AppLink.openInStore({
              appName: 'zse-drive',
              appStoreId: 1180905521,
              appStoreLocale: 'sk',
              playStoreId: 'sk.zse.drive',
            })
              .then()
              .catch()
            break
        }
      }}
      size="small"
      title={
        provider === ChargersProvider.zse
          ? i18n.t('screens.MapScreen.startZseCharger')
          : i18n.t('screens.MapScreen.rent', {
              provider: buttonTitle,
            })
      }
      icon={
        <ChevronRightIconSVG
          height={14}
          width={14}
          fill={getTextColor(provider)}
          style={{ marginLeft: 14 }}
        />
      }
      iconRight
      style={{ minWidth: 164 }}
    />
  )
}

export default ProviderButton
