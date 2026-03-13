const express = require('express');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const router = express.Router();

module.exports = (Reservation, Book) => {
  // Get user reservations
  router.get('/', async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'No token provided' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const reservations = await Reservation.findAll({
        where: { user_id: decoded.userId },
        include: [{ model: Book, attributes: ['book_id', 'title', 'author'] }],
        order: [['reservation_date', 'DESC']]
      });

      res.json({ reservations });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // Create reservation
  router.post('/', async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'No token provided' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const { book_id } = req.body;

      const book = await Book.findByPk(book_id);
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }

      // Check if user already has pending reservation for this book
      const existingReservation = await Reservation.findOne({
        where: {
          user_id: decoded.userId,
          book_id,
          status: { [Op.in]: ['pending', 'approved'] }
        }
      });

      if (existingReservation) {
        return res.status(400).json({ message: 'You already have a reservation for this book' });
      }

      const reservation = await Reservation.create({
        user_id: decoded.userId,
        book_id,
        status: 'pending',
        expiry_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days
      });

      res.json({ message: 'Reservation request submitted successfully', reservation });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // Cancel reservation
  router.delete('/:id', async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'No token provided' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const reservation = await Reservation.findByPk(req.params.id);

      if (!reservation) {
        return res.status(404).json({ message: 'Reservation not found' });
      }

      if (reservation.user_id !== decoded.userId && decoded.role !== 'admin') {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      reservation.status = 'cancelled';
      await reservation.save();

      res.json({ message: 'Reservation cancelled' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  return router;
};
