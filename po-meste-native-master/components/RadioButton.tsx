import { colors } from '@utils/theme'
import React from 'react'
import { StyleSheet, View } from 'react-native'

interface RadioButtonProps {
  active?: boolean
}

const RadioButton = ({ active = false }: RadioButtonProps) => {
  return (
    <View style={[styles.inactive, active && styles.active]}>
      {active && (
        <View
          style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: colors.primary,
          }}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  active: {},
  inactive: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.mediumGray,
    borderRadius: 10,
  },
})

export default RadioButton
