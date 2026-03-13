import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminAPI, bookAPI, reservationAPI } from '../services/api';

const AdminPanel = () => {
  const { user, isAdmin, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [books, setBooks] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // New book form
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    subject: '',
    semester: '',
    isbn: '',
    edition: '',
    total_copies: 1,
    location: ''
  });

  useEffect(() => {
    if (isAuthenticated && !isAdmin) {
      return;
    }
    fetchData();
  }, [activeTab, isAdmin, isAuthenticated]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'dashboard') {
        const statsRes = await adminAPI.getStats();
        setStats(statsRes.data.stats);
      } else if (activeTab === 'books') {
        const booksRes = await bookAPI.getAll();
        setBooks(booksRes.data.books);
      } else if (activeTab === 'reservations') {
        const reservationsRes = await adminAPI.getReservations();
        setReservations(reservationsRes.data.reservations);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.addBook(newBook);
      setMessage({ type: 'success', text: 'Book added successfully!' });
      setNewBook({
        title: '',
        author: '',
        subject: '',
        semester: '',
        isbn: '',
        edition: '',
        total_copies: 1,
        location: ''
      });
      fetchData();
    } catch (error) {
      setMessage({ type: 'danger', text: 'Failed to add book' });
    }
  };

  const handleApproveReservation = async (id) => {
    try {
      await adminAPI.approveReservation(id);
      setMessage({ type: 'success', text: 'Reservation approved!' });
      fetchData();
    } catch (error) {
      setMessage({ type: 'danger', text: 'Failed to approve reservation' });
    }
  };

  const handleRejectReservation = async (id) => {
    try {
      await adminAPI.rejectReservation(id);
      setMessage({ type: 'success', text: 'Reservation rejected' });
      fetchData();
    } catch (error) {
      setMessage({ type: 'danger', text: 'Failed to reject reservation' });
    }
  };

  const handleDeleteBook = async (id) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;
    try {
      await adminAPI.deleteBook(id);
      setMessage({ type: 'success', text: 'Book deleted successfully!' });
      fetchData();
    } catch (error) {
      setMessage({ type: 'danger', text: 'Failed to delete book' });
    }
  };

  const handleInitializeSeats = async () => {
    try {
      await adminAPI.initializeSeats([
        { section: 'Reading Hall A', seats: 50 },
        { section: 'Reading Hall B', seats: 50 },
        { section: 'Quiet Zone', seats: 20 }
      ]);
      setMessage({ type: 'success', text: 'Seats initialized successfully!' });
    } catch (error) {
      setMessage({ type: 'danger', text: 'Failed to initialize seats' });
    }
  };

  if (isAuthenticated && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (!isAuthenticated) {
    return (
      <div className="container">
        <div className="alert alert-warning">
          Please <a href="/login">login</a> as an admin to access this page.
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h2 className="mb-4">🔧 Admin Panel</h2>

      {message.text && (
        <div className={`alert alert-${message.type}`} role="alert">
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'books' ? 'active' : ''}`}
            onClick={() => setActiveTab('books')}
          >
            Manage Books
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'reservations' ? 'active' : ''}`}
            onClick={() => setActiveTab('reservations')}
          >
            Reservations
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
        </li>
      </ul>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && loading && (
        <div className="loading-spinner">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {activeTab === 'dashboard' && stats && (
        <div className="row g-4">
          <div className="col-md-4">
            <div className="card stat-card primary">
              <div className="stat-label">Total Books</div>
              <div className="stat-value">{stats.totalBooks}</div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card stat-card info">
              <div className="stat-label">Total Students</div>
              <div className="stat-value">{stats.totalUsers}</div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card stat-card success">
              <div className="stat-label">Books Borrowed</div>
              <div className="stat-value">{stats.totalBorrowed}</div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card stat-card warning">
              <div className="stat-label">Pending Reservations</div>
              <div className="stat-value">{stats.pendingReservations}</div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card stat-card danger">
              <div className="stat-label">Available Seats</div>
              <div className="stat-value">{stats.availableSeats} / {stats.totalSeats}</div>
            </div>
          </div>
        </div>
      )}

      {/* Books Tab */}
      {activeTab === 'books' && (
        <div className="row">
          <div className="col-md-4">
            <div className="card">
              <div className="card-header">Add New Book</div>
              <div className="card-body">
                <form onSubmit={handleAddBook}>
                  <div className="mb-2">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Title"
                      value={newBook.title}
                      onChange={(e) => setNewBook({...newBook, title: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-2">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Author"
                      value={newBook.author}
                      onChange={(e) => setNewBook({...newBook, author: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-2">
                    <select
                      className="form-select"
                      value={newBook.subject}
                      onChange={(e) => setNewBook({...newBook, subject: e.target.value})}
                      required
                    >
                      <option value="">Select Subject</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Biology">Biology</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Literature">Literature</option>
                    </select>
                  </div>
                  <div className="mb-2">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Semester"
                      min="1"
                      max="8"
                      value={newBook.semester}
                      onChange={(e) => setNewBook({...newBook, semester: e.target.value})}
                    />
                  </div>
                  <div className="mb-2">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="ISBN"
                      value={newBook.isbn}
                      onChange={(e) => setNewBook({...newBook, isbn: e.target.value})}
                    />
                  </div>
                  <div className="mb-2">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Edition"
                      value={newBook.edition}
                      onChange={(e) => setNewBook({...newBook, edition: e.target.value})}
                    />
                  </div>
                  <div className="mb-2">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Total Copies"
                      min="1"
                      value={newBook.total_copies}
                      onChange={(e) => setNewBook({...newBook, total_copies: parseInt(e.target.value)})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Location (e.g., Shelf A-1)"
                      value={newBook.location}
                      onChange={(e) => setNewBook({...newBook, location: e.target.value})}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-100">
                    Add Book
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="col-md-8">
            <div className="card">
              <div className="card-header">All Books ({books.length})</div>
              <div className="card-body">
                <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Author</th>
                        <th>Available</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {books.map(book => (
                        <tr key={book.book_id}>
                          <td>{book.title}</td>
                          <td>{book.author}</td>
                          <td>{book.available_copies}/{book.total_copies}</td>
                          <td>
                            <button 
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteBook(book.book_id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reservations Tab */}
      {activeTab === 'reservations' && (
        <div className="card">
          <div className="card-header">All Reservations</div>
          <div className="card-body">
            {reservations.length === 0 ? (
              <p className="text-muted">No reservations yet.</p>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Book</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map(res => (
                      <tr key={res.reservation_id}>
                        <td>{res.user.name}</td>
                        <td>{res.book.title}</td>
                        <td>{new Date(res.reservation_date).toLocaleDateString()}</td>
                        <td>
                          <span className={`badge bg-${
                            res.status === 'approved' ? 'success' :
                            res.status === 'pending' ? 'warning' :
                            'secondary'
                          }`}>
                            {res.status}
                          </span>
                        </td>
                        <td>
                          {res.status === 'pending' && (
                            <>
                              <button 
                                className="btn btn-sm btn-outline-success me-2"
                                onClick={() => handleApproveReservation(res.reservation_id)}
                              >
                                Approve
                              </button>
                              <button 
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleRejectReservation(res.reservation_id)}
                              >
                                Reject
                              </button>
                            </>
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
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="row">
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">Initialize Seats</div>
              <div className="card-body">
                <p className="text-muted">
                  This will create seats for the library reading halls.
                </p>
                <ul className="mb-3">
                  <li>Reading Hall A: 50 seats</li>
                  <li>Reading Hall B: 50 seats</li>
                  <li>Quiet Zone: 20 seats</li>
                </ul>
                <button 
                  className="btn btn-primary"
                  onClick={handleInitializeSeats}
                >
                  Initialize Seats
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
