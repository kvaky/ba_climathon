// TODO copied from different project, might need cleanup if we're to use it
import Text from '@components/Text'
import React, { ReactElement } from 'react'
import { StyleSheet, TextStyle, TouchableOpacity, View } from 'react-native'
import { colors } from '../utils/theme'

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 72,
  },
  icon: {
    backgroundColor: '#f2f5f8',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 24,
  },
  textContainerNoIcon: {
    flex: 1,
  },
  titleText: {
    color: colors.darkText,
  },
  subtitleText: {
    marginTop: 8,
    color: colors.lightText,
  },
})

interface RowProps {
  title: string
  subtitle?: string
  rightComponent?: ReactElement
  leftComponent?: ReactElement
  titleVariant?:
    | 'headline'
    | 'body'
    | 'light'
    | 'button'
    | 'error'
    | 'text14'
    | 'text12'
  titleStyle?: TextStyle
  titleNumberOfLines?: number
  subtitleVariant?: 'headline' | 'body' | 'light' | 'button' | 'error'
  subtitleNumberOfLines?: number
  onPress?: () => void
  testID?: string
}

const Row = ({
  title,
  subtitle,
  rightComponent,
  leftComponent,
  // titleVariant,
  // titleStyle,
  titleNumberOfLines,
  // subtitleVariant,
  subtitleNumberOfLines,
  onPress,
  testID,
}: RowProps) => {
  const rowChildren = (
    <>
      {leftComponent}
      <View
        style={
          leftComponent ? styles.textContainer : styles.textContainerNoIcon
        }
      >
        {!!title && <Text numberOfLines={titleNumberOfLines}>{title}</Text>}
        {!!subtitle && (
          <Text numberOfLines={subtitleNumberOfLines}>{subtitle}</Text>
        )}
      </View>
      {rightComponent}
    </>
  )

  return onPress ? (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      disabled={!onPress}
      testID={testID}
    >
      {rowChildren}
    </TouchableOpacity>
  ) : (
    <View style={styles.row} testID={testID}>
      {rowChildren}
    </View>
  )
}

export default Row
