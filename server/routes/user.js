const express = require('express');
const { User, Profile, Selections, Progress, Notes } = require('../models');
const { verifyAccessToken } = require('../middleware/auth');
const { 
  validate, 
  profileUpdateSchema, 
  selectionsUpdateSchema, 
  progressUpdateSchema,
  noteCreateSchema,
  noteUpdateSchema 
} = require('../middleware/validation');

const router = express.Router();

// Demo data (in-memory for testing)
let demoSelections = [];
let demoProgress = [];

// All routes require authentication
router.use(verifyAccessToken);

// GET /api/user/profile
router.get('/profile', async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.userId });
    
    if (!profile) {
      // Create default profile if it doesn't exist
      const newProfile = new Profile({ userId: req.userId });
      await newProfile.save();
      return res.json({ profile: newProfile });
    }
    
    res.json({ profile });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// PUT /api/user/profile
router.put('/profile', validate(profileUpdateSchema), async (req, res) => {
  try {
    const { name, avatar, preferences } = req.body;
    
    // Update user if name or avatar provided
    if (name || avatar) {
      const updateData = {};
      if (name) updateData.name = name;
      if (avatar) updateData.avatar = avatar;
      
      await User.findByIdAndUpdate(req.userId, updateData);
    }
    
    // Update profile
    const profile = await Profile.findOneAndUpdate(
      { userId: req.userId },
      { 
        $set: preferences ? { preferences } : {},
        $setOnInsert: { userId: req.userId }
      },
      { upsert: true, new: true }
    );
    
    res.json({ profile });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// GET /api/user/selections
router.get('/selections', async (req, res) => {
  try {
    // Check if we're in demo mode
    const isDemoMode = () => {
      try {
        require('../models');
        return false;
      } catch (error) {
        return true;
      }
    };
    
    if (isDemoMode()) {
      // Demo mode - get from in-memory storage
      const selections = demoSelections.find(s => s.userId === req.userId);
      
      if (!selections) {
        // Create default selections
        const newSelections = {
          userId: req.userId,
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
        demoSelections.push(newSelections);
        return res.json({ 
          data: newSelections.data, 
          version: newSelections.version 
        });
      }
      
      res.json({ 
        data: selections.data, 
        version: selections.version 
      });
      return;
    }
    
    // Production mode
    const selections = await Selections.findOne({ userId: req.userId });
    
    if (!selections) {
      // Create default selections if they don't exist
      const newSelections = new Selections({ userId: req.userId });
      await newSelections.save();
      return res.json({ 
        data: newSelections.data, 
        version: newSelections.version 
      });
    }
    
    res.json({ 
      data: selections.data, 
      version: selections.version 
    });
  } catch (error) {
    console.error('Get selections error:', error);
    res.status(500).json({ error: 'Failed to get selections' });
  }
});

// PUT /api/user/selections
router.put('/selections', validate(selectionsUpdateSchema), async (req, res) => {
  try {
    const { data, version } = req.body;
    
    console.log('PUT /api/user/selections - userId:', req.userId, 'version:', version, 'data:', data);
    
    // Check if userId is present
    if (!req.userId) {
      console.error('No userId in request - auth middleware may not be working');
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    // Check if we're in demo mode
    const isDemoMode = () => {
      try {
        const models = require('../models');
        if (models && models.Selections) {
          console.log('Production mode detected - models available');
          return false;
        }
        console.log('Demo mode detected - no models');
        return true;
      } catch (error) {
        console.log('Demo mode detected - models require error:', error.message);
        return true;
      }
    };
    
    const isDemo = isDemoMode();
    console.log('isDemoMode result:', isDemo);
    
    if (isDemoMode()) {
      // Demo mode - update in-memory storage
      const existingSelections = demoSelections.find(s => s.userId === req.userId);
      
      if (existingSelections && existingSelections.version !== version) {
        return res.status(409).json({
          error: 'Version conflict',
          currentVersion: existingSelections.version,
          currentData: existingSelections.data
        });
      }
      
      const updatedSelections = {
        userId: req.userId,
        data,
        version: version + 1,
        updatedAt: new Date()
      };
      
      const index = demoSelections.findIndex(s => s.userId === req.userId);
      if (index >= 0) {
        demoSelections[index] = updatedSelections;
      } else {
        demoSelections.push(updatedSelections);
      }
      
      console.log('Demo mode - updated selections:', updatedSelections);
      return res.json({ 
        data: updatedSelections.data, 
        version: updatedSelections.version 
      });
    }
    
    console.log('Production mode - updating selections');
    // Production mode - should not reach here in demo mode
    const { Selections } = require('../models');
    const existingSelections = await Selections.findOne({ userId: req.userId });
    
    if (existingSelections && existingSelections.version !== version) {
      return res.status(409).json({
        error: 'Version conflict',
        currentVersion: existingSelections.version,
        currentData: existingSelections.data
      });
    }
    
    // Update selections
    const selections = await Selections.findOneAndUpdate(
      { userId: req.userId },
      { 
        data,
        $inc: { version: 1 } // Increment version
      },
      { upsert: true, new: true }
    );
    
    res.json({ 
      data: selections.data, 
      version: selections.version 
    });
  } catch (error) {
    console.error('Update selections error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to update selections', details: error.message });
  }
});

// GET /api/user/progress/:tutorialId
router.get('/progress/:tutorialId', async (req, res) => {
  try {
    const { tutorialId } = req.params;
    
    const progress = await Progress.find({ 
      userId: req.userId, 
      tutorialId 
    }).sort({ sectionId: 1 });
    
    res.json({ progress });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ error: 'Failed to get progress' });
  }
});

// PUT /api/user/progress/:tutorialId
router.put('/progress/:tutorialId', validate(progressUpdateSchema), async (req, res) => {
  try {
    const { tutorialId } = req.params;
    const { sectionId, status, currentStep, percent, version } = req.body;
    
    // Check version for optimistic concurrency
    const existingProgress = await Progress.findOne({ 
      userId: req.userId, 
      tutorialId, 
      sectionId 
    });
    
    if (existingProgress && existingProgress.version !== version) {
      return res.status(409).json({
        error: 'Version conflict',
        currentVersion: existingProgress.version,
        currentProgress: {
          status: existingProgress.status,
          currentStep: existingProgress.currentStep,
          percent: existingProgress.percent
        }
      });
    }
    
    // Update progress
    const progress = await Progress.findOneAndUpdate(
      { userId: req.userId, tutorialId, sectionId },
      { 
        status,
        currentStep,
        percent,
        version,
        $inc: { version: 1 } // Increment version
      },
      { upsert: true, new: true }
    );
    
    res.json({ 
      status: progress.status,
      currentStep: progress.currentStep,
      percent: progress.percent,
      version: progress.version
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

// GET /api/user/notes
router.get('/notes', async (req, res) => {
  try {
    const { tutorialId } = req.query;
    
    const query = { userId: req.userId };
    if (tutorialId) {
      query.tutorialId = tutorialId;
    }
    
    const notes = await Notes.find(query).sort({ createdAt: -1 });
    
    res.json({ notes });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ error: 'Failed to get notes' });
  }
});

// POST /api/user/notes
router.post('/notes', validate(noteCreateSchema), async (req, res) => {
  try {
    const { tutorialId, content } = req.body;
    
    const note = new Notes({
      userId: req.userId,
      tutorialId,
      content
    });
    
    await note.save();
    
    res.status(201).json({ note });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// PUT /api/user/notes/:id
router.put('/notes/:id', validate(noteUpdateSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    
    const note = await Notes.findOneAndUpdate(
      { _id: id, userId: req.userId },
      { content },
      { new: true }
    );
    
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    res.json({ note });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// DELETE /api/user/notes/:id
router.delete('/notes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const note = await Notes.findOneAndDelete({ 
      _id: id, 
      userId: req.userId 
    });
    
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

module.exports = router;
