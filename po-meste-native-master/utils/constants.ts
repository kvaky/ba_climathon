export const STYLES = {
  borderRadius: 10,
}

export const prices: {
  [key: string]: {
    price: number
    interval: number
    unlockPrice?: number
  }
} = {
  rekola: { price: 100, interval: 30 },
  slovnaftbajk: { price: 600, interval: 1440 },
  tier: { unlockPrice: 100, price: 16, interval: 1 },
  bolt: { price: 19, interval: 1 },
}

export const rekolaPrice = {
  ...prices.rekola,
  unit: { translate: false, text: 'min' },
  translationOption: 'screens.MapScreen.micromobilityPriceFrom',
}
export const slovnaftbajkPrice = {
  ...prices.slovnaftbajk,
  interval: 1,
  unit: { translate: true, text: 'screens.MapScreen.dailyTicket' },
  translationOption: 'screens.MapScreen.micromobilityPriceFrom',
}
export const tierPrice = {
  ...prices.tier,
  unit: { translate: false, text: 'min' },
  translationOption: 'screens.MapScreen.micromobilityWithUnlockPrice',
}
export const boltPrice = {
  ...prices.bolt,
  unit: { translate: false, text: 'min' },
  translationOption: 'screens.MapScreen.micromobilityPrice',
}

export const modeColors: { [key: string]: string } = {
  WALK: '#444',
  BICYCLE: '#0073e5',
  BUS: '#080',
  TRAM: '#800',
  DEFAULT: '#aaa',
}

export const trolleybusLineNumbers = [
  '33',
  '40',
  '42',
  '44',
  '45',
  '47',
  '48',
  '49',
  '60',
  '64',
  '71',
  '72',
]

export const tramNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9]

export const API_ERROR_TEXT = 'ApiErrorText'

export const LATEST_DATASET_INDEX = 'latestDataset'

export const FAVORITE_DATA_INDEX = 'favoriteData'

export const ITINERARY_ICON_WIDTH = 20
export const ITINERARY_PADDING_HORIZONTAL = 10
