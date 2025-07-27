import { readDatabase, writeDatabase } from '../../db';
import { Car, PublicCar, PublicUser } from '../../types';
import { randomUUID } from 'node:crypto';
import { updateUserBalance } from '../users/userService';
import { acquireLock, releaseLock } from '../../lock';
import sseEmitter from '../../eventEmitter';

export async function createCar(
  brand: string,
  model: string,
  price: number,
): Promise<Car> {
  const cars = await readDatabase('cars');
  const newCar: Car = {
    id: randomUUID(),
    brand,
    model,
    price,
    ownerId: null,
  };
  cars.push(newCar);
  await writeDatabase('cars', cars);
  return newCar;
}

export async function findAllCars(): Promise<PublicCar[]> {
  const cars = await readDatabase('cars');
  return cars.map(({ ownerId, ...publicCar }) => publicCar);
}

export async function findCarById(id: string): Promise<PublicCar | null> {
  const cars = await readDatabase('cars');
  const car = cars.find((car) => car.id === id);
  if (!car) {
    return null;
  }
  const { ownerId: _ownerId, ...publicCar } = car;
  return publicCar;
}

export async function buyCar(
  carId: string,
  buyer: PublicUser,
): Promise<boolean> {
  if (!acquireLock(carId)) {
    return false;
  }

  try {
    const cars = await readDatabase('cars');
    const carIndex = cars.findIndex((c) => c.id === carId);
    const car = cars[carIndex];

    if (!car || car.ownerId !== null || buyer.balance < car.price) {
      return false;
    }

    const newBalance = buyer.balance - car.price;
    cars[carIndex].ownerId = buyer.id;

    await writeDatabase('cars', cars);
    await updateUserBalance(buyer.id, newBalance);

    sseEmitter.emit('car-bought', {
      event: 'Car Purchased',
      carId,
      buyerId: buyer.id,
    });

    return true;
  } finally {
    releaseLock(carId);
  }
}

export async function updateCar(
  carId: string,
  newBrand: string,
  newModel: string,
  newPrice: number,
): Promise<Car | null> {
  const cars = await readDatabase('cars');
  const carIndex = cars.findIndex((c) => c.id === carId);

  if (carIndex === -1) {
    return null;
  }

  cars[carIndex].brand = newBrand;
  cars[carIndex].model = newModel;
  cars[carIndex].price = newPrice;

  await writeDatabase('cars', cars);
  return cars[carIndex];
}

export async function deleteCar(carId: string): Promise<boolean> {
  const cars = await readDatabase('cars');
  const initialLength = cars.length;
  const updatedCars = cars.filter((c) => c.id !== carId);

  if (updatedCars.length === initialLength) {
    return false;
  }

  await writeDatabase('cars', updatedCars);
  return true;
}
