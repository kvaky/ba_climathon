import Text from '@components/Text'
import { BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { useNavigation } from '@react-navigation/native'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { useQuery } from 'react-query'

import { Duration, LocalDateTime } from '@js-joda/core'

import {
  BOTTOM_VEHICLE_BAR_HEIGHT_ALL,
  ErrorView,
  LineNumber,
  LoadingView,
} from '@components'
import { GlobalStateContext } from '@state/GlobalStateProvider'
import { TransitVehicleType } from '@types'
import {
  colors,
  getMhdStopStatusData,
  getVehicle,
  mhdDefaultColors,
  MhdStopProps,
  s,
} from '@utils'

import LineFilterTile from '@components/LineFilterTile'
import ForwardMhdStopSvg from '@icons/forward-mhd-stop.svg'
import IsLiveSvg from '@icons/is-live.svg'
import MhdStopSignSvg from '@icons/stop-sign.svg'

interface UpcomingDeparturesProps {
  station: MhdStopProps
}
const UpcomingDepartures = ({ station }: UpcomingDeparturesProps) => {
  const navigation = useNavigation()
  const globalstateContext = useContext(GlobalStateContext)

  const { data, isLoading, error, refetch } = useQuery(
    ['getMhdStopStatusData', station.id],
    () => getMhdStopStatusData(station.id),
    {
      retry: 0,
    }
  )

  const [filtersLineNumber, setFiltersLineNumber] = useState<string[]>([])
  const [allLineNumbers, setAllLineNumbers] = useState<string[]>([])

  useEffect(() => {
    const interval = setInterval(() => refetch(), 10000)
    return () => {
      clearInterval(interval)
    }
  }, [refetch])

  const getVehicleIconStyled = (
    color: string = mhdDefaultColors.grey,
    lineNumber: string,
    vehicleType?: TransitVehicleType
  ) => {
    const Icon = getVehicle(vehicleType, lineNumber)
    return <Icon height={27} width={27} fill={color} />
  }

  useEffect(() => {
    if (data?.allLines) {
      const uniqueLineNumbers = [
        ...new Set(data?.allLines?.map((line) => line.lineNumber)),
      ]
      setAllLineNumbers(uniqueLineNumbers)
      setFiltersLineNumber(uniqueLineNumbers)
    }
  }, [data])

  const applyFilter = useCallback(
    (lineNumber: string) => {
      const index = filtersLineNumber.indexOf(lineNumber)
      if (index > -1) {
        if (
          allLineNumbers &&
          filtersLineNumber.length === allLineNumbers.length
        ) {
          setFiltersLineNumber([lineNumber])
        } else if (filtersLineNumber.length === 1 && allLineNumbers) {
          setFiltersLineNumber(allLineNumbers)
        } else {
          setFiltersLineNumber((oldFilters) =>
            oldFilters.filter((value) => value !== lineNumber)
          )
        }
      } else {
        setFiltersLineNumber((oldFilters) => oldFilters.concat(lineNumber))
      }
    },
    [allLineNumbers, filtersLineNumber]
  )

  if (!isLoading && error)
    return (
      <ErrorView
        error={error}
        action={refetch}
        styleWrapper={styles.errorWrapper}
        plainStyle
      />
    )

  return (
    <View style={styles.column}>
      <View style={styles.header}>
        <View style={[styles.firstRow, s.horizontalMargin]}>
          <View style={styles.start}>
            <View style={s.icon}>
              <MhdStopSignSvg fill={colors.primary} />
            </View>
            <Text style={s.boldText}>
              {station.name}
              {station.platform && (
                <Text style={{ color: colors.primary, fontWeight: 'bold' }}>
                  {` ${station.platform}`}
                </Text>
              )}
            </Text>
          </View>
          <View style={styles.forward}>
            <TouchableOpacity
              style={styles.navigateToIcon}
              onPress={() =>
                navigation.navigate(
                  'FromToScreen' as never,
                  {
                    from: {
                      name: station.name,
                      latitude: parseFloat(station.gpsLat),
                      longitude: parseFloat(station.gpsLon),
                    },
                  } as never
                )
              }
            >
              <ForwardMhdStopSvg fill={colors.primary} height={20} width={20} />
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView horizontal contentContainerStyle={styles.secondRow}>
          {/*filtering unique line numbers*/}
          {data?.allLines
            ?.filter(
              (value, index, self) =>
                self.findIndex(
                  (departure) => departure.lineNumber === value.lineNumber
                ) === index
            )
            .map((departure, index) => {
              const isActive = filtersLineNumber.includes(departure.lineNumber)
              return (
                <LineFilterTile
                  key={index}
                  departure={departure}
                  index={index}
                  isActive={isActive}
                  onPress={() => applyFilter(departure.lineNumber)}
                />
              )
            })}
        </ScrollView>
      </View>
      <BottomSheetScrollView
        contentContainerStyle={[
          styles.scrollingVehiclesData,
          styles.contentWrapper,
          s.horizontalMargin,
        ]}
      >
        {isLoading && (
          <LoadingView
            stylesOuter={styles.elevation}
            iconWidth={80}
            iconHeight={80}
          />
        )}
        {data?.departures
          ?.filter((departure) =>
            filtersLineNumber.includes(departure.lineNumber)
          )
          ?.map((departure, index) => {
            const diffMinutesDelay = Duration.between(
              LocalDateTime.now(),
              departure.delay
                ? LocalDateTime.parse(
                    `${departure.date}T${departure.time}`
                  ).plusSeconds(departure.delay)
                : LocalDateTime.parse(`${departure.date}T${departure.time}`)
            ).toMinutes()
            return (
              <TouchableOpacity
                key={index}
                style={styles.lineDeparture}
                onPress={() => {
                  globalstateContext.setTimeLineNumber(departure.lineNumber)
                  navigation.navigate(
                    'LineTimelineScreen' as never,
                    {
                      tripId: departure.tripId,
                      stopId: station.id,
                    } as never
                  )
                }}
              >
                <View style={styles.departureLeft}>
                  <View key={index} style={s.icon}>
                    {getVehicleIconStyled(
                      departure?.lineColor
                        ? `#${departure?.lineColor}`
                        : undefined,
                      departure.lineNumber,
                      departure.vehicleType
                    )}
                  </View>
                  <LineNumber
                    number={departure.lineNumber}
                    color={departure.lineColor}
                    vehicleType={departure.vehicleType}
                  />
                  <Text style={[s.blackText, styles.finalStation]}>
                    {departure.finalStopName}
                  </Text>
                </View>
                <View style={styles.departureRight}>
                  {departure.isLive && <IsLiveSvg fill={colors.brightGreen} />}
                  <Text>
                    {diffMinutesDelay >= 1
                      ? `${diffMinutesDelay} min`
                      : '<1 min'}
                  </Text>
                </View>
              </TouchableOpacity>
            )
          })}
      </BottomSheetScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  errorWrapper: {
    marginVertical: 20,
  },
  column: {
    flex: 1,
    paddingBottom: 5,
  },
  elevation: {
    elevation: 1,
  },
  firstRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
  },
  header: {
    backgroundColor: colors.lightLightGray,
    paddingVertical: 10,
  },
  secondRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  contentWrapper: {
    paddingBottom: BOTTOM_VEHICLE_BAR_HEIGHT_ALL,
  },
  scrollingVehiclesData: {
    paddingVertical: 5,
  },
  lineDeparture: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  departureLeft: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  departureRight: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  finalStation: {
    marginLeft: 10,
  },
  start: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  navigateToIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
  },
  forward: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 25,
    elevation: 5,
  },
})

export default UpcomingDepartures
