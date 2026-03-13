const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const router = express.Router();

module.exports = (Book, User, BorrowedBook, Reservation, Seat) => {
  // Middleware to check admin role
  const isAdmin = async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'No token provided' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      req.userId = decoded.userId;
      next();
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };

  // Dashboard stats
  router.get('/stats', isAdmin, async (req, res) => {
    try {
      const totalBooks = await Book.count();
      const totalUsers = await User.count({ where: { role: 'student' } });
      const totalBorrowed = await BorrowedBook.count({ where: { status: 'borrowed' } });
      const pendingReservations = await Reservation.count({ where: { status: 'pending' } });
      const availableSeats = await Seat.count({ where: { status: 'available' } });
      const totalSeats = await Seat.count();

      res.json({
        stats: {
          totalBooks,
          totalUsers,
          totalBorrowed,
          pendingReservations,
          availableSeats,
          totalSeats
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // Add new book
  router.post('/books', isAdmin, async (req, res) => {
    try {
      const { title, author, subject, semester, isbn, edition, total_copies, location } = req.body;
      
      const book = await Book.create({
        title,
        author,
        subject,
        semester,
        isbn,
        edition,
        total_copies,
        available_copies: total_copies,
        location
      });

      res.json({ message: 'Book added successfully', book });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // Update book
  router.put('/books/:id', isAdmin, async (req, res) => {
    try {
      const book = await Book.findByPk(req.params.id);
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }

      const { title, author, subject, semester, isbn, edition, total_copies, available_copies, location } = req.body;
      
      await book.update({
        title: title || book.title,
        author: author || book.author,
        subject: subject || book.subject,
        semester: semester || book.semester,
        isbn: isbn || book.isbn,
        edition: edition || book.edition,
        total_copies: total_copies !== undefined ? total_copies : book.total_copies,
        available_copies: available_copies !== undefined ? available_copies : book.available_copies,
        location: location || book.location
      });

      res.json({ message: 'Book updated successfully', book });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // Delete book
  router.delete('/books/:id', isAdmin, async (req, res) => {
    try {
      const book = await Book.findByPk(req.params.id);
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }

      await book.destroy();
      res.json({ message: 'Book deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // Get all users
  router.get('/users', isAdmin, async (req, res) => {
    try {
      const users = await User.findAll({
        attributes: { exclude: ['password'] },
        include: [{
          model: BorrowedBook,
          where: { status: 'borrowed' },
          required: false,
          include: [{ model: Book, attributes: ['title', 'author'] }]
        }]
      });
      res.json({ users });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // Approve reservation
  router.put('/reservations/:id/approve', isAdmin, async (req, res) => {
    try {
      const reservation = await Reservation.findByPk(req.params.id);
      if (!reservation) {
        return res.status(404).json({ message: 'Reservation not found' });
      }

      const book = await Book.findByPk(reservation.book_id);
      if (!book || book.available_copies <= 0) {
        return res.status(400).json({ message: 'Book not available for reservation' });
      }

      reservation.status = 'approved';
      await reservation.save();

      res.json({ message: 'Reservation approved', reservation });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // Reject reservation
  router.put('/reservations/:id/reject', isAdmin, async (req, res) => {
    try {
      const reservation = await Reservation.findByPk(req.params.id);
      if (!reservation) {
        return res.status(404).json({ message: 'Reservation not found' });
      }

      reservation.status = 'cancelled';
      await reservation.save();

      res.json({ message: 'Reservation rejected', reservation });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // Get all reservations
  router.get('/reservations', isAdmin, async (req, res) => {
    try {
      const reservations = await Reservation.findAll({
        include: [
          { model: User, attributes: ['user_id', 'name', 'email'] },
          { model: Book, attributes: ['book_id', 'title', 'author'] }
        ],
        order: [['reservation_date', 'DESC']]
      });
      res.json({ reservations });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // Add seat
  router.post('/seats', isAdmin, async (req, res) => {
    try {
      const { seat_number, section } = req.body;
      
      const seat = await Seat.create({
        seat_number,
        section,
        status: 'available'
      });

      res.json({ message: 'Seat added successfully', seat });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // Initialize seats (bulk)
  router.post('/seats/initialize', isAdmin, async (req, res) => {
    try {
      const { sections } = req.body; // [{ section: 'Reading Hall A', seats: 50 }]
      
      for (const sectionData of sections) {
        for (let i = 1; i <= sectionData.seats; i++) {
          await Seat.findOrCreate({
            where: {
              seat_number: `${sectionData.section}-${i}`,
              section: sectionData.section
            },
            defaults: {
              status: 'available'
            }
          });
        }
      }

      res.json({ message: 'Seats initialized successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  return router;
};
