import { useEffect, useState } from 'react';
import { api } from '../api/client.js';

function Cell({ value }) {
  if (value === null || value === undefined) return <span className="muted">NULL</span>;
  if (typeof value === 'number') return <span>{value}</span>;
  return <span title={String(value)}>{String(value)}</span>;
}

function TableView({ table }) {
  const columns = table.columns.map((c) => c.name);
  return (
    <div className="card">
      <div className="row between">
        <h2><code>{table.name}</code></h2>
        <span className="pill">{table.count} row{table.count === 1 ? '' : 's'}</span>
      </div>

      <h3>Columns</h3>
      <div className="col-chips">
        {table.columns.map((c) => (
          <span className="chip static" key={c.name}>
            {c.pk && <strong>🔑 </strong>}{c.name}
            <span className="muted"> {c.type || 'ANY'}{c.notNull ? ' · required' : ''}</span>
          </span>
        ))}
      </div>

      <h3>Latest rows</h3>
      {table.rows.length === 0 ? (
        <p className="muted small">No rows yet.</p>
      ) : (
        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>{columns.map((c) => <th key={c}>{c}</th>)}</tr>
            </thead>
            <tbody>
              {table.rows.map((row, i) => (
                <tr key={i}>
                  {columns.map((c) => <td key={c}><Cell value={row[c]} /></td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <details className="schema">
        <summary className="muted small">Table definition (SQL)</summary>
        <pre>{table.sql}</pre>
      </details>
    </div>
  );
}

export default function Database() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/admin/database').then(setData).catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="page narrow"><div className="alert">{error}</div></div>;
  if (!data) return <div className="center muted">Loading…</div>;

  const totalRows = data.tables.reduce((sum, t) => sum + t.count, 0);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Database</h1>
          <p className="muted">
            {data.engine} · {data.tables.length} tables · {totalRows} rows in total. Showing the latest {data.rowLimit} rows per table.
            Passwords and session IDs are masked.
          </p>
        </div>
      </div>

      <div className="grid stats">
        {data.tables.map((t) => (
          <a className="card stat" href={`#${t.name}`} key={t.name}>
            <span>{t.name}</span>
            <strong className="md">{t.count}</strong>
          </a>
        ))}
      </div>

      {data.tables.map((t) => <div id={t.name} key={t.name}><TableView table={t} /></div>)}
    </div>
  );
}
