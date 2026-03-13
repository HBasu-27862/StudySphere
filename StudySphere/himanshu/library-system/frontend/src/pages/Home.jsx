import { useState } from 'react';
import { Link } from 'react-router-dom';
import { bookAPI } from '../services/api';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/books?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="container">
      {/* Hero Section */}
      <section className="text-center py-5">
        <h1 className="display-4 fw-bold text-primary mb-3">
          Welcome to StudySphere
        </h1>
        <p className="lead text-muted mb-4">
          Your digital library management system - Find books, reserve seats, and track your borrowings all in one place.
        </p>
        
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="search-container mb-5">
          <div className="input-group">
            <input
              type="text"
              className="form-control search-input"
              placeholder="Search books by title, author, or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="btn btn-primary px-4" type="submit">
              🔍 Search
            </button>
          </div>
        </form>
      </section>

      {/* Quick Links */}
      <section className="row g-4 mb-5">
        <div className="col-md-4">
          <Link to="/books" className="text-decoration-none">
            <div className="card stat-card primary h-100">
              <div className="stat-label">📖 Browse Books</div>
              <div className="stat-value">Search Catalog</div>
              <p className="text-muted mt-2 mb-0">
                Explore our collection of books by subject, semester, or author
              </p>
            </div>
          </Link>
        </div>
        
        <div className="col-md-4">
          <Link to="/seats" className="text-decoration-none">
            <div className="card stat-card success h-100">
              <div className="stat-label">🪑 Check Seats</div>
              <div className="stat-value">Library Seats</div>
              <p className="text-muted mt-2 mb-0">
                View real-time seat availability in reading halls
              </p>
            </div>
          </Link>
        </div>
        
        <div className="col-md-4">
          <Link to="/dashboard" className="text-decoration-none">
            <div className="card stat-card info h-100">
              <div className="stat-label">📋 My Dashboard</div>
              <div className="stat-value">Track Borrowings</div>
              <p className="text-muted mt-2 mb-0">
                View your borrowed books, due dates, and reservations
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5">
        <h2 className="text-center mb-4">Features</h2>
        <div className="row g-4">
          <div className="col-md-6">
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title text-primary">🔍 Smart Book Search</h5>
                <p className="card-text">
                  Find books quickly by title, author, subject, or semester. 
                  See real-time availability status before visiting the library.
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title text-primary">📅 Online Reservation</h5>
                <p className="card-text">
                  Reserve books online and pick them up from the library. 
                  Get notified when your reserved book becomes available.
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title text-primary">⏰ Due Date Reminders</h5>
                <p className="card-text">
                  Track all your borrowed books with due dates. 
                  Get reminders before due dates to avoid fines.
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title text-primary">🪑 Seat Availability</h5>
                <p className="card-text">
                  Check available seats in reading halls before heading to the library. 
                  Save time and find a spot to study.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
