import Text from '@components/Text'
import {
  DateTimeFormatter,
  Duration,
  Instant,
  LocalDateTime,
} from '@js-joda/core'
import i18n from 'i18n-js'
import React, { useEffect, useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

import { LoadingView } from '@components'
import IsLiveSvg from '@icons/is-live.svg'
import { LegModes, MicromobilityProvider } from '@types'
import {
  colors,
  getColor,
  getIcon,
  getProviderFromStationId,
  getProviderName,
  getTextColor,
  LegProps,
  s,
} from '@utils'
import Leg from './Leg'

type Props = {
  provider?: MicromobilityProvider
  duration?: number
  departureDateTime?: LocalDateTime
  arriveDateTime?: LocalDateTime
  legs?: LegProps[]
  onPress?: () => void
  isLoading?: boolean
  isScooter?: boolean
  isMultimodal?: boolean
}

const TripMiniature = ({
  provider,
  duration,
  departureDateTime,
  arriveDateTime,
  legs,
  onPress,
  isLoading,
  isScooter,
  isMultimodal = false,
}: Props) => {
  const [startStationName, setStartStationName] = useState('')
  const [diffMinutes, setDiffMinutes] = useState<number | undefined>(undefined)
  const [firstStopDateTime, setFirstStopDateTime] = useState<
    LocalDateTime | undefined
  >(undefined)
  const [isfirstStopLive, setIsFirstStopLive] = useState(false)

  // TODO is this necessary?
  useEffect(() => {
    if (legs) {
      const firstStop = legs.find(
        (leg) =>
          leg.mode === LegModes.bus ||
          leg.mode === LegModes.tram ||
          leg.mode === LegModes.trolleybus
      )
      if (firstStop) {
        if (firstStop.realTime) setIsFirstStopLive(true)
        firstStop.from.departure &&
          setFirstStopDateTime(
            LocalDateTime.ofInstant(
              Instant.ofEpochMilli(firstStop.from.departure)
            )
          )

        firstStop.from.departure &&
          setDiffMinutes(
            Duration.between(
              LocalDateTime.now(),
              LocalDateTime.ofInstant(
                Instant.ofEpochMilli(firstStop.from.departure)
              )
            ).toMinutes()
          )
        setStartStationName(firstStop.from.name || '')
      }
    }
  }, [legs])

  useEffect(() => {
    if (firstStopDateTime) {
      const timer = setInterval(() => {
        setDiffMinutes(
          Duration.between(LocalDateTime.now(), firstStopDateTime).toMinutes()
        )
      }, 10000)
      return () => {
        clearInterval(timer)
      }
    }
  }, [firstStopDateTime])

  const lastLeg = legs && legs[legs?.length - 1]
  const ignoreLastShortWalk =
    lastLeg?.mode === LegModes.walk &&
    lastLeg?.duration &&
    Math.floor(lastLeg.duration / 60) < 1

  return (
    <View style={styles.containerOuter}>
      <TouchableOpacity onPress={onPress} style={styles.touchable}>
        <View style={styles.container}>
          <View style={styles.row}>
            {provider && (
              <Text
                style={[
                  s.boldText,
                  styles.providerText,
                  {
                    backgroundColor: getColor(provider),
                    color: getTextColor(provider),
                  },
                ]}
              >
                {getProviderName(provider)}
              </Text>
            )}
          </View>
          {isLoading && (
            <LoadingView fullscreen stylesOuter={styles.elevation} />
          )}
          <View style={styles.containerInner}>
            <View style={styles.leftContainer}>
              {legs && (
                <View style={styles.legsContainer}>
                  {legs.map((leg, index) => {
                    if (index === legs.length - 1 && ignoreLastShortWalk) {
                      return null
                    }
                    return (
                      <Leg
                        key={index}
                        isLast={
                          index === legs.length - (ignoreLastShortWalk ? 2 : 1)
                        }
                        mode={leg.mode}
                        duration={leg.duration}
                        color={leg.routeColor}
                        shortName={leg.routeShortName}
                        TransportIcon={getIcon(
                          getProviderFromStationId(leg.from.bikeShareId) ??
                            provider,
                          isScooter
                        )}
                      />
                    )
                  })}
                </View>
              )}
              {startStationName.length > 0 && (
                <View style={styles.atTimeContainer}>
                  {isfirstStopLive && (
                    <View>
                      <IsLiveSvg fill={colors.brightGreen} />
                    </View>
                  )}
                  {diffMinutes != undefined && (
                    <Text style={[styles.atTime, s.textTiny]}>
                      {diffMinutes < 0
                        ? i18n.t('screens.FromToScreen.Planner.beforeIn', {
                            time: Math.abs(diffMinutes),
                          })
                        : i18n.t('screens.FromToScreen.Planner.startingIn', {
                            time: diffMinutes,
                          })}
                    </Text>
                  )}
                  <Text numberOfLines={1} style={s.textTiny}>
                    {i18n.t('screens.FromToScreen.Planner.from') +
                      // vocalizing the preposition for the slovak translation when needed (z -> zo)
                      (i18n.currentLocale() === 'sk' &&
                      ['s', 'z', 'š', 'ž'].includes(
                        startStationName[0]?.toLocaleLowerCase()
                      )
                        ? 'o'
                        : '') +
                      ' '}
                    <Text style={styles.stationName}>{startStationName}</Text>
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.rightContainer}>
              {duration !== undefined && (
                <View style={styles.durationContainer}>
                  <Text style={styles.durationNumber}>{duration}</Text>
                  <Text style={styles.durationMin}>min</Text>
                </View>
              )}
              <View style={styles.fromToTime}>
                <Text style={styles.fromToTimeText}>
                  {departureDateTime &&
                    departureDateTime.format(
                      DateTimeFormatter.ofPattern('HH:mm')
                    )}
                </Text>
                <Text style={styles.fromToTimeText}>
                  {arriveDateTime &&
                    ` - ${arriveDateTime.format(
                      DateTimeFormatter.ofPattern('HH:mm')
                    )}`}
                </Text>
              </View>
              <View
                style={[
                  styles.rightContainerBackground,
                  {
                    backgroundColor: isMultimodal
                      ? colors.gold
                      : colors.lightGray,
                  },
                ]}
              ></View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  touchable: {
    shadowColor: '#000',
    shadowRadius: 12,
    shadowOpacity: 0.5,
    shadowOffset: { width: 4, height: 8 },
    marginBottom: 10,
    elevation: 10,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  containerOuter: { ...s.shadow, marginHorizontal: 20 },
  container: { minHeight: 100 },
  row: {
    display: 'flex',
    flexDirection: 'row',
    elevation: 10,
  },
  containerInner: {
    flex: 1,
    flexDirection: 'row',
  },
  providerText: {
    borderBottomRightRadius: 8,
    paddingHorizontal: 10,
  },
  leftContainer: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    paddingRight: 10,
  },
  rightContainer: {
    position: 'relative',
    width: 100,
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    padding: 10,
  },
  rightContainerBackground: {
    flex: 1,
    width: '100%',
    position: 'absolute',
    top: -100,
    bottom: -100,
    left: 20,
    transform: [{ rotate: '15deg' }, { scale: 1.6 }],
  },
  legsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  durationContainer: {
    flexDirection: 'row',
    position: 'relative',
    zIndex: 10,
    alignItems: 'flex-end',
  },
  durationNumber: {
    fontWeight: 'bold',
    color: colors.darkText,
    fontSize: 24,
  },
  durationMin: {
    fontWeight: 'bold',
    color: colors.darkText,
    marginLeft: 5,
    marginBottom: 2,
  },
  fromToTime: {
    color: colors.darkText,
    flexDirection: 'row',
    position: 'relative',
    zIndex: 10,
    flexWrap: 'nowrap',
  },
  fromToTimeText: {
    ...s.textTiny,
  },
  atTimeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 5,
    paddingRight: 10,
  },
  atTime: {
    fontWeight: 'bold',
    marginRight: 5,
  },
  elevation: {
    elevation: 1,
  },
  stationName: {
    fontWeight: 'bold',
  },
})

export default TripMiniature
