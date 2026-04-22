import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Spinner, Alert, Container, Button, Modal, Tooltip, OverlayTrigger, Form } from 'react-bootstrap';
import { adminAPI, authAPI } from '../services/api';

interface User {
  userId: number;
  name: string;
  email: string;
  role: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Registration form state
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'PATIENT',
    specialization: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getUsers();
      setUsers(res.data);
    } catch (err: any) {
      setError('Failed to load users. Please ensure you have admin privileges.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      setActionLoading(true);
      await adminAPI.deleteUser(userToDelete.userId);
      setUsers(users.filter(u => u.userId !== userToDelete.userId));
      setShowDeleteModal(false);
    } catch (err) {
      setError('Failed to delete user. They might have dependent records.');
    } finally {
      setActionLoading(false);
      setUserToDelete(null);
    }
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await authAPI.register(newUserData);
      setShowCreateModal(false);
      setNewUserData({ name: '', email: '', password: '', role: 'PATIENT', specialization: '' });
      fetchUsers(); // Refresh list
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create user.');
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role.toUpperCase()) {
      case 'ADMIN': return 'danger';
      case 'DOCTOR': return 'success';
      case 'PATIENT': return 'info';
      default: return 'secondary';
    }
  };

  if (loading) return (
    <div className="text-center p-5">
      <Spinner animation="border" variant="primary" />
      <p className="mt-2 text-muted">Synchronizing secure user records...</p>
    </div>
  );

  return (
    <Container fluid className="py-4 px-0">
      <div className="d-flex justify-content-between align-items-end mb-4 px-3">
        <div>
          <h2 className="fw-bold mb-1">👥 User Management</h2>
          <p className="text-muted mb-0">Security and access control for all registered profiles</p>
        </div>
        <div className="d-flex gap-2 align-items-center">
           <Button 
            variant="primary" 
            className="rounded-pill px-4 fw-bold shadow-sm"
            onClick={() => setShowCreateModal(true)}
           >
             + Create User
           </Button>
           <Badge bg="light" text="dark" className="border px-3 py-2 rounded-pill shadow-sm">Total: {users.length}</Badge>
        </div>
      </div>

      {error && <Alert variant="danger" className="mx-3 rounded-4" dismissible onClose={() => setError('')}>{error}</Alert>}

      <Card className="border-0 shadow-sm rounded-4 overflow-hidden mx-3">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0 align-middle">
              <thead className="bg-light border-bottom">
                <tr>
                  <th className="px-4 py-3 text-muted small fw-bold text-uppercase">ID</th>
                  <th className="py-3 text-muted small fw-bold text-uppercase">User Identity</th>
                  <th className="py-3 text-muted small fw-bold text-uppercase">Contact Email</th>
                  <th className="py-3 text-muted small fw-bold text-uppercase text-center">System Role</th>
                  <th className="py-3 text-muted small fw-bold text-uppercase text-center">Status</th>
                  <th className="px-4 py-3 text-muted small fw-bold text-uppercase text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-5 text-muted">
                      <div className="py-4">
                        <span className="display-4 d-block mb-3">📂</span>
                        No users found in the secure registry.
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.userId} className="user-row-premium">
                      <td className="px-4 py-3">
                        <span className="badge bg-light text-dark border font-monospace">#{user.userId}</span>
                      </td>
                      <td className="fw-semibold text-dark">{user.name}</td>
                      <td className="text-muted">{user.email}</td>
                      <td className="text-center">
                        <Badge bg={getRoleBadgeVariant(user.role)} className="px-3 py-2 rounded-pill shadow-sm fw-medium">
                          {user.role}
                        </Badge>
                      </td>
                      <td className="text-center">
                         <span className="text-success small fw-bold">● Active</span>
                      </td>
                      <td className="px-4 py-3 text-end">
                        <div className="d-flex justify-content-end gap-2">
                          <OverlayTrigger overlay={<Tooltip>View Details</Tooltip>}>
                            <Button 
                              variant="outline-info" 
                              size="sm" 
                              className="rounded-circle p-2 d-flex align-items-center justify-content-center"
                              onClick={() => handleViewUser(user)}
                              style={{ width: '32px', height: '32px' }}
                            >
                              👁️
                            </Button>
                          </OverlayTrigger>
                          <OverlayTrigger overlay={<Tooltip>Remove User</Tooltip>}>
                            <Button 
                              variant="outline-danger" 
                              size="sm" 
                              className="rounded-circle p-2 d-flex align-items-center justify-content-center"
                              onClick={() => handleDeleteClick(user)}
                              style={{ width: '32px', height: '32px' }}
                            >
                              🗑️
                            </Button>
                          </OverlayTrigger>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Create User Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">Register New System User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreateUser}>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Full Name</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Enter user name" 
                required 
                value={newUserData.name}
                onChange={(e) => setNewUserData({...newUserData, name: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Email Address</Form.Label>
              <Form.Control 
                type="email" 
                placeholder="user@example.com" 
                required 
                value={newUserData.email}
                onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Password</Form.Label>
              <Form.Control 
                type="password" 
                placeholder="Min 6 characters" 
                required 
                value={newUserData.password}
                onChange={(e) => setNewUserData({...newUserData, password: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">System Role</Form.Label>
              <Form.Select 
                value={newUserData.role}
                onChange={(e) => setNewUserData({...newUserData, role: e.target.value})}
              >
                <option value="PATIENT">Patient</option>
                <option value="DOCTOR">Doctor</option>
                <option value="ADMIN">Administrator</option>
              </Form.Select>
            </Form.Group>
            
            {newUserData.role === 'DOCTOR' && (
              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold">Medical Specialization</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="e.g. Cardiology" 
                  required 
                  value={newUserData.specialization}
                  onChange={(e) => setNewUserData({...newUserData, specialization: e.target.value})}
                />
              </Form.Group>
            )}

            <div className="d-grid mt-4">
              <Button variant="primary" type="submit" disabled={actionLoading} className="rounded-pill">
                {actionLoading ? <Spinner animation="border" size="sm" /> : 'Register User'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* View User Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered className="user-modal-premium">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">User Information</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-3">
          {selectedUser && (
            <div className="p-2">
              <div className="text-center mb-4">
                <div className="avatar-placeholder rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center mb-2" style={{ width: '64px', height: '64px', fontSize: '24px' }}>
                  {selectedUser.name.charAt(0)}
                </div>
                <h4 className="fw-bold mb-0">{selectedUser.name}</h4>
                <Badge bg={getRoleBadgeVariant(selectedUser.role)} className="rounded-pill px-3 mt-1">
                  {selectedUser.role}
                </Badge>
              </div>
              <div className="info-grid">
                <div className="info-item mb-3">
                  <label className="text-muted small fw-bold text-uppercase d-block">User ID</label>
                  <span className="fw-bold">#{selectedUser.userId}</span>
                </div>
                <div className="info-item mb-3">
                  <label className="text-muted small fw-bold text-uppercase d-block">Email Address</label>
                  <span className="fw-bold">{selectedUser.email}</span>
                </div>
                <div className="info-item mb-3">
                  <label className="text-muted small fw-bold text-uppercase d-block">Account Status</label>
                  <span className="text-success fw-bold">Active</span>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="secondary" onClick={() => setShowViewModal(false)} className="rounded-pill px-4">Close</Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Body className="text-center p-5">
          <div className="display-1 text-danger mb-4">⚠️</div>
          <h3 className="fw-bold mb-3">Confirm Deletion</h3>
          <p className="text-muted mb-4">
            Are you sure you want to delete user <strong>{userToDelete?.name}</strong>? 
            This action cannot be undone and will remove all associated records.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Button 
              variant="outline-secondary" 
              onClick={() => setShowDeleteModal(false)} 
              disabled={actionLoading}
              className="rounded-pill px-4 py-2"
            >
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={handleConfirmDelete} 
              disabled={actionLoading}
              className="rounded-pill px-4 py-2"
            >
              {actionLoading ? <Spinner animation="border" size="sm" /> : 'Delete Permanently'}
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      <style>{`
        .user-row-premium:hover { background-color: #f8fbff !important; transition: all 0.2s ease; }
        .user-row-premium td { border-bottom: 1px solid #f1f5f9; }
        .user-modal-premium .modal-content { border-radius: 20px; border: none; box-shadow: 0 15px 50px rgba(0,0,0,0.1); }
      `}</style>
    </Container>
  );
};

export default UserManagement;
