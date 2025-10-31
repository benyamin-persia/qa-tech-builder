const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { User, Profile, RefreshToken } = require('../models');
const { 
  generateTokens, 
  setAuthCookies, 
  clearAuthCookies, 
  verifyRefreshToken, 
  storeRefreshToken, 
  revokeRefreshToken,
  revokeAllUserRefreshTokens 
} = require('../middleware/auth');
const { 
  validate, 
  registerSchema, 
  loginSchema, 
  verifySchema,
  forgotPasswordSchema,
  resetPasswordSchema 
} = require('../middleware/validation');

const router = express.Router();

// Rate limiting for auth endpoints
const authLimiter = require('express-rate-limit')({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: { error: 'Too many authentication attempts, please try again later' }
});

const refreshLimiter = require('express-rate-limit')({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 refresh requests per windowMs
  message: { error: 'Too many refresh attempts, please try again later' }
});

// Demo mode check
const isDemoMode = () => {
  try {
    require('../models');
    return false;
  } catch (error) {
    return true;
  }
};

// Demo user data (in-memory for testing)
let demoUsers = [];
let demoProfiles = [];
let demoSelections = [];
let demoProgress = [];

// POST /api/auth/register
router.post('/register', authLimiter, validate(registerSchema), async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (isDemoMode()) {
      // Demo mode - check if user already exists
      const existingUser = demoUsers.find(u => u.email === email);
      if (existingUser) {
        return res.status(409).json({ error: 'User with this email already exists' });
      }
      
      // Create demo user
      const user = {
        _id: Date.now().toString(),
        email,
        name,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff`,
        emailVerified: true,
        createdAt: new Date()
      };
      
      demoUsers.push(user);
      
      // Create demo profile
      const profile = {
        userId: user._id,
        preferences: {
          theme: 'dark',
          locale: 'en',
          notifications: true
        },
        onboardingCompleted: false,
        lastActivityAt: new Date()
      };
      demoProfiles.push(profile);
      
      // Create demo selections
      const selections = {
        userId: user._id,
        data: {
          language: '',
          uiTesting: '',
          testFramework: '',
          bddFramework: '',
          mobileTesting: '',
          buildTool: '',
          apiTesting: '',
          database: '',
          cicd: '',
          testManagement: ''
        },
        version: 1,
        updatedAt: new Date()
      };
      demoSelections.push(selections);
      
      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user._id);
      
      // Set cookies
      setAuthCookies(res, accessToken, refreshToken);
      
      res.status(201).json({
        message: 'User registered successfully (Demo Mode)',
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt
        }
      });
      return;
    }
    
    // Production mode - existing code
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }
    
    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Create user
    const user = new User({
      email,
      name,
      passwordHash,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff`
    });
    
    await user.save();
    
    // Create user profile
    const profile = new Profile({
      userId: user._id
    });
    await profile.save();
    
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);
    
    // Store refresh token
    await storeRefreshToken(
      user._id, 
      refreshToken, 
      req.get('User-Agent') || 'Unknown', 
      req.ip
    );
    
    // Set cookies
    setAuthCookies(res, accessToken, refreshToken);
    
    // Return user data (without password)
    const userResponse = {
      id: user._id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt
    };
    
    res.status(201).json({
      message: 'User registered successfully',
      user: userResponse
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', authLimiter, validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (isDemoMode()) {
      // Demo mode - simple password check
      const user = demoUsers.find(u => u.email === email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      
      // In demo mode, accept any password
      if (!password) {
        return res.status(401).json({ error: 'Password required' });
      }
      
      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user._id);
      
      // Set cookies
      setAuthCookies(res, accessToken, refreshToken);
      
      // Get user profile
      const profile = demoProfiles.find(p => p.userId === user._id);
      
      res.json({
        message: 'Login successful (Demo Mode)',
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
          profile: profile ? {
            preferences: profile.preferences,
            onboardingCompleted: profile.onboardingCompleted,
            lastActivityAt: profile.lastActivityAt
          } : null
        }
      });
      return;
    }
    
    // Production mode - existing code
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);
    
    // Store refresh token
    await storeRefreshToken(
      user._id, 
      refreshToken, 
      req.get('User-Agent') || 'Unknown', 
      req.ip
    );
    
    // Set cookies
    setAuthCookies(res, accessToken, refreshToken);
    
    // Get user profile
    const profile = await Profile.findOne({ userId: user._id });
    
    // Return user data (without password)
    const userResponse = {
      id: user._id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      profile: profile ? {
        preferences: profile.preferences,
        onboardingCompleted: profile.onboardingCompleted,
        lastActivityAt: profile.lastActivityAt
      } : null
    };
    
    res.json({
      message: 'Login successful',
      user: userResponse
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/auth/refresh
router.post('/refresh', refreshLimiter, verifyRefreshToken, async (req, res) => {
  try {
    const { user, refreshTokenRecord } = req;
    
    // Revoke old refresh token
    await RefreshToken.findByIdAndUpdate(refreshTokenRecord._id, {
      revokedAt: new Date()
    });
    
    // Generate new tokens
    const { accessToken, refreshToken } = generateTokens(user._id);
    
    // Store new refresh token
    await storeRefreshToken(
      user._id, 
      refreshToken, 
      req.get('User-Agent') || 'Unknown', 
      req.ip
    );
    
    // Set new cookies
    setAuthCookies(res, accessToken, refreshToken);
    
    res.json({ message: 'Tokens refreshed successfully' });
    
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({ error: 'Token refresh failed' });
  }
});

// POST /api/auth/logout
router.post('/logout', async (req, res) => {
  try {
    const refreshToken = req.cookies.refresh_token;
    
    if (refreshToken) {
      // Revoke refresh token
      await revokeRefreshToken(refreshToken);
    }
    
    // Clear cookies
    clearAuthCookies(res);
    
    res.json({ message: 'Logout successful' });
    
  } catch (error) {
    console.error('Logout error:', error);
    // Still clear cookies even if there's an error
    clearAuthCookies(res);
    res.json({ message: 'Logout successful' });
  }
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  try {
    const accessToken = req.cookies.access_token;
    
    if (!accessToken) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const jwt = require('jsonwebtoken');
    const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'your-access-secret-key';
    
    try {
      const decoded = jwt.verify(accessToken, JWT_ACCESS_SECRET);
      
      if (decoded.type !== 'access') {
        return res.status(401).json({ error: 'Invalid token type' });
      }
      
      if (isDemoMode()) {
        // Demo mode
        const user = demoUsers.find(u => u._id === decoded.userId);
        if (!user) {
          return res.status(401).json({ error: 'User not found' });
        }
        
        const profile = demoProfiles.find(p => p.userId === user._id);
        const selections = demoSelections.find(s => s.userId === user._id);
        const progressSummary = demoProgress.filter(p => p.userId === user._id);
        
        const userResponse = {
          id: user._id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
          profile: profile ? {
            preferences: profile.preferences,
            onboardingCompleted: profile.onboardingCompleted,
            lastActivityAt: profile.lastActivityAt
          } : null,
          selections: selections ? {
            data: selections.data,
            version: selections.version
          } : null,
          progressSummary
        };
        
        res.json({ user: userResponse });
        return;
      }
      
      // Production mode - existing code
      const user = await User.findById(decoded.userId).select('-passwordHash');
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }
      
      // Get profile
      const profile = await Profile.findOne({ userId: user._id });
      
      // Get selections
      const Selections = require('../models').Selections;
      const selections = await Selections.findOne({ userId: user._id });
      
      // Get progress summary
      const Progress = require('../models').Progress;
      const progressSummary = await Progress.aggregate([
        { $match: { userId: user._id } },
        { $group: {
          _id: '$tutorialId',
          status: { $first: '$status' },
          percent: { $first: '$percent' },
          lastUpdated: { $first: '$updatedAt' }
        }}
      ]);
      
      const userResponse = {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        profile: profile ? {
          preferences: profile.preferences,
          onboardingCompleted: profile.onboardingCompleted,
          lastActivityAt: profile.lastActivityAt
        } : null,
        selections: selections ? {
          data: selections.data,
          version: selections.version
        } : null,
        progressSummary
      };
      
      res.json({ user: userResponse });
      
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Access token expired' });
      }
      return res.status(401).json({ error: 'Invalid access token' });
    }
    
  } catch (error) {
    console.error('Me endpoint error:', error);
    res.status(500).json({ error: 'Failed to get user data' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists or not
      return res.json({ message: 'If the email exists, a reset link has been sent' });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour
    
    // Store reset token (you might want to create a separate collection for this)
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = resetTokenExpiry;
    await user.save();
    
    // In a real app, you would send an email here
    console.log(`Password reset token for ${email}: ${resetToken}`);
    
    res.json({ message: 'If the email exists, a reset link has been sent' });
    
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process password reset request' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), async (req, res) => {
  try {
    const { token, password } = req.body;
    
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: new Date() }
    });
    
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }
    
    // Hash new password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Update user
    user.passwordHash = passwordHash;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();
    
    // Revoke all refresh tokens
    await revokeAllUserRefreshTokens(user._id);
    
    res.json({ message: 'Password reset successfully' });
    
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

module.exports = router;
