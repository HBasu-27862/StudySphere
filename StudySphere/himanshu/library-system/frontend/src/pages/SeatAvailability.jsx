import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { seatAPI } from '../services/api';

const SeatAvailability = () => {
  const { isAuthenticated } = useAuth();
  const [seats, setSeats] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [filterSection, setFilterSection] = useState('all');

  useEffect(() => {
    fetchSeats();
  }, []);

  const fetchSeats = async () => {
    setLoading(true);
    try {
      const response = await seatAPI.getAll();
      setSeats(response.data.seats);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching seats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = async (seat) => {
    if (!isAuthenticated) {
      setMessage({ type: 'warning', text: 'Please login to occupy a seat' });
      return;
    }

    if (seat.status === 'occupied') {
      setMessage({ type: 'warning', text: 'This seat is already occupied' });
      return;
    }

    setSelectedSeat(seat);
  };

  const confirmOccupy = async () => {
    if (!selectedSeat) return;

    try {
      await seatAPI.occupy(selectedSeat.seat_id);
      setMessage({ type: 'success', text: `Seat ${selectedSeat.seat_number} occupied successfully!` });
      fetchSeats();
      setSelectedSeat(null);
    } catch (error) {
      setMessage({ 
        type: 'danger', 
        text: error.response?.data?.message || 'Failed to occupy seat' 
      });
    }
  };

  const handleRelease = async (seatId) => {
    try {
      await seatAPI.release(seatId);
      setMessage({ type: 'success', text: 'Seat released successfully' });
      fetchSeats();
    } catch (error) {
      setMessage({ 
        type: 'danger', 
        text: error.response?.data?.message || 'Failed to release seat' 
      });
    }
  };

  const filteredSeats = filterSection === 'all' 
    ? seats 
    : seats.filter(s => s.section === filterSection);

  const sections = [...new Set(seats.map(s => s.section))];

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

  return (
    <div className="container">
      <h2 className="mb-4">🪑 Seat Availability</h2>

      {message.text && (
        <div className={`alert alert-${message.type}`} role="alert">
          {message.text}
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="row g-4 mb-4">
          <div className="col-md-4">
            <div className="card stat-card success">
              <div className="stat-label">Available Seats</div>
              <div className="stat-value">{stats.availableSeats}</div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card stat-card danger">
              <div className="stat-label">Occupied Seats</div>
              <div className="stat-value">{stats.occupiedSeats}</div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card stat-card info">
              <div className="stat-label">Total Seats</div>
              <div className="stat-value">{stats.totalSeats}</div>
            </div>
          </div>
        </div>
      )}

      {/* Section Filter */}
      {sections.length > 0 && (
        <div className="mb-4">
          <label className="form-label">Filter by Section:</label>
          <select 
            className="form-select" 
            value={filterSection}
            onChange={(e) => setFilterSection(e.target.value)}
          >
            <option value="all">All Sections</option>
            {sections.map(section => (
              <option key={section} value={section}>{section}</option>
            ))}
          </select>
        </div>
      )}

      {/* Legend */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="d-flex gap-4 justify-content-center">
            <div className="d-flex align-items-center">
              <div className="seat available me-2" style={{ width: 'auto', padding: '8px 15px' }}>
                Available
              </div>
            </div>
            <div className="d-flex align-items-center">
              <div className="seat occupied me-2" style={{ width: 'auto', padding: '8px 15px' }}>
                Occupied
              </div>
            </div>
            <div className="d-flex align-items-center">
              <div className="seat selected me-2" style={{ width: 'auto', padding: '8px 15px' }}>
                Selected
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seats Grid */}
      <div className="card">
        <div className="card-header">
          Reading Hall Seats
        </div>
        <div className="card-body">
          {filteredSeats.length === 0 ? (
            <p className="text-muted">No seats available in this section.</p>
          ) : (
            <div className="seat-grid">
              {filteredSeats.map(seat => (
                <div
                  key={seat.seat_id}
                  className={`seat ${seat.status} ${selectedSeat?.seat_id === seat.seat_id ? 'selected' : ''}`}
                  onClick={() => handleSeatClick(seat)}
                >
                  {seat.seat_number}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Section Stats */}
      {stats && stats.sections && (
        <div className="row g-4 mt-4">
          {Object.entries(stats.sections).map(([section, data]) => (
            <div className="col-md-4" key={section}>
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">{section}</h5>
                  <div className="d-flex justify-content-between">
                    <span className="text-success">Available: {data.available}</span>
                    <span className="text-danger">Occupied: {data.occupied}</span>
                  </div>
                  <div className="progress mt-2" style={{ height: '8px' }}>
                    <div 
                      className="progress-bar bg-success" 
                      style={{ width: `${(data.available / data.total) * 100}%` }}
                    ></div>
                    <div 
                      className="progress-bar bg-danger" 
                      style={{ width: `${(data.occupied / data.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirm Modal */}
      {selectedSeat && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Seat</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setSelectedSeat(null)}
                ></button>
              </div>
              <div className="modal-body">
                <p>Do you want to occupy seat <strong>{selectedSeat.seat_number}</strong>?</p>
              </div>
              <div className="modal-footer">
                <button 
                  className="btn btn-secondary"
                  onClick={() => setSelectedSeat(null)}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={confirmOccupy}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* My Occupied Seat */}
      {isAuthenticated && seats.some(s => s.occupied_by) && (
        <div className="card mt-4">
          <div className="card-header">
            Your Occupied Seat
          </div>
          <div className="card-body">
            {seats
              .filter(s => s.status === 'occupied')
              .map(seat => (
                <div key={seat.seat_id} className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{seat.seat_number}</strong> - {seat.section}
                    {seat.occupied_since && (
                      <span className="text-muted ms-2">
                        Since: {new Date(seat.occupied_since).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <button 
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleRelease(seat.seat_id)}
                  >
                    Release Seat
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatAvailability;
