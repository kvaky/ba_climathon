import Text from '@components/Text'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { useNavigation } from '@react-navigation/core'
import Constants from 'expo-constants'
import { openURL } from 'expo-linking'
import { t } from 'i18n-js'
import React, { useContext, useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import CheckBox from 'react-native-check-box'
import { ScrollView } from 'react-native-gesture-handler'

import { Button, ItemListButton, Modal } from '@components'
import { GlobalStateContext } from '@state/GlobalStateProvider'
import { PreferredLanguage } from '@types'
import { colors } from '@utils'

import RadioButton from '@components/RadioButton'
import AboutIcon from '@icons/information.svg'
import LanguageIcon from '@icons/language.svg'
import FAQIcon from '@icons/question.svg'

export const SettingsScreen = () => {
  const privacyPolicyLink = Constants.manifest?.extra?.privacyPolicyLink

  const [isLanguageModalVisible, setLanguageModalVisible] = useState(false)
  const navigation = useNavigation()

  const { preferredLanguage, changePreferredLanguage } =
    useContext(GlobalStateContext)

  const [selectedLangugage, setSelectedLanguage] =
    useState<PreferredLanguage>(preferredLanguage)

  useEffect(() => {
    setSelectedLanguage(preferredLanguage)
  }, [preferredLanguage])

  const onLanguageModalConfirm = () => {
    setLanguageModalVisible(false)
    changePreferredLanguage(selectedLangugage)
  }

  const onLanguageModalCancel = () => {
    setLanguageModalVisible(false)
    setSelectedLanguage(preferredLanguage)
  }

  return (
    <View style={{ flex: 1, paddingBottom: useBottomTabBarHeight() }}>
      <ScrollView>
        <View style={styles.container}>
          <ItemListButton
            icon={LanguageIcon}
            text={t('screens.SettingsScreen.changeLanguage')}
            onPress={() => setLanguageModalVisible(true)}
          />
          <ItemListButton
            icon={AboutIcon}
            text={t('screens.SettingsScreen.aboutApplication')}
            onPress={() => navigation.navigate('AboutScreen' as never)}
          />
          <ItemListButton
            icon={FAQIcon}
            text={t('screens.SettingsScreen.frequentlyAskedQuestions')}
            onPress={() => navigation.navigate('FAQScreen' as never)}
          />
          <ItemListButton
            icon={FAQIcon}
            text={t('common.privacyPolicy')}
            onPress={() => openURL(privacyPolicyLink)}
          />
        </View>
      </ScrollView>
      <Modal visible={isLanguageModalVisible} onClose={onLanguageModalCancel}>
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>
            {t('screens.SettingsScreen.langugageModal.chooseLanguage')}
          </Text>
          <CheckBox
            onClick={() => setSelectedLanguage(PreferredLanguage.en)}
            isChecked={selectedLangugage == PreferredLanguage.en}
            style={styles.modalCheckbox}
            rightText="English"
            rightTextStyle={styles.modalCheckboxText}
            checkedImage={<RadioButton active />}
            unCheckedImage={<RadioButton />}
          />
          <CheckBox
            onClick={() => setSelectedLanguage(PreferredLanguage.sk)}
            isChecked={selectedLangugage == PreferredLanguage.sk}
            style={styles.modalCheckbox}
            rightText="Slovenčina"
            rightTextStyle={styles.modalCheckboxText}
            checkedImage={<RadioButton active />}
            unCheckedImage={<RadioButton />}
          />
          <CheckBox
            onClick={() => setSelectedLanguage(PreferredLanguage.auto)}
            isChecked={selectedLangugage == PreferredLanguage.auto}
            style={styles.modalCheckbox}
            rightText="Auto"
            rightTextStyle={styles.modalCheckboxText}
            checkedImage={<RadioButton active />}
            unCheckedImage={<RadioButton />}
          />
          <Button
            style={styles.modalButton}
            onPress={onLanguageModalConfirm}
            variant="approve"
            title={t('screens.SettingsScreen.langugageModal.confirm')}
          />
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignContent: 'stretch',
    paddingTop: 20,
  },
  modal: {
    paddingVertical: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: colors.darkText,
  },
  modalCheckbox: {
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  modalCheckboxText: {
    color: colors.darkText,
  },
  modalButton: { marginTop: 10 },
})

export default SettingsScreen
