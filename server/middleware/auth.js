const jwt = require('jsonwebtoken');
const { User, RefreshToken } = require('../models');

// JWT Configuration
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'your-access-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
const ACCESS_TOKEN_TTL = process.env.ACCESS_TOKEN_TTL || '15m';
const REFRESH_TOKEN_TTL = process.env.REFRESH_TOKEN_TTL || '7d';

// Generate JWT tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId, type: 'access' },
    JWT_ACCESS_SECRET,
    { expiresIn: ACCESS_TOKEN_TTL }
  );
  
  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_TTL }
  );
  
  return { accessToken, refreshToken };
};

// Set HTTP-only cookies
const setAuthCookies = (res, accessToken, refreshToken) => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Access token cookie
  res.cookie('access_token', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    maxAge: 15 * 60 * 1000 // 15 minutes
  });
  
  // Refresh token cookie
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/api/auth/refresh',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

// Clear auth cookies
const clearAuthCookies = (res) => {
  res.clearCookie('access_token', {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  });
  
  res.clearCookie('refresh_token', {
    path: '/api/auth/refresh',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  });
};

// Verify access token middleware
const verifyAccessToken = async (req, res, next) => {
  try {
    const token = req.cookies.access_token;
    
    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }
    
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET);
    
    if (decoded.type !== 'access') {
      return res.status(401).json({ error: 'Invalid token type' });
    }
    
    // Verify user still exists
    const user = await User.findById(decoded.userId).select('-passwordHash');
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Access token expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid access token' });
    }
    return res.status(500).json({ error: 'Token verification failed' });
  }
};

// Verify refresh token middleware
const verifyRefreshToken = async (req, res, next) => {
  try {
    const token = req.cookies.refresh_token;
    
    if (!token) {
      return res.status(401).json({ error: 'Refresh token required' });
    }
    
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET);
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({ error: 'Invalid token type' });
    }
    
    // Check if refresh token exists in database and is not revoked
    const refreshTokenRecord = await RefreshToken.findOne({
      tokenHash: require('crypto').createHash('sha256').update(token).digest('hex'),
      revokedAt: null,
      expiresAt: { $gt: new Date() }
    });
    
    if (!refreshTokenRecord) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }
    
    // Verify user still exists
    const user = await User.findById(decoded.userId).select('-passwordHash');
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    req.user = user;
    req.userId = user._id;
    req.refreshTokenRecord = refreshTokenRecord;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Refresh token expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }
    return res.status(500).json({ error: 'Token verification failed' });
  }
};

// Store refresh token in database
const storeRefreshToken = async (userId, token, userAgent, ip) => {
  const tokenHash = require('crypto').createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  
  const refreshToken = new RefreshToken({
    userId,
    tokenHash,
    userAgent,
    ip,
    expiresAt
  });
  
  return await refreshToken.save();
};

// Revoke refresh token
const revokeRefreshToken = async (token) => {
  const tokenHash = require('crypto').createHash('sha256').update(token).digest('hex');
  return await RefreshToken.findOneAndUpdate(
    { tokenHash },
    { revokedAt: new Date() }
  );
};

// Revoke all refresh tokens for a user
const revokeAllUserRefreshTokens = async (userId) => {
  return await RefreshToken.updateMany(
    { userId },
    { revokedAt: new Date() }
  );
};

module.exports = {
  generateTokens,
  setAuthCookies,
  clearAuthCookies,
  verifyAccessToken,
  verifyRefreshToken,
  storeRefreshToken,
  revokeRefreshToken,
  revokeAllUserRefreshTokens
};








