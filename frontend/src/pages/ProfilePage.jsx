import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../app/AuthContext";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import ListGroup from "react-bootstrap/ListGroup";
import Modal from "react-bootstrap/Modal";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";


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
  const [variable, setVariable] = useState("obseg");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [series, setSeries] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const fetchSeries = async () => {
    setBusy(true); setErr("");
    try {
      const body = { datapoint: variable, date_start: from || undefined, date_end: to || undefined };
      const { data } = await api.post(`/doctor/series/${id}`, body, { timeout: 60000 });
      setSeries(Array.isArray(data) ? data : []);
    } catch (e) {
      setSeries([]);
      setErr(e?.response?.data?.message || "Failed to load series");
    } finally {
      setBusy(false);
    }
  };

  const chartData = (series || [])
    .map(p => {
      const d = p.date ?? p.datum ?? p.day ?? p.ts ?? p.time;
      const date = typeof d === "number" ? new Date(d).toISOString().slice(0,10) : (typeof d === "string" ? d.slice(0,10) : "");
      return { date, value: Number(p.value ?? p.val ?? p.y) };
    })
    .filter(p => p.date && Number.isFinite(p.value));

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton><Modal.Title>Generate Graph</Modal.Title></Modal.Header>
      <Modal.Body>
        <div className="d-flex gap-2 mb-3">
          <Form.Select value={variable} onChange={e => setVariable(e.target.value)} style={{ maxWidth: 180 }}>
            <option value="obseg">Obseg</option>
            <option value="kolicnik">Količnik</option>
          </Form.Select>
          <Form.Control type="date" value={from} onChange={e => setFrom(e.target.value)} />
          <Form.Control type="date" value={to} onChange={e => setTo(e.target.value)} />
          <Button onClick={fetchSeries} disabled={busy}>{busy ? "Fetching…" : "Fetch"}</Button>
        </div>

        {err && <div className="alert alert-danger">{err}</div>}
        {!err && !busy && chartData.length === 0 && <div className="text-muted">No data.</div>}

        {chartData.length > 0 && (
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="value" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
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
