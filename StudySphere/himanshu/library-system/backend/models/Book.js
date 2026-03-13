const { DataTypes } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  const Book = sequelize.define('books', {
    book_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    author: {
      type: DataTypes.STRING,
      allowNull: false
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false
    },
    semester: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    isbn: {
      type: DataTypes.STRING,
      allowNull: true
    },
    edition: {
      type: DataTypes.STRING,
      allowNull: true
    },
    total_copies: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    available_copies: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true
    }
  });

  return Book;
};
