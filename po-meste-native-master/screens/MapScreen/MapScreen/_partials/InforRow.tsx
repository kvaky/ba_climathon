import { s } from '@utils/globalStyles'
import { colors } from '@utils/theme'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { SvgProps } from 'react-native-svg'

interface InfoRowProps {
  title: string
  value: string | number
  Icon?: React.FC<SvgProps> | null
}

const InfoRow = ({ title, value, Icon = null }: InfoRowProps) => {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        {Icon && <Icon width={16} height={16} fill={colors.black} />}
      </View>
      <Text style={styles.infoText}>
        {title}
        <Text style={s.boldText}>{value}</Text>
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
  },
  infoIcon: {
    marginRight: 5,
  },
  infoText: {
    ...s.textSmall,
  },
})

export default InfoRow
