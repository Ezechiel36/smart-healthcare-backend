import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Alert, Spinner, Modal, Form } from 'react-bootstrap';
import { scheduleAPI } from '../services/api';
import DoctorSidebar from './DoctorSidebar';
import DoctorNavbar from './DoctorNavbar';
import './DoctorDashboard.css';

interface Schedule {
  scheduleId: number;
  doctorId: number;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

const ManageSchedule: React.FC = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newSlot, setNewSlot] = useState({ startTime: '', endTime: '' });
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await scheduleAPI.getMySchedules();
      setSchedules(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      setError('Could not load your schedules.');
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAvailability = async () => {
    if (!newSlot.startTime || !newSlot.endTime) return;

    if (new Date(newSlot.startTime) < new Date()) {
      alert('Cannot set availability in the past. Please select a future date and time.');
      return;
    }

    if (new Date(newSlot.endTime) <= new Date(newSlot.startTime)) {
      alert('End time must be after the start time.');
      return;
    }
    try {
      setSaving(true);
      const payload = {
        startTime: new Date(newSlot.startTime).toISOString(),
        endTime: new Date(newSlot.endTime).toISOString(),
      };
      
      if (editingId) {
        await scheduleAPI.updateAvailability(editingId, payload);
        alert('Availability updated!');
      } else {
        await scheduleAPI.addAvailability(payload);
        alert('Availability slot added!');
      }
      
      setShowModal(false);
      setEditingId(null);
      setNewSlot({ startTime: '', endTime: '' });
      await fetchSchedules();
    } catch (err: any) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this availability slot?')) return;
    try {
      setDeletingId(id);
      await scheduleAPI.deleteSchedule(id);
      await fetchSchedules();
      alert('Availability slot deleted successfully!');
    } catch (err: any) {
      alert('Delete failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return (
    <div className="dashboard-wrapper">
      <DoctorSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <DoctorNavbar onSidebarToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="dashboard-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading schedules...</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="dashboard-wrapper">
      <DoctorSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <DoctorNavbar onSidebarToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="dashboard-container">
        <div className="dashboard-content">
          <div className="dashboard-header">
            <h1 className="dashboard-title">🕒 Manage Schedule</h1>
            <p className="dashboard-subtitle">Set your working hours and availability</p>
          </div>

          {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

          <div className="dashboard-grid">
            <div className="stats-section">
              <div className="section-header">
                <h2 className="section-title">Overview</h2>
                <p className="section-subtitle">Your schedule at a glance</p>
              </div>
              <div className="stats-grid">
                <Card className="stat-card schedules">
                  <Card.Body>
                    <div className="stat-icon-wrapper">
                      <div className="stat-icon">📅</div>
                    </div>
                    <div className="stat-content">
                      <div className="stat-number">{schedules.length}</div>
                      <div className="stat-label">Total Slots</div>
                    </div>
                    <div className="stat-trend positive">
                      <span className="trend-icon">📊</span>
                      <span className="trend-value">All</span>
                    </div>
                  </Card.Body>
                </Card>
                <Card className="stat-card active">
                  <Card.Body>
                    <div className="stat-icon-wrapper">
                      <div className="stat-icon">✅</div>
                    </div>
                    <div className="stat-content">
                      <div className="stat-number">{schedules.filter(s => !s.isBooked).length}</div>
                      <div className="stat-label">Available</div>
                    </div>
                    <div className="stat-trend positive">
                      <span className="trend-icon">↑</span>
                      <span className="trend-value">{schedules.length > 0 ? Math.round((schedules.filter(s => !s.isBooked).length / schedules.length) * 100) : 0}%</span>
                    </div>
                  </Card.Body>
                </Card>
                <Card className="stat-card notifications">
                  <Card.Body>
                    <div className="stat-icon-wrapper">
                      <div className="stat-icon">🔒</div>
                    </div>
                    <div className="stat-content">
                      <div className="stat-number">{schedules.filter(s => s.isBooked).length}</div>
                      <div className="stat-label">Booked</div>
                    </div>
                    <div className="stat-trend neutral">
                      <span className="trend-icon">→</span>
                      <span className="trend-value">{schedules.length > 0 ? Math.round((schedules.filter(s => s.isBooked).length / schedules.length) * 100) : 0}%</span>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            </div>

            <div className="status-section">
              <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 className="section-title">Availability Slots</h2>
                  <p className="section-subtitle">Your current schedule</p>
                </div>
                <Button 
                  variant="primary" 
                  className="add-slot-btn"
                  onClick={() => {
                    setEditingId(null);
                    setNewSlot({ startTime: '', endTime: '' });
                    setShowModal(true);
                  }}
                >
                  <span className="btn-icon">+</span>
                  <span>Add Time Slot</span>
                </Button>
              </div>
              <Card className="status-card">
                <Card.Body>
                  {schedules.length === 0 ? (
                    <div className="text-center py-5">
                      <div className="notification-empty-icon">📅</div>
                      <p className="text-muted mb-3">You haven't added any availability yet.</p>
                      <Button 
                        variant="outline-primary" 
                        className="add-first-slot-btn"
                        onClick={() => {
                          setEditingId(null);
                          setNewSlot({ startTime: '', endTime: '' });
                          setShowModal(true);
                        }}
                      >
                        <span className="btn-icon">+</span>
                        <span>Add Your First Time Slot</span>
                      </Button>
                    </div>
                  ) : (
                    <div className="schedule-list">
                      {schedules.map((s) => (
                        <div key={s.scheduleId} className="schedule-item">
                          <div className="schedule-icon">
                            📅
                          </div>
                          <div className="schedule-content">
                            <div className="schedule-date">{new Date(s.startTime).toLocaleDateString()}</div>
                            <div className="schedule-time">
                              {new Date(s.startTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} - 
                              {new Date(s.endTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                            </div>
                          </div>
                          <div className="schedule-actions">
                            <Badge bg={s.isBooked ? 'danger' : 'success'} className="rounded-pill">
                              {s.isBooked ? 'Booked' : 'Available'}
                            </Badge>
                            {!s.isBooked && (
                              <div className="action-buttons">
                                <Button 
                                  variant="outline-primary"
                                  size="sm"
                                  className="edit-btn"
                                  onClick={() => {
                                    setEditingId(s.scheduleId);
                                    setNewSlot({
                                      startTime: new Date(new Date(s.startTime).getTime() - new Date(s.startTime).getTimezoneOffset() * 60000).toISOString().slice(0, 16),
                                      endTime: new Date(new Date(s.endTime).getTime() - new Date(s.endTime).getTimezoneOffset() * 60000).toISOString().slice(0, 16)
                                    });
                                    setShowModal(true);
                                  }}
                                >
                                  <span className="btn-icon">✏️</span>
                                  <span>Edit</span>
                                </Button>
                                <Button 
                                  variant="outline-danger" 
                                  size="sm" 
                                  className="delete-btn"
                                  onClick={() => handleDelete(s.scheduleId)}
                                  disabled={deletingId === s.scheduleId}
                                >
                                  {deletingId === s.scheduleId ? (
                                    <Spinner size="sm" animation="border" />
                                  ) : (
                                    <>
                                      <span className="btn-icon">🗑️</span>
                                      <span>Delete</span>
                                    </>
                                  )}
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingId ? 'Reschedule Availability' : 'Add New Availability'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Start Time</Form.Label>
              <Form.Control 
                type="datetime-local" 
                value={newSlot.startTime}
                min={new Date().toISOString().slice(0, 16)}
                onChange={e => setNewSlot({...newSlot, startTime: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>End Time</Form.Label>
              <Form.Control 
                type="datetime-local" 
                value={newSlot.endTime}
                min={newSlot.startTime || new Date().toISOString().slice(0, 16)}
                onChange={e => setNewSlot({...newSlot, endTime: e.target.value})}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)} className="cancel-btn">
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSaveAvailability} 
            disabled={saving}
            className="save-btn"
          >
            {saving ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                Saving...
              </>
            ) : (
              <>
                <span className="btn-icon">💾</span>
                <span>{editingId ? 'Save Changes' : 'Save Availability'}</span>
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ManageSchedule;
