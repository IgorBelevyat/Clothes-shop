const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma.client.js'); 


const register = async (req, res, next) => {
  const { email, password, firstName, lastName } = req.body;

  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({ 
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: 'user', 
      },
    });
    res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
    next(error);
  }
};


const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: '7d', 
    });

    res.cookie('token', token, {
      httpOnly: true, 
      sameSite: 'lax', 
      secure: process.env.NODE_ENV === 'production', 
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    });

    res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    next(error);
  }
};

const getMe = (req, res, next) => {
  try {
    const { password, ...userData } = req.user; 
    res.status(200).json(req.user); 
  } catch (error) {
    next(error);
  }
};


const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

module.exports = {
  register,
  login,
  getMe,
  logout,
};