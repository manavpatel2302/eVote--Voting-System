# 🗳️ Voting Website

A complete, secure voting website built with Node.js, Express.js, MongoDB, and vanilla HTML/CSS/JavaScript. This project implements a full-stack voting system with user authentication, secure vote casting, and real-time results.

## ✨ Features

### 🔐 User Authentication

- **User Registration** with email verification
- **Secure Login/Logout** with JWT tokens
- **Password Reset** via email
- **Role-based Access Control** (Voter/Admin)
- **Email Verification** system

### 🗳️ Voting System

- **Secure Vote Casting** with one-vote-per-user restriction
- **Duplicate Vote Prevention**
- **Real-time Results** with live updates
- **Admin Dashboard** for detailed analytics
- **Vote Tracking** with timestamps and IP logging

### 🎨 Frontend

- **Responsive Design** for all devices
- **Modern UI/UX** with beautiful styling
- **Real-time Updates** without page refresh
- **Interactive Charts** for results visualization
- **Mobile-friendly** navigation

### 🔧 Backend

- **RESTful API** design
- **JWT Authentication** for secure sessions
- **MongoDB** for data persistence
- **Input Validation** and error handling
- **Email Integration** for notifications

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v14 or higher)
- **MongoDB** (local installation or MongoDB Atlas)
- **Git**

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd voting-website
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   ```bash
   # Copy the example environment file
   cp env.example .env

   # Edit .env with your configuration
   nano .env
   ```

4. **Configure Environment Variables**

   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/voting-website

   # JWT Secret (generate a strong secret)
   JWT_SECRET=your-super-secret-jwt-key-here

   # Server Port
   PORT=3000

   # Email Configuration (for password reset)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password

   # Frontend URL
   FRONTEND_URL=http://localhost:3000
   ```

5. **Start MongoDB**

   ```bash
   # If using local MongoDB
   mongod

   # Or start MongoDB service
   sudo systemctl start mongod
   ```

6. **Run the application**

   ```bash
   # Development mode with auto-restart
   npm run dev

   # Or production mode
   npm start
   ```

7. **Access the application**
   - **Frontend**: http://localhost:3000
   - **API**: http://localhost:3000/api
   - **Admin Dashboard**: http://localhost:3000/admin

## 📁 Project Structure

```
voting-website/
├── models/                 # MongoDB schemas
│   ├── User.js            # User model with authentication
│   └── Vote.js            # Vote model with validation
├── controllers/           # Business logic
│   ├── authController.js  # Authentication operations
│   └── voteController.js  # Voting operations
├── middleware/            # Custom middleware
│   ├── auth.js           # JWT authentication
│   └── validation.js     # Input validation
├── routes/               # API routes
│   ├── auth.js          # Authentication routes
│   ├── vote.js          # Voting routes
│   └── index.js         # Main routes
├── public/              # Frontend files
│   ├── index.html       # Home page
│   ├── login.html       # Login page
│   ├── signup.html      # Registration page
│   ├── voting.html      # Voting interface
│   ├── results.html     # Results page
│   ├── admin.html       # Admin dashboard
│   ├── forgot-password.html
│   ├── reset-password.html
│   ├── verify-email.html
│   ├── styles.css       # Main stylesheet
│   └── script.js        # Main JavaScript
├── server.js            # Application entry point
├── package.json         # Dependencies and scripts
├── postman-collection.json # API testing collection
└── README.md           # This file
```

## 🔌 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/verify-email/:token` - Verify email
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)
- `POST /api/auth/logout` - Logout user (protected)

### Voting

- `POST /api/vote/cast` - Cast a vote (protected)
- `GET /api/vote/status` - Check vote status (protected)
- `GET /api/vote/results/public` - Get public results
- `GET /api/vote/results` - Get detailed results (admin)
- `GET /api/vote/stats` - Get voting statistics (admin)

### General

- `GET /api/health` - Health check
- `GET /api` - API information

## 🧪 Testing with Postman

1. **Import the collection**

   - Open Postman
   - Click "Import" and select `postman-collection.json`

2. **Set up environment variables**

   - Create a new environment in Postman
   - Set `baseUrl` to `http://localhost:3000`

3. **Run test scenarios**
   - Use the "Complete User Flow" folder for end-to-end testing
   - Use "Error Testing" for edge cases
   - Individual endpoints for specific testing

## 👥 User Roles

### Voter

- Register and verify email
- Cast one vote per election
- View public results
- Update profile

### Admin

- All voter permissions
- View detailed results with voter information
- Access voting statistics
- Monitor voting activity

## 🔒 Security Features

- **Password Hashing** with bcrypt (12 rounds)
- **JWT Tokens** for secure authentication
- **Email Verification** required for voting
- **One Vote Per User** enforcement
- **Input Validation** on all endpoints
- **CORS Protection** configured
- **Rate Limiting** ready for implementation
- **IP Address Logging** for audit trails

## 📧 Email Configuration

### Gmail Setup

1. Enable 2-factor authentication
2. Generate an App Password
3. Use the App Password in `EMAIL_PASS`

### Other Email Providers

Update the email configuration in `.env`:

```env
EMAIL_HOST=your-smtp-host
EMAIL_PORT=587
EMAIL_USER=your-email@domain.com
EMAIL_PASS=your-password
```

## 🎨 Frontend Features

### Pages

- **Home**: Landing page with candidate information
- **Login/Signup**: Authentication forms
- **Voting**: Interactive voting interface
- **Results**: Real-time results with charts
- **Admin**: Comprehensive dashboard
- **Password Reset**: Email-based password recovery

### Responsive Design

- Mobile-first approach
- Tablet and desktop optimized
- Touch-friendly interface
- Accessible navigation

## 🚀 Deployment

### Local Development

```bash
npm run dev
```

### Production

```bash
npm start
```

### Environment Variables for Production

```env
NODE_ENV=production
MONGODB_URI=mongodb://your-production-db
JWT_SECRET=your-production-secret
PORT=3000
```

## 🔧 Customization

### Adding New Candidates

1. Update the candidate options in:
   - `models/Vote.js` (enum values)
   - `public/voting.html` (UI options)
   - `public/results.html` (display names)

### Changing Voting Session

Update the `votingSession` field in:

- `models/Vote.js` (default value)
- `controllers/voteController.js` (session name)

### Styling Customization

- Modify `public/styles.css` for visual changes
- Update color scheme in CSS variables
- Add custom animations and transitions

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**

   - Ensure MongoDB is running
   - Check connection string in `.env`
   - Verify database permissions

2. **Email Not Sending**

   - Check email credentials
   - Verify SMTP settings
   - Check firewall/network restrictions

3. **JWT Token Issues**

   - Ensure `JWT_SECRET` is set
   - Check token expiration
   - Verify token format in requests

4. **Port Already in Use**
   - Change `PORT` in `.env`
   - Kill existing processes: `lsof -ti:3000 | xargs kill`

### Debug Mode

```bash
DEBUG=* npm run dev
```

## 📊 Database Schema

### Users Collection

```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (voter/admin),
  isEmailVerified: Boolean,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Votes Collection

```javascript
{
  voter: ObjectId (ref: User),
  candidate: String (candidate1/candidate2/candidate3/abstain),
  votingSession: String,
  ipAddress: String,
  userAgent: String,
  isVerified: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation

## 🎯 Future Enhancements

- [ ] Real-time notifications
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Social media integration
- [ ] Advanced security features
- [ ] Mobile app development
- [ ] Blockchain integration
- [ ] Advanced reporting

---

**Built By MANAV PATEL with using Node.js, Express.js, MongoDB, and modern web technologies.**
