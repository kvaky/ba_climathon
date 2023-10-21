import Link from '@components/Link'
import { t } from 'i18n-js'
import React from 'react'
import {
  KeyboardAvoidingView,
  Modal as NativeModal,
  StyleSheet,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from 'react-native'

export type ModalProps = {
  visible?: boolean
  children?: React.ReactNode
  onClose?: () => void
}

export default function Modal({
  visible = true,
  children,
  onClose = () => void 0,
}: ModalProps) {
  const dimensions = useWindowDimensions()
  return (
    <NativeModal
      statusBarTranslucent
      animationType="fade"
      transparent
      visible={visible}
    >
      <KeyboardAvoidingView
        style={styles.modalWrapper}
        behavior="height"
        enabled={dimensions.height < 750}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.modalBackground}></View>
        </TouchableWithoutFeedback>
        <View style={styles.modalCard}>{children}</View>
        <Link
          style={styles.modalDismiss}
          onPress={onClose}
          title={t('common.close')}
        />
      </KeyboardAvoidingView>
    </NativeModal>
  )
}

const styles = StyleSheet.create({
  modalWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  modalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
    opacity: 0.65,
  },
  modalCard: {
    backgroundColor: '#fff',
    width: '100%',
    borderRadius: 10,
    padding: 20,
    maxWidth: '80%',
    marginBottom: 20,
  },
  modalDismiss: {
    textAlign: 'center',
    width: '100%',
    color: 'white',
  },
})
