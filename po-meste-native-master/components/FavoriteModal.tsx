import Text from '@components/Text'
import EditSvg from '@icons/edit-pencil.svg'
import HeartSvg from '@icons/favorite.svg'
import HomeSvg from '@icons/home.svg'
import StopSignSvg from '@icons/stop-sign.svg'
import TrashcanSvg from '@icons/trashcan.svg'
import WorkSvg from '@icons/work.svg'
import { FavoritePlace, FavoriteStop, GooglePlaceDataCorrected } from '@types'
import { s } from '@utils/globalStyles'
import { colors, inputSelectionColor } from '@utils/theme'
import { isFavoritePlace } from '@utils/utils'
import i18n from 'i18n-js'
import React, { useEffect, useRef, useState } from 'react'
import {
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import {
  GooglePlaceDetail,
  GooglePlacesAutocompleteRef,
} from 'react-native-google-places-autocomplete'
import uuid from 'react-native-uuid'
import Autocomplete from './Autocomplete'
import Button from './Button'
import Modal from './Modal'

export interface FavoriteModalProps {
  type: 'place' | 'stop'
  onClose: () => void
  onConfirm?: (
    place?: FavoritePlace | FavoriteStop,
    oldStop?: FavoriteStop
  ) => void
  onDelete?: (place: FavoritePlace | FavoriteStop | undefined) => void
  favorite?: FavoritePlace | FavoriteStop
}

const FavoriteModal = ({
  type,
  onConfirm,
  onDelete,
  onClose,
  favorite,
}: FavoriteModalProps) => {
  const nameInputRef = useRef<TextInput>(null)
  const googleInputRef = useRef<GooglePlacesAutocompleteRef>(null)
  const [googlePlace, setGooglePlace] = useState<
    | { data: GooglePlaceDataCorrected; detail: GooglePlaceDetail | null }
    | undefined
  >(undefined)
  const [favoriteName, setFavoriteName] = useState('')
  const [isEditingName, setIsEditingName] = useState(
    isFavoritePlace(favorite) && favorite.name ? false : true
  )
  const [isEditingAddress, setIsEditingAddress] = useState(
    favorite ? false : true
  )

  const isPlace = isFavoritePlace(favorite) || type === 'place'
  const iconData = isFavoritePlace(favorite) ? favorite.icon : undefined
  const Icon = isPlace
    ? iconData
      ? iconData === 'home'
        ? HomeSvg
        : iconData === 'work'
        ? WorkSvg
        : HeartSvg
      : HeartSvg
    : StopSignSvg

  // useEffect(() => {
  //   if (isFavoritePlace(favorite)) {
  //     setFavoriteName(favorite.name)
  //   }
  //   if (googleInputRef.current && favorite?.place?.data) {
  //     googleInputRef.current.setAddressText(favorite.place.data.description)
  //     setGooglePlace({
  //       data: favorite.place.data,
  //       detail: favorite.place.detail,
  //     })
  //   }
  // }, [favorite])

  useEffect(() => {
    if (isEditingName) nameInputRef.current?.focus()
  }, [isEditingName])

  useEffect(() => {
    if (isEditingAddress) googleInputRef.current?.focus()
  }, [isEditingAddress])

  const handleSave = () => {
    if (!onConfirm) {
      onClose()
      return
    }
    if (isPlace) {
      if (isFavoritePlace(favorite)) {
        const updatedFavoritePlace: FavoritePlace = { ...favorite }
        if (googlePlace) {
          updatedFavoritePlace.place = googlePlace
        }
        if (!updatedFavoritePlace.isHardSetName) {
          updatedFavoritePlace.name = favoriteName
        }
        onConfirm(updatedFavoritePlace)
      } else {
        const newFavoritePlace: FavoritePlace = {
          id: uuid.v4().toString(),
          name: favoriteName,
          place: googlePlace,
        }
        onConfirm(newFavoritePlace)
      }
    } else {
      if (favorite) {
        const updatedFavoriteStop: FavoriteStop = { ...favorite }
        if (googlePlace) {
          updatedFavoriteStop.place = googlePlace
        }
        onConfirm(updatedFavoriteStop, { ...favorite })
      } else {
        const newFavoriteStop: FavoriteStop = { place: googlePlace }
        onConfirm(newFavoriteStop)
      }
    }
    onClose()
  }

  const handleDelete = () => {
    if (onDelete) onDelete(favorite)
    onClose()
  }

  return (
    <Modal onClose={onClose}>
      <View style={[styles.modal, { height: isPlace ? 360 : 290 }]}>
        <View style={{ alignItems: 'center' }}>
          <View style={styles.iconWrapper}>
            <Icon width={30} height={30} fill={colors.primary} />
          </View>
        </View>
        {isPlace &&
          (isFavoritePlace(favorite) && favorite.isHardSetName ? (
            <Text
              style={[
                s.boldText,
                {
                  alignSelf: 'center',
                  marginBottom: 30,
                  fontSize: 22,
                  lineHeight: 33,
                },
              ]}
            >
              {favorite.id === 'home'
                ? i18n.t('screens.SearchFromToScreen.FavoriteModal.home')
                : favorite.id === 'work'
                ? i18n.t('screens.SearchFromToScreen.FavoriteModal.work')
                : favorite.name}
            </Text>
          ) : (
            <View style={styles.inputWrapper}>
              <TextInput
                ref={nameInputRef}
                style={styles.input}
                placeholder={
                  isFavoritePlace(favorite)
                    ? favorite.name
                    : i18n.t(
                        'screens.SearchFromToScreen.FavoriteModal.namePlaceholder'
                      )
                }
                onChangeText={(text) => setFavoriteName(text)}
                selectionColor={inputSelectionColor}
                onBlur={() => {
                  if (
                    !favoriteName ||
                    (isFavoritePlace(favorite) &&
                      favoriteName === favorite.name)
                  ) {
                    setIsEditingName(false)
                    nameInputRef.current?.clear()
                  }
                }}
                placeholderTextColor={Platform.select({ ios: colors.gray })}
                onFocus={() => setIsEditingName(true)}
                multiline={false}
              />
              {!isEditingName && (
                <View style={styles.editButtonContainer}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => setIsEditingName(true)}
                  >
                    <EditSvg width={24} height={24} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        <View style={styles.googleFrom}>
          <Autocomplete
            onGooglePlaceChosen={(data, detail) => {
              const place = { data, detail }
              setGooglePlace(place)
              if (
                place &&
                favorite &&
                place.data.place_id === favorite.place?.data.place_id
              )
                setIsEditingAddress(false)
            }}
            inputPlaceholder={
              favorite?.place
                ? favorite.place?.data.description
                : type === 'place'
                ? i18n.t(
                    'screens.SearchFromToScreen.FavoriteModal.addressPlaceholder'
                  )
                : i18n.t(
                    'screens.SearchFromToScreen.FavoriteModal.stopPlaceholder'
                  )
            }
            renderLeftButton={undefined}
            googleInputRef={googleInputRef}
            placeTypeFilter={type === 'stop' ? 'transit_station' : undefined}
            styles={{
              textInputContainer: {
                borderRadius: 10,
                paddingLeft: 15,
                paddingRight: isEditingAddress ? 0 : 5,
              },
              textInput: {
                flex: 0.9,
              },
            }}
            renderRightButton={() =>
              !isEditingAddress ? (
                <TouchableOpacity
                  style={{
                    alignSelf: 'center',
                    padding: 10,
                    flexBasis: 44,
                    flex: 0,
                  }}
                  onPress={() => {
                    setIsEditingAddress(true)
                  }}
                >
                  <EditSvg width={24} height={24} />
                </TouchableOpacity>
              ) : (
                <View />
              )
            }
            textInputProps={{
              onFocus: () => setIsEditingAddress(true),
              onBlur: () => {
                if (
                  !googlePlace ||
                  googlePlace?.data.place_id === favorite?.place?.data.place_id
                ) {
                  setIsEditingAddress(false)
                  googleInputRef.current?.clear()
                } else if (googlePlace) {
                  googleInputRef.current?.setAddressText(
                    googlePlace.data.description
                  )
                }
              },
            }}
          />
        </View>
        <View style={{ flexGrow: 1 }} />
        <View
          style={[
            styles.buttonsContainer,
            { justifyContent: onDelete ? 'space-between' : 'center' },
          ]}
        >
          {onDelete && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete()}
            >
              <TrashcanSvg width={24} height={24} />
            </TouchableOpacity>
          )}
          {onConfirm && (
            <Button
              style={[styles.button, { maxWidth: onDelete ? undefined : 166 }]}
              variant="approve"
              size="small"
              title={i18n.t('common.save')}
              onPress={() => handleSave()}
              disabled={
                isPlace && isFavoritePlace(favorite)
                  ? ((favorite.isHardSetName && !favoriteName) ||
                      favoriteName === favorite.name) &&
                    (!googlePlace ||
                      googlePlace.data.place_id ===
                        favorite.place?.data.place_id)
                  : !googlePlace ||
                    googlePlace.data.place_id === favorite?.place?.data.place_id
              }
            />
          )}
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modal: {
    minHeight: 290,
    paddingVertical: 32,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  inputWrapper: {
    display: 'flex',
    borderWidth: 2,
    borderColor: colors.mediumGray,
    height: 50,
    borderRadius: 10,
    paddingLeft: 15,
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    marginBottom: 15,
  },
  input: {
    letterSpacing: 0.5,
    flex: 1,
    paddingVertical: 8,
    alignSelf: 'flex-start',
    ...s.textSmall,
    ...s.fontNormal,
  },
  editButtonContainer: {
    justifyContent: 'center',
  },
  editButton: {
    zIndex: 2,
    padding: 10,
    paddingRight: 15,
    borderTopRightRadius: 30,
    borderBottomRightRadius: 30,
  },
  googleFrom: {
    flexDirection: 'row',
    marginBottom: 30,
    zIndex: 1,
  },
  button: { flexGrow: 1 },
  iconWrapper: {
    backgroundColor: colors.lightLightGray,
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  buttonsContainer: {
    display: 'flex',
    flexDirection: 'row',
  },
  deleteButton: {
    borderRadius: 20,
    marginRight: 30,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
    backgroundColor: colors.secondary,
  },
})

export default FavoriteModal
