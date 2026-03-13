const { DataTypes } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  const Reservation = sequelize.define('reservations', {
    reservation_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    book_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    reservation_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'fulfilled', 'cancelled'),
      defaultValue: 'pending'
    },
    expiry_date: {
      type: DataTypes.DATE,
      allowNull: true
    }
  });

  return Reservation;
};
