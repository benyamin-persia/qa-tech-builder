const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Profile Schema
const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'dark'
    },
    locale: {
      type: String,
      default: 'en'
    },
    notifications: {
      type: Boolean,
      default: true
    }
  },
  onboardingCompleted: {
    type: Boolean,
    default: false
  },
  lastActivityAt: {
    type: Date,
    default: Date.now
  }
});

// Selections Schema (for tech stack choices)
const selectionsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  data: {
    language: { type: String, default: '' },
    uiTesting: { type: String, default: '' },
    testFramework: { type: String, default: '' },
    bddFramework: { type: String, default: '' },
    mobileTesting: { type: String, default: '' },
    buildTool: { type: String, default: '' },
    apiTesting: { type: String, default: '' },
    database: { type: String, default: '' },
    cicd: { type: String, default: '' },
    testManagement: { type: String, default: '' }
  },
  version: {
    type: Number,
    default: 1
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Progress Schema (for tutorial progress)
const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tutorialId: {
    type: String,
    required: true
  },
  sectionId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed'],
    default: 'not_started'
  },
  currentStep: {
    type: Number,
    default: 0
  },
  percent: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  version: {
    type: Number,
    default: 1
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  indexes: [
    { userId: 1, tutorialId: 1 },
    { userId: 1, tutorialId: 1, sectionId: 1 }
  ]
});

// Notes Schema
const notesSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tutorialId: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Refresh Tokens Schema
const refreshTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tokenHash: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  ip: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  revokedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for performance
refreshTokenSchema.index({ tokenHash: 1 });
refreshTokenSchema.index({ userId: 1 });
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Pre-save middleware to update timestamps
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

profileSchema.pre('save', function(next) {
  this.lastActivityAt = Date.now();
  next();
});

selectionsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  this.version += 1;
  next();
});

progressSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  this.version += 1;
  next();
});

notesSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Models
const User = mongoose.model('User', userSchema);
const Profile = mongoose.model('Profile', profileSchema);
const Selections = mongoose.model('Selections', selectionsSchema);
const Progress = mongoose.model('Progress', progressSchema);
const Notes = mongoose.model('Notes', notesSchema);
const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);

module.exports = {
  User,
  Profile,
  Selections,
  Progress,
  Notes,
  RefreshToken
};








