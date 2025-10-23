@echo off
echo Starting Tech Quiz Backend Server...
echo.

cd backend

echo Installing dependencies if needed...
call npm install

echo.
echo Starting server...
echo Server will run on http://localhost:4000
echo Press Ctrl+C to stop the server
echo.

call npm run dev
