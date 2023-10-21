import { StyleSheet } from 'react-native'
import { STYLES } from './constants'
import { colors } from './theme'
export const s = StyleSheet.create({
  icon: {
    marginRight: 9,
  },
  lineNumber: {
    borderRadius: 5,
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  bgRed: {
    backgroundColor: 'red',
  },
  boldText: {
    fontWeight: 'bold',
  },
  fontWeightMedium: {
    fontWeight: '500',
  },
  blackText: {
    color: 'black',
  },
  lightGreyText: {
    color: 'lightgrey',
  },
  whiteText: {
    color: 'white',
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'white',
  },
  horizontalMargin: {
    marginHorizontal: 20,
  },
  horizontalPadding: {
    paddingHorizontal: 20,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    shadowOpacity: 0.2,
  },
  borderBlack: {
    borderWidth: 1,
  },
  borderBlue: {
    borderWidth: 1,
    borderColor: 'blue',
  },
  borderRed: {
    borderWidth: 1,
    borderColor: 'red',
  },
  borderGreen: {
    borderWidth: 1,
    borderColor: 'green',
  },
  roundedBorder: {
    borderRadius: STYLES.borderRadius,
  },
  textSmall: {
    fontSize: 14,
    lineHeight: 16,
    textAlignVertical: 'center',
  },
  textTiny: {
    fontSize: 12,
    lineHeight: 14,
    textAlignVertical: 'center',
  },
  textMedium: {
    fontSize: 16,
    lineHeight: 19,
    textAlignVertical: 'center',
  },
  textLarge: {
    fontSize: 20,
    lineHeight: 24,
    textAlignVertical: 'center',
  },
  handleStyle: {
    backgroundColor: colors.lightGray,
    width: 66,
    height: 4,
    marginTop: 5,
    marginBottom: 10,
  },
  fontNormal: {
    fontFamily: 'work-sans',
  },
  fontBold: {
    fontFamily: 'work-sans-bold',
  },
})
