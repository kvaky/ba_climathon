import Text from '@components/Text'
import i18n from 'i18n-js'
import React from 'react'
import { StyleSheet, View } from 'react-native'

import { ChargerStatus, ChargerTypes } from '@types'
import { colors, s } from '@utils'

import CcsSvg from '@icons/ccs.svg'
import ChademoSvg from '@icons/chademo.svg'
import MennekesSvg from '@icons/mennekes.svg'

const PADDING_VERTICAL = 10
type Props = {
  status?: ChargerStatus
  type?: ChargerTypes
  chargingPrice?: string
  freeParkingTime?: string
  parkingPrice?: string
}

const ConnectorMiniature = ({
  status,
  type,
  chargingPrice,
  freeParkingTime,
  parkingPrice,
}: Props) => {
  return (
    <View style={styles.container}>
      <View style={styles.containerInner}>
        <View style={styles.leftContainer}>
          <Text style={[styles.type, s.boldText]}>{type}</Text>
          <View style={styles.chargerInfo}>
            <Text>{i18n.t('screens.MapScreen.chargingPrice')}</Text>
            <Text style={s.boldText}>{chargingPrice}</Text>
          </View>
          <View style={styles.chargerInfo}>
            <Text>{i18n.t('screens.MapScreen.parkingPrice')}</Text>
            <Text style={s.boldText}>{parkingPrice}</Text>
          </View>
          <View style={styles.chargerInfo}>
            <Text>{i18n.t('screens.MapScreen.freeParkingTime')}</Text>
            <Text style={s.boldText}>{freeParkingTime}</Text>
          </View>
        </View>
        <View style={[styles.rightContainer, s.borderBlue]}>
          <View style={styles.rightContainerBackground}></View>
          <View
            style={[
              styles.rightContainerBackgroundAvailability,
              status === ChargerStatus.available
                ? styles.availableConnector
                : styles.notAvailableConnector,
            ]}
          >
            <Text style={s.whiteText}>{status}</Text>
          </View>
          <View style={styles.rightContainerWhiteOverlayBackground}></View>
          {type === ChargerTypes.ccs && <CcsSvg />}
          {type === ChargerTypes.mennekes && <MennekesSvg />}
          {type === ChargerTypes.chademo && <ChademoSvg />}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    shadowColor: '#000',
    shadowRadius: 12,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 8 },
    marginBottom: 10,
  },
  containerInner: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'white',
    elevation: 5,
    paddingVertical: PADDING_VERTICAL,
  },
  leftContainer: {
    flex: 1,
    paddingVertical: 10,
    paddingLeft: 12,
    paddingRight: 25,
  },
  type: {
    fontWeight: '600',
    fontSize: 18,
    marginBottom: 10,
  },
  rightContainer: {
    position: 'relative',
    width: 110,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  rightContainerWhiteOverlayBackground: {
    // TODO better to use triangle, this solution goes outside of element boundaries
    flex: 1,
    width: '22%',
    position: 'absolute',
    top: -100,
    bottom: -100,
    left: '-9%',
    right: 0,
    backgroundColor: 'white',
    transform: [{ rotate: '15deg' }, { scale: 1.5 }],
  },
  rightContainerBackground: {
    flex: 1,
    width: '100%',
    position: 'absolute',
    top: '-100%',
    bottom: -100,
    backgroundColor: colors.lightGray,
  },
  rightContainerBackgroundAvailability: {
    height: '20%',
    width: '100%',
    position: 'absolute',
    alignItems: 'center',
    bottom: -PADDING_VERTICAL - 1,
    left: 0,
  },
  availableConnector: {
    backgroundColor: colors.available,
  },
  notAvailableConnector: {
    backgroundColor: colors.primary,
  },
  chargerInfo: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
})

export default ConnectorMiniature
