import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { bookAPI } from '../services/api';

const BookSearch = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    subject: searchParams.get('subject') || '',
    semester: searchParams.get('semester') || '',
    availability: searchParams.get('availability') || ''
  });

  useEffect(() => {
    fetchBooks();
  }, [filters]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.subject) params.subject = filters.subject;
      if (filters.semester) params.semester = filters.semester;
      if (filters.availability) params.availability = filters.availability;

      const response = await bookAPI.getAll(params);
      setBooks(response.data.books);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    
    const newParams = new URLSearchParams();
    Object.entries({ ...filters, [name]: value }).forEach(([key, val]) => {
      if (val) newParams.set(key, val);
    });
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setFilters({ search: '', subject: '', semester: '', availability: '' });
    setSearchParams({});
  };

  return (
    <div className="container">
      <h2 className="mb-4">📚 Book Catalog</h2>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                name="search"
                placeholder="Search by title or author..."
                value={filters.search}
                onChange={handleFilterChange}
              />
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                name="subject"
                value={filters.subject}
                onChange={handleFilterChange}
              >
                <option value="">All Subjects</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Biology">Biology</option>
                <option value="Engineering">Engineering</option>
                <option value="Literature">Literature</option>
              </select>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                name="semester"
                value={filters.semester}
                onChange={handleFilterChange}
              >
                <option value="">All Semesters</option>
                <option value="1">Semester 1</option>
                <option value="2">Semester 2</option>
                <option value="3">Semester 3</option>
                <option value="4">Semester 4</option>
                <option value="5">Semester 5</option>
                <option value="6">Semester 6</option>
                <option value="7">Semester 7</option>
                <option value="8">Semester 8</option>
              </select>
            </div>
            <div className="col-md-2">
              <select
                className="form-select"
                name="availability"
                value={filters.availability}
                onChange={handleFilterChange}
              >
                <option value="">All Books</option>
                <option value="available">Available Only</option>
              </select>
            </div>
          </div>
          {(filters.search || filters.subject || filters.semester || filters.availability) && (
            <div className="mt-3">
              <button className="btn btn-outline-secondary btn-sm" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="loading-spinner">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : books.length === 0 ? (
        <div className="alert alert-info">
          No books found. Try adjusting your search criteria.
        </div>
      ) : (
        <div className="row g-4">
          {books.map(book => (
            <div className="col-md-4 col-lg-3" key={book.book_id}>
              <Link to={`/books/${book.book_id}`} className="text-decoration-none">
                <div className="card book-card h-100">
                  <div className="card-body">
                    <h5 className="book-title">{book.title}</h5>
                    <p className="book-author">by {book.author}</p>
                    <p className="text-muted small mb-2">
                      📍 {book.location || 'Library'}
                    </p>
                    <span className="book-subject">{book.subject}</span>
                    {book.semester && (
                      <span className="book-subject ms-2">
                        Sem {book.semester}
                      </span>
                    )}
                    <div className="mt-3">
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
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Results count */}
      {!loading && (
        <div className="text-center mt-4 text-muted">
          Showing {books.length} book(s)
        </div>
      )}
    </div>
  );
};

export default BookSearch;
