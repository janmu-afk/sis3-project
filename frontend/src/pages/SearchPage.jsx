import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import Form from "react-bootstrap/Form";
import ListGroup from "react-bootstrap/ListGroup";

export default function SearchPage() {
  const [all, setAll] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try { const { data } = await api.get("/api/results"); if (alive) setAll(Array.isArray(data) ? data : []); }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return all;
    return all.filter(it => {
      const title = (it.title || "").toLowerCase();
      const tags = Array.isArray(it.tags) ? it.tags.join(" ").toLowerCase() : "";
      return title.includes(s) || tags.includes(s);
    });
  }, [q, all]);

  if (loading) return <div>Loading…</div>;

  return (
    <>
      <Form.Control
        placeholder="Search…"
        value={q}
        onChange={e => setQ(e.target.value)}
        className="mb-3"
      />
      <ListGroup>
        {filtered.map(it => (
          <ListGroup.Item key={it.id} action as={Link} to={`/${it.id}`}>
            {it.title || it.id}
            {it.subtitle && <div className="text-muted small">{it.subtitle}</div>}
          </ListGroup.Item>
        ))}
      </ListGroup>
    </>
  );
}
