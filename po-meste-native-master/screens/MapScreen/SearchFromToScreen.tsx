import Text from '@components/Text'
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet'
import i18n from 'i18n-js'
import React, {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useEffect,
  useState,
} from 'react'
import { Keyboard, StyleSheet, TouchableOpacity, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import {
  GooglePlaceDetail,
  GooglePlacesAutocompleteRef,
} from 'react-native-google-places-autocomplete'

import LocationSvg from '@icons/current-location.svg'
import MapSvg from '@icons/map.svg'

import { colors, FAVORITE_DATA_INDEX, isFavoritePlace, s, STYLES } from '@utils'

import Autocomplete from '@components/Autocomplete'
import FavoriteModal, { FavoriteModalProps } from '@components/FavoriteModal'
import FavoriteTile, { AddStopFavoriteTile } from '@components/FavoriteTile'
import { BOTTOM_TAB_NAVIGATOR_HEIGHT } from '@components/navigation/TabBar'
import CrossIcon from '@icons/cross.svg'
import HistorySvg from '@icons/history-search.svg'
import PlaceSvg from '@icons/map-pin-marker.svg'
import PlusButtonSvg from '@icons/plus.svg'
import StopSignSvg from '@icons/stop-sign.svg'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  FavoriteData,
  FavoriteItem,
  FavoriteStop,
  GooglePlace,
  GooglePlaceDataCorrected,
} from '@types'
import produce from 'immer'
import { omit } from 'lodash'
import { Shadow as NativeShadow } from 'react-native-shadow-2'

interface SearchFromToScreen {
  sheetRef: MutableRefObject<BottomSheet | null>
  getMyLocation?: (reask?: boolean) => void
  onGooglePlaceChosen: (
    _data: GooglePlaceDataCorrected,
    detail: GooglePlaceDetail | null
  ) => void
  googleInputRef: React.MutableRefObject<GooglePlacesAutocompleteRef | null>
  setLocationFromMap: () => void
  inputPlaceholder: string
  initialSnapIndex: number
  favoriteData: FavoriteData
  setFavoriteData: Dispatch<SetStateAction<FavoriteData>>
}

type ModalPropsOmitOnClose<T = FavoriteModalProps> = Omit<T, 'onClose'>

