# 🚀 Quick Start Guide - Fix Connection Issues

## ❌ Current Problem
The frontend is showing "Loading quizzes..." because it can't connect to the backend server on `localhost:4000`.

## ✅ Solution Steps

### Step 1: Start the Backend Server

**Option A: Using the batch file (Windows)**
```bash
# Double-click on start-backend.bat file
# OR run in terminal:
start-backend.bat
```

**Option B: Manual start**
```bash
# Open terminal/command prompt
cd backend
npm install
npm run dev
```

### Step 2: Verify Backend is Running
1. Open browser and go to: `http://localhost:4000`
2. You should see: `{"success":true,"message":"Tech Quiz API Server is running!"}`
3. Check `http://localhost:4000/api/status` for server status

### Step 3: Start the Frontend
```bash
# Open new terminal/command prompt
cd frontend
npm install
npm run dev
```

### Step 4: Test the Application
1. Go to `http://localhost:5173`
2. The app should now load without "Loading quizzes..." error
3. You should see the quiz list or login page

## 🔧 Troubleshooting

### If Backend Won't Start:

**Check if port 4000 is free:**
```bash
# Windows
netstat -ano | findstr :4000

# If something is using port 4000, kill it:
taskkill /PID <PID_NUMBER> /F
```

**Install MongoDB:**
```bash
# Download from: https://www.mongodb.com/try/download/community
# Or use MongoDB Atlas (cloud)
```

**Create .env file in backend folder:**
```env
MONGO_URL=mongodb://localhost:27017/tech-quiz-app
SECRET_KEY=your-super-secret-jwt-key-here
PORT=4000
NODE_ENV=development
```

### If Frontend Still Shows Errors:

**Clear browser cache:**
- Press `Ctrl + Shift + R` to hard refresh
- Or open Developer Tools → Network → Disable cache

**Check console for errors:**
- Press `F12` → Console tab
- Look for any red error messages

## 📋 Required Services

### 1. MongoDB Database
- **Local**: Install MongoDB Community Server
- **Cloud**: Use MongoDB Atlas (recommended)

### 2. Node.js
- **Version**: 16+ required
- **Check**: `node --version`

### 3. Ports
- **Frontend**: 5173 (Vite default)
- **Backend**: 4000 (Express server)
- **Database**: 27017 (MongoDB default)

## 🚨 Common Issues & Solutions

### Issue: "ERR_INSUFFICIENT_RESOURCES"
**Solution**: 
1. Restart your computer
2. Close other applications using network
3. Check if antivirus is blocking connections

### Issue: "Failed to fetch"
**Solution**:
1. Make sure backend is running on port 4000
2. Check CORS configuration
3. Verify MongoDB is running

### Issue: "Cannot connect to database"
**Solution**:
1. Start MongoDB service
2. Check connection string in .env file
3. Use MongoDB Atlas for cloud database

## ✅ Success Indicators

When everything is working correctly, you should see:

**Backend Console:**
```
🚀 Tech Quiz API Server Started!
📍 Server running on: http://localhost:4000
🌐 Environment: development
📊 Database: mongodb://localhost:27017/tech-quiz-app
✅ Ready to accept requests!
```

**Frontend Console:**
- No red errors
- Network requests showing 200 status
- Quiz list loading properly

**Browser:**
- No "Loading quizzes..." spinner
- Quiz cards visible
- No network errors in DevTools

## 🆘 Still Having Issues?

1. **Check all services are running:**
   - Backend: `http://localhost:4000`
   - Frontend: `http://localhost:5173`
   - Database: MongoDB service

2. **Verify file structure:**
   ```
   tech-quiz-app/
   ├── backend/
   │   ├── server.js
   │   ├── package.json
   │   └── .env (create if missing)
   ├── frontend/
   │   ├── src/
   │   └── package.json
   └── start-backend.bat
   ```

3. **Check network connectivity:**
   - Disable firewall temporarily
   - Check antivirus settings
   - Try different browser

4. **Reset everything:**
   ```bash
   # Stop all services (Ctrl+C)
   # Clear node_modules
   rm -rf backend/node_modules frontend/node_modules
   # Reinstall
   cd backend && npm install
   cd ../frontend && npm install
   # Restart services
   ```

---

**Need more help?** Check the main README.md for detailed setup instructions.
