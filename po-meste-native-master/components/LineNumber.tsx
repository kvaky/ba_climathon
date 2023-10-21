import Text from '@components/Text'
import { tramNumbers } from '@utils/constants'
import { mhdDefaultColors } from '@utils/theme'
import React from 'react'
import { StyleSheet, View } from 'react-native'
import { TransitVehicleType } from './../types'

interface LineNumberProps {
  number?: string | number
  color?: string
  vehicleType?: TransitVehicleType
}

export const LineNumber = ({
  number = '?',
  color = mhdDefaultColors.grey,
  vehicleType,
}: LineNumberProps) => {
  const isTramNumber =
    typeof number === 'string'
      ? tramNumbers.includes(Number.parseInt(number))
      : tramNumbers.includes(number)
  return (
    <View
      style={[
        styles.container,
        vehicleType === TransitVehicleType.tram ||
        (!vehicleType && isTramNumber)
          ? styles.tram
          : null,
        {
          backgroundColor: color.length === 6 ? `#${color}` : color,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          (typeof number === 'string' && number.length > 2) ||
          (typeof number === 'number' && number > 99)
            ? styles.smallText
            : null,
        ]}
      >
        {number}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 4,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tram: {
    borderRadius: 16,
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  smallText: {
    fontSize: 12,
  },
})

export default LineNumber
