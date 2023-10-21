import { colors } from '@utils/theme'
import React, { useState } from 'react'
import { LayoutRectangle, View } from 'react-native'

import Svg, { G, Line as SvgLine } from 'react-native-svg'

type Props = {
  color?: string
  strokeWidth?: number
}

const Line = ({ color = colors.gray, strokeWidth = 2 }: Props) => {
  const [layout, setlayout] = useState<LayoutRectangle>()

  return (
    <View
      style={{ width: strokeWidth, flex: 1 }}
      onLayout={(event) => {
        setlayout(event.nativeEvent.layout)
      }}
    >
      <Svg height="100%" width={strokeWidth}>
        <G>
          <SvgLine
            x1={strokeWidth / 2}
            x2={strokeWidth / 2}
            y1={0}
            y2={layout?.height}
            stroke={color}
            strokeLinecap="round"
            strokeWidth={strokeWidth}
          />
        </G>
      </Svg>
    </View>
  )
}

export default Line
