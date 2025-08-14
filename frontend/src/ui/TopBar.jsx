import { useState } from "react";
import { Navbar, Nav, Container, Button, Modal, Form, Dropdown } from "react-bootstrap";
import { useAuth } from "../app/AuthContext";

export default function TopBar() {
  const { user, login, register, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="sm">
        <Container>
          <Navbar.Brand href="/">App</Navbar.Brand>
          <Nav className="ms-auto">
            {!user ? (
              <>
                <Button variant="outline-light" size="sm" onClick={() => setShowLogin(true)}>Login</Button>
                <Button className="ms-2" size="sm" onClick={() => setShowRegister(true)}>Register</Button>
              </>
            ) : (
              <Dropdown align="end">
                <Dropdown.Toggle variant="outline-light" size="sm">{user.username}</Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Header>Bookmarks</Dropdown.Header>
                  {(user.bookmarks || []).map(b => (
                    <Dropdown.Item key={b.id} href={`/${b.id}`}>{b.title || b.id}</Dropdown.Item>
                  ))}
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={logout}>Logout</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}
          </Nav>
        </Container>
      </Navbar>

      <LoginModal show={showLogin} onHide={() => setShowLogin(false)} onSubmit={login} />
      <RegisterModal show={showRegister} onHide={() => setShowRegister(false)} onSubmit={register} />
    </>
  );
}

function LoginModal({ show, onHide, onSubmit }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const submit = async () => {
    setErr("");
    try { await onSubmit({ username, password }); onHide(); }
    catch (e) { setErr(e?.response?.data?.message || "Login failed"); }
  };
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton><Modal.Title>Login</Modal.Title></Modal.Header>
      <Modal.Body>
        <Form.Control className="mb-2" placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} />
        <Form.Control className="mb-2" type="password" placeholder="Password" value={password}
          onChange={e=>setPassword(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter') submit(); }} />
        {err && <div className="text-danger small">{err}</div>}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancel</Button>
        <Button onClick={submit}>Login</Button>
      </Modal.Footer>
    </Modal>
  );
}

function RegisterModal({ show, onHide, onSubmit }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const submit = async () => {
    setErr("");
    try { await onSubmit({ username, email, password }); onHide(); }
    catch (e) { setErr(e?.response?.data?.message || "Register failed"); }
  };
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton><Modal.Title>Register</Modal.Title></Modal.Header>
      <Modal.Body>
        <Form.Control className="mb-2" placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} />
        <Form.Control className="mb-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <Form.Control className="mb-2" type="password" placeholder="Password" value={password}
          onChange={e=>setPassword(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter') submit(); }} />
        {err && <div className="text-danger small">{err}</div>}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancel</Button>
        <Button onClick={submit}>Register</Button>
      </Modal.Footer>
    </Modal>
  );
}
