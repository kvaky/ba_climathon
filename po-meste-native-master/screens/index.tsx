import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { DefaultTheme, NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import i18n from 'i18n-js'
import React from 'react'
import { ColorSchemeName, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { BottomTabParamList, RootStackParamList } from '@types'
import { colors, linking } from '@utils'

import MapScreen from '@screens/MapScreen'
import NotFoundScreen from '@screens/NotFoundScreen'
import SettingsScreen from '@screens/SettingsScreen'
import TicketsScreen from '@screens/TicketsScreen'

import BurgerMenuSvg from '@icons/burger-menu.svg'
import HomeSearchSvg from '@icons/home-search.svg'
import TicketSvg from '@icons/ticket-alt.svg'

import { TabBar } from '@components'
import { PortalHost } from '@gorhom/portal'

const Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'white',
  },
}

const BottomTab = createBottomTabNavigator<BottomTabParamList>()

const BottomTabNavigator = () => {
  return (
    <BottomTab.Navigator
      initialRouteName="Map"
      backBehavior="initialRoute"
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
      }}
    >
      <BottomTab.Screen
        name="Tickets"
        component={TicketsScreen}
        options={{
          title: i18n.t('common.tickets'),
          tabBarIcon: TicketSvg,
        }}
      />
      <BottomTab.Screen
        name="Map"
        options={{
          title: i18n.t('common.searching'),
          tabBarIcon: HomeSearchSvg,
        }}
      >
        {() => (
          <>
            <MapScreen />
            <PortalHost name="MapScreen" />
          </>
        )}
      </BottomTab.Screen>
      <BottomTab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: i18n.t('common.settings'),
          tabBarIcon: BurgerMenuSvg,
        }}
      />
    </BottomTab.Navigator>
  )
}

const Stack = createStackNavigator<RootStackParamList>()

const Navigation = ({ colorScheme }: { colorScheme: ColorSchemeName }) => {
  return (
    <NavigationContainer linking={linking} theme={Theme}>
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <SafeAreaView style={{ flex: 1 }} edges={['right', 'bottom', 'left']}>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Root" component={BottomTabNavigator} />
            <Stack.Screen
              name="NotFound"
              component={NotFoundScreen}
              options={{ title: 'Oops!' }}
            />
          </Stack.Navigator>
        </SafeAreaView>
      </View>
    </NavigationContainer>
  )
}

export default Navigation
