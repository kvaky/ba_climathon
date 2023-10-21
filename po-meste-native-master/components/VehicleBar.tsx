import Text from '@components/Text'
import React, { useContext, useState } from 'react'
import { StyleSheet, View } from 'react-native'

import { GlobalStateContext, VehicleProps } from '@state/GlobalStateProvider'
import { TouchableHighlight } from 'react-native-gesture-handler'
import { SvgProps } from 'react-native-svg'

import {
  useMhdStopsData,
  useRekolaData,
  useSlovnaftbajkData,
  useTierData,
  useZseChargersData,
} from '@hooks'
import useBoltData from '@hooks/useBoltData'
import { VehicleType } from '@types'
import { colors } from '@utils/theme'
import { t } from 'i18n-js'
import * as Progress from 'react-native-progress'

const BOTTOM_VEHICLE_BAR_HEIGHT = 50
const BOTTOM_VEHICLE_BAR_MARGIN_BOTTOM = 10
const BOTTOM_TAB_NAVIGATOR_SPACING = 7.5
const ICON_SIZE = 46

export const BOTTOM_VEHICLE_BAR_HEIGHT_ALL =
  BOTTOM_VEHICLE_BAR_HEIGHT +
  BOTTOM_VEHICLE_BAR_MARGIN_BOTTOM +
  BOTTOM_TAB_NAVIGATOR_SPACING

const VehicleBar = () => {
  const vehiclesContext = useContext(GlobalStateContext)

  const { isLoading: isLoadingMhd } = useMhdStopsData()
  const { isLoading: isLoadingTier } = useTierData()
  const { isLoading: isLoadingZseChargers } = useZseChargersData()
  const { isLoading: isLoadingRekola } = useRekolaData()
  const { isLoading: isLoadingSlovnaftbajk } = useSlovnaftbajkData()
  const { isLoading: isLoadingBolt } = useBoltData()
  return (
    <View style={styles.vehicleBar}>
      {vehiclesContext.vehicleTypes?.map((vehicleType, index) => {
        const { id } = vehicleType
        const isLoading =
          (id === VehicleType.mhd && isLoadingMhd) ||
          (id === VehicleType.bicycle &&
            (isLoadingRekola || isLoadingSlovnaftbajk)) ||
          (id === VehicleType.chargers && isLoadingZseChargers) ||
          (id === VehicleType.scooter && (isLoadingTier || isLoadingBolt))
        return (
          <VehicleFilterTouchable
            key={index}
            vehicleType={vehicleType}
            index={index}
            isLoading={isLoading}
          />
        )
      })}
    </View>
  )
}

interface VehicleFilterTouchableProps {
  vehicleType: VehicleProps
  index: number
  isLoading: boolean
}

const VehicleFilterTouchable = ({
  vehicleType,
  index,
  isLoading,
}: VehicleFilterTouchableProps) => {
  const { id, icon, show } = vehicleType
  const vehiclesContext = useContext(GlobalStateContext)
  const [isPressed, setIsPressed] = useState(false)

  const onVehicleClick = (id: string) => {
    vehiclesContext.setVehicleTypes((oldVehicleTypes) => {
      let clickedOnShown = false
      let oneNotShown = false
      const clickedOnSingleShown = oldVehicleTypes.some((vehicleType) => {
        if (vehicleType.id === id && vehicleType.show === true) {
          clickedOnShown = true
        } else if (vehicleType.id !== id && vehicleType.show === false) {
          oneNotShown = true
        }
        return clickedOnShown && oneNotShown
      })
      const newVehicleTypes = oldVehicleTypes.map((vehicleType) => {
        if (clickedOnSingleShown) {
          return {
            ...vehicleType,
            show: true,
          }
        }
        return {
          ...vehicleType,
          show: id === vehicleType.id ? true : false,
        }
      })
      return newVehicleTypes
    })
  }

  const getVehicleIconStyled = (
    isLoading: boolean,
    icon: () => React.FC<SvgProps>
  ) => {
    const Icon = icon()
    return (
      <View>
        {isLoading && (
          <Progress.CircleSnail
            color={index === 0 ? colors.secondary : colors.primary}
            size={ICON_SIZE + 6}
            borderWidth={0}
            spinDuration={2000}
            thickness={3}
            style={styles.loadingWheel}
          />
        )}
        <Icon
          width={ICON_SIZE}
          height={ICON_SIZE}
          style={{ width: ICON_SIZE, height: ICON_SIZE }}
        />
      </View>
    )
  }

  let label = ''
  switch (vehicleType.id) {
    case VehicleType.bicycle:
      label = 'bikes'
      break
    case VehicleType.chargers:
      label = 'chargers'
      break
    case VehicleType.scooter:
      label = 'scooters'
      break
    case VehicleType.mhd:
      label = 'mhd'
      break
    case VehicleType.motorScooters:
      label = 'motorScooters'
      break
    case VehicleType.cars:
      label = 'cars'
      break
  }

  const isSoon = !!vehicleType.soonIcon

  return (
    <View style={styles.vehicleFilterTouchable}>
      <TouchableHighlight
        key={id}
        underlayColor="#000000"
        style={styles.icon}
        containerStyle={styles.icon}
        onPress={() => onVehicleClick(id)}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        disabled={isSoon}
      >
        {getVehicleIconStyled(
          isLoading,
          isSoon
            ? () => vehicleType.soonIcon ?? icon(isPressed ? true : show)
            : () => icon(isPressed ? true : show)
        )}
      </TouchableHighlight>
      <Text style={styles.label}>
        {t(`screens.MapScreen.VehicleBar.${label}`)}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  vehicleBar: {
    display: 'flex',
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: '100%',
    height: '100%',
    justifyContent: 'flex-start',
    backgroundColor: 'white',
    alignItems: 'flex-start',
    borderRadius: ICON_SIZE / 2,
  },
  icon: {
    borderRadius: ICON_SIZE / 2,
  },
  loadingWheel: {
    position: 'absolute',
    zIndex: 2,
    top: -3,
    left: -3,
    width: ICON_SIZE + 6,
    height: ICON_SIZE + 6,
  },
  vehicleFilterTouchable: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexBasis: '25%',
    marginBottom: 15,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 5,
  },
})

export default VehicleBar
