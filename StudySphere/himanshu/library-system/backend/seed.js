const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './studysphere.db'
});

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...');

    const User = require('./models/User')(sequelize, Sequelize);
    const Book = require('./models/Book')(sequelize, Sequelize);
    const Seat = require('./models/Seat')(sequelize, Sequelize);

    await sequelize.sync({ alter: true });

    // Check if admin already exists
    const adminCount = await User.count({ where: { email: 'admin@test.com' } });
    
    if (adminCount === 0) {
      // Create admin user
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        name: 'Admin User',
        email: 'admin@test.com',
        password: hashedPassword,
        department: 'Library',
        role: 'admin'
      });
      console.log('✅ Admin user created (admin@test.com / admin123)');
    }

    // Create sample student
    const studentCount = await User.count({ where: { email: 'student@test.com' } });
    
    if (studentCount === 0) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      await User.create({
        name: 'John Student',
        email: 'student@test.com',
        password: hashedPassword,
        department: 'Computer Engineering',
        role: 'student'
      });
      console.log('✅ Student user created (student@test.com / password123)');
    }

    // Add sample books
    const booksCount = await Book.count();
    
    if (booksCount === 0) {
      const sampleBooks = [
        ['Data Structures and Algorithms', 'Mark Allen Weiss', 'Computer Science', 3, '978-0132847377', '2nd Edition', 5, 'Shelf A-1'],
        ['Introduction to Algorithms', 'Thomas H. Cormen', 'Computer Science', 4, '978-0262033848', '3rd Edition', 3, 'Shelf A-2'],
        ['Clean Code', 'Robert C. Martin', 'Computer Science', 5, '978-0132350884', '1st Edition', 4, 'Shelf A-3'],
        ['Design Patterns', 'Erich Gamma', 'Computer Science', 6, '978-0201633610', '1st Edition', 3, 'Shelf A-4'],
        ['Operating System Concepts', 'Abraham Silberschatz', 'Computer Science', 4, '978-1118063330', '9th Edition', 4, 'Shelf A-5'],
        ['Computer Networks', 'Andrew S. Tanenbaum', 'Computer Science', 5, '978-0132126953', '5th Edition', 3, 'Shelf B-1'],
        ['Database System Concepts', 'Abraham Silberschatz', 'Computer Science', 5, '978-0073523323', '6th Edition', 4, 'Shelf B-2'],
        ['Artificial Intelligence', 'Stuart Russell', 'Computer Science', 7, '978-0136042594', '3rd Edition', 3, 'Shelf B-3'],
        ['Calculus', 'James Stewart', 'Mathematics', 1, '978-0538497817', '7th Edition', 5, 'Shelf C-1'],
        ['Linear Algebra', 'Gilbert Strang', 'Mathematics', 2, '978-0980232714', '4th Edition', 4, 'Shelf C-2'],
        ['Physics for Scientists', 'Douglas Giancoli', 'Physics', 1, '978-0321869111', '7th Edition', 4, 'Shelf D-1'],
        ['Organic Chemistry', 'Paula Bruice', 'Chemistry', 2, '978-0321811691', '7th Edition', 3, 'Shelf D-2'],
        ['Biology', 'Neil Campbell', 'Biology', 1, '978-0061120084', '1st Edition', 4, 'Shelf D-3'],
        ['Engineering Mechanics', 'R.C. Hibbeler', 'Engineering', 3, '978-0133915426', '14th Edition', 5, 'Shelf E-1'],
        ['To Kill a Mockingbird', 'Harper Lee', 'Literature', null, '978-0061120084', '1st Edition', 3, 'Shelf F-1']
      ];

      for (const book of sampleBooks) {
        await Book.create({
          title: book[0],
          author: book[1],
          subject: book[2],
          semester: book[3],
          isbn: book[4],
          edition: book[5],
          total_copies: book[6],
          available_copies: book[6],
          location: book[7]
        });
      }
      console.log('✅ Sample books added (15 books)');
    }

    // Add sample seats
    const seatsCount = await Seat.count();
    
    if (seatsCount === 0) {
      const sections = [
        { name: 'Reading Hall A', seats: 50 },
        { name: 'Reading Hall B', seats: 50 },
        { name: 'Quiet Zone', seats: 20 }
      ];

      for (const section of sections) {
        for (let i = 1; i <= section.seats; i++) {
          await Seat.create({
            seat_number: `${section.name}-${i}`,
            section: section.name,
            status: 'available'
          });
        }
      }
      console.log('✅ Sample seats created (120 total)');
    }

    console.log('🎉 Database seeding completed!');
    console.log('');
    console.log('📊 Login Credentials:');
    console.log('   Admin: admin@test.com / admin123');
    console.log('   Student: student@test.com / password123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seedDatabase();
