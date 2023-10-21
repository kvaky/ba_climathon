import Text from '@components/Text'
import { Ionicons } from '@expo/vector-icons'
import WheelchairIcon from '@icons/wheelchair.svg'
import { DateTimeFormatter, Instant, LocalDate } from '@js-joda/core'
import { StackScreenProps } from '@react-navigation/stack'
import i18n, { t } from 'i18n-js'
import _ from 'lodash'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import DateTimePickerModal from 'react-native-modal-datetime-picker'
import { useQuery } from 'react-query'

import { ErrorView, LineNumber, LoadingView } from '@components'
import { MapParamList, TimetableType } from '@types'
import {
  colors,
  getMhdGrafikon,
  getVehicle,
  mhdDefaultColors,
  padTimeToTwoDigits,
  s,
} from '@utils'

import ArrowRight from '@icons/arrow-right.svg'

export default function LineTimetableScreen({
  route,
}: StackScreenProps<MapParamList, 'LineTimetableScreen'>) {
  const [activeTimetable, setActiveTimetable] = useState<TimetableType>(
    TimetableType.workDays
  )
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false)
  const [date, setDate] = useState(LocalDate.now())

  const { stopId, lineNumber } = route.params
  const { data, isLoading, error, refetch } = useQuery(
    ['getGrafikon', stopId, lineNumber, date],
    () => getMhdGrafikon(stopId, lineNumber, date)
  )

  const verticalScrollViewRef = useRef<ScrollView | null>(null)
  const horizontalScrollViewRef = useRef<ScrollView | null>(null)
  const [highlightedMinutePositionX, setHighlightedMinutePositionX] =
    useState<number>(0)
  const [highlightedMinutePositionY, setHighlightedMinutePositionY] =
    useState<number>(0)

  const allAccessible = useMemo(
    // a note is a string with each character representing a timetable note, for wheelchair accessibility the `_` is used
    () => data?.timetable?.every((time) => time.notes?.includes('_')),
    [data]
  )

  const isToday = (d: LocalDate) => d.equals(LocalDate.now())

  const timetableHours = useMemo(
    () =>
      lineNumber.toLowerCase().startsWith('n')
        ? [23, 0, 1, 2, 3, 4]
        : _.range(4, 24).concat(0),
    [lineNumber]
  )

  //scroll to highlighted minute on layout event
  useEffect(() => {
    if (isToday(date))
      setTimeout(() => {
        horizontalScrollViewRef.current?.scrollTo({
          x: highlightedMinutePositionX,
          animated: true,
        })
        verticalScrollViewRef.current?.scrollTo({
          y: highlightedMinutePositionY,
          animated: true,
        })
      }, 500)
  }, [
    highlightedMinutePositionX,
    highlightedMinutePositionY,
    verticalScrollViewRef,
    horizontalScrollViewRef,
    date,
  ])

  const formattedData = useMemo(() => {
    const timetableByHours = _.groupBy(data?.timetable, (value) => {
      return parseInt(value.time.split(':')[0])
    })
    return (
      timetableHours
        // after midnight links is marked '00:24:00'
        .map((hour) => {
          return {
            hour,
            minutes: timetableByHours[hour]
              ? timetableByHours[hour].map((value) => ({
                  minute: value.time.split(':')[1],
                  notes: value.notes,
                }))
              : [],
          }
        })
    )
  }, [data])

  const activeIndex = useMemo(() => {
    const now = new Date().getTime()
    const times = formattedData.reduce(
      (accumulatorHours, hourObject, indexHours) => {
        const timesInHours = hourObject.minutes.reduce(
          (accumulatorMinutes, departureMinute, indexMinutes) => {
            const date = new Date()
            date.setHours(hourObject.hour)
            date.setMinutes(parseInt(departureMinute.minute))
            if (
              accumulatorMinutes[0] > date.getTime() - now &&
              date.getTime() - now > 0
            ) {
              return [date.getTime() - now, indexHours, indexMinutes]
            }
            return accumulatorMinutes
          },
          accumulatorHours
        )
        if (accumulatorHours[0] > timesInHours[0] && timesInHours[0] > 0) {
          return [timesInHours[0], timesInHours[1], timesInHours[2]]
        }
        return accumulatorHours
      },
      [Infinity, Infinity, Infinity]
    )
    return times
  }, [formattedData])

  const handleConfirm = (date: Date) => {
    const utcTimestamp = Instant.parse(date.toISOString()) //'1989-08-16T00:00:00.000Z'
    const localDateTime = LocalDate.ofInstant(utcTimestamp)

    setDate(localDateTime)
    hideDatePicker()
  }

  const showSchedulePicker = () => {
    setDatePickerVisibility(true)
  }

  const hideDatePicker = () => {
    setDatePickerVisibility(false)
  }

  const getVehicleIconStyledFilter = useCallback(() => {
    const Icon = getVehicle(data?.vehicleType, data?.lineNumber)
    return (
      <Icon
        width={24}
        height={24}
        fill={data?.lineColor ? `#${data?.lineColor}` : mhdDefaultColors.grey}
      />
    )
  }, [data])

  const shouldBeMinuteHighlighted = (
    indexHours: number,
    indexMinutes: number
  ) => {
    return (
      activeIndex[1] === indexHours &&
      activeIndex[2] === indexMinutes &&
      isToday(date)
    )
  }

  if (!isLoading && error)
    return (
      <ErrorView
        errorMessage={i18n.t('components.ErrorView.errors.dataLineTimetable')}
        error={error}
        action={refetch}
        plainStyle
      />
    )

  return (
    <View style={s.container}>
      <View style={styles.column}>
        {isLoading && (
          <LoadingView
            fullscreen
            stylesOuter={styles.elevation}
            iconWidth={80}
            iconHeight={80}
          />
        )}
        <View style={styles.headerGrey}>
          <View style={s.horizontalMargin}>
            <View style={styles.header}>
              <View style={s.icon}>{getVehicleIconStyledFilter()}</View>
              <LineNumber number={data?.lineNumber} color={data?.lineColor} />
              <Text style={[styles.startStation, styles.textBold, s.blackText]}>
                {data?.currentStopName}
              </Text>
              <View style={[s.icon, styles.marginHorizontal]}>
                <ArrowRight width={12} height={12} fill={colors.primary} />
              </View>
              <Text style={s.blackText}>{data?.finalStopName}</Text>
            </View>
          </View>
        </View>
        <View style={[s.horizontalMargin, styles.timetableDayType]}>
          <TouchableOpacity onPress={showSchedulePicker}>
            <Text style={styles.schedulingText}>
              {date.format(DateTimeFormatter.ofPattern('dd.MM.'))}
              {LocalDate.now().toString() === date.toString() &&
                `(${i18n.t('common.today')})`}
              {LocalDate.now().toString() === date.minusDays(1).toString() &&
                `(${i18n.t('common.tomorrow')})`}
              <Ionicons
                size={15}
                style={{
                  alignSelf: 'center',
                  color: colors.primary,
                }}
                name="chevron-down"
              />
            </Text>
          </TouchableOpacity>
          {/* <ButtonGroup style={styles.row}> //TODO left for https://inovaciebratislava.atlassian.net/browse/PLAN-293
            {Object.keys(TimetableType).map((key) => {
              return (
                <Button
                  key={key}
                  variant={activeTimetable === key ? 'danger' : 'secondary'}
                  titleStyle={styles.textAlign}
                  onPress={() => {
                    key === TimetableType.workDays &&
                      setActiveTimetable(TimetableType.workDays)
                    key === TimetableType.weekend &&
                      setActiveTimetable(TimetableType.weekend)
                    key === TimetableType.holidays &&
                      setActiveTimetable(TimetableType.holidays)
                  }}
                  title={
                    (key === TimetableType.workDays && i18n.t('common.workDays')) ||
                    (key === TimetableType.weekend && i18n.t('common.weekend')) ||
                    (key === TimetableType.holidays && i18n.t('common.holidays')) ||
                    ''
                  }
                />
              )
            })}
          </ButtonGroup> */}
        </View>
        <ScrollView
          ref={verticalScrollViewRef}
          contentContainerStyle={s.horizontalMargin}
        >
          <ScrollView
            ref={horizontalScrollViewRef}
            horizontal
            contentContainerStyle={styles.flexColumn}
          >
            {timetableHours.map((hour, indexHours) => {
              const dataToShow = formattedData.find(
                (hourDataRow) => hourDataRow.hour === hour
              )
              return (
                <View
                  key={hour}
                  style={[
                    styles.timetableRow,
                    indexHours % 2 === 0 ? styles.headerEven : null,
                  ]}
                  onLayout={(event) =>
                    activeIndex[1] === indexHours &&
                    setHighlightedMinutePositionY(event.nativeEvent.layout.y)
                  }
                >
                  <Text
                    style={[
                      styles.textBold,
                      styles.hourText,
                      indexHours % 2 === 0 ? styles.hourEven : null,
                    ]}
                    onLayout={(event) =>
                      activeIndex[1] === indexHours &&
                      setHighlightedMinutePositionY(event.nativeEvent.layout.y)
                    }
                  >
                    {padTimeToTwoDigits(hour)}
                  </Text>
                  {dataToShow?.minutes.map((minuteData, indexMinutes) => {
                    return (
                      <View
                        key={indexMinutes}
                        style={[
                          styles.minuteContainer,
                          shouldBeMinuteHighlighted(indexHours, indexMinutes)
                            ? styles.highlightedMinuteContainer
                            : null,
                        ]}
                        onLayout={(event) =>
                          shouldBeMinuteHighlighted(indexHours, indexMinutes) &&
                          setHighlightedMinutePositionX(
                            event.nativeEvent.layout.x
                          )
                        }
                      >
                        <Text
                          style={[
                            shouldBeMinuteHighlighted(indexHours, indexMinutes)
                              ? styles.highlightedMinuteText
                              : null,
                            indexHours % 2 === 0 ? styles.hourEven : null,
                            // a note is a string with each character representing a timetable note, for wheelchair accessibility the `_` is used
                            minuteData.notes?.includes('_') &&
                            allAccessible === false
                              ? { textDecorationLine: 'underline' }
                              : null,
                          ]}
                        >
                          {minuteData.minute}
                          {minuteData.notes
                            ? minuteData.notes.replace('_', '')
                            : ''}
                        </Text>
                      </View>
                    )
                  })}
                </View>
              )
            })}
          </ScrollView>
          <View style={{ marginBottom: 100 }}>
            {data?.notes?.map((note) => {
              if (
                note.description === 'wheelchairAccessible' &&
                allAccessible
              ) {
                return (
                  <View
                    key={note.note}
                    style={{ flexDirection: 'row', marginBottom: 5 }}
                  >
                    <View style={{ width: 40 }}>
                      <WheelchairIcon
                        fill={colors.primary}
                        width={24}
                        height={24}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text>
                        {t('screens.LineTimetableScreen.allAccessible')}
                      </Text>
                    </View>
                  </View>
                )
              }
              return (
                <View
                  key={note.note}
                  style={{ flexDirection: 'row', marginBottom: 5 }}
                >
                  {note.description === 'wheelchairAccessible' ? (
                    <Text
                      style={{
                        width: 40,
                        textDecorationColor: colors.primary,
                        textDecorationLine: 'underline',
                      }}
                    >
                      min
                    </Text>
                  ) : (
                    <Text
                      style={{
                        width: 40,
                        color: colors.primary,
                        fontWeight: 'bold',
                      }}
                    >
                      {note.note}
                    </Text>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text>
                      {note.description === 'differentFinalStop'
                        ? t('screens.LineTimetableScreen.differentFinalStop', {
                            value: note.value,
                          })
                        : note.description === 'customSkEn'
                        ? note.value?.split('|')[
                            i18n.currentLocale() === 'sk' ? 0 : 1
                          ]
                        : note.description === 'wheelchairAccessible' &&
                          allAccessible === false
                        ? t('screens.LineTimetableScreen.wheelchairAccessible')
                        : ''}
                    </Text>
                  </View>
                </View>
              )
            })}
          </View>
        </ScrollView>
      </View>
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        display="default"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  column: {
    flex: 1,
  },
  elevation: {
    elevation: 1,
  },
  headerGrey: {
    backgroundColor: colors.lightLightGray,
  },
  headerEven: {
    backgroundColor: colors.secondary,
  },
  hourEven: {
    color: colors.tertiary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13.5,
  },
  timetableDayType: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: 11,
    paddingBottom: 10,
  },
  startStation: {
    marginLeft: 10,
  },
  marginHorizontal: {
    marginHorizontal: 10,
  },
  textBold: {
    fontWeight: 'bold',
  },
  schedulingText: {
    color: colors.primary,
    ...s.textMedium,
  },
  flexColumn: {
    flexDirection: 'column',
    alignItems: 'stretch',
    marginBottom: 25,
    minWidth: '100%',
  },
  timetableRow: {
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    flex: 1,
  },
  hourText: {
    width: 20,
    marginRight: 10,
  },
  minuteContainer: {
    padding: 4,
    borderRadius: 5,
  },
  highlightedMinuteContainer: {
    backgroundColor: colors.primary,
  },
  highlightedMinuteText: {
    color: 'white',
  },
})
