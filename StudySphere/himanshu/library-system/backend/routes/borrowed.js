const express = require('express');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const router = express.Router();

module.exports = (BorrowedBook, Book, User) => {
  // Get user borrowed books
  router.get('/', async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'No token provided' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const borrowedBooks = await BorrowedBook.findAll({
        where: { user_id: decoded.userId },
        include: [{ model: Book, attributes: ['book_id', 'title', 'author', 'location'] }],
        order: [['due_date', 'ASC']]
      });

      // Calculate fines for overdue books
      const today = new Date();
      borrowedBooks.forEach(book => {
        if (book.status === 'borrowed' && new Date(book.due_date) < today) {
          const daysOverdue = Math.floor((today - new Date(book.due_date)) / (1000 * 60 * 60 * 24));
          book.fine_amount = daysOverdue * 5; // Rs. 5 per day
        }
      });

      res.json({ borrowedBooks });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // Borrow a book
  router.post('/', async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'No token provided' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const { book_id, due_date } = req.body;

      const book = await Book.findByPk(book_id);
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }

      if (book.available_copies <= 0) {
        return res.status(400).json({ message: 'Book not available' });
      }

      // Check if user already has this book
      const existingBorrow = await BorrowedBook.findOne({
        where: {
          user_id: decoded.userId,
          book_id,
          status: 'borrowed'
        }
      });

      if (existingBorrow) {
        return res.status(400).json({ message: 'You already have this book borrowed' });
      }

      const borrowedBook = await BorrowedBook.create({
        user_id: decoded.userId,
        book_id,
        due_date,
        status: 'borrowed'
      });

      // Decrease available copies
      book.available_copies -= 1;
      await book.save();

      res.json({ message: 'Book borrowed successfully', borrowedBook });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // Return a book
  router.put('/:id/return', async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'No token provided' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const borrowedBook = await BorrowedBook.findByPk(req.params.id);

      if (!borrowedBook) {
        return res.status(404).json({ message: 'Borrowed record not found' });
      }

      if (borrowedBook.user_id !== decoded.userId && decoded.role !== 'admin') {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      // Calculate fine if overdue
      const today = new Date();
      const dueDate = new Date(borrowedBook.due_date);
      let fineAmount = 0;

      if (today > dueDate) {
        const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
        fineAmount = daysOverdue * 5; // Rs. 5 per day
      }

      borrowedBook.status = 'returned';
      borrowedBook.return_date = today.toISOString().split('T')[0];
      borrowedBook.fine_amount = fineAmount;
      await borrowedBook.save();

      // Increase available copies
      const book = await Book.findByPk(borrowedBook.book_id);
      book.available_copies += 1;
      await book.save();

      res.json({ message: 'Book returned successfully', fine_amount: fineAmount });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  return router;
};
