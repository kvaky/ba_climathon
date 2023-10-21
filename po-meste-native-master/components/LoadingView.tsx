import React from 'react'
import { StyleSheet, View, StyleProp, ViewStyle } from 'react-native'
import LoadingSvg from '@icons/loading-icon.svg'
import { NumberProp } from 'react-native-svg'

interface UpcomingDeparturesProps {
  fullscreen?: boolean
  stylesOuter?: StyleProp<ViewStyle>
  iconWidth?: NumberProp
  iconHeight?: NumberProp
}

export default function LoadingView({
  fullscreen,
  stylesOuter,
  iconWidth,
  iconHeight,
}: UpcomingDeparturesProps) {
  return (
    <View
      style={[
        styles.map,
        styles.overlayLoading,
        stylesOuter,
        //
        fullscreen && StyleSheet.absoluteFillObject,
      ]}
    >
      {/* TODO add graphics, see comments https://inovaciebratislava.atlassian.net/browse/PLAN-233 */}
      <View style={styles.center}>
        {fullscreen ? (
          <LoadingSvg
            height={iconHeight !== undefined ? iconHeight : '60%'}
            width={iconWidth !== undefined ? iconWidth : '60%'}
          />
        ) : (
          <LoadingSvg
            height={iconHeight !== undefined ? iconHeight : 40}
            width={iconWidth}
          />
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  map: {
    display: 'flex',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  overlayLoading: {
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
})
