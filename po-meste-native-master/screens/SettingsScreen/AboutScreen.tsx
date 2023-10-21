import Text from '@components/Text'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import Constants from 'expo-constants'
import { openURL } from 'expo-linking'
import { t } from 'i18n-js'
import React from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'

import { Link, ScreenFooter } from '@components'
import { colors } from '@utils'

import AppLogo from '@images/app-logo.svg'
import EuropeanUnionLogo from '@images/european-union-logo.svg'
import InovationBratislavaLogo from '@images/inovation-bratislava-logo.svg'

export const AboutScreen = () => {
  const contactEmailAddress = Constants.manifest?.extra?.contactEmailAddress
  const privacyPolicyLink = Constants.manifest?.extra?.privacyPolicyLink
  const generalTermsAndConditionsLink =
    Constants.manifest?.extra?.generalTermsAndConditionsLink

  return (
    <View style={{ flex: 1, paddingBottom: useBottomTabBarHeight() }}>
      <ScrollView>
        <View style={styles.bodyContainer}>
          <View style={styles.logoContainer}>
            <AppLogo width={96} height={96} />
          </View>
          <Text style={styles.versionText}>
            {t('screens.AboutScreen.version')}{' '}
            {Constants.manifest?.version || t('screens.AboutScreen.unknown')}
          </Text>
          <Text style={styles.appName}>
            {Constants.manifest?.name || 'Po meste'}
          </Text>
          <Text style={styles.description}>
            {t('screens.AboutScreen.description')}
          </Text>
        </View>
        <ScreenFooter>
          <View style={styles.footerContainer}>
            <Text style={styles.footerLabel}>
              {t('screens.AboutScreen.contact')}
            </Text>
            <Link
              style={styles.footerLink}
              onPress={() => {
                openURL(`mailto:${contactEmailAddress}`)
              }}
              title={contactEmailAddress}
            />
            <Link
              style={styles.footerLink}
              onPress={() => openURL(generalTermsAndConditionsLink)}
              title={t('screens.AboutScreen.generalTermsAndConditions')}
            />
            <Link
              style={styles.footerLink}
              onPress={() => openURL(privacyPolicyLink)}
              title={t('common.privacyPolicy')}
            />
            <Text style={styles.footerLabel}>
              {t('screens.AboutScreen.createdBy')}
            </Text>
            <View style={styles.poweredByContainer}>
              <View style={styles.poweredByItem}>
                <InovationBratislavaLogo width={48} height={48} />
                <Text style={styles.poweredByItemText}>
                  {t('screens.AboutScreen.inovationsBratislava')}
                </Text>
              </View>
              <View style={styles.poweredByItem}>
                <EuropeanUnionLogo width={64} height={48} />
                <Text style={[styles.poweredByItemText, { color: '#003193' }]}>
                  {t('screens.AboutScreen.coFundedByTheEuropeanUnion')}
                </Text>
              </View>
            </View>
          </View>
        </ScreenFooter>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  bodyContainer: {
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  logoContainer: {
    padding: 5,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: 'black',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 5 },
    textShadowRadius: 12,
    marginBottom: 10,
  },
  versionText: {
    fontSize: 12,
    marginBottom: 40,
    textAlign: 'center',
  },
  appName: {
    fontWeight: 'bold',
    fontSize: 24,
    marginBottom: 30,
    textAlign: 'center',
  },
  description: {
    marginBottom: 40,
    textAlign: 'center',
  },
  footerContainer: {
    alignItems: 'center',
  },
  footerLabel: {
    marginBottom: 5,
  },
  footerLink: {
    color: colors.primary,
    marginBottom: 20,
  },
  poweredByContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    fontFamily: 'Open sans',
  },
  poweredByItem: {
    maxWidth: 120,
    alignItems: 'center',
    margin: 10,
  },
  poweredByItemText: {
    textAlign: 'center',
    marginTop: 5,
  },
})

export default AboutScreen
