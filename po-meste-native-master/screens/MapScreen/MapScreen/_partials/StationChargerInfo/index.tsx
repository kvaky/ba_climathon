import Text from '@components/Text'
import { BottomSheetScrollView } from '@gorhom/bottom-sheet'
import i18n from 'i18n-js'
import React from 'react'
import { StyleSheet, View } from 'react-native'

import { BOTTOM_VEHICLE_BAR_HEIGHT_ALL } from '@components'
import { colors, ConnectorProps, s } from '@utils'
import ConnectorMiniature from './_partials/ConnectorMiniature'

import ProviderButton from '@components/ProviderButton'
import ClockSvg from '@icons/clock.svg'
import MapPinSvg from '@icons/map-pin-marker.svg'
import CarSvg from '@icons/vehicles/car.svg'
import ChargerSvg from '@images/charger.svg'
import { ChargersProvider } from '@types'
import InfoRow from '../InforRow'

interface StationChargerInfoProps {
  name?: string
  openingTimes?: string | null
  numberOfParkingSpaces?: number | null
  connectors?: ConnectorProps[]
}

const StationChargerInfo = ({
  name,
  openingTimes,
  numberOfParkingSpaces,
  connectors,
}: StationChargerInfoProps) => {
  return (
    <BottomSheetScrollView
      contentContainerStyle={[
        styles.backgroundColorGrey,
        styles.contentWrapper,
      ]}
    >
      <View style={styles.backgroundColorWhite}>
        <View style={[styles.header, s.horizontalMargin]}>
          <Text>{i18n.t('screens.MapScreen.zseChargerTitle')}</Text>
          <Text style={[s.boldText, styles.fontBiggest]}>{name}</Text>
        </View>
      </View>
      <View style={styles.backgroundColorWhite}>
        <View
          style={[
            s.horizontalMargin,
            styles.additionalInfoWrapper,
            styles.backgroundColorWhite,
          ]}
        >
          <View style={styles.vehicleImage}>
            <ChargerSvg height={150} />
          </View>
          <View style={styles.additionalText}>
            <View>
              {name != null && (
                <InfoRow
                  value={name}
                  Icon={MapPinSvg}
                  title={i18n.t('screens.MapScreen.location')}
                />
              )}
              {openingTimes != null && (
                <InfoRow
                  value={openingTimes}
                  Icon={ClockSvg}
                  title={i18n.t('screens.MapScreen.openingHours')}
                />
              )}
              {numberOfParkingSpaces != null && (
                <InfoRow
                  value={numberOfParkingSpaces}
                  Icon={CarSvg}
                  title={i18n.t('screens.MapScreen.parkingSpaces', {
                    amount: numberOfParkingSpaces,
                  })}
                />
              )}
            </View>
            <View>
              <ProviderButton provider={ChargersProvider.zse} />
            </View>
          </View>
        </View>
      </View>
      <View>
        <View style={s.horizontalMargin}>
          <Text style={[s.boldText, styles.fontBigger, styles.connectorsTitle]}>
            {i18n.t('screens.MapScreen.chargingPoints')}
          </Text>
          {connectors?.map((connector, index) => {
            //TODO Bug? At each station, 2 connectors have the same id, cannot be used as a `key`
            const { id, status, type, pricing } = connector
            return (
              <ConnectorMiniature
                key={index}
                status={status}
                type={type}
                chargingPrice={
                  pricing.charging_price ? pricing.charging_price : undefined
                }
                freeParkingTime={
                  pricing.free_parking_time
                    ? pricing.free_parking_time
                    : undefined
                }
                parkingPrice={pricing.parking_price}
              />
            )
          })}
        </View>
      </View>
    </BottomSheetScrollView>
  )
}

const styles = StyleSheet.create({
  header: {
    marginTop: 10,
    marginBottom: 30,
  },
  fontBiggest: {
    fontSize: 22,
  },
  fontBigger: {
    fontSize: 18,
  },
  connectorsTitle: {
    marginVertical: 15,
  },
  additionalInfoWrapper: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 20,
  },
  vehicleImage: {
    width: 150,
  },
  additionalText: {
    flex: 1,
    display: 'flex',
    justifyContent: 'space-between',
  },
  backgroundColorGrey: {
    backgroundColor: colors.lightLightGray,
  },
  contentWrapper: {
    paddingBottom: BOTTOM_VEHICLE_BAR_HEIGHT_ALL,
  },
  backgroundColorWhite: {
    backgroundColor: 'white',
  },
})

export default StationChargerInfo
