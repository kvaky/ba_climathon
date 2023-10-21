import Text from '@components/Text'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import * as SMS from 'expo-sms'
import i18n from 'i18n-js'
import React, { useEffect, useState } from 'react'
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'

import {
  Button,
  ConfirmationModal,
  ConfirmationModalProps,
  Modal,
} from '@components'
import Markdown from '@components/Markdown'
import LightBulbIcon from '@icons/light-bulb.svg'
import { useNavigation } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import {
  SmsTicketNumbers,
  SmsTicketPrices,
  TicketName,
  TicketsParamList,
} from '@types'
import { colors, presentPrice } from '@utils'

export default function SMSScreen({
  route,
}: StackScreenProps<TicketsParamList, 'SMSScreen'>) {
  const [showHintModal, setShowHintModal] = useState(false)

  const navigation = useNavigation()

  useEffect(() => {
    // Use `setOptions` to update the button that we previously specified
    // Now the button includes an `onPress` handler to update the count
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => setShowHintModal(true)}>
          <View
            style={{
              borderRadius: 20,
              borderColor: colors.mediumGray,
              borderWidth: 2,
              padding: 4,
            }}
          >
            <LightBulbIcon width={22} height={22} fill={colors.mediumGray} />
          </View>
        </TouchableOpacity>
      ),
    })
  }, [navigation])

  async function handleSend(receiverNumber: string) {
    const isAvailable = await SMS.isAvailableAsync()
    if (isAvailable) {
      await SMS.sendSMSAsync(receiverNumber, '.')
    } else {
      Alert.alert('', i18n.t('screens.SMSScreen.smsNotAvailable'), [
        {
          text: i18n.t('screens.SMSScreen.smsOK'),
        },
      ])
    }
  }

  const onModalClose = () => {
    setConfirmationModalVisible(false)
  }

  const onModalConfirm = async (phoneNumber: string) => {
    await handleSend(phoneNumber)
    setConfirmationModalVisible(false)
  }

  const ticketNames: TicketName[] = [
    'ticket40min',
    'ticket70min',
    'ticket24hours',
  ]

  const getTicketButtonTitle = (ticketName: TicketName) => {
    return `${i18n.t(
      `screens.SMSScreen.tickets.${ticketName}.name`
    )} / ${presentPrice(SmsTicketPrices[ticketName])}`
  }

  const ticketNameToBoldMarkdown = (ticketName: string) =>
    `${ticketName.replace(/\*\*/g, '')}**`

  const modalData: { [key in TicketName]: ConfirmationModalProps } = {
    ticket40min: {
      onClose: onModalClose,
      onConfirm: () => onModalConfirm(SmsTicketNumbers.ticket40min),
      bodyText: i18n.t('screens.SMSScreen.smsModal.bodyText', {
        ticketName: ticketNameToBoldMarkdown(
          i18n.t('screens.SMSScreen.tickets.ticket40min.name')
        ),
        price: presentPrice(SmsTicketPrices.ticket40min),
      }),
    },
    ticket70min: {
      onClose: onModalClose,
      onConfirm: () => onModalConfirm(SmsTicketNumbers.ticket70min),
      bodyText: i18n.t('screens.SMSScreen.smsModal.bodyText', {
        ticketName: ticketNameToBoldMarkdown(
          i18n.t('screens.SMSScreen.tickets.ticket70min.name')
        ),
        price: presentPrice(SmsTicketPrices.ticket70min),
      }),
    },
    ticket24hours: {
      onClose: onModalClose,
      onConfirm: () => onModalConfirm(SmsTicketNumbers.ticket24hours),
      bodyText: i18n.t('screens.SMSScreen.smsModal.bodyText', {
        ticketName: ticketNameToBoldMarkdown(
          i18n.t('screens.SMSScreen.tickets.ticket24hours.name')
        ),
        price: presentPrice(SmsTicketPrices.ticket24hours),
      }),
    },
  }

  const [confirmationModalVisible, setConfirmationModalVisible] =
    useState(false)

  const [confirmationModalProps, setConfirmationModalProps] = useState(
    modalData.ticket40min
  )

  const ticketButtonClickHandler = (ticketName: TicketName) => {
    setConfirmationModalProps(modalData[ticketName])
    setConfirmationModalVisible(true)
  }

  return (
    <View style={{ flex: 1, paddingBottom: useBottomTabBarHeight() }}>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollView}
          style={{ height: '100%' }}
        >
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              flex: 1,
            }}
          >
            {ticketNames.map((ticketName, index) => {
              return (
                <View key={index} style={styles.buttonFullWidth}>
                  <Button
                    title={<Markdown text={getTicketButtonTitle(ticketName)} />}
                    onPress={() => ticketButtonClickHandler(ticketName)}
                    isFullWidth
                    size="large"
                    variant={
                      index === 0
                        ? 'secondary'
                        : index === 1
                        ? 'primary'
                        : 'tertiary'
                    }
                  />
                </View>
              )
            })}
          </View>
          <View style={styles.bottomContainer}>
            <Text style={styles.smsInfoText}>
              <Markdown
                text={i18n.t('screens.SMSScreen.ticketDuplicateDescription')}
              />
            </Text>
            <View style={{ marginTop: 30, alignItems: 'center' }}>
              <Button
                title={i18n.t('screens.SMSScreen.ticketDuplicate')}
                onPress={() => handleSend(SmsTicketNumbers.ticketDuplicate)}
                size="small"
                variant="outlined"
              />
            </View>
          </View>
        </ScrollView>
        <ConfirmationModal
          visible={confirmationModalVisible}
          onClose={confirmationModalProps.onClose}
          onConfirm={confirmationModalProps.onConfirm}
          title={i18n.t('screens.SMSScreen.smsModal.title')}
          bodyText={confirmationModalProps.bodyText}
          requiredCheckboxText={i18n.t(
            'screens.SMSScreen.smsModal.checkboxText'
          )}
        />
        <Modal visible={showHintModal} onClose={() => setShowHintModal(false)}>
          <ScrollView contentContainerStyle={styles.hintModal}>
            <View
              style={{
                borderRadius: 30,
                borderColor: colors.primary,
                borderWidth: 3,
                padding: 10,
                marginBottom: 30,
              }}
            >
              <LightBulbIcon width={32} height={32} fill={colors.primary} />
            </View>
            <Text style={styles.smsInfoText}>
              <Markdown
                text={i18n.t('screens.SMSScreen.smsInfo')}
                renderCustomMatchComponent={(text, key) => (
                  <Text
                    style={{
                      color: colors.primary,
                      textDecorationLine: 'underline',
                      top: 3,
                      flexWrap: 'wrap',
                      ...styles.smsInfoText,
                    }}
                    key={key}
                    onPress={() =>
                      Linking.openURL(
                        'https://dpba.blob.core.windows.net/media/Default/Dokumenty/Pre%20cestuj%C3%BAcich/TARIFA%20SMS%2025.05.2018.pdf'
                      )
                    }
                  >
                    {text}
                  </Text>
                )}
              />
            </Text>
          </ScrollView>
        </Modal>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    alignItems: 'center',
    justifyContent: 'space-evenly',
    height: '100%',
    width: '100%',
  },
  smsInfoText: {
    lineHeight: 21,
    fontSize: 14,
    textAlign: 'center',
  },
  buttonFullWidth: {
    flexDirection: 'row',
    marginHorizontal: 20,
    margin: 10,
  },
  hintModal: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  bottomContainer: {
    alignSelf: 'stretch',
    backgroundColor: colors.lightLightGray,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    paddingBottom: 50,
    paddingTop: 30,
    paddingHorizontal: 40,
  },
})
