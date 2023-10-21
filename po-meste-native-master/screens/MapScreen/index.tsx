import { createStackNavigator, StackHeaderProps } from '@react-navigation/stack'
import i18n from 'i18n-js'
import React, { useContext } from 'react'

import FeedbackScreen from '@screens/FeedbackScreen'
import ChooseLocationScreen from '@screens/MapScreen/ChooseLocationScreen'
import FromToScreen from '@screens/MapScreen/FromToScreen'
import LineTimelineScreen from '@screens/MapScreen/LineTimelineScreen'
import LineTimetableScreen from '@screens/MapScreen/LineTimetableScreen'
import MapScreen from '@screens/MapScreen/MapScreen'
import PlannerScreen from '@screens/MapScreen/PlannerScreen'
import { MapParamList } from '@types'

import { Header } from '@components'
import Text from '@components/Text'
import ArrowRightSvg from '@icons/arrow-right.svg'
import { GlobalStateContext } from '@state/GlobalStateProvider'
import { s } from '@utils/globalStyles'
import { colors } from '@utils/theme'
import { getShortAddress } from '@utils/utils'
import { View } from 'react-native'

const MapStack = createStackNavigator<MapParamList>()

const MapScreenNavigation = () => {
  const globalstateContext = useContext(GlobalStateContext)
  return (
    <MapStack.Navigator
      screenOptions={{
        header: (props) => <Header {...props} />,
      }}
    >
      <MapStack.Screen
        name="MapScreen"
        component={MapScreen}
        options={{ headerShown: false }}
      />
      <MapStack.Screen
        name="FromToScreen"
        component={FromToScreen}
        options={{
          header: (props) => <Header {...props} borderShown={false} />,
        }}
      />
      <MapStack.Screen
        name="PlannerScreen"
        component={PlannerScreen}
        options={{
          header: plannerScreenHeader,
        }}
      />
      <MapStack.Screen
        name="LineTimelineScreen"
        component={LineTimelineScreen}
        options={{
          title: i18n.t('screens.LineTimelineScreen.screenTitle', {
            lineNumber: globalstateContext.timeLineNumber,
          }),
        }}
      />
      <MapStack.Screen
        name="LineTimetableScreen"
        component={LineTimetableScreen}
        options={{
          title: i18n.t('screens.LineTimetableScreen.screenTitle', {
            lineNumber: globalstateContext.timeLineNumber,
          }),
        }}
      />
      <MapStack.Screen
        name="ChooseLocationScreen"
        component={ChooseLocationScreen}
      />
      <MapStack.Screen name="FeedbackScreen" component={FeedbackScreen} />
    </MapStack.Navigator>
  )
}

const plannerScreenHeader = (props: StackHeaderProps) => {
  /* eslint-disable-next-line react/prop-types */
  const params = props.route?.params as MapParamList['PlannerScreen']
  return (
    <Header
      {...props}
      borderShown={false}
      titleElement={
        params
          ? (style) => (
              <Text
                style={{
                  ...style,
                  flexDirection: 'row',
                  ...s.textSmall,
                }}
              >
                <Text>
                  {params.fromPlace && getShortAddress(params.fromPlace)}
                </Text>
                <View style={{ paddingHorizontal: 11 }}>
                  <ArrowRightSvg fill={colors.primary} width={14} height={14} />
                </View>
                <Text>{params.toPlace && getShortAddress(params.toPlace)}</Text>
              </Text>
            )
          : undefined
      }
    />
  )
}

export default MapScreenNavigation
