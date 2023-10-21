import Text from '@components/Text'
import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

import { DashedLine } from '@components'
import { colors, s } from '@utils'

import CircleSvg from '@icons/circle.svg'
import SwitchSvg from '@icons/switch.svg'
import TriangleSvg from '@icons/triangle.svg'

type Props = {
  fromPlaceText?: string
  toPlaceText?: string
  fromPlaceTextPlaceholder?: string
  toPlaceTextPlaceholder?: string
  onFromPlacePress: () => void
  onToPlacePress: () => void
  onSwitchPlacesPress: () => void
}

const FromToSelector = ({
  fromPlaceText,
  toPlaceText,
  fromPlaceTextPlaceholder,
  toPlaceTextPlaceholder,
  onFromPlacePress,
  onToPlacePress,
  onSwitchPlacesPress,
}: Props) => {
  return (
    <View style={styles.container}>
      <View style={styles.arrowContainer}>
        <CircleSvg width={14} height={14} fill={colors.primary} />
        <DashedLine spacing={4} dashLength={3} color={colors.gray} />
        <TriangleSvg width={14} height={14} fill={colors.primary} />
      </View>
      <View style={styles.inputsContainer}>
        <TouchableOpacity onPress={onFromPlacePress} style={styles.input}>
          <Text
            style={
              fromPlaceText ? styles.inputText : styles.inputTextPlaceholder
            }
          >
            {fromPlaceText || fromPlaceTextPlaceholder}
          </Text>
        </TouchableOpacity>
        <View style={styles.line}></View>
        <TouchableOpacity onPress={onToPlacePress} style={styles.input}>
          <Text
            style={toPlaceText ? styles.inputText : styles.inputTextPlaceholder}
          >
            {toPlaceText || toPlaceTextPlaceholder}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.switchPlacesContainer}>
        <TouchableOpacity
          style={styles.switchPlaces}
          onPress={onSwitchPlacesPress}
        >
          <SwitchSvg fill={colors.primary} width={22} height={22} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    ...s.roundedBorder,
  },
  arrowContainer: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  inputsContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  switchPlacesContainer: {
    alignItems: 'center',
  },
  switchPlaces: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    paddingVertical: 16,
    paddingLeft: 5,
  },
  line: {
    width: '100%',
    height: 1,
    backgroundColor: colors.mediumGray,
  },
  inputTextPlaceholder: {
    color: colors.gray,
  },
  inputText: {
    color: 'black',
  },
})

export default FromToSelector
