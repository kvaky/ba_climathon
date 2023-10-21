import i18n from 'i18n-js'
import React from 'react'
import { StyleSheet, useWindowDimensions, View } from 'react-native'
import { Route, SceneRendererProps } from 'react-native-tab-view'

import { MhdStopProps } from '@utils'

import TabView from '@components/TabView'
import Timetables from './_partials/Timetables'
import UpcomingDepartures from './_partials/UpcomingDepartures'

interface StationMhdInfoProps {
  station: MhdStopProps
}

enum Routes {
  upcomingDepartures = 'upcomingDepartures',
  timetables = 'timetables',
}

const StationMhdInfo = ({ station }: StationMhdInfoProps) => {
  const layout = useWindowDimensions()
  const [index, setIndex] = React.useState(0)
  const routes = [
    {
      key: Routes.upcomingDepartures,
      title: i18n.t('screens.MapScreen.upcomingDepartures'),
    },
    { key: Routes.timetables, title: i18n.t('screens.MapScreen.timetables') },
  ]

  const renderScene = ({
    route,
  }: SceneRendererProps & {
    route: Route
  }) => {
    switch (route.key) {
      case Routes.upcomingDepartures:
        return <UpcomingDepartures station={station} />
      case Routes.timetables:
        return <Timetables station={station} />
    }
  }

  return (
    <View style={styles.container}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        variant="small"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
  },
})

export default StationMhdInfo
