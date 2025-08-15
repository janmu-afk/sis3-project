import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import Form from "react-bootstrap/Form";
import ListGroup from "react-bootstrap/ListGroup";

export default function SearchPage() {
  const [all, setAll] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {
    let alive = true;
    (async () => {
      try { const { data } = await api.get("/doctor/list"); if (alive) setAll(Array.isArray(data) ? data : []); }
      catch (e) { console.error("GET /doctor/list failed", e?.response?.status, e?.response?.data || e?.message);
      if (alive) setError(e?.response?.data?.message || `HTTP ${e?.response?.status || 0}`); }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, []);

  // the "search function"
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return all;
    return all.filter(it => {
      const title = (it.ime || "").toLowerCase();
      const tags = Array.isArray(it.tags) ? it.tags.join(" ").toLowerCase() : "";
      return title.includes(s) || tags.includes(s);
    });
  }, [q, all]);
  if (error) return <div className="alert alert-danger">Failed to load results: {error}</div>;
  if (loading) return <div>Loading…</div>;

  return (
    <>
      <Form.Control
        placeholder="Iskanje..."
        value={q}
        onChange={e => setQ(e.target.value)}
        className="mb-3"
      />
      <ListGroup>
        {filtered.map(it => (
          <ListGroup.Item key={it.sifra_zd} action as={Link} to={`/${it.sifra_zd}`}>
            {it.ime}
            <div className="text-muted small">{it.naziv_iz}</div>
            <div className="text-muted small">{it.naziv_de}</div>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </>
  );
}
