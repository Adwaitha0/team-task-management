import { useEffect, useState } from "react";
import client from "../api/client";

export default function Activities() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    client.get("/activities").then((res) => setItems(res.data));
  }, []);

  return (
    <>
      <div className="page-heading">
        <div><h1>Activity</h1><p>History of important system actions</p></div>
      </div>
      <section className="panel">
        {items.length === 0 ? <p>No activity yet.</p> : items.map((item) => (
          <div className="activity" key={item._id}>
            <div className="activity-dot" />
            <div><strong>{item.user?.name || "System"}</strong><p>{item.description}</p><span>{new Date(item.createdAt).toLocaleString()}</span></div>
          </div>
        ))}
      </section>
    </>
  );
}