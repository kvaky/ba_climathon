import Text from '@components/Text'
import { useNavigation } from '@react-navigation/native'
import Constants from 'expo-constants'
import i18n from 'i18n-js'
import React, { useContext, useState } from 'react'
import {
  KeyboardAvoidingView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import { ScrollView, TextInput } from 'react-native-gesture-handler'

import { Button } from '@components'
import { GlobalStateContext } from '@state/GlobalStateProvider'
import { colors } from '@utils/theme'

import CrossIcon from '@icons/cross.svg'
import ThumbDown from '@icons/thumb-down.svg'

const FeedbackScreen = () => {
  const [feedbackText, setFeedbackText] = useState('')

  const { isFeedbackSent, setFeedbackSent } = useContext(GlobalStateContext)

  const navigation = useNavigation()

  const handleFeedbackSent = () => {
    setFeedbackSent(true)
  }

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.container}>
      {!isFeedbackSent ? (
        <ScrollView contentContainerStyle={styles.scroolView}>
          <TouchableOpacity
            onPress={navigation.goBack}
            style={styles.closeButton}
          >
            <CrossIcon
              style={styles.icon}
              width={16}
              height={16}
              fill={c.closeButtonIcon}
            />
          </TouchableOpacity>
          <ThumbDown style={styles.icon} width={48} height={48} fill={c.icon} />
          <View>
            <Text style={styles.title}>
              {i18n.t('screens.feedbackScreen.title')}
            </Text>
            <Text style={styles.text}>
              {i18n.t('screens.feedbackScreen.text')}
            </Text>
          </View>
          <TextInput
            style={styles.textArea}
            multiline
            onChangeText={(text) => setFeedbackText(text)}
            placeholder={i18n.t('screens.feedbackScreen.textAreaPlaceholder')}
          />
          <Button
            style={styles.button}
            onPress={handleFeedbackSent}
            title={i18n.t('common.send')}
            disabled={!feedbackText.length}
          />
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.scroolView}>
          <TouchableOpacity
            onPress={navigation.goBack}
            style={styles.closeButton}
          >
            <CrossIcon
              style={styles.icon}
              width={16}
              height={16}
              fill={c.closeButtonIcon}
            />
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>{i18n.t('common.thankYou')}!</Text>
            <Text style={styles.text}>
              {i18n.t('screens.feedbackScreen.thankYouText')}
            </Text>
          </View>
          <Button
            style={styles.button}
            onPress={navigation.goBack}
            title={i18n.t('screens.feedbackScreen.backToSearch')}
          />
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  )
}

const c = {
  closeButtonIcon: 'gray',
  icon: colors.primary,
  title: colors.primary,
  text: colors.darkText,
  textAreaText: colors.lightGray,
  textAreaBorder: colors.lightGray,
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    paddingTop: Constants.statusBarHeight,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 10,
    padding: 10,
  },
  scroolView: {
    position: 'relative',
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    minHeight: 450,
    marginBottom: 50,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    color: c.title,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  text: {
    color: c.text,
    textAlign: 'center',
    marginBottom: 30,
  },
  textArea: {
    width: '100%',
    height: 128,
    borderWidth: 1,
    borderRadius: 3,
    borderColor: c.textAreaBorder,
    marginBottom: 30,
    padding: 10,
  },
  button: {
    width: '80%',
  },
})

export default FeedbackScreen
