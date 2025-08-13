const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/Users');

// Token functions
const createAccessToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_ACCESS_SECRET, 
    { expiresIn: '15m' }
  );
};

const createRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET, 
    { expiresIn: '7d' }
  );
};

// REGISTER
const register = async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;
    const newUser = new User({ firstname, lastname, email, password }); 
    await newUser.save();
    res.status(200).json({ msg: 'User created successfully' });
  } catch (error) {
    console.error(error);
    res.json({ error: 'Failed to register' });
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password }  = req.body;
    const useremail = await User.findOne({ email });

    if (!useremail) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, useremail.password);
    if (!isMatch) {
      return res.status(404).json({ message: 'Invalid password' });
    }

    // Create tokens
    const accessToken = createAccessToken(useremail._id);
    const refreshToken = createRefreshToken(useremail._id);

    // Save refresh token to DB
    useremail.refreshToken = refreshToken;
    await useremail.save();

    // Set cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 15 * 60 * 1000,
      path: '/',
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return res.json({ message: 'Login successful', user: { id: useremail._id, email: useremail.email } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Login failed' });
  }
};

// REFRESH
const refresh = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.sendStatus(401);

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.sendStatus(403); 
    }

    const user = await User.findById(payload.id);
    if (!user || user.refreshToken !== token) {
      return res.sendStatus(403);
    }

    const newAccessToken = createAccessToken(user._id);
    const newRefreshToken = createRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save();

    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 15 * 60 * 1000,
      path: '/',
    });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return res.json({ message: 'Token refreshed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Refresh failed' });
  }
};

// LOGOUT
const logout = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      const payload = jwt.decode(token);
      if (payload?.id) {
        await User.findByIdAndUpdate(payload.id, { $unset: { refreshToken: "" } });
      }
    }

    res.clearCookie('accessToken', { path: '/' });
    res.clearCookie('refreshToken', { path: '/' });

    return res.json({ message: 'Logged out' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Logout failed' });
  }
};

module.exports = { register, login, refresh, logout };
