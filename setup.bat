@echo off
echo 🚀 Setting up QA Tech Builder...

REM Install root dependencies
echo 📦 Installing root dependencies...
npm install

REM Install client dependencies
echo 📦 Installing client dependencies...
cd client
npm install
cd ..

REM Install server dependencies
echo 📦 Installing server dependencies...
cd server
npm install
cd ..

echo ✅ Setup complete!
echo.
echo To start the development servers:
echo   npm run dev
echo.
echo This will start:
echo   - Frontend: http://localhost:3000
echo   - Backend API: http://localhost:5000
echo.
echo To build for production:
echo   npm run build
pause








