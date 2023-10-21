import Text from '@components/Text'
import React from 'react'
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'

import { TravelModes, VehicleData } from '@types'
import { colors, s } from '@utils'

type Props = {
  selectedVehicle: TravelModes
  vehicles: VehicleData[]
  onVehicleChange: (mode: TravelModes) => void
}

const VehicleSelector = ({
  selectedVehicle,
  onVehicleChange,
  vehicles,
}: Props) => {
  return (
    <ScrollView horizontal>
      <View style={styles.container}>
        {vehicles.map((vehicle, index) => {
          //Price is in cents
          const priceToString = (price?: number) =>
            price
              ? `${
                  price % 100 === 0
                    ? price / 100
                    : (price / 100).toFixed(2).replace('.', ',')
                }`
              : undefined

          const getPrice = () => {
            const min = priceToString(vehicle.priceMin)
            const max = priceToString(vehicle.priceMax)
            if (!min) {
              return null
            }
            if (vehicle.mode === TravelModes.mhd || min === max) {
              return `~${min}€`
            }
            if ((vehicle.priceMax ?? 0) > 1000) {
              return `>${min}€`
            }
            return `${min}${min && max && ` - `}${max}${(min || max) && '€'}`
          }

          const getDuration = () => {
            const min = vehicle.estimatedTimeMin
            const max = vehicle.estimatedTimeMax
            if (!min) {
              return null
            }
            if (min === max) {
              return `${min} min`
            }
            if (min >= 100 || (max && max >= 100)) {
              return `>${min} min`
            }
            return `${min}${min && max && ` - `}${max}${(min || max) && ' min'}`
          }

          const duration = getDuration()
          const price = getPrice()

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.vehicleContainer,
                selectedVehicle === vehicle.mode
                  ? styles.vehicleContainerSelected
                  : {},
                index !== vehicles.length - 1
                  ? styles.vehicleContainerLast
                  : {},
              ]}
              onPress={() => onVehicleChange(vehicle.mode)}
            >
              <vehicle.icon
                fill={
                  selectedVehicle === vehicle.mode ? 'white' : colors.mediumGray
                }
                width={24}
                height={20}
                style={styles.vehicleIcon}
              />
              <Text
                style={[
                  styles.vehicleEstimatedTime,
                  selectedVehicle === vehicle.mode
                    ? styles.vehicleEstimatedTimeSelected
                    : {},
                ]}
              >
                {duration ? duration : '--'}
              </Text>
              <Text
                style={[
                  styles.vehiclePrice,
                  selectedVehicle === vehicle.mode
                    ? styles.vehiclePriceSelected
                    : {},
                ]}
              >
                {price ? price : '--'}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  vehicleContainer: {
    padding: 7,
    borderWidth: 2,
    borderColor: colors.mediumGray,
    width: 100,
    height: 70,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    ...s.roundedBorder,
  },
  vehicleContainerLast: {
    marginRight: 10,
  },
  vehicleContainerSelected: {
    padding: 9,
    borderWidth: 0,
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  vehicleIcon: {
    marginBottom: 5,
  },
  vehicleEstimatedTime: {
    fontWeight: 'bold',
    color: colors.gray,
    ...s.textTiny,
  },
  vehicleEstimatedTimeSelected: {
    ...s.textTiny,
    color: 'white',
  },
  vehiclePrice: {
    ...s.textTiny,
    color: colors.gray,
  },
  vehiclePriceSelected: {
    color: 'white',
  },
})

export default VehicleSelector
