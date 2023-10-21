import Accordion from '@components/Accordion'
import Line from '@components/Line'
import LineNumber from '@components/LineNumber'
import Text from '@components/Text'
import { Ionicons } from '@expo/vector-icons'
import ChevronRightSmall from '@icons/chevron-right-small.svg'
import MapPinSvg from '@icons/map-pin-marker.svg'
import BusSvg from '@icons/vehicles/bus.svg'
import TramSvg from '@icons/vehicles/tram.svg'
import TrolleybusSvg from '@icons/vehicles/trolleybus.svg'
import { DateTimeFormatter, Instant, LocalTime } from '@js-joda/core'
import { LegModes } from '@types'
import { ITINERARY_ICON_WIDTH, ITINERARY_PADDING_HORIZONTAL } from '@utils'
import { getMhdTrip } from '@utils/api'
import { s } from '@utils/globalStyles'
import { colors } from '@utils/theme'
import { LegProps } from '@utils/validation'
import i18n from 'i18n-js'
import _ from 'lodash'
import React from 'react'
import { StyleSheet, View } from 'react-native'
import { useQuery } from 'react-query'

interface MhdTransitCardProps {
  leg: LegProps
  isLastLeg: boolean
}

const MhdTransitCard = ({ leg, isLastLeg }: MhdTransitCardProps) => {
  const trip = useQuery(['getMhdTrip', leg.tripId], async () =>
    getMhdTrip(
      leg.tripId?.startsWith('1:')
        ? leg.tripId.replace('1:', '')
        : leg.tripId ?? ''
    )
  )
  const startTime =
    leg.startTime &&
    LocalTime.ofInstant(Instant.ofEpochMilli(parseInt(leg.startTime)))
  const endTime =
    leg.endTime && LocalTime.ofInstant(Instant.ofEpochMilli(leg.endTime))

  const accordion = trip.data && (
    <Accordion
      containerStyle={{
        backgroundColor: colors.white,
        borderRadius: 8,
        width: '100%',
        paddingVertical: 10,
        overflow: 'hidden',
        alignItems: 'stretch',
      }}
      items={{
        header: (isOpen) => (
          <View style={styles.mhdTripHeader}>
            <View style={styles.mhdTripAdditionalInfoWrapper}>
              <Text style={{ color: colors.darkGray, fontWeight: 'bold' }}>
                {(leg?.from?.stopIndex || leg?.from?.stopIndex === 0) &&
                  (leg?.to?.stopIndex || leg?.to?.stopIndex === 0) &&
                  `${i18n.t('common.stops', {
                    count: leg.to.stopIndex - leg.from.stopIndex,
                  })}`}
              </Text>
              <Text style={{ color: colors.darkGray, fontWeight: 'bold' }}>
                {leg?.duration &&
                  `, ${i18n.t('common.minutes', {
                    count: Math.floor(leg?.duration / 60),
                  })}`}
              </Text>
            </View>
            <ChevronRightSmall
              width={12}
              height={12}
              fill={colors.primary}
              style={{ transform: [{ rotate: isOpen ? '270deg' : '90deg' }] }}
            />
          </View>
        ),
        body: (
          <View style={{ marginTop: 10 }}>
            {trip.data.timeline
              ?.slice(
                trip.data.timeline.findIndex(
                  // stop.stopId: 32500002
                  // leg.to.stopId: 1:000000032500002
                  (stop) =>
                    stop.stopId ===
                    _.trimStart(_.trimStart(leg.from.stopId, '1:'), '0')
                ) + 1,
                trip.data.timeline.findIndex(
                  (stop) =>
                    stop.stopId ===
                    _.trimStart(_.trimStart(leg.to.stopId, '1:'), '0')
                )
              )
              .map((stop) => (
                <View key={stop.stopId}>
                  <Text
                    style={{
                      color: colors.darkGray,
                      fontSize: 14,
                      lineHeight: 25,
                    }}
                  >{`${stop.time.slice(0, -3)} ${stop.stopName}`}</Text>
                </View>
              ))}
          </View>
        ),
      }}
    />
  )

  return (
    <View
      style={[
        styles.card,
        s.horizontalMargin,
        styles.whiteCard,
        styles.cardVerticalMargin,
      ]}
    >
      <View style={styles.left}>
        {leg.mode === LegModes.tram && (
          <TramSvg
            width={ITINERARY_ICON_WIDTH}
            height={32}
            fill={`#${leg.routeColor}`}
          />
        )}
        {leg.mode === LegModes.trolleybus && (
          <TrolleybusSvg
            width={ITINERARY_ICON_WIDTH}
            height={32}
            fill={`#${leg.routeColor}`}
          />
        )}
        {leg.mode === LegModes.bus && (
          <BusSvg
            width={ITINERARY_ICON_WIDTH}
            height={32}
            fill={`#${leg.routeColor}`}
          />
        )}
        <View style={styles.line}>
          <Line color={`#${leg.routeColor}`} />
        </View>
        {isLastLeg ? (
          <MapPinSvg width={20} height={20} fill={`#${leg.routeColor}`} />
        ) : (
          <View
            style={{
              width: 8,
              height: 8,
              backgroundColor: `#${leg.routeColor}`,
              borderRadius: 4,
              marginLeft: 6,
            }}
          ></View>
        )}
      </View>
      <View style={styles.middle}>
        <View style={{ marginHorizontal: 8 }}>
          <LineNumber number={leg.routeShortName} color={leg.routeColor} />
          {/* <WheelchairSvg width={30} height={20} /> // TODO add when trip data is available*/}
        </View>
        <View style={styles.stopsContainer}>
          <View>
            <View style={{ flexDirection: 'row' }}>
              <Text style={[styles.textBold, styles.textSizeBig]}>
                {leg.from.name}
              </Text>
              <Text
                style={[
                  styles.textBold,
                  styles.textSizeBig,
                  { color: colors.darkGray },
                ]}
              >
                {` ${leg.from.platformCode}`}
              </Text>
            </View>
            <View style={styles.heading}>
              <Ionicons
                size={15}
                style={{
                  alignSelf: 'center',
                  bottom: 1,
                }}
                name="arrow-forward"
              />
              <Text style={s.textTiny}>{leg.headsign}</Text>
            </View>
            <View>{accordion}</View>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <Text style={[styles.textBold, styles.textSizeBig]}>
              {leg.to.name}
            </Text>
            <Text
              style={[
                styles.textBold,
                styles.textSizeBig,
                { color: colors.darkGray },
              ]}
            >
              {` ${leg.to.platformCode}`}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.right}>
        <Text style={{ fontWeight: 'bold' }}>
          {startTime && startTime.format(DateTimeFormatter.ofPattern('HH:mm'))}
        </Text>
        <Text style={{ fontWeight: 'bold' }}>
          {endTime && endTime.format(DateTimeFormatter.ofPattern('HH:mm'))}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: ITINERARY_PADDING_HORIZONTAL || 10,
    paddingVertical: 3,
    borderRadius: 10,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  cardVerticalMargin: {
    marginVertical: 5,
  },
  whiteCard: {
    backgroundColor: 'white',
    paddingVertical: 20,
    elevation: 7,
  },
  line: {
    alignItems: 'center',
    flex: 1,
  },
  left: {
    height: '100%',
    justifyContent: 'flex-start',
  },
  middle: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
  },
  textBold: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  textSizeBig: {
    fontSize: 16,
  },
  heading: {
    display: 'flex',
    flexDirection: 'row',
  },
  mhdTripAdditionalInfoWrapper: {
    display: 'flex',
    flexDirection: 'row',
  },
  stopsContainer: {
    justifyContent: 'space-between',
    flex: 1,
    minHeight: 0,
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mhdTripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
})

export default MhdTransitCard
