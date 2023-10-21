import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'

import { SettingsParamList } from '@types'
import { Header } from '@components'

import SettingsScreen from './SettingsScreen'
import AboutScreen from './AboutScreen'
import FAQScreen from './FAQScreen'

const Stack = createStackNavigator<SettingsParamList>()

export const SettingsScreenNavigation = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        header: (props) => <Header {...props} />,
      }}
    >
      <Stack.Screen
        name="SettingsScreen"
        component={SettingsScreen}
        options={{ headerLeft: () => null }}
      />
      <Stack.Screen name="AboutScreen" component={AboutScreen} />
      <Stack.Screen name="FAQScreen" component={FAQScreen} />
    </Stack.Navigator>
  )
}

export default SettingsScreenNavigation
