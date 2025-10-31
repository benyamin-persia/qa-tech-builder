# 21st.dev Extension Setup Guide for QA Tech Builder

## 🚀 Quick Setup Steps

### 1. Install the Code Editor Extension
- **VS Code**: Install from VS Code Marketplace or Extensions tab
- **Cursor**: Install from Extensions tab or manually from Open VSX
- **Windsurf**: Install from Extensions tab

### 2. Install the Toolbar Package (Optional)
```bash
# Try one of these commands:
npm install -D @21st-extension/toolbar-react @21st-extension/react
# OR
npm install -D @21st-extension/toolbar
# OR
npm install -D @stagewise/toolbar
```

**Note**: The toolbar packages may not be available yet. The app works perfectly without them. The toolbar integration is optional and won't break your application.

### 3. Auto-Setup (Recommended)
In Cursor:
1. Press `CMD + Shift + P` (Mac) or `Ctrl + Shift + P` (Windows)
2. Type `setupToolbar`
3. Execute the command
4. The toolbar will initialize automatically! 🦄

### 4. Manual Setup (Alternative)
The toolbar is already configured in your App.js file. It will automatically initialize when you run the development server.

## 🎯 How to Use

### Select Elements
1. **Click the toolbar icon** in your browser
2. **Select any element** in your QA Tech Builder app
3. **Leave a comment** about what you want to change
4. **Let AI do the magic** - it will send the context to your code editor

### Supported Elements
- ✅ **Technology Options** - Select any tech option to modify it
- ✅ **Progress Bar** - Select to change the progress indicator
- ✅ **Tech Stack Preview** - Select to modify the preview panel
- ✅ **Navigation Buttons** - Select to change button behavior
- ✅ **Popularity Bars** - Select to modify the popularity display

### Example Prompts
- "Make this technology option more prominent"
- "Change the color of the popularity bar to blue"
- "Add a tooltip to this element"
- "Make this button larger and more clickable"
- "Add an animation to this tech selection"

## 🔧 Configuration

The toolbar is configured with:
- **Project Name**: QA Tech Builder
- **Description**: QA Testing Technology Stack Builder
- **Development Mode Only**: Only works in development
- **Data Attributes**: Rich metadata for AI context

## 🚨 Troubleshooting

### If package installation fails:
1. **App still works** - The toolbar is optional and won't break your app
2. **Try different package names** - `@21st-extension/toolbar` or `@stagewise/toolbar`
3. **Use auto-setup** - The extension can inject the toolbar automatically
4. **Check package availability** - The package might not be published yet

### If nothing happens when sending prompts:
1. **Keep only one Cursor window open** - Multiple windows can cause confusion
2. **Check console** - Look for "🚀 21st.dev toolbar initialized successfully!"
3. **Verify extension** - Make sure the extension is installed and enabled

### If toolbar doesn't appear:
1. **Check development mode** - Toolbar only works in development
2. **Refresh the page** - Sometimes needs a refresh after installation
3. **Check browser console** - Look for any error messages
4. **Try auto-setup command** - Use `setupToolbar` in your editor

## 🎨 Features Available

- **Element Selection**: Click any UI element
- **Context Awareness**: AI gets full DOM context
- **Rich Metadata**: Technology names, popularity, categories
- **Real-time Editing**: Changes appear immediately
- **Component Understanding**: AI knows React component structure

## 🚀 Ready to Go!

Your QA Tech Builder is now equipped with the 21st.dev extension! 

1. **Start your dev server**: `npm run dev`
2. **Open the toolbar** in your browser
3. **Select elements** and start building with AI! 🎉
