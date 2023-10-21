import Text from '@components/Text'
import { Departure, TransitVehicleType } from '@types'
import { s } from '@utils/globalStyles'
import { colors, mhdDefaultColors } from '@utils/theme'
import { getVehicle } from '@utils/utils'
import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

const BORDER_WIDTH = 2

interface LineFilterTileProps {
  departure: Departure
  index: number
  isActive: boolean
  onPress: (lineNumber: number | string) => void
}

const LineFilterTile = ({
  departure,
  index,
  isActive,
  onPress,
}: LineFilterTileProps) => {
  const getVehicleIconStyledFilter = (
    color: string = mhdDefaultColors.grey,
    lineNumber: string,
    vehicleType?: TransitVehicleType
  ) => {
    const Icon = getVehicle(vehicleType, lineNumber)
    return <Icon width={18} height={18} fill={color} />
  }

  return (
    <TouchableOpacity
      style={[
        styles.linkFilter,
        !isActive && styles.linkFilterInactive,
        {
          marginLeft: index ? 5 : 0,
          backgroundColor: `${
            isActive ? '#' + departure.lineColor : colors.lightLightGray
          }`,
          borderColor: isActive ? '#' + departure.lineColor : colors.gray,
        },
      ]} //TODO add colors https://inovaciebratislava.atlassian.net/browse/PLAN-238
      onPress={() => onPress(departure.lineNumber)}
    >
      <View style={styles.icon}>
        {getVehicleIconStyledFilter(
          isActive ? 'white' : colors.gray,
          departure.lineNumber,
          departure.vehicleType
        )}
      </View>
      <Text style={[{ color: isActive ? 'white' : colors.gray }, s.boldText]}>
        {departure.lineNumber}
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  linkFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5 + BORDER_WIDTH,
    paddingHorizontal: 4.5 + BORDER_WIDTH,
    minWidth: 60,
    borderRadius: 10,
  },
  linkFilterInactive: {
    borderWidth: BORDER_WIDTH,
    paddingVertical: 5,
    paddingHorizontal: 4.5,
  },
  icon: {
    marginRight: 6,
  },
})

export default LineFilterTile
