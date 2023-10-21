import Text from '@components/Text'
import { colors } from '@utils/theme'
import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import {
  NavigationState,
  Route,
  SceneRendererProps,
  TabBar,
  TabView as ReactTabView,
  TabViewProps as ReactTabViewProps,
} from 'react-native-tab-view'

export const TAB_BAR_LARGE_HEIGHT = 56
export const TAB_BAR_SMALL_HEIGHT = 34

const renderTabBar = (
  props: SceneRendererProps & { navigationState: NavigationState<Route> },
  variant: 'small' | 'large'
) => {
  return (
    <TabBar
      {...props}
      style={[styles.tabBar, variant === 'large' && { elevation: 0 }]}
      pressColor="rgba(0,0,0,0)"
      pressOpacity={0}
      contentContainerStyle={styles.tabBarContentContainer}
      renderTabBarItem={(props) => {
        const focused =
          props.key ===
          props.navigationState.routes[props.navigationState.index].key
        const index = props.navigationState.routes.findIndex(
          (route) => route.key === props.key
        )
        return (
          <TouchableOpacity
            key={props.key}
            onPress={props.onPress}
            style={[
              styles.tabBarTab,
              variant === 'large' && styles.tabBarTabLarge,
              {
                backgroundColor:
                  variant === 'large' ? colors.lightLightGray : colors.white,
                marginLeft: variant === 'large' && index !== 0 ? 1 : 0,
              },
              focused ? styles.tabBarTabLabelFocused : {},
              variant === 'large'
                ? index === 0
                  ? { borderTopLeftRadius: 0 }
                  : index === props.navigationState.routes.length - 1
                  ? { borderTopRightRadius: 0 }
                  : {}
                : {},
            ]}
          >
            {props.renderLabel &&
              props.renderLabel({
                route: props.route,
                focused,
                color:
                  (focused ? props.activeColor : props.inactiveColor) ??
                  'transparent',
              })}
          </TouchableOpacity>
        )
      }}
      renderLabel={({ route, focused }) => {
        const [title, subtitle] = route.title
          ? route.title.split('|')
          : ['', '']
        return (
          <View style={styles.tabBarTabLabel}>
            <Text
              style={[
                styles.tabBarTabLabelTitle,
                variant === 'large' && styles.tabBarTabLabelTitleLarge,
                focused ? styles.tabBarTabLabelTextFocused : {},
              ]}
            >
              {title}
            </Text>
            {subtitle && (
              <Text
                style={[
                  styles.tabBarTabLabelSubtitle,
                  focused ? styles.tabBarTabLabelTextFocused : {},
                ]}
              >
                {subtitle}
              </Text>
            )}
          </View>
        )
      }}
      renderIndicator={(props) => null}
      indicatorContainerStyle={{
        height: 5,
        top: variant === 'large' ? TAB_BAR_LARGE_HEIGHT : TAB_BAR_SMALL_HEIGHT,
        backgroundColor: colors.primary,
        position: 'absolute',
      }}
    />
  )
}

interface TabViewProps {
  variant: 'small' | 'large'
}

const TabView = ({
  variant,
  ...props
}: ReactTabViewProps<Route> & TabViewProps) => {
  return (
    <ReactTabView
      style={{ zIndex: 0 }}
      {...props}
      renderTabBar={
        props.renderTabBar ?? ((props) => renderTabBar(props, variant))
      }
    />
  )
}

const styles = StyleSheet.create({
  tabBar: {
    shadowOpacity: 0,
    backgroundColor: colors.white,
  },
  tabBarContentContainer: {},
  tabBarTab: {
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    height: TAB_BAR_SMALL_HEIGHT,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    flex: 1,
  },
  tabBarTabLarge: {
    height: TAB_BAR_LARGE_HEIGHT,
  },
  tabBarTabLabel: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBarTabLabelFocused: {
    backgroundColor: colors.primary,
  },
  tabBarTabLabelTitle: {
    textTransform: 'uppercase',
    color: colors.darkText,
    fontSize: 14,
    lineHeight: 16,
  },
  tabBarTabLabelTitleLarge: {
    fontSize: 16,
    lineHeight: 19,
    marginBottom: 2,
    fontWeight: 'bold',
  },
  tabBarTabLabelSubtitle: {
    color: colors.darkText,
    fontSize: 12,
    lineHeight: 14,
  },
  tabBarTabLabelTextFocused: {
    color: 'white',
  },
})

export default TabView
