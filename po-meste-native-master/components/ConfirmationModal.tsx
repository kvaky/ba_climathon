import Text from '@components/Text'
import { s } from '@utils/globalStyles'
import i18n from 'i18n-js'
import React, { useEffect, useState } from 'react'
import { StyleSheet } from 'react-native'
import CheckBox from 'react-native-check-box'

import { colors } from '../utils/theme'
import Button from './Button'
import Checkbox from './Checkbox'
import Markdown from './Markdown'
import Modal from './Modal'

export type ConfirmationModalProps = {
  visible?: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  bodyText?: string
  confirmText?: string
  dismissText?: string
  requiredCheckboxText?: string
}

export default function ConfirmationModal({
  visible = true,
  onClose,
  onConfirm,
  title,
  bodyText,
  confirmText,
  dismissText,
  requiredCheckboxText,
}: ConfirmationModalProps) {
  const [isChecked, setChecked] = useState(false)

  useEffect(() => {
    setChecked(false)
  }, [visible])

  return (
    <Modal visible={visible} onClose={onClose}>
      {title && <Text style={styles.modalTitle}>{title}</Text>}
      {bodyText && <Markdown text={bodyText} style={styles.modalText} />}
      <Text style={[styles.modalText, s.boldText]}>
        {i18n.t('common.doYouWantToContinue')}
      </Text>
      {requiredCheckboxText && (
        <CheckBox
          onClick={() => setChecked(!isChecked)}
          isChecked={isChecked}
          style={styles.modalCheckbox}
          rightTextView={
            <Markdown
              style={styles.modalCheckboxText}
              text={requiredCheckboxText}
            />
          }
          checkedCheckBoxColor={colors.primary}
          uncheckedCheckBoxColor={colors.gray}
          unCheckedImage={<Checkbox />}
          checkedImage={<Checkbox checked />}
        />
      )}
      <Button
        disabled={requiredCheckboxText ? !isChecked : false}
        style={styles.modalButton}
        onPress={onConfirm}
        title={confirmText ?? i18n.t('common.continue')}
      />
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: colors.darkText,
  },
  modalText: {
    marginBottom: 30,
    color: colors.darkText,
  },
  modalCheckbox: {
    marginBottom: 30,
    alignItems: 'flex-start',
  },
  modalCheckboxText: {
    color: colors.darkText,
    marginLeft: 12,
  },
  modalButton: {
    marginBottom: 20,
  },
})
