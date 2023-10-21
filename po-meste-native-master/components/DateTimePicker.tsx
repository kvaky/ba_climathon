import Text from '@components/Text'
import { convert, DateTimeFormatter, LocalDateTime } from '@js-joda/core'
import { ScheduleType } from '@types'
import { s } from '@utils/globalStyles'
import { colors } from '@utils/theme'
import i18n from 'i18n-js'
import { range } from 'lodash'
import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import ScrollPickerNative, {
  ScrollHandle,
  ScrollPickerProps as ScrollPickerNativeProps,
} from '../vendor/react-native-wheel-scrollview-picker/ScrollViewPicker'
import Button from './Button'

const formatter = DateTimeFormatter.ofPattern('d.M')
const minutes = range(0, 60, 1).map((value) => (value < 10 ? '0' : '') + value)
const hours = range(0, 24, 1).map((value) => (value < 10 ? '0' : '') + value)

const ScrollPicker = React.forwardRef<ScrollHandle, ScrollPickerNativeProps>(
  (scrollPickerProps: ScrollPickerNativeProps, ref) => {
    return (
      <ScrollPickerNative
        ref={ref}
        style={{ width: 100 }}
        dataSource={scrollPickerProps.dataSource}
        selectedIndex={scrollPickerProps.selectedIndex ?? 1}
        renderItem={(data, index) => (
          <View key={index}>
            <Text style={[{ color: colors.black }, s.textLarge]}>{data}</Text>
          </View>
        )}
        onValueChange={scrollPickerProps.onValueChange}
        wrapperHeight={180}
        wrapperStyle={{
          width: 100,
          height: 180,
          ...scrollPickerProps.wrapperStyle,
        }}
        itemHeight={60}
        scrollViewComponent={ScrollView}
        highlightStyle={{
          backgroundColor: colors.lightLightGray,
          width: 100,
          ...scrollPickerProps.highlightStyle,
        }}
      />
    )
  }
)

interface DateTimePickerProps {
  onConfirm: (date: Date) => void
  onScheduleTypeChange: (scheduleType: ScheduleType) => void
}

interface DateTimePickerHandles {
  setDate: (date: LocalDateTime) => void
}

export type DateTimePickerRef = DateTimePickerProps & DateTimePickerHandles

const DateTimePicker = React.forwardRef<
  DateTimePickerHandles,
  DateTimePickerProps
