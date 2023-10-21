import { colors } from '@utils/theme'
import React, { useEffect, useState } from 'react'
import { View, LayoutRectangle } from 'react-native'

import Svg, { G, Line } from 'react-native-svg'

type Props = {
  color?: string
  strokeWidth?: number
  dashLength?: number
  spacing?: number
}

const DashedLine = ({
  color = colors.gray,
  strokeWidth = 2,
  dashLength = 6,
  spacing = 2,
}: Props) => {
  const [layout, setlayout] = useState<LayoutRectangle>()
  // TODO think it through
  const [dashes, setDashes] = useState<null[]>([])

  useEffect(() => {
    if (layout) {
      setDashes(
        new Array(Math.floor(layout.height / (dashLength + spacing))).fill(null)
      )
    }
  }, [layout, dashLength, spacing])

  return (
    <View
      style={{ width: strokeWidth, flex: 1 }}
      onLayout={(event) => {
        setlayout(event.nativeEvent.layout)
      }}
    >
      <Svg height={layout?.height ? layout?.height : 15} width={strokeWidth}>
        <G>
          {dashes.map((_, index) => (
            <Line
              key={index}
              x1={strokeWidth / 2}
              x2={strokeWidth / 2}
              y1={index * dashLength + index * spacing + 3}
              y2={index * dashLength + index * spacing + 3 + dashLength}
              stroke={color}
              strokeLinecap="round"
              strokeWidth={strokeWidth}
            />
          ))}
        </G>
      </Svg>
    </View>
  )
}

export default DashedLine
