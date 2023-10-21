import Text from '@components/Text'
import ChevronLeftSmall from '@icons/chevron-left-small.svg'
import { useNavigation } from '@react-navigation/core'
import { StackHeaderProps } from '@react-navigation/stack'
import { colors } from '@utils/theme'
import { t } from 'i18n-js'
import React from 'react'
import { StyleSheet, TextStyle, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export interface HeaderProps extends StackHeaderProps {
  onBack?: () => void
  borderShown?: boolean
  titleElement?: (style: TextStyle) => JSX.Element
}

export const NAVIGATION_HEADER_HEIGHT = 56

export const Header = ({
  options,
  route,
  onBack,
  borderShown = true,
  titleElement,
}: HeaderProps) => {
  const navigation = useNavigation()
  const insets = useSafeAreaInsets()

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          height: insets.top + NAVIGATION_HEADER_HEIGHT,
          borderBottomWidth: borderShown ? 5 : 0,
        },
      ]}
    >
      <View style={styles.leftContainer}>
        {!options.headerLeft ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => (onBack ? onBack() : navigation.goBack())}
          >
            <ChevronLeftSmall width={16} height={16} fill={colors.gray} />
          </TouchableOpacity>
        ) : (
          options.headerLeft({})
        )}
      </View>
      <View style={styles.centerContainer}>
        {titleElement ? (
          titleElement(styles.centerText)
        ) : (
          <Text style={styles.centerText}>
            {options.title ?? t(`screens.${route.name}.screenTitle`)}
          </Text>
        )}
      </View>
      <View style={styles.rightContainer}>
        {options.headerRight && options.headerRight({})}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 5,
    borderBottomColor: colors.primary,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  backButton: {
    padding: 15,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  centerContainer: {
    flex: 5,
  },
  centerText: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
    lineHeight: 27,
    color: colors.darkGray,
    letterSpacing: 0.5,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
})

export default Header
