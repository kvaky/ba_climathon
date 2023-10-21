import Text from '@components/Text'
import HeartSvg from '@icons/favorite.svg'
import HomeSvg from '@icons/home.svg'
import MoreSvg from '@icons/more.svg'
import PlusButtonSvg from '@icons/plus.svg'
import StopSignSvg from '@icons/stop-sign.svg'
import WorkSvg from '@icons/work.svg'
import { FavoritePlace, FavoriteStop } from '@types'
import { s } from '@utils/globalStyles'
import { colors } from '@utils/theme'
import { isFavoritePlace } from '@utils/utils'
import i18n from 'i18n-js'
import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

interface FavoriteTileProps {
  favoriteItem: FavoritePlace | FavoriteStop
  onPress: () => void
  onMorePress: () => void
}

interface AddStopFavoriteTileProps {
  title: string
  onPress: () => void
}

export const AddStopFavoriteTile = ({
  title,
  onPress,
}: AddStopFavoriteTileProps) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.horizontalScrollItem}>
        <StopSignSvg width={20} height={20} fill={colors.tertiary} />
        <View style={styles.placeTexts}>
          <Text style={styles.placeName}>{title}</Text>
        </View>
        <View style={[styles.moreContainer, { marginRight: 10 }]}>
          <PlusButtonSvg width={30} height={30} />
        </View>
      </View>
    </TouchableOpacity>
  )
}

const FavoriteTile = ({
  favoriteItem,
  onPress,
  onMorePress,
}: FavoriteTileProps) => {
  const isPlace = isFavoritePlace(favoriteItem)
  const {
    id = '',
    name = undefined,
    isHardSetName = false,
    icon = undefined,
  } = isPlace ? favoriteItem : {}
  const Icon = isPlace
    ? icon
      ? icon === 'home'
        ? HomeSvg
        : icon === 'work'
        ? WorkSvg
        : HeartSvg
      : HeartSvg
    : StopSignSvg
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.horizontalScrollItem}>
        <Icon width={20} height={20} fill={colors.tertiary} />
        <View style={styles.placeTexts}>
          {name ? (
            <>
              <Text style={styles.placeName} numberOfLines={1}>
                {id === 'home'
                  ? i18n.t('screens.SearchFromToScreen.FavoriteModal.home')
                  : id === 'work'
                  ? i18n.t('screens.SearchFromToScreen.FavoriteModal.work')
                  : name}
              </Text>
              <Text style={styles.placeAddressMinor} numberOfLines={1}>
                {favoriteItem.place?.data?.structured_formatting.main_text ??
                  i18n.t('screens.SearchFromToScreen.add')}
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.placeName} numberOfLines={1}>
                {favoriteItem.place?.data?.structured_formatting.main_text}
              </Text>
            </>
          )}
        </View>
        <View style={styles.moreContainer}>
          <TouchableOpacity onPress={onMorePress}>
            <MoreSvg
              width={20}
              height={20}
              fill={colors.tertiary}
              style={styles.more}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  horizontalScrollItem: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    marginRight: 10,
    paddingHorizontal: 13,
    paddingRight: 3,
    backgroundColor: colors.secondary,
    ...s.roundedBorder,
  },
  placeTexts: {
    color: colors.tertiary,
    marginLeft: 10,
    maxWidth: 200,
    alignSelf: 'center',
  },
  placeName: {
    color: colors.tertiary,
    fontWeight: 'bold',
    ...s.textTiny,
  },
  placeAddressMinor: {
    color: colors.tertiary,
    ...s.textTiny,
  },
  more: {
    margin: 10,
    padding: 5,
  },
  moreContainer: {
    marginLeft: 17,
  },
})

export default FavoriteTile
