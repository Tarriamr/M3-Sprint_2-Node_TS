import { IncomingMessage, ServerResponse } from 'node:http';
import {
  buyCar,
  createCar,
  deleteCar,
  findAllCars,
  findCarById,
  updateCar,
} from '../api/cars/carService';

export async function handleCreateCar(
  req: IncomingMessage,
  res: ServerResponse,
) {
  try {
    const { brand, model, price } = req.body as {
      brand?: string;
      model?: string;
      price?: number;
    };
    if (!brand || !model || !price) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(
        JSON.stringify({ error: 'Model, price and owner are required' }),
      );
    }

    const newCar = await createCar(brand, model, price);
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(newCar));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
}

export async function handleGetCars(req: IncomingMessage, res: ServerResponse) {
  try {
    const cars = await findAllCars();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(cars));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
}

export async function handleGetCarById(
  req: IncomingMessage,
  res: ServerResponse,
) {
  try {
    const carId = req.params?.id;

    if (!carId) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Car ID is missing in URL' }));
    }

    const car = await findCarById(carId);

    if (!car) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Car not found' }));
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(car));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
}

export async function handleBuyCar(req: IncomingMessage, res: ServerResponse) {
  try {
    const carId = req.params?.id;
    const buyer = req.user;

    if (!carId || !buyer) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(
        JSON.stringify({
          error: 'Car ID and user authentication are required',
        }),
      );
    }

    const success = await buyCar(carId, buyer);

    if (!success) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(
        JSON.stringify({
          error: 'Transaction failed: car not available or insufficient funds',
        }),
      );
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Car purchased successfully' }));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
}

export async function handleUpdateCar(
  req: IncomingMessage,
  res: ServerResponse,
) {
  try {
    const carId = req.params?.id;
    const { brand, model, price } = req.body as {
      brand?: string;
      model?: string;
      price?: number;
    };

    if (!carId || !brand || !model || !price) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(
        JSON.stringify({ error: 'Car ID, model, and price are required' }),
      );
    }

    const updatedCar = await updateCar(carId, brand, model, price);

    if (!updatedCar) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Car not found' }));
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(updatedCar));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
}

export async function handleDeleteCar(
  req: IncomingMessage,
  res: ServerResponse,
) {
  try {
    const carId = req.params?.id;

    if (!carId) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Car ID is required' }));
    }

    const success = await deleteCar(carId);

    if (!success) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Car not found' }));
    }

    res.writeHead(204, { 'Content-Type': 'application/json' });
    res.end();
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
}
