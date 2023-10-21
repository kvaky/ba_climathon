import ErrorView from '@components/ErrorView'
import { LineNumber } from '@components/LineNumber'
import Text from '@components/Text'
import { BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { useNavigation } from '@react-navigation/core'
import React, { useContext } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { useQuery } from 'react-query'

import { LoadingView } from '@components'
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

import MhdStopSignSvg from '@icons/stop-sign.svg'
import i18n from 'i18n-js'

interface TimetablesProps {
  station: MhdStopProps
}

const Timetables = ({ station }: TimetablesProps) => {
  const navigation = useNavigation()
  const globalStateContext = useContext(GlobalStateContext)
  const { data, isLoading, error, refetch } = useQuery(
    ['getMhdStopStatusData', station.id],
    () => getMhdStopStatusData(station.id),
    {
      retry: 0,
    }
  )

  const getVehicleIconStyled = (
    color: string = mhdDefaultColors.grey,
    lineNumber?: string,
    vehicleType?: TransitVehicleType
  ) => {
    const Icon = getVehicle(vehicleType, lineNumber)
    return <Icon width={30} height={30} fill={color} />
  }

  if (!isLoading && error)
    return (
      <ErrorView
        error={error}
        action={refetch}
        styleWrapper={styles.errorWrapper}
        errorMessage={i18n.t('components.ErrorView.errors.dataLineTimetable')}
        plainStyle
      />
    )

  return (
    <>
      <View style={styles.greyBackground}>
        <View style={[styles.firstRow, s.horizontalMargin]}>
          <View style={s.icon}>
            <MhdStopSignSvg fill={colors.primary} />
          </View>
          <Text>{`${station.name} ${
            station.platform ? station.platform : ''
          }`}</Text>
        </View>
      </View>
      <BottomSheetScrollView
        contentContainerStyle={[styles.secondRow, s.horizontalMargin]}
      >
        {isLoading && (
          <LoadingView
            stylesOuter={styles.elevation}
            iconWidth={80}
            iconHeight={80}
          />
        )}
        {data?.allLines?.map((departure, index) => {
          return (
            <TouchableOpacity
              key={index}
              style={styles.lineDeparture}
              onPress={() => {
                globalStateContext.setTimeLineNumber(departure.lineNumber)
                navigation.navigate(
                  'LineTimetableScreen' as never,
                  {
                    lineNumber: departure.lineNumber,
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
                    departure.vehicleType // TODO waits for https://inovaciebratislava.atlassian.net/browse/PLAN-274
                  )}
                </View>
                <LineNumber
                  number={departure.lineNumber}
                  color={departure.lineColor}
                  vehicleType={departure.vehicleType}
                />
                <Text style={[s.blackText, styles.finalStation]}>
                  {departure.usualFinalStop}
                </Text>
              </View>
            </TouchableOpacity>
          )
        })}
      </BottomSheetScrollView>
    </>
  )
}

const styles = StyleSheet.create({
  errorWrapper: {
    marginVertical: 20,
  },
  greyBackground: {
    backgroundColor: colors.lightLightGray,
    paddingVertical: 10,
  },
  firstRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 10,
  },
  secondRow: {
    paddingTop: 10,
  },
  elevation: {
    elevation: 1,
  },
  lineDeparture: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 10,
  },
  departureLeft: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  finalStation: {
    marginLeft: 10,
  },
})

export default Timetables
