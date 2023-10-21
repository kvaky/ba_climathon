import Text from '@components/Text'
import React from 'react'
import { StyleSheet, View } from 'react-native'
import { SvgProps } from 'react-native-svg'

import { LegModes } from '@types'
import { colors } from '@utils'

import { LineNumber } from '@components/LineNumber'
import ChevronRightSvg from '@icons/chevron-right-small.svg'
import WalkingSvg from '@icons/walking.svg'

type LegProps = {
  shortName?: string
  color?: string
  isLast?: boolean
  duration?: number
  mode?: LegModes
  TransportIcon: React.FC<SvgProps>
}

const Leg = ({
  mode = LegModes.bus,
  shortName,
  color,
  isLast = false,
  duration = 0,
  TransportIcon,
}: LegProps) => {
  const isIndividualTransport =
    mode == LegModes.walk || mode == LegModes.bicycle

  const durationMinutes = Math.round(duration / 60)

  return (
    <View style={styles.leg}>
      {(isIndividualTransport && (
        <View style={styles.legWalkingContainer}>
          {(mode === LegModes.walk && (
            <WalkingSvg width={20} height={20} fill="black" />
          )) ||
            (mode === LegModes.bicycle && (
              <TransportIcon width={30} height={20} fill="black" />
            ))}
          <View style={styles.legDurationContainer}>
            <Text style={styles.legDurationNumber}>
              {durationMinutes < 1 ? '<1' : durationMinutes}
            </Text>
            <Text>min</Text>
          </View>
        </View>
      )) || <LineNumber number={shortName ?? '?'} color={color} />}

      {!isLast && (
        <View style={styles.legArrowContainer}>
          <ChevronRightSvg width={12} height={12} fill={colors.gray} />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  leg: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 10,
  },
  legArrowContainer: {
    alignItems: 'center',
    padding: 4,
  },
  legDurationContainer: {},
  legWalkingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legDurationNumber: {
    fontWeight: 'bold',
    marginBottom: -4,
  },
})

export default Leg
