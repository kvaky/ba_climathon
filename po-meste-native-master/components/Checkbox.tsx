import CheckIcon from '@icons/check.svg'
import { colors } from '@utils/theme'
import React from 'react'
import { StyleSheet, View } from 'react-native'

interface CheckboxProps {
  checked?: boolean
}

const Checkbox = ({ checked = false }: CheckboxProps) => {
  return (
    <View style={[styles.unchecked, checked && styles.checked]}>
      {checked && <CheckIcon />}
    </View>
  )
}

const styles = StyleSheet.create({
  checked: {},
  unchecked: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.mediumGray,
    borderRadius: 5,
  },
})

export default Checkbox
