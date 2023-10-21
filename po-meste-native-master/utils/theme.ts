import { customMapStyle } from '@screens/MapScreen/customMapStyle'
import { MapViewProps } from 'react-native-maps'

export const colors = {
  primary: '#FF5D52',
  secondary: '#F8D7D4',
  tertiary: '#923438',

  green: '#5DB56E',
  alert: '#FD4344',
  error: '#FA4646',
  gray: '#C3C3C3',
  lighterGray: '#b0b0b0', // 0.1 alpha
  mediumGray: '#C4C4C4',
  darkGray: '#8d8d8d',
  lightLightGray: '#F5F5F5', //TODO can we merge it from lightergray?
  lightGray: '#dedede',
  lightText: '#83919b',
  darkText: '#454545',
  white: '#ffffff',
  black: '#000000',
  blackLighter: '#444444',
  transparentBlack: 'rgba(0, 0, 0, 0.5)',
  rekolaColor: '#ED3C8D',
  slovnaftColor: '#FFF215',
  tierColor: '#77E4D7',
  zseColor: '#F21C0A',
  boltColor: '#34D186',
  available: '#5DB56E',
  ownVehicleHeaderColor: '#8D8D8D',
  brightGreen: '#ADCD00',
  gold: '#FFC700',

  switchGreen: '#ADCD00',
  switchGray: '#E1E4E8',
}

export const inputSelectionColor = colors.primary

export const mhdDefaultColors = {
  grey: '#9E9E9E',
}

export const mapStyles: MapViewProps = {
  customMapStyle: customMapStyle,
  toolbarEnabled: false,
  initialRegion: {
    latitude: 48.1512015,
    longitude: 17.1110118,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  },
  showsPointsOfInterest: false,
}
