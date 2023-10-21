import Text from '@components/Text'
import { BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { DateTimeFormatter, Instant, LocalTime } from '@js-joda/core'
import i18n from 'i18n-js'
import _ from 'lodash'
import { StyleSheet, View } from 'react-native'

// import WheelchairSvg from '@icons/wheelchair.svg'
import EllipseSvg from '@icons/ellipse.svg'
import MapPinSvg from '@icons/map-pin-marker.svg'
import CyclingSvg from '@icons/vehicles/cycling.svg'
import ScooterSvg from '@icons/vehicles/scooter.svg'
import WalkingSvg from '@icons/walking.svg'

import { BOTTOM_TAB_NAVIGATOR_HEIGHT, DashedLine } from '@components'
import { LegModes, MicromobilityProvider } from '@types'
import React, { useEffect, useState } from 'react'

// import WheelchairSvg from '@icons/wheelchair.svg'

import BoltHeaderSvg from '@icons/bottom-route-headers/bolt.svg'
import RekolaHeaderSvg from '@icons/bottom-route-headers/rekola.svg'
import SlovnaftbajkHeaderSvg from '@icons/bottom-route-headers/slovnaftbajk.svg'
import TierHeaderSvg from '@icons/bottom-route-headers/tier.svg'

import OwnBicycle from '@icons/bottom-route-headers/own-bicycle.svg'
import OwnScooter from '@icons/bottom-route-headers/own-scooter.svg'
import Walking from '@icons/bottom-route-headers/walking.svg'

import ProviderButton from '@components/ProviderButton'
import IsLiveSvg from '@icons/is-live.svg'
import { TravelModes } from '@types'
import {
  colors,
  getHeaderBgColor,
  getIcon,
  getMicromobilityImage,
  getProviderFromStationId,
  getProviderName,
  getShortAddress,
  googlePlacesReverseGeocode,
  ITINERARY_ICON_WIDTH,
  ITINERARY_PADDING_HORIZONTAL,
  LegProps,
  s,
} from '@utils'
import { SvgProps } from 'react-native-svg'
import MhdTransitCard from './_partials/MhdTransitCard'

interface TextItineraryProps {
  legs: LegProps[]
  provider?: MicromobilityProvider
  isScooter?: boolean
  travelMode: TravelModes
  fromPlace?: string
  toPlace?: string
  price?: number
}

const DASHED_HEIGHT = 20

const BIKESHARE_PROPERTY = 'BIKESHARE'

export const TextItinerary = ({
  legs,
  provider,
  isScooter,
  travelMode,
  fromPlace,
  toPlace,
  price,
}: TextItineraryProps) => {
  const [timeNow, setTimeNow] = useState(LocalTime.now())
  const [updateEveryMinuteInterval, setUpdateEveryMinuteInterval] = useState<
    number | undefined
  >(undefined)
  const [boltStationNames, setBoltStationNames] = useState([
    i18n.t('screens.PlannerScreen.polygon'),
    i18n.t('screens.PlannerScreen.polygon'),
  ])
  useEffect(() => {
    if (travelMode === TravelModes.mhd)
      setUpdateEveryMinuteInterval(
        window.setInterval(() => setTimeNow(LocalTime.now()), 60 * 1000)
      )
    return () => {
      if (travelMode === TravelModes.mhd)
        clearInterval(updateEveryMinuteInterval)
    }
  }, [])

  const title = provider && getProviderName(provider)
  const getHeaderIcon = (
    provider: MicromobilityProvider | undefined,
    travelMode: TravelModes
  ) => {
    switch (provider) {
      case MicromobilityProvider.rekola:
        return RekolaHeaderSvg
      case MicromobilityProvider.slovnaftbajk:
        return SlovnaftbajkHeaderSvg
      case MicromobilityProvider.tier:
        return TierHeaderSvg
      case MicromobilityProvider.bolt:
        return BoltHeaderSvg
      default:
        break
    }
    switch (travelMode) {
      case TravelModes.bicycle:
        return OwnBicycle
      case TravelModes.scooter:
        return OwnScooter
      case TravelModes.walk:
        return Walking
      default:
        break
    }
  }
  const HeaderIcon = getHeaderIcon(provider, travelMode)
  const getHeaderTextColor = (provider: MicromobilityProvider | undefined) => {
    switch (provider) {
      case MicromobilityProvider.rekola:
        return '#FFFFFF'
      case MicromobilityProvider.slovnaftbajk:
        return '#454545'
      case MicromobilityProvider.tier:
        return '#454545'
      default:
        return '#FFFFFF'
    }
  }

  const getFirstRentedInstanceIndex = legs.findIndex(
    (leg) => leg.from.vertexType === BIKESHARE_PROPERTY
  )

  const getLastRentedInstanceIndex = _.findLastIndex(
    legs,
    (leg) => leg.from.vertexType === BIKESHARE_PROPERTY
  )

  if (provider === MicromobilityProvider.bolt) {
    const origin = legs[getFirstRentedInstanceIndex]
    const destination = legs[getLastRentedInstanceIndex]
    if (origin.from.lat && origin.from.lon) {
      googlePlacesReverseGeocode(origin.from.lat, origin.from.lon, (result) =>
        setBoltStationNames((old) => {
          old[0] = getShortAddress(
            `${i18n.t('screens.PlannerScreen.polygon')} ${
              result[0].formatted_address
            }`
          )
          return old
        })
      )
    }
    if (destination.from.lat && destination.from.lon) {
      googlePlacesReverseGeocode(
        destination.from.lat,
        destination.from.lon,
        (result) =>
          setBoltStationNames((old) => {
            old[1] = getShortAddress(
              `${i18n.t('screens.PlannerScreen.polygon')} ${
                result[0].formatted_address
              }`
            )
            return old
          })
      )
    }
  }

  const firstStop = legs.find((leg) => leg.from.vertexType === 'TRANSIT')
  const isMhd = !!firstStop

  const getDashedLine = () => {
    return <DashedLine spacing={4} dashLength={2} color={colors.darkText} />
  }

  const renderProviderIconWithText = (
    text?: string,
    ProviderIcon?: React.FC<SvgProps>
  ) => {
    return (
      <View style={[styles.card, s.horizontalMargin]}>
        <View style={styles.left}>
          <View style={styles.inline}>
            {ProviderIcon && (
              <ProviderIcon
                width={ITINERARY_ICON_WIDTH + 8}
                height={ITINERARY_ICON_WIDTH + 8}
                style={{ left: -4 }}
              />
            )}
            <Text style={[styles.textBold, styles.textMargin]}>{text}</Text>
          </View>
        </View>
      </View>
    )
  }

  const renderTransitOnFoot = (leg: LegProps) => {
    const durationMinutes = leg.duration && Math.floor(leg.duration / 60)
    return (
      <View style={[styles.card, s.horizontalMargin]}>
        <View style={styles.left}>
          <View style={styles.dashedLine}>{getDashedLine()}</View>
          <View style={styles.inline}>
            <WalkingSvg
              width={ITINERARY_ICON_WIDTH + 2}
              height={ITINERARY_ICON_WIDTH + 2}
              style={{ left: -1 }}
              fill={colors.darkText}
            />
            <View style={styles.textMargin}>
              {durationMinutes !== undefined && (
                <Text style={[s.boldText, { fontSize: 14, lineHeight: 14 }]}>
                  {i18n.t('screens.PlannerScreen.minShort', {
                    count: durationMinutes < 1 ? '<1' : durationMinutes,
                  })}
                </Text>
              )}
              {leg.distance !== undefined && (
                <Text style={{ fontSize: 14, lineHeight: 14 }}>
                  {i18n.t('screens.PlannerScreen.distanceShort', {
                    count: Math.floor(leg.distance),
                  })}
                </Text>
              )}
            </View>
          </View>
          <View style={styles.dashedLine}>{getDashedLine()}</View>
        </View>
      </View>
    )
  }

  const renderTransitOnMicromobility = (leg: LegProps) => {
    return (
      <View style={[styles.card, s.horizontalMargin]}>
        <View style={styles.left}>
          <View style={styles.dashedLine}>{getDashedLine()}</View>
          <View style={styles.inline}>
            {getMobilityIcon(isScooter)}
            <View style={styles.textMargin}>
              <Text style={[s.boldText, { fontSize: 14, lineHeight: 14 }]}>
                {leg.duration &&
                  i18n.t('screens.PlannerScreen.minShort', {
                    count: Math.floor(leg.duration / 60),
                  })}
              </Text>
              <Text style={{ fontSize: 14, lineHeight: 14 }}>
                {leg.distance !== undefined &&
                  i18n.t('screens.PlannerScreen.distanceShort', {
                    count: Math.floor(leg.distance),
                  })}
              </Text>
            </View>
          </View>
          <View style={styles.dashedLine}>{getDashedLine()}</View>
        </View>
      </View>
    )
  }

  const renderTransitOnOther = (leg: LegProps, isLastLeg: boolean) => {
    return <MhdTransitCard leg={leg} isLastLeg={isLastLeg} />
  }

  const getMobilityIcon = (isScooter?: boolean) => {
    const Icon = isScooter ? ScooterSvg : CyclingSvg
    return (
      <Icon width={ITINERARY_ICON_WIDTH} height={20} fill={colors.darkText} />
    )
  }

  const headerTitle = (minutes = '13'): string => {
    if (title) return title
    switch (travelMode) {
      case TravelModes.mhd:
        return i18n.t('screens.PlannerScreen.mhdHeader', { minutes })
      case TravelModes.bicycle:
        return i18n.t('screens.FromToScreen.Planner.myBike')
      case TravelModes.scooter:
        return i18n.t('screens.FromToScreen.Planner.myScooter')
      case TravelModes.walk:
        return i18n.t('screens.FromToScreen.Planner.walk')
      default:
        return ''
    }
  }

  const buttonTitle =
    provider === MicromobilityProvider.rekola
      ? 'Rekola'
      : provider === MicromobilityProvider.slovnaftbajk
      ? 'Bajk'
      : provider === MicromobilityProvider.tier
      ? 'Tier'
      : ''

  const lastLeg = legs[legs.length - 1]
  const renderDestinationIcon =
    (lastLeg?.mode === LegModes.walk &&
      lastLeg.duration &&
      lastLeg.duration / 60 > 1) ||
    ((lastLeg?.mode === LegModes.bicycle ||
      lastLeg?.mode === LegModes.scooter) &&
      !provider)

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.card,
          s.horizontalPadding,
          styles.cardHeader,
          { backgroundColor: getHeaderBgColor(travelMode, provider) },
        ]}
      >
        {HeaderIcon && (
          <HeaderIcon
            width={30}
            height={30}
            style={{ marginRight: 10, top: -3 }}
          />
        )}
        {firstStop?.realTime && (
          <View>
            <IsLiveSvg fill={colors.white} />
          </View>
        )}
        <Text
          style={[styles.textBold, { color: getHeaderTextColor(provider) }]}
        >
          {headerTitle(
            firstStop?.startTime && //TODO Live data from getMhdStopStatusData(firstStop.id)
              Math.floor(
                (LocalTime.ofInstant(
                  Instant.ofEpochMilli(parseInt(firstStop.startTime))
                ).toSecondOfDay() -
                  LocalTime.now().toSecondOfDay()) /
                  60
              ).toString()
          )}
        </Text>
        {!title && travelMode === TravelModes.mhd && (
          <Text
            style={[
              styles.textSizeBig,
              { color: getHeaderTextColor(provider) },
            ]}
          >
            {title ||
              ` ${firstStop?.from.name}${
                firstStop?.from.platformCode
                  ? ' ' + firstStop?.from.platformCode
                  : ''
              }`}
          </Text>
        )}
      </View>
      <BottomSheetScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContainerContent}
      >
        <View style={[styles.containerContent, styles.paddingVertical]}>
          {legs.map((leg, index) => {
            return (
              <View key={index}>
                {index === 0 && leg.duration && leg.duration / 60 > 1 && (
                  <View
                    style={[
                      styles.card,
                      s.horizontalMargin,
                      { justifyContent: 'space-between' },
                    ]}
                  >
                    <View style={styles.left}>
                      <View style={styles.row}>
                        <View style={styles.iconStart}>
                          <EllipseSvg
                            width={ITINERARY_ICON_WIDTH}
                            height={ITINERARY_ICON_WIDTH}
                            fill={colors.darkText}
                          />
                        </View>
                        {/* TODO add location based on google or get it from previous screen */}
                        <Text style={[styles.textMargin, styles.textBold]}>
                          {fromPlace && getShortAddress(fromPlace)}
                        </Text>
                      </View>
                    </View>
                    {leg.startTime && isMhd && (
                      <View
                        style={{
                          alignItems: 'flex-end',
                          position: 'absolute',
                          right: ITINERARY_PADDING_HORIZONTAL,
                          top: -14,
                        }}
                      >
                        <Text style={s.textTiny}>
                          {i18n.t('screens.PlannerScreen.departAt')}
                        </Text>
                        <Text style={[s.textSmall, s.boldText]}>
                          {LocalTime.ofInstant(
                            Instant.ofEpochMilli(parseInt(leg.startTime))
                          ).format(DateTimeFormatter.ofPattern('HH:mm'))}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
                {(getFirstRentedInstanceIndex === index ||
                  getLastRentedInstanceIndex === index) &&
                  renderProviderIconWithText(
                    provider === MicromobilityProvider.bolt
                      ? index === getFirstRentedInstanceIndex
                        ? boltStationNames[0]
                        : index === getLastRentedInstanceIndex
                        ? boltStationNames[1]
                        : leg.from.name
                      : leg.from.name,
                    getIcon(
                      getProviderFromStationId(leg.from.bikeShareId) ??
                        provider,
                      isScooter
                    )
                  )}
                {leg.mode === LegModes.walk &&
                  // if the last leg is walking and shorter than 1 minute, it does not render
                  !(
                    index === legs.length - 1 &&
                    leg.duration &&
                    leg.duration / 60 < 1
                  ) &&
                  renderTransitOnFoot(leg)}
                {leg.mode === LegModes.bicycle &&
                  renderTransitOnMicromobility(leg)}
                {leg.mode !== LegModes.bicycle &&
                  leg.mode !== LegModes.walk &&
                  renderTransitOnOther(
                    leg,
                    index === legs.length - 1 ||
                      (index === legs.length - 2 &&
                        legs[legs.length - 1].mode === LegModes.walk &&
                        !renderDestinationIcon)
                  )}
                {index === legs.length - 1 && renderDestinationIcon && (
                  <View
                    style={[
                      styles.card,
                      s.horizontalMargin,
                      { justifyContent: 'space-between' },
                    ]}
                  >
                    <View style={styles.left}>
                      <View style={styles.row}>
                        <View style={styles.iconDestination}>
                          <MapPinSvg
                            width={ITINERARY_ICON_WIDTH + 5}
                            height={ITINERARY_ICON_WIDTH + 5}
                            fill={colors.black}
                          />
                        </View>
                        {/* TODO add location based on google or get it from previous screen */}
                        <Text style={styles.textBold}>
                          {toPlace && getShortAddress(toPlace)}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            )
          })}
          {/* TODO do it like in https://github.com/bratislava/hybaj-native/pull/49 StationMicromobilityInfo.tsx */}
          {provider && (
            <View
              style={[
                styles.card,
                styles.whiteCard,
                {
                  marginHorizontal: 20,
                  marginTop: 30,
                  justifyContent: 'space-between',
                  flexDirection: 'row',
                  height: 100,
                  alignItems: 'center',
                },
              ]}
            >
              <View>{getMicromobilityImage(provider, 90, 90)}</View>
              <View style={{ alignItems: 'center' }}>
                <ProviderButton provider={provider} />
                <Text
                  style={{
                    ...s.textTiny,
                    color: colors.mediumGray,
                    fontWeight: 'bold',
                  }}
                >
                  {i18n.t('screens.PlannerScreen.price', {
                    count: (price ?? 0) / 100,
                  })}
                </Text>
              </View>
            </View>
          )}
        </View>
      </BottomSheetScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
  },
  scrollContainer: {
    backgroundColor: colors.lightLightGray,
  },
  scrollContainerContent: {
    paddingTop: 20,
    paddingBottom: BOTTOM_TAB_NAVIGATOR_HEIGHT + 20,
  },
  paddingVertical: {
    paddingVertical: 20,
  },
  containerContent: {
    backgroundColor: colors.lightLightGray,
  },
  inline: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  textMargin: {
    marginLeft: 10,
  },
  cardHeader: {
    borderRadius: 0,
    justifyContent: 'center',
    paddingBottom: 14,
    paddingTop: 4,
  },
  card: {
    paddingHorizontal: ITINERARY_PADDING_HORIZONTAL,
    paddingVertical: 3,
    borderRadius: 10,
    display: 'flex',
    flexDirection: 'row',
  },
  whiteCard: {
    paddingHorizontal: 20,
    backgroundColor: 'white',
    elevation: 7,
  },
  iconStart: {
    width: ITINERARY_ICON_WIDTH,
  },
  iconDestination: {
    width: ITINERARY_ICON_WIDTH + 5,
    left: -2.5,
  },
  dashedLine: {
    height: DASHED_HEIGHT,
    width: ITINERARY_ICON_WIDTH,
    alignItems: 'center',
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
  },
  left: {},
  textBold: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  textSizeBig: {
    fontSize: 16,
  },
})
