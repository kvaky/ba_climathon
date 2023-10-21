import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'

import { Header } from '@components'
import { TicketsParamList } from '@types'

import { useNavigation } from '@react-navigation/native'
import SMSScreen from './SMSScreen'

const Stack = createStackNavigator<TicketsParamList>()

export const TicketsScreenNavigation = () => {
  const navigation = useNavigation()
  return (
    <Stack.Navigator
      screenOptions={{
        header: (props) => <Header {...props} />,
      }}
    >
      <Stack.Screen
        name="SMSScreen"
        component={SMSScreen}
        options={{
          headerLeft: () => null,
        }}
      />
    </Stack.Navigator>
  )
}

export default TicketsScreenNavigation
