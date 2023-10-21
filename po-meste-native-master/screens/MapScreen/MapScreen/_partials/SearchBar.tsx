import Text from '@components/Text'
import SearchSvg from '@icons/search.svg'
import { useNavigation } from '@react-navigation/native'
import { s } from '@utils/globalStyles'
import { colors } from '@utils/theme'
import i18n from 'i18n-js'
import React from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const SearchBar = () => {
  const navigation = useNavigation()

  const insets = useSafeAreaInsets()
  return (
    <TouchableOpacity
      style={{
        ...styles.searchBar,
        marginTop: Math.max(insets.top, 30),
      }}
      onPress={() => navigation.navigate('FromToScreen')}
      activeOpacity={0.6}
    >
      <SearchSvg
        width={20}
        height={20}
        fill={colors.primary}
        style={styles.searchIcon}
      />
      <Text style={styles.searchInput}>
        {i18n.t('screens.MapScreen.whereTo')}
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  searchBar: {
    display: 'flex',
    flex: 1,
    position: 'absolute',
    top: 10,
    width: '90%',
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    alignItems: 'center',
    borderRadius: 30,
    ...s.shadow,
    elevation: 7,
  },
  searchInput: {
    marginLeft: 16,
    width: '100%',
    color: colors.mediumGray,
    letterSpacing: 0.5,
  },
  searchIcon: {
    marginLeft: 16,
  },
})

export default SearchBar
