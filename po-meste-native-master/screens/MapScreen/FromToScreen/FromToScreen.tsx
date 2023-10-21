import { StackScreenProps } from '@react-navigation/stack'
import i18n from 'i18n-js'
import React from 'react'
import { StyleSheet, useWindowDimensions, View } from 'react-native'

import { colors } from '@utils'

import { MapParamList } from '@types'

import TabView from '@components/TabView'
import { Route, SceneRendererProps } from 'react-native-tab-view'
import Planner from './_partials/Planner'
import SearchMhd from './_partials/SearchMhd'

enum Routes {
  planner = 'planner',
  linesAndStops = 'linesAndStops',
}

export default function FromToScreen({
  route,
}: StackScreenProps<MapParamList, 'FromToScreen'>) {
  const layout = useWindowDimensions()
  const [index, setIndex] = React.useState(0)

  // // For load time checking
  // useEffect(() => {
  //   const start = new Date()
  //   InteractionManager.runAfterInteractions(() => {
  //     const end = new Date()
  //     console.log(
  //       `FromToScreen rendered in ${end.getTime() - start.getTime()}ms`
  //     )
  //   })
  // }, [])

  const routes = [
    {
      key: Routes.planner,
      title: `${i18n.t('screens.FromToScreen.plannerTitle')}|${i18n.t(
        'screens.FromToScreen.plannerSubtitle'
      )}`,
    },
    {
      key: Routes.linesAndStops,
      title: `${i18n.t('screens.FromToScreen.linesAndStopsTitle')}|${i18n.t(
        'screens.FromToScreen.linesAndStopsSubtitle'
      )}`,
    },
  ]

  const mainRoute = route || {}

  const renderScene = ({
    route,
  }: SceneRendererProps & {
    route: Route
  }) => {
    switch (route.key) {
      case Routes.planner:
        return (
          <Planner from={mainRoute?.params?.from} to={mainRoute?.params?.to} />
        )
      case Routes.linesAndStops:
        return <SearchMhd />
    }
  }

  return (
    <View style={styles.container}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        variant="large"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'center',
    backgroundColor: colors.lightLightGray,
    height: '100%',
    paddingBottom: 55,
  },
})
