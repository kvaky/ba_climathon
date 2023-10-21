import Text from '@components/Text'
import { colors } from '@utils/theme'
import React from 'react'
import {
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native'

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circle: {
    height: 16,
    width: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  checked: {
    borderWidth: 6,
  },
  text: {
    paddingHorizontal: 16,
  },
})

interface RadioButtonPickerProps {
  containerStyle?: ViewStyle
  labelStyle?: TextStyle
  options: {
    value: string
    label: string
    customComponent?: React.ReactElement
  }[]
  value: any
  onChangeValue: (value: any) => void
}

const RadioButtonPicker = ({
  options,
  value,
  onChangeValue,
  containerStyle,
  labelStyle,
}: RadioButtonPickerProps) => {
  return (
    <View>
      {options.map((item, index) => (
        <View style={[styles.row, containerStyle]} key={index}>
          <TouchableOpacity
            style={styles.buttonContainer}
            onPress={() => onChangeValue(item.value)}
          >
            <>
              <View
                style={[styles.circle, value === item.value && styles.checked]}
              />
              <Text style={[styles.text, labelStyle]}>{item.label}</Text>
            </>
          </TouchableOpacity>
          <View>{item.customComponent}</View>
        </View>
      ))}
    </View>
  )
}
export default RadioButtonPicker
