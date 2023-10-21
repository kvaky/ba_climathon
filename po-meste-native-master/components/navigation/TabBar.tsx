import Text from '@components/Text'
import { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import React from 'react'
import { StyleSheet, TouchableWithoutFeedback, View } from 'react-native'

import Shadow from '@components/Shadow'
import TicketSvg from '@icons/ticket-alt.svg'
import { colors } from '@utils/theme'

export const BOTTOM_TAB_NAVIGATOR_HEIGHT = 55

const TabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  return (
    <Shadow
      outerStyle={styles.tabBarContainer}
      element={(iosContainerAndShadowStyle) => (
        <View style={[iosContainerAndShadowStyle, styles.tabBar]}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key]
            const label = options.title || ''

            const isFocused = state.index === index

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              })

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name)
              }
            }

            return (
              <TouchableWithoutFeedback key={index} onPress={onPress}>
                <View>
                  <TabItem
                    label={label}
                    isFocused={isFocused}
                    IconComponent={
                      (options.tabBarIcon || TicketSvg) as React.FC
                    }
                    iconSize={index === 1 ? 42 : 30}
                    index={index}
                  />
                </View>
              </TouchableWithoutFeedback>
            )
          })}
        </View>
      )}
    />
  )
}

export default TabBar

const TabItem = ({
  label,
  isFocused,
  IconComponent,
  iconSize,
  index,
}: {
  label: string
  isFocused: boolean
  IconComponent: React.FC<{ fill: string; width: number; height: number }>
  iconSize: number
  index: number
}) => {
  return (
    <View style={styles.tabItemWrapper}>
      {index === 1 && (
        <Shadow
          element={(iosContainerAndShadowStyle) => (
            <View style={iosContainerAndShadowStyle} />
          )}
          innerContainerStyle={styles.tabItemShadow}
          customOffset={{ x: 5, y: 0 }}
        />
      )}
      <View style={styles.tabItemBackground} />
      <View style={styles.tabItem}>
        <IconComponent
          width={iconSize}
          height={iconSize}
          fill={isFocused ? colors.primary : colors.mediumGray}
        />
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    height: BOTTOM_TAB_NAVIGATOR_HEIGHT,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    width: '100%',
  },
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  tabItemWrapper: {
    width: 90,
    height: 80,
    position: 'relative',
  },
  tabItemShadow: {
    width: 80,
    height: 80,
    position: 'absolute',
    top: 1,
    left: 5,
    backgroundColor: '#fff',
    borderRadius: 40,
  },
  tabItemBackground: {
    width: 105,
    height: 80,
    position: 'absolute',
    top: 12.5,
    left: -10,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  tabItem: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 16,
    width: 90,
    height: 80,
  },
  label: {
    fontSize: 10,
    color: colors.darkGray,
    lineHeight: 15,
  },
})
