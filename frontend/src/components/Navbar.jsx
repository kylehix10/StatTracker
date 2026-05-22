import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import BootstrapNavbar from 'react-bootstrap/Navbar';
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';
import { NavLink, useNavigate } from 'react-router-dom';



function BasicExample() {
  const navigate = useNavigate();
  const [showLogoutToast, setShowLogoutToast] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('statTrackerUser');
    setShowLogoutToast(false);
    navigate('/');
  };

  return (
    <BootstrapNavbar expand="lg"  style={{backgroundColor: '#738678bb'}}>
      <Container className="app-navbar-container" fluid>
        <BootstrapNavbar.Brand as={NavLink} to="/dashboard">StatTracker</BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            
            <Nav.Link as={NavLink} to="/dashboard">
                        Dashboard
            </Nav.Link>            
          </Nav>
          <Button
            className="navbar-logout-button"
            onClick={() => setShowLogoutToast(true)}
            size="sm"
            type="button"
            variant="outline-light"
          >
            Logout
          </Button>
        </BootstrapNavbar.Collapse>
      </Container>

      <ToastContainer className="dashboard-toast-container" position="top-end">
        <Toast show={showLogoutToast} onClose={() => setShowLogoutToast(false)} bg="light">
          <Toast.Header>
            <strong className="me-auto">Are you sure you want to logout?</strong>
          </Toast.Header>
          <Toast.Body>
            <div className="delete-toast-actions">
              <Button onClick={handleLogout} size="sm" variant="danger">
                Yes
              </Button>
              <Button onClick={() => setShowLogoutToast(false)} size="sm" variant="secondary">
                No
              </Button>
            </div>
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </BootstrapNavbar>
  );
}

export default BasicExample;
