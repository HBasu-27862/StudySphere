const { DataTypes } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  const Seat = sequelize.define('seats', {
    seat_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    seat_number: {
      type: DataTypes.STRING,
      allowNull: false
    },
    section: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('available', 'occupied'),
      defaultValue: 'available'
    },
    occupied_by: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    occupied_since: {
      type: DataTypes.DATE,
      allowNull: true
    }
  });

  return Seat;
};
