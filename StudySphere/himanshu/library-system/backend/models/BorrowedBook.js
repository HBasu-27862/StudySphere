const { DataTypes } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  const BorrowedBook = sequelize.define('borrowed_books', {
    borrow_id: {
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
    issue_date: {
      type: DataTypes.DATEONLY,
      defaultValue: DataTypes.NOW
    },
    due_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    return_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('borrowed', 'returned', 'overdue'),
      defaultValue: 'borrowed'
    },
    fine_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    }
  });

  return BorrowedBook;
};
