# StudySphere - Library Management System

A complete digital library management system for students to check book availability, reserve books, track borrowings, and check library seat availability.

## ⚡ Quick Start (First Time Setup)

### Step 1: Install MySQL

Download and install MySQL from: https://dev.mysql.com/downloads/mysql/

During installation:
- Set a root password (remember it!)
- Use default port: 3306

### Step 2: Create Database

Open MySQL Command Line or MySQL Workbench and run:

```sql
CREATE DATABASE studysphere;
```

### Step 3: Configure Backend

Edit `backend\.env` file with your MySQL password:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=studysphere
JWT_SECRET=studysphere_secret_key_2026
```

### Step 4: Seed Database

Open Command Prompt in the project folder and run:

```bash
cd backend
npm run seed
```

### Step 5: Start the Application

**Option A: Use the batch file (Recommended)**

Double-click `start.bat` in the project root folder.

**Option B: Manual start**

Open two command prompts:

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

### Step 6: Access the Application

Open your browser and go to: **http://localhost:3000**

## 📋 Default Login Credentials

**Admin:**
- Email: `admin@test.com`
- Password: `admin123`

**Student:**
- Email: `student@test.com`
- Password: `password123`

## 🎯 Features

- 🔍 **Smart Book Search** - Search by title, author, subject, or semester
- 📚 **Book Availability** - Real-time tracking of available copies
- 📅 **Online Reservation** - Reserve books before visiting the library
- 📋 **Borrow Tracking** - Track borrowed books with due dates
- ⏰ **Due Date Reminders** - Automatic fine calculation for overdue books
- 🪑 **Seat Availability** - Check and occupy library reading hall seats
- 🔐 **User Authentication** - Secure login/register system
- 👨‍💼 **Admin Panel** - Manage books, users, and reservations

## 🛠️ Tech Stack

**Backend:**
- Node.js + Express.js
- MySQL (Database)
- Sequelize ORM
- JWT Authentication
- bcryptjs for password hashing

**Frontend:**
- React 18
- React Router
- Bootstrap 5
- Axios

## 📁 Project Structure

```
library-system/
├── backend/
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── server.js        # Express server
│   ├── seed.js          # Database seeder
│   ├── .env             # Environment variables
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React context
│   │   ├── services/    # API services
│   │   └── App.jsx      # Main app component
│   ├── index.html
│   └── package.json
├── start.bat            # Quick start script
└── README.md
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Books
- `GET /api/books` - Get all books (with filters)
- `GET /api/books/:id` - Get book by ID
- `GET /api/books/:id/similar` - Get similar books

### Borrowed Books
- `GET /api/borrowed` - Get user's borrowed books
- `POST /api/borrowed` - Borrow a book
- `PUT /api/borrowed/:id/return` - Return a book

### Reservations
- `GET /api/reservations` - Get user's reservations
- `POST /api/reservations` - Create reservation
- `DELETE /api/reservations/:id` - Cancel reservation

### Seats
- `GET /api/seats` - Get all seats with stats
- `POST /api/seats/:id/occupy` - Occupy a seat
- `POST /api/seats/:id/release` - Release a seat

### Admin (Requires admin role)
- `GET /api/admin/stats` - Get dashboard stats
- `POST /api/admin/books` - Add new book
- `PUT /api/admin/books/:id` - Update book
- `DELETE /api/admin/books/:id` - Delete book
- `GET /api/admin/users` - Get all users
- `GET /api/admin/reservations` - Get all reservations
- `PUT /api/admin/reservations/:id/approve` - Approve reservation
- `PUT /api/admin/reservations/:id/reject` - Reject reservation
- `POST /api/admin/seats/initialize` - Initialize seats

## 📖 Usage Guide

### For Students

1. **Register/Login** - Create an account or login with provided credentials
2. **Search Books** - Use the search bar or browse the catalog
3. **Borrow Books** - Click on a book, select due date, and borrow
4. **Reserve Books** - If unavailable, reserve the book
5. **Dashboard** - View borrowed books, due dates, and fines
6. **Check Seats** - View and occupy library seats

### For Admins

1. **Login** - Use admin credentials
2. **Dashboard** - View system statistics
3. **Manage Books** - Add, update, or delete books
4. **Reservations** - Approve or reject reservation requests
5. **Initialize Seats** - Set up reading hall seats

## 💰 Fine System

- **Loan Period:** 14 days
- **Fine:** ₹5 per day after due date
- Fines are automatically calculated when returning books

## 🔧 Troubleshooting

### MySQL Connection Error

If you see "Access denied for user 'root'@'localhost'":

1. Open `backend\.env`
2. Update `DB_PASSWORD` with your MySQL root password
3. Run `npm run seed` again

### Port Already in Use

If port 3000 or 5000 is already in use:

1. For frontend: Edit `frontend\vite.config.js` and change `port: 3000`
2. For backend: Edit `backend\.env` and change `PORT=5000`

### Database Not Created

Run this in MySQL:
```sql
CREATE DATABASE studysphere;
```

## 🚀 Future Enhancements

- Email notifications for due dates
- QR code scanning for book checkout
- AI-based book recommendations
- Mobile app version
- Digital library integration

## 📄 License

MIT License
