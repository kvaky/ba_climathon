import Text from '@components/Text'
import React from 'react'
import {
  GestureResponderEvent,
  StyleProp,
  StyleSheet,
  TextStyle,
  TouchableHighlight,
} from 'react-native'
import { colors } from '../utils/theme'

interface LinkProps {
  onPress: (event: GestureResponderEvent) => void
  title?: string
  style?: StyleProp<TextStyle>
}

const Link = ({ onPress, title, style }: LinkProps) => {
  return (
    <TouchableHighlight onPress={onPress} underlayColor="transparent">
      <Text style={[styles.link, style]}>{title}</Text>
    </TouchableHighlight>
  )
}

const styles = StyleSheet.create({
  link: {
    textDecorationLine: 'underline',
    color: colors.darkText,
  },
})

export default Link
