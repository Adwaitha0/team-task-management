import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import client from "../api/client";
import TaskCard from "../components/TaskCard";
import Modal from "../components/Modal";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../hooks/useSocket";

const statuses = ["Todo", "In Progress", "Review", "Done"];

export default function Tasks() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const workspace = searchParams.get("workspace") || "";
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", priority: "Medium", dueDate: "", assignedTo: "", labels: "", workspace
  });
  const [error, setError] = useState("");

  const load = useCallback(() => {
    const url = workspace ? `/tasks?workspace=${workspace}` : "/tasks";
    client.get(url).then((res) => setTasks(res.data));
  }, [workspace]);

  useEffect(() => {
    load();
    if (user.role !== "employee") client.get("/users").then((res) => setUsers(res.data));
  }, [load, user.role]);

  useSocket(useCallback(() => load(), [load]));

  async function create(e) {
    e.preventDefault();
    try {
      await client.post("/tasks", {
        ...form,
        assignedTo: form.assignedTo || null,
        labels: form.labels.split(",").map((x) => x.trim()).filter(Boolean),
        dueDate: form.dueDate || null
      });
      setShow(false);
      setForm({ title: "", description: "", priority: "Medium", dueDate: "", assignedTo: "", labels: "", workspace });
      load();
    } catch (err) { setError(err.response?.data?.message || "Failed to create task"); }
  }

  async function statusChange(id, status) {
    try {
      await client.patch(`/tasks/${id}`, { status });
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Invalid transition");
    }
  }

  return (
    <>
      <div className="page-heading">
        <div><h1>Tasks</h1><p>Track work across the team</p></div>
        {user.role !== "employee" && <button onClick={() => setShow(true)}>+ Task</button>}
      </div>

      <div className="kanban">
        {statuses.map((status) => (
          <section className="column" key={status}>
            <div className="column-title"><h3>{status}</h3><span>{tasks.filter(t => t.status === status).length}</span></div>
            {tasks.filter(t => t.status === status).map((task) => (
              <TaskCard key={task._id} task={task} onStatusChange={statusChange} />
            ))}
          </section>
        ))}
      </div>

      {show && (
        <Modal title="Create task" onClose={() => setShow(false)}>
          <form onSubmit={create}>
            {error && <div className="error">{error}</div>}
            <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              <option>Low</option><option>Medium</option><option>High</option>
            </select>
            <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            <select value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}>
              <option value="">Unassigned</option>
              {users.filter(u => u.role === "employee").map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
            </select>
            <input placeholder="Label" value={form.labels} onChange={(e) => setForm({ ...form, labels: e.target.value })} />
            <button>Create task</button>
          </form>
        </Modal>
      )}
    </>
  );
}