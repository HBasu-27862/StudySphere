import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { borrowedAPI, reservationAPI } from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [borrowedRes, reservationsRes] = await Promise.all([
        borrowedAPI.getAll(),
        reservationAPI.getAll()
      ]);
      setBorrowedBooks(borrowedRes.data.borrowedBooks);
      setReservations(reservationsRes.data.reservations);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (borrowId) => {
    try {
      const response = await borrowedAPI.return(borrowId);
      setMessage({ type: 'success', text: response.data.message });
      fetchDashboardData();
    } catch (error) {
      setMessage({ 
        type: 'danger', 
        text: error.response?.data?.message || 'Failed to return book' 
      });
    }
  };

  const handleCancelReservation = async (reservationId) => {
    try {
      await reservationAPI.cancel(reservationId);
      setMessage({ type: 'success', text: 'Reservation cancelled' });
      fetchDashboardData();
    } catch (error) {
      setMessage({ 
        type: 'danger', 
        text: error.response?.data?.message || 'Failed to cancel reservation' 
      });
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'borrowed': return 'status-borrowed';
      case 'returned': return 'status-returned';
      case 'overdue': return 'status-overdue';
      default: return '';
    }
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading-spinner">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  const activeBorrowings = borrowedBooks.filter(b => b.status === 'borrowed');
  const totalFine = activeBorrowings.reduce((sum, book) => sum + (parseFloat(book.fine_amount) || 0), 0);

  return (
    <div className="container">
      <h2 className="mb-4">📋 Welcome, {user?.name}!</h2>

      {message.text && (
        <div className={`alert alert-${message.type}`} role="alert">
          {message.text}
        </div>
      )}

      {/* Stats Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card stat-card primary">
            <div className="stat-label">Borrowed Books</div>
            <div className="stat-value">{activeBorrowings.length}</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card stat-card info">
            <div className="stat-label">Reservations</div>
            <div className="stat-value">{reservations.filter(r => r.status === 'pending' || r.status === 'approved').length}</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card stat-card warning">
            <div className="stat-label">Total Fine</div>
            <div className="stat-value">₹{totalFine}</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card stat-card success">
            <div className="stat-label">Returned</div>
            <div className="stat-value">{borrowedBooks.filter(b => b.status === 'returned').length}</div>
          </div>
        </div>
      </div>

      {/* Borrowed Books */}
      <div className="card mb-4">
        <div className="card-header">
          📖 Borrowed Books
        </div>
        <div className="card-body">
          {activeBorrowings.length === 0 ? (
            <p className="text-muted mb-0">You haven't borrowed any books.</p>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Book</th>
                    <th>Author</th>
                    <th>Issue Date</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th>Fine</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {activeBorrowings.map(book => (
                    <tr key={book.borrow_id}>
                      <td>
                        <Link to={`/books/${book.book.book_id}`}>
                          {book.book.title}
                        </Link>
                      </td>
                      <td>{book.book.author}</td>
                      <td>{book.issue_date}</td>
                      <td className={isOverdue(book.due_date) ? 'text-danger fw-bold' : ''}>
                        {book.due_date}
                        {isOverdue(book.due_date) && ' (Overdue)'}
                      </td>
                      <td>
                        <span className={getStatusClass(book.status)}>
                          {book.status}
                        </span>
                      </td>
                      <td className={book.fine_amount > 0 ? 'text-danger fw-bold' : ''}>
                        ₹{book.fine_amount || 0}
                      </td>
                      <td>
                        <button 
                          className="btn btn-sm btn-outline-success"
                          onClick={() => handleReturn(book.borrow_id)}
                        >
                          Return
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Reservations */}
      <div className="card">
        <div className="card-header">
          📌 Reservations
        </div>
        <div className="card-body">
          {reservations.length === 0 ? (
            <p className="text-muted mb-0">You haven't made any reservations.</p>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Book</th>
                    <th>Author</th>
                    <th>Reservation Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map(reservation => (
                    <tr key={reservation.reservation_id}>
                      <td>
                        <Link to={`/books/${reservation.book.book_id}`}>
                          {reservation.book.title}
                        </Link>
                      </td>
                      <td>{reservation.book.author}</td>
                      <td>{new Date(reservation.reservation_date).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge bg-${
                          reservation.status === 'approved' ? 'success' :
                          reservation.status === 'pending' ? 'warning' :
                          'secondary'
                        }`}>
                          {reservation.status}
                        </span>
                      </td>
                      <td>
                        {reservation.status === 'pending' && (
                          <button 
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleCancelReservation(reservation.reservation_id)}
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
