import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import client from "../api/client";

export default function WorkspaceDetails() {
  const { id } = useParams();
  const [workspace, setWorkspace] = useState(null);
  const [sprints, setSprints] = useState([]);

  useEffect(() => {
    Promise.all([
      client.get(`/workspaces/${id}`),
      client.get(`/sprints/workspace/${id}`)
    ]).then(([w, s]) => {
      setWorkspace(w.data);
      setSprints(s.data);
    });
  }, [id]);

  if (!workspace) return <div>Loading...</div>;

  return (
    <>
      <div className="page-heading">
        <div><h1>{workspace.name}</h1><p>{workspace.description}</p></div>
        <Link className="button-link" to={`/tasks?workspace=${id}`}>View Tasks</Link>
      </div>
      <section className="panel">
        <h3>Sprints</h3>
        {sprints.length === 0 ? <p>No sprints yet.</p> :
          sprints.map((s) => (
            <div className="list-row" key={s._id}>
              <div><strong>{s.name}</strong><span>{new Date(s.startDate).toLocaleDateString()} - {new Date(s.endDate).toLocaleDateString()}</span></div>
              <span className="badge">{s.status}</span>
            </div>
          ))}
      </section>
    </>
  );
}