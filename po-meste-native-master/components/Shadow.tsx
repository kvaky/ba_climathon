import { s } from '@utils/globalStyles'
import React from 'react'
import { Platform, ViewProps } from 'react-native'
import { Shadow as NativeShadow } from 'react-native-shadow-2'

interface ShadowProps {
  element: (iosContainerAndShadowStyle?: ViewProps['style']) => JSX.Element
  outerStyle?: ViewProps['style']
  customOffset?: { x: number; y: number }
  innerContainerStyle?: ViewProps['style']
}

const Shadow = ({
  element,
  outerStyle,
  customOffset,
  innerContainerStyle,
}: ShadowProps) => {
  if (Platform.OS === 'android') {
    return (
      <NativeShadow
        startColor={`rgba(0,0,0,${0.1})`}
        offset={customOffset ? [customOffset.x, customOffset.y] : [0, 0]}
        distance={s.shadow.shadowRadius}
        style={innerContainerStyle}
        containerStyle={outerStyle}
      >
        {element()}
      </NativeShadow>
    )
  } else {
    return element([s.shadow, outerStyle, innerContainerStyle])
  }
}

// shadow: {
//   shadowColor: '#000',
//   shadowOffset: { width: 0, height: 2 },
//   shadowRadius: 5,
//   shadowOpacity: 0.2,
// },

export default Shadow
