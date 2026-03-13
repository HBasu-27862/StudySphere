const express = require('express');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const router = express.Router();

module.exports = (Seat) => {
  // Get all seats with stats
  router.get('/', async (req, res) => {
    try {
      const seats = await Seat.findAll();
      
      const totalSeats = seats.length;
      const availableSeats = seats.filter(s => s.status === 'available').length;
      const occupiedSeats = seats.filter(s => s.status === 'occupied').length;

      // Group by section
      const sections = {};
      seats.forEach(seat => {
        if (!sections[seat.section]) {
          sections[seat.section] = { total: 0, available: 0, occupied: 0 };
        }
        sections[seat.section].total++;
        if (seat.status === 'available') {
          sections[seat.section].available++;
        } else {
          sections[seat.section].occupied++;
        }
      });

      res.json({
        seats,
        stats: {
          totalSeats,
          availableSeats,
          occupiedSeats,
          sections
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // Occupy a seat
  router.post('/:id/occupy', async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'No token provided' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const seat = await Seat.findByPk(req.params.id);

      if (!seat) {
        return res.status(404).json({ message: 'Seat not found' });
      }

      if (seat.status === 'occupied') {
        return res.status(400).json({ message: 'Seat already occupied' });
      }

      seat.status = 'occupied';
      seat.occupied_by = decoded.userId;
      seat.occupied_since = new Date();
      await seat.save();

      res.json({ message: 'Seat occupied successfully', seat });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // Release a seat
  router.post('/:id/release', async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'No token provided' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const seat = await Seat.findByPk(req.params.id);

      if (!seat) {
        return res.status(404).json({ message: 'Seat not found' });
      }

      if (seat.status === 'available') {
        return res.status(400).json({ message: 'Seat is already available' });
      }

      seat.status = 'available';
      seat.occupied_by = null;
      seat.occupied_since = null;
      await seat.save();

      res.json({ message: 'Seat released successfully', seat });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  return router;
};
