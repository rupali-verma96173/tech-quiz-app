# Tech Quiz App - Setup Instructions

## 🚀 Quick Start Guide

This guide will help you set up the Tech Quiz Application on your local development environment.

---

## 📋 Prerequisites

### Required Software
- **Node.js** (v16.0.0 or higher)
- **MongoDB** (v4.4 or higher)
- **Git** (for version control)
- **Code Editor** (VS Code recommended)

### System Requirements
- **RAM**: Minimum 4GB (8GB recommended)
- **Storage**: At least 2GB free space
- **OS**: Windows 10+, macOS 10.15+, or Linux

---

## 🔧 Installation Steps

### Step 1: Clone the Repository
```bash
# Clone the repository
git clone <repository-url>
cd tech-quiz-app

# Verify the project structure
ls -la
```

### Step 2: Backend Setup

#### Install Dependencies
```bash
cd backend
npm install
```

#### Environment Configuration
Create a `.env` file in the backend directory:
```bash
# Backend/.env
MONGO_URL=mongodb://localhost:27017/tech-quiz-app
SECRET_KEY=your-super-secret-key-here-make-it-long-and-random
PORT=4000
NODE_ENV=development
```

**Important**: Replace `your-super-secret-key-here-make-it-long-and-random` with a strong, random secret key.

#### Database Setup
```bash
# Start MongoDB (choose one method)

# Method 1: Local MongoDB
mongod

# Method 2: Using MongoDB Compass
# Open MongoDB Compass and connect to localhost:27017

# Method 3: Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

#### Seed Admin User (Optional)
```bash
# Create an admin user for testing
npm run seed:admin
```

#### Start Backend Server
```bash
# Development mode with auto-restart
npm run dev

# Or production mode
npm start
```

The backend server will start on `http://localhost:4000`

### Step 3: Frontend Setup

#### Install Dependencies
```bash
cd ../frontend
npm install
```

#### Start Frontend Development Server
```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

---

## 🗄️ Database Configuration

### MongoDB Setup Options

#### Option 1: Local MongoDB Installation

**Windows:**
1. Download MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Run the installer
3. Start MongoDB service: `net start MongoDB`

**macOS:**
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/brew/mongodb-community
```

**Linux (Ubuntu/Debian):**
```bash
# Import MongoDB public key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create list file
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
```

#### Option 2: MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get connection string
4. Update `.env` file:
```env
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/tech-quiz-app
```

#### Option 3: Docker
```bash
# Run MongoDB in Docker container
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  mongo:latest

# Update .env file
MONGO_URL=mongodb://admin:password@localhost:27017/tech-quiz-app
```

---

## 🔐 Security Configuration

### Environment Variables
Create a secure `.env` file with the following variables:

```env
# Database
MONGO_URL=mongodb://localhost:27017/tech-quiz-app

# JWT Secret (Generate a strong secret)
SECRET_KEY=your-very-long-and-secure-secret-key-here

# Server Configuration
PORT=4000
NODE_ENV=development

# CORS Configuration (for production)
CORS_ORIGIN=http://localhost:5173

# Rate Limiting (optional)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Generate Secure Secret Key
```bash
# Method 1: Using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Method 2: Using OpenSSL
openssl rand -hex 64

# Method 3: Online generator (use with caution)
# Visit: https://generate-secret.vercel.app/64
```

---

## 🧪 Testing the Setup

### Backend Testing
```bash
# Test database connection
curl http://localhost:4000

# Expected response: "Server running successfully!"

# Test API endpoints
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","useremail":"test@example.com","password":"password123"}'
```

### Frontend Testing
1. Open `http://localhost:5173` in your browser
2. You should see the login page
3. Try creating a new account
4. Test the quiz functionality

### Database Testing
```bash
# Connect to MongoDB
mongo

# Or using MongoDB Compass
# Connect to: mongodb://localhost:27017
```

---

## 🚀 Production Deployment

### Backend Deployment

