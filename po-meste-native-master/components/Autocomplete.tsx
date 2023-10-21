import Text from '@components/Text'
import CrossIcon from '@icons/cross.svg'
import MarkerSvg from '@icons/map-pin-marker.svg'
import MhdStopSvg from '@icons/stop-sign.svg'
import { GooglePlaceDataCorrected } from '@types'
import { s } from '@utils/globalStyles'
import { colors, inputSelectionColor } from '@utils/theme'
import Constants from 'expo-constants'
import React, { useState } from 'react'
import {
  Platform,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native'
import {
  GooglePlaceData,
  GooglePlaceDetail,
  GooglePlacesAutocomplete,
  GooglePlacesAutocompleteProps,
  GooglePlacesAutocompleteRef,
} from 'react-native-google-places-autocomplete'

interface AutocompleteProps {
  onGooglePlaceChosen: (
    _data: GooglePlaceDataCorrected,
    details: GooglePlaceDetail | null
  ) => void
  googleInputRef: React.MutableRefObject<GooglePlacesAutocompleteRef | null>
  inputPlaceholder: string
  placeTypeFilter?: string
  selectOnFocus?: boolean
  addToHistory?: (
    data: GooglePlaceDataCorrected,
    detail: GooglePlaceDetail | null
  ) => void
}

const mergeStyles = (a: any, b: any) => {
  const mergedStyles: any = {}
  Object.keys(a).forEach((key) => {
    mergedStyles[key] = { ...a[key], ...b[key] }
  })
  return mergedStyles
}

const Autocomplete = ({
  googleInputRef,
  inputPlaceholder,
  onGooglePlaceChosen,
  placeTypeFilter,
  selectOnFocus = false,
  addToHistory,
  ...rest
}: AutocompleteProps &
  Omit<GooglePlacesAutocompleteProps, 'query' | 'placeholder'>) => {
  const [googleAutocompleteSelection, setGoogleAutocompleteSelection] =
    useState<{ start: number; end?: number } | undefined>(undefined)
  const mergedStyles = rest.styles
    ? mergeStyles(autoCompleteStyles, rest.styles)
    : autoCompleteStyles
  const textInputProps = rest.textInputProps as TextInputProps
  return (
    <GooglePlacesAutocomplete
      renderLeftButton={() => (
        <TouchableOpacity
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 16,
            height: 46,
          }}
          onPress={() => googleInputRef.current?.setAddressText('')}
        >
          <CrossIcon width={20} height={20} fill={colors.mediumGray} />
        </TouchableOpacity>
      )}
      ref={googleInputRef}
      enablePoweredByContainer={false}
      fetchDetails
      placeholder={inputPlaceholder.replace(/ /g, '\u00A0')}
      // "react-native-google-places-autocomplete" version: 2.4.1, wrong typing of GooglePlaceData
      onPress={(data, detail) => {
        onGooglePlaceChosen(data as unknown as GooglePlaceDataCorrected, detail)
        addToHistory &&
          addToHistory(data as unknown as GooglePlaceDataCorrected, detail)
      }}
      query={{
        key: Constants.manifest?.extra?.googlePlacesApiKey,
        language: 'sk',
        location: '48.160170, 17.130256',
        radius: '20788', //20,788 km
        strictbounds: true,
        type: placeTypeFilter,
        components: 'country:sk',
      }}
      renderRow={(result: GooglePlaceData) => {
        // "react-native-google-places-autocomplete" version: 2.4.1, wrong typing of GooglePlaceData
        const correctedResult = result as unknown as GooglePlaceDataCorrected
        const Icon =
          correctedResult.types[0] === 'transit_station'
            ? MhdStopSvg
            : MarkerSvg
        return (
          <View style={styles.searchResultRow}>
            <Icon
              style={styles.searchResultRowIcon}
              fill={colors.lighterGray}
              width={16}
              height={16}
            />
            <Text
              style={styles.searchResultText}
            >{`${correctedResult.description}`}</Text>
          </View>
        )
      }}
      {...rest}
      textInputProps={{
        placeholderTextColor: Platform.select({ ios: colors.gray }),
        selectTextOnFocus: selectOnFocus,
        selectionColor: inputSelectionColor,
        ...rest.textInputProps,
        onBlur: (e) => {
          setGoogleAutocompleteSelection({ start: 0 })
          setTimeout(() => {
            setGoogleAutocompleteSelection(undefined)
          }, 10)
          textInputProps?.onBlur && textInputProps.onBlur(e)
        },
        selection: googleAutocompleteSelection,
        multiline: false,
        numberOfLines: 1,
      }}
      suppressDefaultStyles
      styles={mergedStyles}
    />
  )
}

const styles = StyleSheet.create({
  searchResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 20,
  },
  searchResultRowIcon: {
    marginRight: 5,
  },
  searchResultText: {},
})

export const autoCompleteStyles = {
  container: {
    zIndex: 1,
    flex: 1,
  },
  listView: {
    height: '100%',
  },
  textInput: {
    flexGrow: 1,
    flexBasis: 'auto',
    maxWidth: '90%',
    paddingVertical: 8,
    flexWrap: 'nowrap',
    alignSelf: 'center',
    ...s.textSmall,
    ...s.fontNormal,
  },
  textInputContainer: {
    borderWidth: 2,
    borderRadius: 30,
    borderColor: colors.mediumGray,
    paddingHorizontal: 16,
    letterSpacing: 0.5,
    height: 50,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  row: {
    backgroundColor: '#FFFFFF',
    padding: 13,
    height: 44,
    flexDirection: 'row',
  },
  separator: {
    height: 0.5,
    backgroundColor: '#c8c7cc',
  },
  loader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    height: 20,
  },
}

export default Autocomplete
