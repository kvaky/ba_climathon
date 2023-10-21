import Text from '@components/Text'
import ChevronRightSvg from '@icons/chevron-right-large.svg'
import MhdStopSvg from '@icons/stop-sign.svg'
import { tramNumbers } from '@utils/constants'
import { s } from '@utils/globalStyles'
import { colors } from '@utils/theme'
import { MhdStopProps, MhdStopStatusProps } from '@utils/validation'
import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

interface StopPlatformCardProps {
  stop: MhdStopProps
  stopStatus?: MhdStopStatusProps
  onPress?: () => void
}

const StopPlatformCard = ({
  stop,
  stopStatus,
  onPress,
}: StopPlatformCardProps) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 15,
            }}
          >
            <MhdStopSvg
              width={20}
              height={20}
              fill={colors.black}
              style={{ marginRight: 15 }}
            />
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
              {stop.name}
            </Text>
            <Text style={styles.platform}>{stop.platform}</Text>
          </View>
          {stopStatus && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {stopStatus.allLines
                ?.filter(
                  (value, index, self) =>
                    self.findIndex(
                      (line) => line.lineNumber === value.lineNumber
                    ) === index
                )
                .map((line, index) => {
                  return (
                    <View
                      key={line.lineNumber}
                      style={[
                        styles.lineIcon,
                        {
                          backgroundColor: '#' + line.lineColor,
                          borderRadius: tramNumbers.includes(+line.lineNumber)
                            ? 14
                            : 5,
                        },
                      ]}
                    >
                      <Text style={styles.lineIconText}>{line.lineNumber}</Text>
                    </View>
                  )
                })}
            </View>
          )}
        </View>
        <View>
          <ChevronRightSvg
            width={18}
            height={30}
            fill={colors.mediumGray}
            style={{ marginHorizontal: 5 }}
          />
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    elevation: 10,
    minHeight: 100,
    ...s.roundedBorder,
    backgroundColor: colors.white,
    marginBottom: 10,
    padding: 15,
    shadowColor: '#000',
    shadowRadius: 12,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 8 },
  },
  platform: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.mediumGray,
    marginLeft: 5,
  },
  lineIcon: {
    minWidth: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    marginRight: 5,
    marginBottom: 5,
  },
  lineIconText: {
    color: colors.white,
    fontWeight: 'bold',
    textAlignVertical: 'center',
    fontSize: 16,
  },
})

export default StopPlatformCard