export default function SearchFromToScreen({
  sheetRef,
  getMyLocation,
  onGooglePlaceChosen,
  googleInputRef,
  setLocationFromMap,
  inputPlaceholder,
  initialSnapIndex,
  favoriteData,
  setFavoriteData,
}: SearchFromToScreen) {
  useEffect(() => {
    if (getMyLocation) {
      getMyLocation()
    }
  }, [getMyLocation])

  const [modal, setModal] = useState<ModalPropsOmitOnClose | undefined>(
    undefined
  )

  const saveFavoriteData = (data: FavoriteData) => {
    if (favoriteData) {
      AsyncStorage.setItem(FAVORITE_DATA_INDEX, JSON.stringify(data))
    }
  }

  const updateFavoriteData = (data: FavoriteData) => {
    setFavoriteData(data)
    saveFavoriteData(data)
  }

  const renderAddButton = (onPress: () => void) => (
    <NativeShadow
      startColor="rgba(255,255,255,0.9)"
      endColor="rgba(255,255,255,0.0)"
      offset={[10, 0]}
      distance={30}
      containerStyle={styles.addButtonWrapper}
    >
      <View style={{ padding: 17 }}>
        <TouchableOpacity style={styles.addButton} onPress={onPress}>
          <PlusButtonSvg width={30} height={30} />
        </TouchableOpacity>
      </View>
    </NativeShadow>
  )

  const handleFavoritePress = (favoriteItem: FavoriteItem) => {
    if (favoriteItem.place?.data && favoriteItem.place.detail) {
      onGooglePlaceChosen(favoriteItem.place.data, favoriteItem.place.detail)
      return
    }
    if (isFavoritePlace(favoriteItem))
      setModal({
        type: 'place',
        favorite: favoriteItem,
        onConfirm: addOrUpdatePlace,
        onDelete: !favoriteItem.isHardSetName ? deleteFavorite : undefined,
      })
  }

  const addOrUpdatePlace = (favoritePlace?: FavoriteItem) => {
    if (!favoritePlace || !isFavoritePlace(favoritePlace)) return
    //2 huge attributes which we do not need to store
    const cleanedFavoritePlace = produce(favoritePlace, (draft) => {
      if (draft.place?.detail) {
        delete (draft.place.detail as any).photos
        delete (draft.place.detail as any).reviews
      }
    })
    const newFavoriteData = produce(favoriteData, (draftFavoriteData) => {
      const matchingPlaceIndex = draftFavoriteData.favoritePlaces.findIndex(
        (value) => value.id === favoritePlace.id
      )
      if (matchingPlaceIndex === -1) {
        draftFavoriteData.favoritePlaces.push(cleanedFavoritePlace)
      } else {
        draftFavoriteData.favoritePlaces[matchingPlaceIndex] = {
          ...draftFavoriteData.favoritePlaces[matchingPlaceIndex],
          ...cleanedFavoritePlace,
        }
      }
    })
    updateFavoriteData(newFavoriteData)
  }

  const addOrUpdateStop = (stop?: FavoriteStop, oldStop?: FavoriteStop) => {
    if (!stop) return
    const cleanedStop = produce(stop, (draft) => {
      if (draft.place?.detail) {
        delete (draft.place.detail as any).photos
        delete (draft.place.detail as any).reviews
      }
    })
    const newFavoriteData = produce(favoriteData, (draftFavoriteData) => {
      if (oldStop) {
        const oldStopIndex = draftFavoriteData.favoriteStops.findIndex(
          (favoriteStop) =>
            favoriteStop.place?.data.place_id === oldStop.place?.data.place_id
        )
        if (oldStopIndex >= 0) {
          draftFavoriteData.favoriteStops[oldStopIndex] = cleanedStop
        }
      } else {
        draftFavoriteData.favoriteStops.push(cleanedStop)
      }
    })
    updateFavoriteData(newFavoriteData)
  }

  const deleteFavorite = (favorite?: FavoriteItem) => {
    if (!favorite) return
    if (isFavoritePlace(favorite)) {
      if (favorite.isHardSetName) return
      const updatedFavoritePlaces = favoriteData.favoritePlaces.filter(
        (value) => value.id !== favorite.id
      )
      const newFavoriteData: FavoriteData = {
        ...favoriteData,
        favoritePlaces: updatedFavoritePlaces,
      }
      updateFavoriteData(newFavoriteData)
    } else {
      const updatedFavoriteStops = favoriteData.favoriteStops.filter(
        (value) =>
          value.place?.data?.place_id !== favorite.place?.data?.place_id
      )
      const newFavoriteData: FavoriteData = {
        ...favoriteData,
        favoriteStops: updatedFavoriteStops,
      }
      updateFavoriteData(newFavoriteData)
    }
  }

  const addToHistory = (
    data: GooglePlaceDataCorrected,
    detail: GooglePlaceDetail | null
  ) => {
    const newHistory = favoriteData.history.filter(
      (item) => item.data.place_id !== data.place_id
    )
    const historyLenght = newHistory.unshift({
      data,
      detail: omit(detail, ['photos', 'reviews']) as any,
    })
    if (historyLenght > 15) newHistory.pop()
    const newFavoriteData: FavoriteData = {
      ...favoriteData,
      history: newHistory,
    }
    updateFavoriteData(newFavoriteData)
  }

  const deleteFromHistory = (place: GooglePlace) => {
    const newHistory = favoriteData.history.filter(
      (item) => item.data.place_id !== place.data.place_id
    )
    const newFavoriteData: FavoriteData = {
      ...favoriteData,
      history: newHistory,
    }
    updateFavoriteData(newFavoriteData)
  }

  return (
    <BottomSheet
      ref={sheetRef}
      index={initialSnapIndex}
      snapPoints={['95%']}
      enablePanDownToClose
      handleIndicatorStyle={s.handleStyle}
      onClose={() => {
        googleInputRef?.current?.blur()
        Keyboard.dismiss()
      }}
    >
      <View style={{ height: '100%' }}>
        <BottomSheetScrollView
          style={styles.content}
          contentContainerStyle={styles.contentInnerContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[s.horizontalMargin, styles.googleForm]}>
            <Autocomplete
              onGooglePlaceChosen={onGooglePlaceChosen}
              inputPlaceholder={inputPlaceholder}
              googleInputRef={googleInputRef}
              addToHistory={addToHistory}
            />
          </View>
          <View>
            <Text style={[styles.categoriesTitle, s.horizontalMargin]}>
              {i18n.t('screens.SearchFromToScreen.myAddresses')}
            </Text>
            <ScrollView
              contentContainerStyle={styles.horizontalScrollView}
              style={{ marginLeft: s.horizontalMargin.marginHorizontal }}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyboardShouldPersistTaps="always"
            >
              {favoriteData.favoritePlaces.map((favoriteItem, index) => (
                <FavoriteTile
                  key={index}
                  favoriteItem={favoriteItem}
                  onPress={() => handleFavoritePress(favoriteItem)}
                  onMorePress={() =>
                    setModal({
                      type: 'place',
                      favorite: favoriteItem,
                      onConfirm: addOrUpdatePlace,
                      onDelete: !favoriteItem.isHardSetName
                        ? deleteFavorite
                        : undefined,
                    })
                  }
                />
              ))}
            </ScrollView>
            {renderAddButton(() =>
              setModal({
                type: 'place',
                onConfirm: addOrUpdatePlace,
              })
            )}
          </View>
          <View style={styles.categoryStops}>
            <Text style={[styles.categoriesTitle, s.horizontalMargin]}>
              {i18n.t('screens.SearchFromToScreen.myStops')}
            </Text>
            <ScrollView
              contentContainerStyle={styles.horizontalScrollView}
              style={{ marginLeft: s.horizontalMargin.marginHorizontal }}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyboardShouldPersistTaps="always"
            >
              {favoriteData.favoriteStops.length > 0 ? (
                favoriteData.favoriteStops.map((favoriteItem, index) => (
                  <FavoriteTile
                    key={index}
                    favoriteItem={favoriteItem}
                    onPress={() => handleFavoritePress(favoriteItem)}
                    onMorePress={() =>
                      setModal({
                        type: 'stop',
                        favorite: favoriteItem,
                        onDelete: deleteFavorite,
                        onConfirm: addOrUpdateStop,
                      })
                    }
                  />
                ))
              ) : (
                <AddStopFavoriteTile
                  title={i18n.t('screens.SearchFromToScreen.addStop')}
                  onPress={() =>
                    setModal({ type: 'stop', onConfirm: addOrUpdateStop })
                  }
                />
              )}
            </ScrollView>
            {favoriteData.favoriteStops.length > 0 &&
              renderAddButton(() =>
                setModal({ type: 'stop', onConfirm: addOrUpdateStop })
              )}
          </View>
          <View style={[styles.categoryStops, s.horizontalMargin]}>
            <View style={styles.chooseFromMapRow}>
              {getMyLocation && (
                <TouchableOpacity onPress={() => getMyLocation(true)}>
                  <View style={styles.chooseFromMap}>
                    <LocationSvg width={30} height={30} fill={colors.primary} />
                    <View style={[styles.placeTexts, styles.chooseFromMapText]}>
                      <Text style={styles.placeAddress}>
                        {i18n.t('screens.SearchFromToScreen.currentPosition')}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              {setLocationFromMap && (
                <TouchableOpacity onPress={setLocationFromMap}>
                  <View style={styles.chooseFromMap}>
                    <MapSvg width={30} height={30} fill={colors.primary} />
                    <View style={[styles.placeTexts, styles.chooseFromMapText]}>
                      <Text style={styles.placeAddress}>
                        {i18n.t(
                          'screens.SearchFromToScreen.choosePlaceFromMap'
                        )}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </View>
          <View style={[styles.categoryStops, styles.history]}>
            <Text style={styles.categoriesTitle}>
              {i18n.t('screens.SearchFromToScreen.history')}
            </Text>
            <View style={styles.historyContainer}>
              {favoriteData.history.map((place, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => onGooglePlaceChosen(place.data, place.detail)}
                >
                  <View style={styles.verticalScrollItem}>
                    <View style={styles.leftSideItemWrapper}>
                      <HistorySvg width={30} height={20} fill={colors.black} />
                      {(place.detail?.types[0] as any) === 'transit_station' ? (
                        <StopSignSvg
                          width={30}
                          height={20}
                          fill={colors.black}
                        />
                      ) : (
                        <PlaceSvg width={30} height={20} fill={colors.black} />
                      )}
                      <View style={styles.placeTexts}>
                        <Text
                          style={[styles.placeAddress, { marginRight: 15 }]}
                          numberOfLines={1}
                        >
                          {place.data?.structured_formatting.main_text}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.rightSideItemWrapper}>
                      <TouchableOpacity
                        onPress={() => deleteFromHistory(place)}
                        style={styles.deleteHistoryButton}
                      >
                        <CrossIcon width={16} height={16} fill={colors.black} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </BottomSheetScrollView>
      </View>
      {modal && (
        <FavoriteModal
          type={modal.type}
          favorite={modal.favorite}
          onConfirm={modal.onConfirm}
          onDelete={modal.onDelete}
          onClose={() => setModal(undefined)}
        />
      )}
    </BottomSheet>
  )
}

const styles = StyleSheet.create({
  categoriesTitle: {
    marginTop: 14,
    marginBottom: 10,
  },
  horizontalScrollView: {
    minHeight: 62,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 35,
  },
  historyContainer: {
    marginBottom: BOTTOM_TAB_NAVIGATOR_HEIGHT + 5,
  },
  verticalScrollItem: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    justifyContent: 'space-between',
  },
  leftSideItemWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    overflow: 'hidden',
  },
  rightSideItemWrapper: {
    flex: 0,
  },
  chooseFromMapRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 15,
    alignItems: 'center',
  },
  chooseFromMap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  chooseFromMapText: {
    width: 100,
    alignItems: 'center',
  },
  placeTexts: {
    marginLeft: 10,
  },
  categoryStops: {
    marginTop: 14,
  },
  placeAddress: {
    color: colors.blackLighter,
  },
  content: {
    backgroundColor: 'white',
    marginTop: 10,
    height: '100%',
  },
  contentInnerContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    minHeight: '100%',
  },
  history: {
    backgroundColor: colors.lightLightGray,
    paddingHorizontal: 20,
    flex: 1,
    alignSelf: 'stretch',
    borderTopEndRadius: STYLES.borderRadius,
  },
  addButton: {},
  addButtonWrapper: {
    position: 'absolute',
    zIndex: 2,
    bottom: 0,
    right: 0,
  },
  googleForm: {
    flexDirection: 'row',
    marginBottom: 7,
    zIndex: 1,
  },
  deleteHistoryButton: { padding: 8 },
})
