import React, { useState } from 'react'
import { StyleSheet, TouchableOpacityProps, View } from 'react-native'
import AccordionItem from './AccordionItem'

interface AccorionProps {
  items:
    | {
        header: (isOpen: boolean) => JSX.Element
        body: JSX.Element
      }[]
    | {
        header: (isOpen: boolean) => JSX.Element
        body: JSX.Element
      }
  containerStyle?: TouchableOpacityProps['style']
}

const Accordion = ({ items, containerStyle }: AccorionProps) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const onItemPress = (index: number) => {
    if (activeIndex === index) {
      setActiveIndex(null)
    } else {
      setActiveIndex(index)
    }
  }

  return (
    <View style={styles.container}>
      {Array.isArray(items) ? (
        items.map(({ header, body }, index) => (
          <AccordionItem
            key={index}
            onPress={() => onItemPress(index)}
            isOpen={activeIndex === index}
            header={header}
            body={body}
            containerStyle={containerStyle}
          />
        ))
      ) : (
        <AccordionItem
          key={0}
          onPress={() => onItemPress(0)}
          isOpen={activeIndex === 0}
          header={items.header}
          body={items.body}
          containerStyle={containerStyle}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
})

export default Accordion
