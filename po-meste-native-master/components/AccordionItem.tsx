import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  Animated,
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from 'react-native'

import { colors } from '@utils/theme'

interface AccorionItemProps {
  isOpen?: boolean
  onPress?: () => void
  body: JSX.Element
  header: (isOpen: boolean) => JSX.Element
  containerStyle?: TouchableOpacityProps['style']
}

const AccordionItem = ({
  isOpen = false,
  onPress,
  body,
  header,
  containerStyle,
}: AccorionItemProps) => {
  const [maxHeight, setMaxHeight] = useState(0)

  const animation = useRef(new Animated.Value(0)).current

  const playOpenAnimation = useCallback(() => {
    Animated.timing(animation, {
      useNativeDriver: false,
      toValue: maxHeight,
      duration: 200,
    }).start()
  }, [animation, maxHeight])

  const playCloseAnimation = useCallback(() => {
    Animated.timing(animation, {
      useNativeDriver: false,
      toValue: 0,
      duration: 200,
    }).start()
  }, [animation])

  useEffect(() => {
    if (isOpen) {
      playOpenAnimation()
    } else playCloseAnimation()
  }, [isOpen, playOpenAnimation, playCloseAnimation])

  return (
    <TouchableOpacity
      onPress={onPress}
      style={containerStyle ?? styles.container}
    >
      {header(isOpen)}
      <Animated.View style={{ height: animation }}>
        <View
          style={styles.bodyContainer}
          onLayout={(event) => setMaxHeight(event.nativeEvent.layout.height)}
        >
          {body}
        </View>
      </Animated.View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.secondary,
    borderRadius: 8,
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 20,
    overflow: 'hidden',
  },
  bodyContainer: {
    position: 'absolute',
  },
})

export default AccordionItem
