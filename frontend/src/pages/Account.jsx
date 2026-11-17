import { useEffect, useState } from 'react';
import { api } from '../api/client.js';

export default function Account() {
  const [data, setData] = useState(null);
  useEffect(() => {
    api('/auth/me').then(setData);
  }, []);
  if (!data) return <div className="center muted">Loading…</div>;
  const { user, loginHistory } = data;

  return (
    <div className="page narrow">
      <h1>Account</h1>
      <div className="card">
        <dl className="kv">
          <dt>Name</dt><dd>{user.name}</dd>
          <dt>Email</dt><dd>{user.email}</dd>
          <dt>Role</dt><dd className="cap">{user.role}</dd>
        </dl>
      </div>
      <div className="card">
        <h2>Recent sign-in activity</h2>
        <p className="muted small">Every sign-in attempt is recorded in the database for security.</p>
        <table className="table">
          <thead>
            <tr><th>When</th><th>Result</th><th>IP</th><th>Device</th></tr>
          </thead>
          <tbody>
            {loginHistory.map((h, i) => (
              <tr key={i}>
                <td>{new Date(h.created_at + 'Z').toLocaleString()}</td>
                <td><span className={`status ${h.success ? 'completed' : 'failed'}`}>{h.success ? 'Success' : 'Failed'}</span></td>
                <td>{h.ip_address}</td>
                <td className="ellipsis" title={h.user_agent}>{h.user_agent}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
