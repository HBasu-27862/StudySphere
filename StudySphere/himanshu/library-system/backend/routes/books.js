const express = require('express');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const router = express.Router();

module.exports = (Book) => {
  // Get all books with search and filters
  router.get('/', async (req, res) => {
    try {
      const { search, subject, semester, availability } = req.query;
      const where = {};

      if (search) {
        where[Op.or] = [
          { title: { [Op.like]: `%${search}%` } },
          { author: { [Op.like]: `%${search}%` } }
        ];
      }

      if (subject) where.subject = subject;
      if (semester) where.semester = semester;
      if (availability === 'available') where.available_copies = { [Op.gt]: 0 };

      const books = await Book.findAll({ where });
      res.json({ books });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // Get book by ID
  router.get('/:id', async (req, res) => {
    try {
      const book = await Book.findByPk(req.params.id);
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }
      res.json({ book });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // Get similar books
  router.get('/:id/similar', async (req, res) => {
    try {
      const book = await Book.findByPk(req.params.id);
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }

      const similarBooks = await Book.findAll({
        where: {
          subject: book.subject,
          book_id: { [Op.ne]: req.params.id }
        },
        limit: 5
      });

      res.json({ books: similarBooks });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  return router;
};
