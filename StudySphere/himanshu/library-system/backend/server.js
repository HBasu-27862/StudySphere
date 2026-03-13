const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './studysphere.db'
});

// Test connection
sequelize.authenticate()
  .then(() => console.log('✅ SQLite Database Connected'))
  .catch(err => console.log('❌ Database Error:', err));

// Models
const User = require('./models/User')(sequelize, Sequelize);
const Book = require('./models/Book')(sequelize, Sequelize);
const BorrowedBook = require('./models/BorrowedBook')(sequelize, Sequelize);
const Reservation = require('./models/Reservation')(sequelize, Sequelize);
const Seat = require('./models/Seat')(sequelize, Sequelize);

// Relationships
User.hasMany(BorrowedBook, { foreignKey: 'user_id' });
BorrowedBook.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Reservation, { foreignKey: 'user_id' });
Reservation.belongsTo(User, { foreignKey: 'user_id' });

Book.hasMany(BorrowedBook, { foreignKey: 'book_id' });
BorrowedBook.belongsTo(Book, { foreignKey: 'book_id' });

Book.hasMany(Reservation, { foreignKey: 'book_id' });
Reservation.belongsTo(Book, { foreignKey: 'book_id' });

// Routes
app.use('/api/auth', require('./routes/auth')(User));
app.use('/api/books', require('./routes/books')(Book));
app.use('/api/reservations', require('./routes/reservations')(Reservation, Book));
app.use('/api/borrowed', require('./routes/borrowed')(BorrowedBook, Book, User));
app.use('/api/seats', require('./routes/seats')(Seat));
app.use('/api/admin', require('./routes/admin')(Book, User, BorrowedBook, Reservation, Seat));

// Sync database and start server
sequelize.sync({ alter: true })
  .then(async () => {
    console.log('✅ Database synchronized');
    
    // Seed initial data if empty
    const User = require('./models/User')(sequelize, Sequelize);
    const bcrypt = require('bcryptjs');
    
    const adminCount = await User.count();
    if (adminCount === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        name: 'Admin User',
        email: 'admin@test.com',
        password: hashedPassword,
        department: 'Library',
        role: 'admin'
      });
      
      const studentHashedPassword = await bcrypt.hash('password123', 10);
      await User.create({
        name: 'John Student',
        email: 'student@test.com',
        password: studentHashedPassword,
        department: 'Computer Engineering',
        role: 'student'
      });
      
      console.log('✅ Default users created');
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 StudySphere Backend running on http://localhost:${PORT}`);
      console.log(`📊 Admin: admin@test.com / admin123`);
      console.log(`👨‍🎓 Student: student@test.com / password123`);
    });
  })
  .catch(err => console.log('❌ Sync Error:', err));
