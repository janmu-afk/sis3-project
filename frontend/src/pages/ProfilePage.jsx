import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../app/AuthContext";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import ListGroup from "react-bootstrap/ListGroup";
import Modal from "react-bootstrap/Modal";

export default function ProfilePage() {
  const { id } = useParams();
  const { user, refresh } = useAuth();

  const [profile, setProfile] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [showGraph, setShowGraph] = useState(false);
  const [showExport, setShowExport] = useState(false);

  const load = async () => {
    const [{ data: p }, { data: c }] = await Promise.all([
      api.get(`/api/profiles/${id}`),
      api.get(`/api/profiles/${id}/comments`)
    ]);
    setProfile(p); setComments(c || []);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  const toggleBookmark = async () => { await api.post(`/api/profiles/${id}/bookmark`); await refresh(); };

  const postComment = async () => {
    if (!newComment.trim()) return;
    await api.post(`/api/profiles/${id}/comments`, { text: newComment.trim() });
    setNewComment("");
    const { data } = await api.get(`/api/profiles/${id}/comments`);
    setComments(data || []);
  };

  if (!profile) return <div>Loading…</div>;

  return (
    <>
      <Card className="mb-3">
        <Card.Body>
          <Card.Title>{profile.name || id}</Card.Title>
          {profile.location && <div className="text-muted">{profile.location}</div>}
          {/* more fields as needed */}
          <div className="mt-2 d-flex gap-2">
            <Button variant="outline-primary" onClick={() => setShowGraph(true)}>Generate Graph</Button>
            <Button variant="outline-secondary" onClick={() => setShowExport(true)}>Generate Dataset</Button>
            {user && <Button onClick={toggleBookmark}>Bookmark</Button>}
          </div>
        </Card.Body>
      </Card>

      <h5>Comments</h5>
      <ListGroup className="mb-2">
        {comments.map(c => (
          <ListGroup.Item key={c.id}>
            <div>{c.text}</div>
            <div className="text-muted small">
              {c.author?.username}{c.createdAt ? ` • ${new Date(c.createdAt).toLocaleString()}` : ""}
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>

      {user ? (
        <div className="d-flex gap-2">
          <Form.Control
            placeholder="Write a comment…"
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') postComment(); }}
          />
          <Button onClick={postComment}>Post</Button>
        </div>
      ) : (
        <div className="text-muted">Login to comment.</div>
      )}

      <GraphModal show={showGraph} onHide={() => setShowGraph(false)} id={id} />
      <ExportModal show={showExport} onHide={() => setShowExport(false)} id={id} />
    </>
  );
}

function GraphModal({ show, onHide, id }) {
  const [variable, setVariable] = useState("A");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [series, setSeries] = useState(null);

  const fetchSeries = async () => {
    const { data } = await api.get(`/api/profiles/${id}/series`, { params: { from, to, variable } });
    setSeries(data || []);
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton><Modal.Title>Generate Graph</Modal.Title></Modal.Header>
      <Modal.Body>
        <div className="d-flex gap-2 mb-2">
          <Form.Select value={variable} onChange={e => setVariable(e.target.value)} style={{ maxWidth: 180 }}>
            <option value="A">Variable A</option>
            <option value="B">Variable B</option>
          </Form.Select>
          <Form.Control type="date" value={from} onChange={e => setFrom(e.target.value)} />
          <Form.Control type="date" value={to} onChange={e => setTo(e.target.value)} />
          <Button onClick={fetchSeries}>Fetch</Button>
        </div>
        {Array.isArray(series) && series.length > 0 && (
          <ListGroup style={{ maxHeight: 260, overflow: 'auto' }}>
            {series.map((p, i) => (
              <ListGroup.Item key={i}>{p.date}: {p.value}</ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}

function ExportModal({ show, onHide, id }) {
  const [format, setFormat] = useState("csv");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const download = async () => {
    const res = await api.get(`/api/profiles/${id}/export`, {
      params: { from, to, format }, responseType: "blob"
    });
    const mime = format === "csv" ? "text/csv" : "application/json";
    const blob = new Blob([res.data], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `export-${id}-${from || ""}-${to || ""}.${format}`;
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton><Modal.Title>Generate Dataset</Modal.Title></Modal.Header>
      <Modal.Body>
        <div className="d-flex gap-2">
          <Form.Select value={format} onChange={e => setFormat(e.target.value)} style={{ maxWidth: 140 }}>
            <option value="csv">CSV</option>
            <option value="json">JSON</option>
          </Form.Select>
          <Form.Control type="date" value={from} onChange={e => setFrom(e.target.value)} />
          <Form.Control type="date" value={to} onChange={e => setTo(e.target.value)} />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Close</Button>
        <Button onClick={download}>Download</Button>
      </Modal.Footer>
    </Modal>
  );
}
