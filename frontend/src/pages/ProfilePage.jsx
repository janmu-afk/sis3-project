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

  function Field({ label, value }) {
  if (value == null || value === "") return null; // skip empty rows
  return (
    <ListGroup.Item className="d-flex py-2">
      <div className="me-3 text-muted" style={{ minWidth: 140 }}>{label}</div>
      <div className="flex-fill">{value}</div>
    </ListGroup.Item>
  );
}
  const dateFmt = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });
  function formatDateOnly(x) {
    if (!x) return "";
    if (typeof x === "string") {
      // Works for "YYYY-MM-DD" and "YYYY-MM-DD HH:MM:SS"
      const m = x.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (m) {
        const [, y, mo, d] = m;
        return dateFmt.format(new Date(Number(y), Number(mo) - 1, Number(d)));
      }
    }
    const d = new Date(x); // ISO or epoch
    return Number.isNaN(d.getTime()) ? String(x) : dateFmt.format(d);
  }

  const load = async () => {
    const [{ data: p }, { data: c }] = await Promise.all([
      api.get(`/doctor/${id}`),
      api.get(`/doctor/comment/${id}`)
    ]);
    setProfile(Array.isArray(p) ? (p[0] ?? null) : (p ?? null)); setComments(c || []);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  const toggleBookmark = async () => { await api.post(`/user/bookmarks/${id}`); await refresh(); };

  const postComment = async () => {
    if (!newComment.trim()) return;
    await api.post(`/doctor/comment/${id}`, { text: newComment.trim() });
    setNewComment("");
    const { data } = await api.get(`/doctor/comment/${id}`);
    load(); // easy fix :)
  };

  if (!profile) return <div>Loading…</div>;

  return (
    <>
      <Card className="mb-3">
        <Card.Body>
          <Card.Title>{profile.ime}</Card.Title>
          <ListGroup variant="flush" className="mb-2">
            {/* the date is hacky but it will do :/ */}
            <Field label="Datum zadnjega vnosa" value={profile.datum ? `${formatDateOnly(profile.datum)}` : ""} />
            <Field label="Dejavnost" value={profile.naziv_de} />
            <Field label="Izvajalec" value={profile.naziv_iz} />
            <Field label="Enota"     value={profile.enota} />
            <Field label="Naslov"    value={[profile.ulica, profile.kraj].filter(Boolean).join(", ")} />
            <Field label="Glavarinski količnik" value={profile.kolicnik} />
            <Field label="Obseg dela"      value={String(profile.obseg * 100) + '%'} />
            <Field label="Sprejema paciente?"    value={(profile.sprejem === 1 ? "DA" : "NE")} />
          </ListGroup>
          <div className="mt-2 d-flex gap-2">
            <Button variant="outline-primary" onClick={() => setShowGraph(true)}>Generate Graph</Button>
            <Button variant="outline-secondary" onClick={() => setShowExport(true)}>Generate Dataset</Button>
            {user?.username && (
              <Button onClick={toggleBookmark}>Bookmark</Button>
            )}
          </div>
        </Card.Body>
      </Card>

      <h5>Comments</h5>
      
      {user?.username ? (
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

      <ListGroup className="mb-2">
        {comments.map(c => (
          <ListGroup.Item key={c.id_pripombe}>
            <div>{c.text}</div>
            <div className="text-muted small">
              <b>{c.username}</b>: {c.tekst}
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>

      

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

    const body = { date_start: from || undefined, date_end: to || undefined, format };
    const filename = `export-${id}-${from || ""}-${to || ""}.${format}`;

    if (format === "json") {
      // backend throws json as json
      const { data } = await api.post(`/doctor/export/${id}`, body, {
        timeout: 60000
      });
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    } else {
      // backend throws csv as blob
      const res = await api.post(`/doctor/export/${id}`, body, {
      responseType: "arraybuffer",
      timeout: 60000
    });
      const blob = new Blob([res.data], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    }
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
