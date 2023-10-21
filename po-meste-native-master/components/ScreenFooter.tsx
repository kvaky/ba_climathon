import { colors } from '@utils/theme'
import React, { ReactNode } from 'react'
import { View, StyleSheet } from 'react-native'

interface FooterProps {
  children?: ReactNode
}

export const Footer = ({ children }: FooterProps) => {
  return <View style={style.container}>{children}</View>
}

const style = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: colors.lightLightGray,
  },
})

export default Footer
