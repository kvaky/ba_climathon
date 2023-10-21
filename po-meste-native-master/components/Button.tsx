// TODO copied from different project, might need cleanup if we're to use it
import Text from '@components/Text'
import React, { ReactElement, useState } from 'react'
import {
  GestureResponderEvent,
  StyleProp,
  StyleSheet,
  TextStyle,
  TouchableHighlight,
  View,
  ViewStyle,
} from 'react-native'
import { colors } from '../utils/theme'

const styles = StyleSheet.create({
  touchable: {
    borderRadius: 1000,
    borderWidth: 2,
  },
  touchableFullWidth: {
    flex: 1,
  },
  touchableGrouped: {
    marginLeft: 16,
  },
  touchableGroupedSmall: {
    marginLeft: 8,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    overflow: 'hidden',
  },
  // eslint-disable-next-line react-native/no-unused-styles
  small: {
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 20,
  },
  // eslint-disable-next-line react-native/no-unused-styles
  medium: {
    height: 50,
    borderRadius: 25,
    paddingHorizontal: 25,
  },
  // eslint-disable-next-line react-native/no-unused-styles
  large: {
    height: 60,
    borderRadius: 30,
    paddingHorizontal: 30,
  },
  // eslint-disable-next-line react-native/no-unused-styles
  iconSpacing: {
    marginRight: 4,
  },
  // eslint-disable-next-line react-native/no-unused-styles
  lottieView: {
    height: 15,
  },
})

const COLORS = {
  backgroundColor: {
    primary: colors.primary,
    secondary: colors.secondary,
    tertiary: colors.tertiary,
    outlined: 'transparent',
    approve: colors.green,
    danger: colors.error,
  },
  disabledBackgroundColor: {
    primary: colors.gray,
    secondary: colors.gray,
    tertiary: colors.gray,
    outlined: colors.white,
    approve: colors.gray,
    danger: colors.gray,
  },
  iconColor: {
    primary: colors.white,
    secondary: colors.secondary,
    tertiary: colors.lightText,
    outlined: colors.white,
    approve: colors.white,
    danger: colors.white,
  },
  textColor: {
    primary: colors.white,
    secondary: colors.tertiary,
    tertiary: colors.white,
    outlined: colors.tertiary,
    approve: colors.white,
    danger: colors.white,
  },
  disabledTextColor: {
    primary: colors.white,
    secondary: colors.white,
    tertiary: colors.white,
    outlined: colors.gray,
    approve: colors.white,
    danger: colors.white,
  },
  borderColor: {
    primary: 'transparent',
    secondary: 'transparent',
    tertiary: 'transparent',
    outlined: colors.tertiary,
    approve: 'transparent',
    danger: 'transparent',
  },
  disabledBorderColor: {
    primary: 'transparent',
    secondary: 'transparent',
    tertiary: 'transparent',
    outlined: colors.gray,
    approve: 'transparent',
    danger: 'transparent',
  },
}

type FontWeightType =
  | 'normal'
  | 'bold'
  | '100'
  | '200'
  | '300'
  | '400'
  | '500'
  | '600'
  | '700'
  | '800'
  | '900'

const FONT_WEIGHT: { [key: string]: FontWeightType } = {
  primary: 'bold',
  approve: 'bold',
  secondary: 'bold',
  tertiary: 'bold',
  outlined: 'bold',
  danger: 'bold',
}

const FONT_SIZE: { [key: string]: number } = {
  small: 14,
  medium: 16,
  large: 22,
}

interface ButtonProps {
  onPress: (event: GestureResponderEvent) => void
  title?: string | JSX.Element
  // icon?: IconName
  isGrouped?: boolean
  isFullWidth?: boolean
  variant?:
    | 'primary'
    | 'approve'
    | 'secondary'
    | 'tertiary'
    | 'outlined'
    | 'danger'
  size?: 'small' | 'medium' | 'large'
  style?: StyleProp<ViewStyle>
  contentStyle?: StyleProp<ViewStyle>
  titleStyle?: StyleProp<TextStyle>
  disabled?: boolean
  loading?: boolean
  testID?: string
  icon?: ReactElement
  iconRight?: boolean
}

const Button = ({
  title,
  onPress,
  variant = 'primary',
  isGrouped,
  isFullWidth,
  size = 'medium',
  disabled,
  style,
  contentStyle,
  titleStyle,
  loading,
  testID,
  icon,
  iconRight,
}: ButtonProps) => {
  const showDisabledStyle = disabled && !loading
  const [isPressed, setIsPressed] = useState(false)
  const renderText = (text: string | JSX.Element) => (
    <Text
      style={[
        {
          color: disabled
            ? COLORS.disabledTextColor[variant]
            : COLORS.textColor[variant],
          fontWeight: FONT_WEIGHT[variant],
          fontSize: FONT_SIZE[size],
        },
        titleStyle,
      ]}
    >
      {text}
    </Text>
  )

  return (
    <TouchableHighlight
      onPress={onPress}
      onShowUnderlay={() => setIsPressed(true)}
      onHideUnderlay={() => setIsPressed(false)}
      underlayColor="#000"
      disabled={disabled || loading}
      style={[
        styles.touchable,
        isGrouped && styles.touchableGrouped,
        isGrouped && size === 'small' && styles.touchableGroupedSmall,
        isFullWidth && styles.touchableFullWidth,
        {
          borderColor: showDisabledStyle
            ? COLORS.disabledBorderColor[variant]
            : isPressed
            ? 'transparent'
            : COLORS.borderColor[variant],
        },
        style,
      ]}
      testID={testID}
    >
      <View
        style={[
          styles.container,
          styles[size],
          {
            backgroundColor:
              isPressed && variant === 'outlined'
                ? colors.secondary
                : showDisabledStyle
                ? COLORS.disabledBackgroundColor[variant]
                : COLORS.backgroundColor[variant],
          },
          contentStyle,
        ]}
      >
        {!iconRight && icon}
        {loading ? (
          renderText('Loading...')
        ) : (
          <>{!!title && renderText(title)}</>
        )}
        {iconRight && icon}
      </View>
    </TouchableHighlight>
  )
}

export default Button
