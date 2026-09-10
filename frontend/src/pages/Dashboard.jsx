import { useEffect, useState } from "react";
import client from "../api/client";

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    client.get("/dashboard").then((res) => setData(res.data));
  }, []);

  if (!data) return <div>Loading dashboard...</div>;

  return (
    <>
      <div className="page-heading">
        <div><h1>Dashboard</h1><p>Team task overview</p></div>
      </div>

      <section className="stats-grid">
        <div className="stat"><span>Total</span><strong>{data.total}</strong></div>
        <div className="stat"><span>Completed</span><strong>{data.completed}</strong></div>
        <div className="stat"><span>Overdue</span><strong>{data.overdue}</strong></div>
        <div className="stat"><span>Active</span><strong>{data.total - data.completed}</strong></div>
      </section>

      <div className="two-col">
        <section className="panel">
          <h3>Status</h3>
          {Object.entries(data.byStatus).map(([key, value]) => (
            <div className="bar-row" key={key}><span>{key}</span><b>{value}</b></div>
          ))}
        </section>
        <section className="panel">
          <h3>Priority</h3>
          {Object.entries(data.byPriority).map(([key, value]) => (
            <div className="bar-row" key={key}><span>{key}</span><b>{value}</b></div>
          ))}
        </section>
      </div>

      {data.employeeStats.length > 0 && (
        <section className="panel">
          <h3>Employee task statistics</h3>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Employee</th><th>Total</th><th>Active</th><th>Completed</th></tr></thead>
              <tbody>
                {data.employeeStats.map((item) => (
                  <tr key={String(item._id)}>
                    <td>{item.user?.name}</td><td>{item.total}</td><td>{item.active}</td><td>{item.completed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}