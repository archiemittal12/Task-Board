const bcrypt = require('bcrypt');
const prisma = require('../config/db');
const { generateToken, generateRefreshToken } = require('../utils/generateToken');
const jwt = require('jsonwebtoken');


// helper to set refresh token cookie
const setRefreshCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in ms
  });
};


const register = async (req, res) => {
  try {
    const { name, email, password, username } = req.body;
    if (!name || !email || !password || !username) {
      return res.status(400).json({
        message: 'Name, email, username and password are required',
      });
    }

    // first we will check if the user already exists with the given email
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // check username uniqueness
    const existingUsername = await prisma.user.findUnique({
      where: { username: username.trim().toLowerCase() },
    });

    if (existingUsername) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    // now hashing the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // now we will create the user in the database
    // First registered user becomes Global Admin
      const userCount = await prisma.user.count();

      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          username: username.trim().toLowerCase(),
          globalRole: userCount === 0 ? "ADMIN" : "USER",
          avatarUrl: user.avatarUrl ?? null, 
        },
      });

    // generate both tokens
    const accessToken = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // store refresh token in db so we can invalidate on logout
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    // set refresh token in http-only cookie
    setRefreshCookie(res, refreshToken);

    // once registered we will automatically log in the user
    return res.status(201).json({
      token: accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
         globalRole: user.globalRole,
      },
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Server error',
    });
  }
};


const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required',
      });
    }

    // finding the user with the given email
    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    // checking correctness of the password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    // generate both tokens
    const accessToken = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // store refresh token in db so we can invalidate on logout
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    // set refresh token in http-only cookie
    setRefreshCookie(res, refreshToken);

    // to maintain consistency with register, returning access token + user info
    return res.status(200).json({
      token: accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
         globalRole: user.globalRole,
         avatarUrl: user.avatarUrl ?? null, 
      },
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Server error',
    });
  }
};


// issue a new access token using the refresh token from cookie
const refresh = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({ message: 'No refresh token' });
    }

    // check if token exists in db (not logged out)
    const stored = await prisma.refreshToken.findUnique({
      where: { token }
    });

    if (!stored) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    // check if expired
    if (stored.expiresAt < new Date()) {
      await prisma.refreshToken.delete({ where: { token } });
      return res.status(401).json({ message: 'Refresh token expired' });
    }

    // verify the jwt signature
    const payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

    // issue new access token
    const accessToken = generateToken(payload.id);

    return res.status(200).json({ token: accessToken });

  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
};


// logout — delete from db and clear cookie so token cannot be reused
const logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (token) {
      await prisma.refreshToken.deleteMany({ where: { token } });
      res.clearCookie('refreshToken', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });
    }

    return res.status(200).json({ message: 'Logged out successfully' });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};


module.exports = { register, login, refresh, logout };