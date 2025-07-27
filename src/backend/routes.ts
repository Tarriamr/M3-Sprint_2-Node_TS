import { addRoute } from './middleware/router';
import {
  handleDeleteUser,
  handleFundUser,
  handleGetMe,
  handleGetUsers,
  handleLogin,
  handleRegister,
  handleUpdateUser,
} from './handlers/userHandlers';
import {
  adminAuthMiddleware,
  userAuthMiddleware,
} from './middleware/authMiddleware';
import {
  handleBuyCar,
  handleCreateCar,
  handleDeleteCar,
  handleGetCarById,
  handleGetCars,
  handleUpdateCar,
} from './handlers/carHandlers';
import { handleSse } from './handlers/sseHandlers';

addRoute('POST', '/register', handleRegister);
addRoute('POST', '/login', handleLogin);
addRoute('GET', '/users', adminAuthMiddleware, handleGetUsers);
addRoute('POST', '/cars', adminAuthMiddleware, handleCreateCar);
addRoute('POST', '/cars/:id/buy', userAuthMiddleware, handleBuyCar);
addRoute('PUT', '/cars/:id', adminAuthMiddleware, handleUpdateCar);
addRoute('DELETE', '/cars/:id', adminAuthMiddleware, handleDeleteCar);
addRoute('PUT', '/users/:id', userAuthMiddleware, handleUpdateUser);
addRoute('DELETE', '/users/:id', userAuthMiddleware, handleDeleteUser);
addRoute('POST', '/users/:id/fund', adminAuthMiddleware, handleFundUser);
addRoute('GET', '/users/me', userAuthMiddleware, handleGetMe);
addRoute('GET', '/cars', handleGetCars);
addRoute('GET', '/cars/:id', handleGetCarById);
addRoute('GET', '/sse', handleSse);
