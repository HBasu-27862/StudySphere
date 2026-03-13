import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookAPI, borrowedAPI, reservationAPI } from '../services/api';

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [book, setBook] = useState(null);
  const [similarBooks, setSimilarBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dueDate, setDueDate] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchBookDetails();
  }, [id]);

  const fetchBookDetails = async () => {
    setLoading(true);
    try {
      const response = await bookAPI.getById(id);
      setBook(response.data.book);
      
      const similarResponse = await bookAPI.getSimilar(id);
      setSimilarBooks(similarResponse.data.books);
    } catch (error) {
      console.error('Error fetching book:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBorrow = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!dueDate) {
      setMessage({ type: 'danger', text: 'Please select a due date' });
      return;
    }

    setActionLoading(true);
    try {
      await borrowedAPI.borrow(id, dueDate);
      setMessage({ type: 'success', text: 'Book borrowed successfully!' });
      fetchBookDetails();
    } catch (error) {
      setMessage({ 
        type: 'danger', 
        text: error.response?.data?.message || 'Failed to borrow book' 
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReserve = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setActionLoading(true);
    try {
      await reservationAPI.create(id);
      setMessage({ type: 'success', text: 'Reservation request submitted!' });
    } catch (error) {
      setMessage({ 
        type: 'danger', 
        text: error.response?.data?.message || 'Failed to reserve book' 
      });
    } finally {
      setActionLoading(false);
    }
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

  if (!book) {
    return (
      <div className="container">
        <div className="alert alert-danger">Book not found</div>
      </div>
    );
  }

  const minDate = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 14);
  const maxDateString = maxDate.toISOString().split('T')[0];

  return (
    <div className="container">
      <button className="btn btn-outline-secondary mb-4" onClick={() => navigate('/books')}>
        ← Back to Search
      </button>

      {message.text && (
        <div className={`alert alert-${message.type}`} role="alert">
          {message.text}
        </div>
      )}

      <div className="row">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-body">
              <h1 className="text-primary mb-3">{book.title}</h1>
              
              <div className="row mb-4">
                <div className="col-md-6">
                  <p><strong>Author:</strong> {book.author}</p>
                  <p><strong>Subject:</strong> {book.subject}</p>
                  {book.edition && <p><strong>Edition:</strong> {book.edition}</p>}
                </div>
                <div className="col-md-6">
                  {book.isbn && <p><strong>ISBN:</strong> {book.isbn}</p>}
                  <p><strong>Location:</strong> {book.location || 'Main Library'}</p>
                  <p><strong>Semester:</strong> {book.semester || 'All'}</p>
                </div>
              </div>

              <div className="d-flex align-items-center gap-3 mb-4">
                <div>
                  <strong>Total Copies:</strong> {book.total_copies}
                </div>
                <div>
                  {book.available_copies > 0 ? (
                    <span className="badge-available">
                      ✓ {book.available_copies} Available
                    </span>
                  ) : (
                    <span className="badge-unavailable">
                      ✗ Not Available
                    </span>
                  )}
                </div>
              </div>

              {book.available_copies > 0 && isAuthenticated && (
                <div className="card bg-light mb-4">
                  <div className="card-body">
                    <h5>Borrow This Book</h5>
                    <div className="row g-3 align-items-end">
                      <div className="col-md-4">
                        <label className="form-label">Due Date (within 14 days)</label>
                        <input
                          type="date"
                          className="form-control"
                          min={minDate}
                          max={maxDateString}
                          value={dueDate}
                          onChange={(e) => setDueDate(e.target.value)}
                        />
                      </div>
                      <div className="col-md-4">
                        <button 
                          className="btn btn-primary w-100"
                          onClick={handleBorrow}
                          disabled={actionLoading}
                        >
                          {actionLoading ? 'Processing...' : 'Borrow Book'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {book.available_copies === 0 && (
                <button 
                  className="btn btn-warning w-100 mb-4"
                  onClick={handleReserve}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Processing...' : 'Reserve Book'}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card">
            <div className="card-header">
              📋 Borrowing Information
            </div>
            <div className="card-body">
              <ul className="list-unstyled">
                <li className="mb-2">
                  <strong>📅 Loan Period:</strong> 14 days
                </li>
                <li className="mb-2">
                  <strong>⚠️ Fine:</strong> Rs. 5 per day after due date
                </li>
                <li className="mb-2">
                  <strong>🔄 Renewal:</strong> Contact library staff
                </li>
                <li>
                  <strong>📍 Return To:</strong> Library Counter
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Books */}
      {similarBooks.length > 0 && (
        <div className="mt-5">
          <h3 className="mb-4">Similar Books</h3>
          <div className="row g-4">
            {similarBooks.map(similarBook => (
              <div className="col-md-4" key={similarBook.book_id}>
                <div 
                  className="card book-card" 
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/books/${similarBook.book_id}`)}
                >
                  <div className="card-body">
                    <h6 className="book-title">{similarBook.title}</h6>
                    <p className="book-author">{similarBook.author}</p>
                    <span className="book-subject">{similarBook.subject}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookDetails;
