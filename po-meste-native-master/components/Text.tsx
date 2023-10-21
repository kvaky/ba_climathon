import React from 'react'
import {
  Falsy,
  RecursiveArray,
  RegisteredStyle,
  Text as NativeText,
  TextProps as NativeTextProps,
  TextStyle,
} from 'react-native'

interface TextProps extends NativeTextProps {
  variant?: 'tiny' | 'small' | 'medium' | 'large' | 'xlarge'
}

type NotRegisteredStyle = Exclude<
  TextProps['style'],
  | RegisteredStyle<TextStyle>
  | Falsy
  | RecursiveArray<Falsy | TextStyle | RegisteredStyle<TextStyle>>
>

const findFontWeight = (
  style: TextProps['style']
): 'normal' | 'medium' | 'bold' => {
  if (!style) return 'normal'
  let fontWeight = ''
  if (Array.isArray(style)) {
    fontWeight =
      (
        style.find(
          (s) =>
            s &&
            typeof s === 'object' &&
            !Array.isArray(s) &&
            !!(s as TextStyle)?.fontWeight
        ) as TextStyle
      )?.fontWeight ?? 'normal'
  } else if (typeof style === 'object') {
    fontWeight = style.fontWeight ?? 'normal'
  } else return 'normal'
  if (fontWeight === '500') return 'medium'
  return ['bold', '600', '700', '800', '900'].includes(fontWeight)
    ? 'bold'
    : 'normal'
}

const Text = ({ style, ...props }: TextProps) => {
  const fontWeight = findFontWeight(style)
  let fontFamily = 'work-sans'
  switch (fontWeight) {
    case 'medium':
      fontFamily = 'work-sans-medium'
      break
    case 'bold':
      fontFamily = 'work-sans-bold'
      break
  }
  return (
    <NativeText
      {...props}
      style={[
        {
          fontFamily,
        },
        style,
        {
          fontWeight: 'normal',
        },
      ]}
    ></NativeText>
  )
}

export default Text
