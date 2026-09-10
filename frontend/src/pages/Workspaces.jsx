import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/Modal";

export default function Workspaces() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [error, setError] = useState("");

  const load = () => client.get("/workspaces").then((res) => setItems(res.data));
  useEffect(() => { load(); }, []);

  async function create(e) {
    e.preventDefault();
    try {
      await client.post("/workspaces", form);
      setForm({ name: "", description: "" });
      setShow(false);
      load();
    } catch (err) { setError(err.response?.data?.message || "Failed"); }
  }

  async function archive(id) {
    if (!confirm("Archive this workspace?")) return;
    await client.patch(`/workspaces/${id}/archive`);
    load();
  }

  return (
    <>
      <div className="page-heading">
        <div><h1>Workspaces</h1><p>Manage team workspaces</p></div>
        {(user.role === "admin" || user.role === "manager") && <button onClick={() => setShow(true)}>+ Workspace</button>}
      </div>

      <div className="card-grid">
        {items.map((ws) => (
          <div className="panel" key={ws._id}>
            <h3>{ws.name}</h3>
            <p>{ws.description || "No description"}</p>
            <span className={ws.isArchived ? "badge archived" : "badge"}>{ws.isArchived ? "Archived" : "Active"}</span>
            <div className="actions">
              <Link className="small-btn" to={`/workspaces/${ws._id}`}>Open</Link>
              {(user.role === "admin" || user.role === "manager") && !ws.isArchived &&
                <button className="small-btn" onClick={() => archive(ws._id)}>Archive</button>}
            </div>
          </div>
        ))}
      </div>

      {show && (
        <Modal title="Create workspace" onClose={() => setShow(false)}>
          <form onSubmit={create}>
            {error && <div className="error">{error}</div>}
            <input placeholder="Workspace name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <button>Create workspace</button>
          </form>
        </Modal>
      )}
    </>
  );
}