>(({ onConfirm, onScheduleTypeChange }: DateTimePickerProps, ref) => {
  const [now, setNow] = useState(LocalDateTime.now())
  const [selectedHour, setSelectedHour] = useState<number>(now.hour())
  const [selectedMinute, setSelectedMinute] = useState<number>(now.minute())
  const [selectedDateIndex, setSelectedDateIndex] = useState<number>(7)
  const [scheduleType, setScheduleType] = useState<ScheduleType | 'now'>('now')
  const datePickerRef = useRef<ScrollHandle>(null)
  const hourPickerRef = useRef<ScrollHandle>(null)
  const minutePickerRef = useRef<ScrollHandle>(null)

  useImperativeHandle(ref, () => ({
    setDate: (date) => scrollToDate(date),
  }))

  const days = range(0, 15, 1).map((value) => {
    const date = LocalDateTime.now()
    if (value < 7) return date.minusDays(7 - value).format(formatter)
    if (value === 7) return i18n.t('common.today')
    if (value === 8) return i18n.t('common.tomorrow')
    else return date.plusDays(value - 7).format(formatter)
  })

  useEffect(() => {
    if (scheduleType !== 'now') onScheduleTypeChange(scheduleType)
  }, [scheduleType, onScheduleTypeChange])

  const scrollToDate = useCallback(
    (date: LocalDateTime) => {
      setSelectedHour(date.hour())
      hourPickerRef.current?.scrollTo(date.hour(), false)
      setSelectedMinute(date.minute())
      minutePickerRef.current?.scrollTo(date.minute(), false)
      setSelectedDateIndex(7)
      datePickerRef.current?.scrollTo(7, false)
    },
    [setSelectedHour, setSelectedMinute, setSelectedDateIndex]
  )

  useEffect(() => scrollToDate(LocalDateTime.now()), [scrollToDate])

  const handleConfirm = () => {
    if (scheduleType === 'now') setScheduleType(ScheduleType.departure)
    let adjustedDate = now
    if (selectedDateIndex < 7)
      adjustedDate = now.minusDays(7 - selectedDateIndex)
    if (selectedDateIndex > 7)
      adjustedDate = now.plusDays(selectedDateIndex - 7)
    const selectedDatetime = new Date(
      adjustedDate.year(),
      adjustedDate.monthValue() - 1,
      adjustedDate.dayOfMonth(),
      selectedHour,
      selectedMinute
    )
    onConfirm(selectedDatetime)
  }

  const handleNow = () => {
    const localNow = LocalDateTime.now()
    setScheduleType('now')
    setNow(localNow)
    scrollToDate(localNow)
    onScheduleTypeChange(ScheduleType.departure)
    onConfirm(convert(localNow).toDate())
  }

  return (
    <View style={styles.contentWrapper}>
      <View style={styles.schedulePickerWrapper}>
        <TouchableOpacity onPress={() => handleNow()}>
          <Text
            style={
              scheduleType === 'now'
                ? styles.schedulePickerSelectedButton
                : styles.schedulePickerButton
            }
          >
            {i18n.t('common.now')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            scheduleType !== ScheduleType.departure &&
            setScheduleType(ScheduleType.departure)
          }
        >
          <Text
            style={
              scheduleType === ScheduleType.departure
                ? styles.schedulePickerSelectedButton
                : styles.schedulePickerButton
            }
          >
            {i18n.t('screens.FromToScreen.departureAt')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            scheduleType !== ScheduleType.arrival &&
            setScheduleType(ScheduleType.arrival)
          }
        >
          <Text
            style={
              scheduleType === ScheduleType.arrival
                ? styles.schedulePickerSelectedButton
                : styles.schedulePickerButton
            }
          >
            {i18n.t('screens.FromToScreen.arrivalAt')}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.datetimePickersWrapper}>
        <ScrollPicker
          ref={datePickerRef}
          dataSource={days}
          selectedIndex={selectedDateIndex}
          highlightStyle={{
            borderTopLeftRadius: 16,
            borderBottomLeftRadius: 16,
          }}
          onValueChange={(value, index) => setSelectedDateIndex(index)}
        />
        <ScrollPicker
          ref={hourPickerRef}
          dataSource={hours}
          selectedIndex={selectedHour}
          onValueChange={(value) => setSelectedHour(+value)}
        />
        <ScrollPicker
          ref={minutePickerRef}
          dataSource={minutes}
          selectedIndex={selectedMinute}
          highlightStyle={{
            borderTopRightRadius: 16,
            borderBottomRightRadius: 16,
          }}
          onValueChange={(value) => setSelectedMinute(+value)}
          wrapperStyle={{ right: 1 }}
        />
      </View>
      <View
        style={{
          marginTop: 28,
          paddingHorizontal: 57,
        }}
      >
        <Button title={i18n.t('common.set')} onPress={handleConfirm} />
      </View>
    </View>
  )
})

const styles = StyleSheet.create({
  contentWrapper: {
    flexDirection: 'column',
    padding: 20,
  },
  schedulePickerWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 24,
  },
  schedulePickerSelectedButton: {
    ...s.textSmall,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: colors.black,
    borderBottomColor: colors.primary,
    borderBottomWidth: 2,
    lineHeight: 25,
  },
  schedulePickerButton: {
    ...s.textSmall,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: colors.mediumGray,
    lineHeight: 25,
  },
  datetimePickersWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
})

export default DateTimePicker
