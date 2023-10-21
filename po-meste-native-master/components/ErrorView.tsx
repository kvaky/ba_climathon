import Text from '@components/Text'
import * as Sentry from '@sentry/react-native'
import i18n from 'i18n-js'
import React, { useContext, useEffect, useState } from 'react'
import {
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native'

import CrossIcon from '@icons/cross.svg'
import { GlobalStateContext } from '@state/GlobalStateProvider'
import { isApiError, isNetworkError, isValidationError, s } from '@utils'
import { colors } from '@utils/theme'
import Button from './Button'

interface ErrorViewProps {
  action?: () => unknown
  dismiss?: () => unknown
  isFullscreen?: boolean
  styleWrapper?: StyleProp<ViewStyle>
  plainStyle?: boolean
}

interface ErrorViewPropsError extends ErrorViewProps {
  error?: any
}

interface ErrorViewPropsErrorMessage extends ErrorViewProps {
  errorMessage?: string
}

interface ErrorViewMerged
  extends ErrorViewPropsError,
    ErrorViewPropsErrorMessage {}

const ErrorView = ({
  error,
  errorMessage,
  action,
  dismiss,
  isFullscreen,
  styleWrapper,
  plainStyle = false,
}: ErrorViewMerged) => {
  const netInfo = useContext(GlobalStateContext).netInfo
  const [errorMessageToDisplay, setErrorMessageToDisplay] =
    useState(errorMessage)
  useEffect(() => {
    isNetworkError(error) &&
      !netInfo.isConnected &&
      setErrorMessageToDisplay(
        i18n.t('components.ErrorView.errors.disconnected')
      )
    if (__DEV__) {
      return
    }
    if (isValidationError(error)) {
      Sentry.captureException(error, {
        extra: {
          exceptionType: 'validation error',
          rawData: JSON.stringify(error),
        },
      })
    } else if (isApiError(error)) {
      Sentry.captureException(error, {
        extra: {
          exceptionType: 'api error manual',
          rawData: JSON.stringify(error),
        },
      })
    } else if (isNetworkError(error) && !netInfo.isConnected) {
      Sentry.captureException(error, {
        extra: {
          exceptionType: 'network error',
          rawData: JSON.stringify(error),
        },
      })
    } else if (error) {
      Sentry.captureException(error, {
        extra: {
          exceptionType: 'other error',
          rawData: JSON.stringify(error),
        },
      })
    } else if (errorMessage) {
      Sentry.captureMessage(errorMessage, 'error')
    }
  }, [error, errorMessage, netInfo.isConnected])

  if (isValidationError(error)) {
    // TODO add proper error message
    return <Text>{i18n.t('components.ErrorView.errors.validation')}</Text>
  }

  if (plainStyle) {
    return (
      <View style={[styles.containerPlain, styleWrapper]}>
        <Text style={[styles.error, styles.errorPlain]}>
          {errorMessageToDisplay ||
            (isNetworkError(error)
              ? i18n.t('components.ErrorView.errors.dataGeneric')
              : i18n.t('components.ErrorView.errors.generic'))}
        </Text>
        {(!isNetworkError(error) || netInfo.isConnected) && action && (
          <Button
            title={i18n.t('components.ErrorView.errorViewActionText')}
            size="small"
            variant="outlined"
            onPress={() => action()}
            style={[styles.action, { flex: 0 }]}
          />
        )}
      </View>
    )
  }

  return (
    <View
      style={[
        styles.wrapper,
        styleWrapper,
        isFullscreen ? styles.fullscreen : null,
      ]}
    >
      <View style={styles.container}>
        <View style={styles.firstRow}>
          <Text style={styles.error}>
            {errorMessageToDisplay ||
              (isNetworkError(error)
                ? i18n.t('components.ErrorView.errors.dataGeneric')
                : i18n.t('components.ErrorView.errors.generic'))}
          </Text>
          <TouchableOpacity onPress={dismiss} style={styles.dismiss}>
            <CrossIcon
              width={20}
              height={20}
              fill={colors.tertiary}
              strokeWidth={5}
            />
          </TouchableOpacity>
        </View>
        {(!isNetworkError(error) || netInfo.isConnected) && action && (
          <Button
            title={i18n.t('components.ErrorView.errorViewActionText')}
            size="small"
            variant="outlined"
            onPress={() => action()}
            style={styles.action}
          />
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  fullscreen: {
    flexGrow: 1,
  },
  wrapper: {
    marginVertical: 20,
    justifyContent: 'center',
    width: '100%',
  },
  container: {
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginHorizontal: 16,
    alignItems: 'center',
    backgroundColor: colors.secondary,
    elevation: 7,
    ...s.shadow,
  },
  containerPlain: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  firstRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  error: {
    flex: 1,
    textAlign: 'left',
    ...s.fontWeightMedium,
    ...s.textMedium,
    lineHeight: 24,
  },
  errorPlain: {
    flex: 0,
    textAlign: 'center',
  },
  dismiss: {
    padding: 10,
    top: -10,
    right: -10,
    flex: 0,
  },
  action: {
    marginTop: 20,
  },
})

export default ErrorView
