import React from 'react'
import { TextProps } from 'react-native'
import Text from './Text'

interface MarkdownProps extends TextProps {
  text: string
  renderCustomMatchComponent?: (
    text: string,
    key: string | number
  ) => JSX.Element
}

/** A very simple Markdown capable of only parsing **{}** double-asterix as bold text */
const Markdown = ({
  text,
  renderCustomMatchComponent,
  ...rest
}: MarkdownProps) => {
  //a-zA-Z0-9áäčďéíĺľňóôŕšťúýžÁÄČĎÉÍĹĽŇÓÔŔŠŤÚÝŽ€
  const regex = new RegExp(
    /([\s]|^)(\*\*[^\s*][^*\n]+[^\s*]\*\*|__[^\s_][^*]+[^\s_]__)([ !?.;,])/gu
  )
  const split = text.split(regex)
  return (
    <Text {...rest}>
      {split.map((t, index) => {
        if (t === null) return null
        if (t.startsWith('**')) {
          return (
            <Text key={index} style={{ fontWeight: 'bold' }}>
              {t.replace(/\*\*/g, '')}
            </Text>
          )
        }
        if (t.startsWith('__')) {
          if (renderCustomMatchComponent)
            return renderCustomMatchComponent(t.replace(/__/g, ''), index)
        }
        return <Text key={index}>{t}</Text>
      })}
    </Text>
  )
}

export default Markdown
