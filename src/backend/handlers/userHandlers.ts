import { IncomingMessage, ServerResponse } from 'node:http';
import {
  createUser,
  deleteUser,
  findAllUsers,
  fundUserAccount,
  updateUser,
  userExists,
  verifyUserCredentials,
} from '../api/users/userService';
import { generateToken, setAuthCookie } from '../auth';

export async function handleRegister(
  req: IncomingMessage,
  res: ServerResponse,
) {
  try {
    const { username, password } = req.body as {
      username?: string;
      password?: string;
    };

    if (
      !username ||
      !password ||
      username.trim() === '' ||
      password.trim() === ''
    ) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(
        JSON.stringify({ error: 'Correct username and password are required' }),
      );
    }

    const userAlreadyExists = await userExists(username);
    if (userAlreadyExists) {
      res.writeHead(409, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Username already exists' }));
    }

    const newUser = await createUser({ username, password });
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(newUser));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
}

export async function handleLogin(req: IncomingMessage, res: ServerResponse) {
  try {
    const { username, password } = req.body as {
      username?: string;
      password?: string;
    };

    if (!username || !password) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(
        JSON.stringify({ error: 'Username and password are required' }),
      );
    }

    const user = await verifyUserCredentials(username, password);
    if (!user) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Incorrect login or password' }));
    }

    const token = generateToken(user);

    setAuthCookie(res, token);

    res.writeHead(200, { 'Content-Type': 'application/json' });

    res.end(JSON.stringify({ message: 'Login successful' }));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
}

export async function handleGetUsers(
  req: IncomingMessage,
  res: ServerResponse,
) {
  try {
    const users = await findAllUsers();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(users));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
}

export async function handleUpdateUser(
  req: IncomingMessage,
  res: ServerResponse,
) {
  try {
    const userIdToUpdate = req.params?.id;
    const loggedInUser = req.user;
    const { username, password } = req.body as {
      username?: string;
      password?: string;
    };

    if (!userIdToUpdate || !loggedInUser) {
      return res.writeHead(400).end();
    }

    if (loggedInUser.role !== 'admin' && loggedInUser.id !== userIdToUpdate) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      return res.end(
        JSON.stringify({
          error: 'Forbidden: You can only update your own account',
        }),
      );
    }

    const updatedUser = await updateUser(userIdToUpdate, username, password);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(updatedUser));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
}

export async function handleDeleteUser(
  req: IncomingMessage,
  res: ServerResponse,
) {
  try {
    const userIdToDelete = req.params?.id;
    const loggedInUser = req.user;

    if (!userIdToDelete || !loggedInUser) {
      return res.writeHead(400).end();
    }

    if (loggedInUser.role !== 'admin' && loggedInUser.id !== userIdToDelete) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      return res.end(
        JSON.stringify({
          error: 'Forbidden: You can only delete your own account',
        }),
      );
    }

    await deleteUser(userIdToDelete);
    res.writeHead(204);
    res.end();
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
}

export async function handleFundUser(
  req: IncomingMessage,
  res: ServerResponse,
) {
  try {
    const userIdToFund = req.params?.id;
    const { amount } = req.body as { amount?: number };

    if (!userIdToFund || typeof amount !== 'number' || amount <= 0) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(
        JSON.stringify({ error: 'User ID and a positive amount are required' }),
      );
    }

    const updatedUser = await fundUserAccount(userIdToFund, amount);

    if (!updatedUser) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'User not found' }));
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(updatedUser));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
}

export async function handleGetMe(req: IncomingMessage, res: ServerResponse) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(req.user));
}
