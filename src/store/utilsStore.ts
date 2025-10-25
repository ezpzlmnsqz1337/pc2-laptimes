import { CARS_ENDPOINT, dataStore } from '@/store/dataStore'

export interface UtilsStore {
  setCarImage(carId: string, imageUrl: string): void;
}

export const utilsStore: UtilsStore = {
  async setCarImage (carId: string, imageUrl: string) {
    if (!carId || !imageUrl) return

    const car = dataStore.getCarById(carId) // Ensure car exists in the store
    if (!car) {
      console.error(`Car with ID ${carId} does not exist in the store.`)
      return
    }
    car.imageUrl = imageUrl // Update the car's image URL in the store
    const response = await fetch(`${CARS_ENDPOINT}/${carId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ car })
    })

    if (!response.ok) {
      console.log(response.statusText)
    } else {
      dataStore.broadcastDataChange('cars')
    }
  }
}