#### Using Heroku
```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create Heroku app
heroku create your-app-name

# Set environment variables
heroku config:set MONGO_URL=your-mongodb-atlas-url
heroku config:set SECRET_KEY=your-production-secret-key
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

#### Using DigitalOcean
```bash
# Create droplet
# Install Node.js and MongoDB
# Clone repository
# Set up PM2 for process management
npm install -g pm2
pm2 start server.js --name "tech-quiz-api"
pm2 startup
pm2 save
```

### Frontend Deployment

#### Using Netlify
1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Set environment variables in Netlify dashboard

#### Using Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

---

## 🔧 Development Tools

### Recommended VS Code Extensions
- **ES7+ React/Redux/React-Native snippets**
- **Prettier - Code formatter**
- **ESLint**
- **MongoDB for VS Code**
- **Thunder Client** (for API testing)

### Useful Commands
```bash
# Backend development
npm run dev          # Start development server
npm run seed:admin   # Create admin user
npm test            # Run tests (if available)

# Frontend development
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
```

---

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port 4000
lsof -i :4000

# Kill the process
kill -9 <PID>

# Or use different port
PORT=4001 npm run dev
```

#### MongoDB Connection Issues
```bash
# Check if MongoDB is running
brew services list | grep mongodb

# Start MongoDB
brew services start mongodb

# Check MongoDB logs
tail -f /usr/local/var/log/mongodb/mongo.log
```

#### Node.js Version Issues
```bash
# Check Node.js version
node --version

# Install correct version using nvm
nvm install 16
nvm use 16
```

#### Permission Issues (Linux/macOS)
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm

# Or use nvm to avoid permission issues
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

### Database Issues

#### Reset Database
```bash
# Connect to MongoDB
mongo

# Drop database
use tech-quiz-app
db.dropDatabase()

# Restart application
```

#### Backup Database
```bash
# Create backup
mongodump --db tech-quiz-app --out ./backup

# Restore backup
mongorestore --db tech-quiz-app ./backup/tech-quiz-app
```

---

## 📊 Performance Optimization

### Backend Optimization
```javascript
// Enable compression
app.use(compression());

// Set up caching
app.use(express.static('public', {
  maxAge: '1d'
}));

// Database indexing
db.quizzes.createIndex({ "technology": 1, "isPublished": 1 });
db.attempts.createIndex({ "userId": 1, "createdAt": -1 });
```

### Frontend Optimization
```javascript
// Enable code splitting
const LazyComponent = React.lazy(() => import('./Component'));

// Use React.memo for expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  // Component logic
});
```

---

## 🔒 Security Checklist

### Development Security
- [ ] Use strong JWT secret key
- [ ] Enable HTTPS in production
- [ ] Validate all inputs
- [ ] Use environment variables for secrets
- [ ] Implement rate limiting
- [ ] Set up CORS properly
- [ ] Use helmet.js for security headers

### Production Security
- [ ] Use MongoDB Atlas with authentication
- [ ] Enable MongoDB encryption at rest
- [ ] Set up SSL certificates
- [ ] Configure firewall rules
- [ ] Monitor for suspicious activity
- [ ] Regular security updates

---

## 📈 Monitoring and Logging

### Application Monitoring
```javascript
// Add logging middleware
app.use(morgan('combined'));

// Error tracking
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});
```

### Database Monitoring
```bash
# Monitor MongoDB performance
mongostat

# Check database size
db.stats()
```

---

## 🆘 Getting Help

### Support Channels
- **GitHub Issues**: Report bugs and feature requests
- **Documentation**: Check README.md and API documentation
- **Community**: Join our developer community

### Debug Mode
```bash
# Enable debug logging
DEBUG=app:* npm run dev

# Or set specific debug flags
DEBUG=app:auth,app:database npm run dev
```

---

## 📝 Additional Resources

### Documentation
- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [React Documentation](https://reactjs.org/docs/)
- [JWT Documentation](https://jwt.io/)

### Tutorials
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [MongoDB University](https://university.mongodb.com/)
- [React Patterns](https://reactpatterns.com/)

---

*This setup guide is regularly updated. Check back for the latest instructions and improvements.*

**Last Updated**: January 2024
**Version**: 1.0.0
