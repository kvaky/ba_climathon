import Text from '@components/Text'
import ChevronRightSmall from '@icons/chevron-right-small.svg'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import Constants from 'expo-constants'
import { openURL } from 'expo-linking'
import { t } from 'i18n-js'
import React from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'

import { Accordion, Link } from '@components'
import { colors } from '@utils'

export const FAQScreen = () => {
  const contactEmailAddress = Constants.manifest?.extra?.contactEmailAddress

  const questions = new Array(2).fill(null).map((question, index) => {
    return {
      header: (isOpen: boolean) => (
        <View style={styles.accordionHeader}>
          <Text>
            {t(`screens.FAQScreen.questions.question${index + 1}.question`)}
          </Text>
          <ChevronRightSmall
            width={16}
            height={16}
            fill={colors.tertiary}
            style={[
              { transform: [{ rotate: isOpen ? '270deg' : '90deg' }] },
              styles.arrow,
            ]}
          />
        </View>
      ),
      body: (
        <View style={{ marginTop: 20 }}>
          <Text>
            {t(`screens.FAQScreen.questions.question${index + 1}.answer`)}
          </Text>
        </View>
      ),
    }
  })

  return (
    <View style={{ flex: 1, paddingBottom: useBottomTabBarHeight() }}>
      <ScrollView
        style={{ height: '100%' }}
        contentContainerStyle={styles.bodyContainer}
      >
        <Accordion items={questions} />
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>
            {t('screens.FAQScreen.footerText')}
          </Text>
          <Link
            style={styles.link}
            onPress={() => openURL(`mailto:${contactEmailAddress}`)}
            title={contactEmailAddress}
          />
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  bodyContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 40,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerContainer: {
    alignItems: 'center',
    paddingBottom: 55,
  },
  footerText: {
    textAlign: 'center',
    marginTop: 20,
  },
  link: {
    color: colors.primary,
  },
  arrow: { backgroundColor: colors.secondary },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
})

export default FAQScreen
