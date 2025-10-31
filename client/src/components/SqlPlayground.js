import React, { useEffect, useMemo, useRef, useState } from 'react';

// Lightweight in-browser SQL lab using sql.js (SQLite -> WASM)
// Goal: teach SQL querying (PostgreSQL-style) without server setup

const DEFAULT_SCHEMA_SQL = `
-- E-commerce minimal dataset
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL
);

CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  price_cents INTEGER NOT NULL
);

CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE order_items (
  order_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  PRIMARY KEY(order_id, product_id),
  FOREIGN KEY(order_id) REFERENCES orders(id),
  FOREIGN KEY(product_id) REFERENCES products(id)
);

INSERT INTO users (id, name, email) VALUES
  (1, 'Alice', 'alice@example.com'),
  (2, 'Bob', 'bob@example.com'),
  (3, 'Carol', 'carol@example.com');

INSERT INTO products (id, name, price_cents) VALUES
  (1, 'Selenium Guide', 2500),
  (2, 'JUnit Cookbook', 3000),
  (3, 'Cucumber Recipes', 2000);

INSERT INTO orders (id, user_id, created_at) VALUES
  (100, 1, '2025-01-10T09:00:00Z'),
  (101, 2, '2025-01-11T10:15:00Z'),
  (102, 1, '2025-01-12T12:30:00Z');

INSERT INTO order_items (order_id, product_id, quantity) VALUES
  (100, 1, 1),
  (100, 3, 2),
  (101, 2, 1),
  (102, 1, 1),
  (102, 2, 1);
`;

const SAMPLE_TASKS = [
  {
    id: 't1',
    title: 'Top buyers (total spent)',
    prompt: 'List users and their total spent in dollars, highest first.',
    expectedColumns: ['name', 'total_spent'],
    validator: (rows) => rows.length > 0,
    starter: `SELECT u.name,
       ROUND(SUM(oi.quantity * p.price_cents) / 100.0, 2) AS total_spent
FROM users u
JOIN orders o ON o.user_id = u.id
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
GROUP BY u.id, u.name
ORDER BY total_spent DESC;`
  },
  {
    id: 't2',
    title: 'Most popular product',
    prompt: 'Find product name and total quantity ordered.',
    expectedColumns: ['name', 'qty'],
    validator: (rows) => rows.length > 0,
    starter: `SELECT p.name, SUM(oi.quantity) AS qty
FROM products p
JOIN order_items oi ON oi.product_id = p.id
GROUP BY p.id, p.name
ORDER BY qty DESC
LIMIT 1;`
  }
];

export default function SqlPlayground() {
  const [SQL, setSQL] = useState(null);
  const dbRef = useRef(null);
  const [schemaApplied, setSchemaApplied] = useState(false);
  const [taskIndex, setTaskIndex] = useState(0);
  const [query, setQuery] = useState(SAMPLE_TASKS[0].starter);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsBusy(true);
      try {
        const initSqlJs = (await import('sql.js')).default;
        const SQLModule = await initSqlJs({ locateFile: (f) => `/${f}` });
        if (cancelled) return;
        setSQL(SQLModule);
        dbRef.current = new SQLModule.Database();
      } catch (e) {
        setError(`Failed to load SQL engine: ${e.message}`);
      } finally {
        setIsBusy(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!SQL || !dbRef.current || schemaApplied) return;
    try {
      dbRef.current.run('BEGIN;');
      dbRef.current.run(DEFAULT_SCHEMA_SQL);
      dbRef.current.run('COMMIT;');
      setSchemaApplied(true);
    } catch (e) {
      setError(`Schema error: ${e.message}`);
    }
  }, [SQL, schemaApplied]);

  const currentTask = useMemo(() => SAMPLE_TASKS[taskIndex], [taskIndex]);

  const runQuery = () => {
    if (!dbRef.current) return;
    setError('');
    setResults([]);
    try {
      const stmt = dbRef.current.prepare(query);
      const rows = [];
      const cols = stmt.getColumnNames();
      let count = 0;
      while (stmt.step()) {
        rows.push(stmt.get());
        count += 1;
        if (count > 2000) break; // safety cap
      }
      stmt.free();

      setResults([{ columns: cols, values: rows }]);
    } catch (e) {
      setError(e.message);
    }
  };

  const resetDb = () => {
    if (!SQL) return;
    if (dbRef.current) dbRef.current.close();
    dbRef.current = new SQL.Database();
    setSchemaApplied(false);
    setTimeout(() => setSchemaApplied(true), 0);
  };

  const loadTask = (idx) => {
    setTaskIndex(idx);
    setQuery(SAMPLE_TASKS[idx].starter);
    setResults([]);
    setError('');
  };

  return (
    <div className="card slide-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">SQL Playground (in-browser)</h3>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={() => resetDb()}>Reset DB</button>
          <button className="btn-primary" onClick={() => runQuery()} disabled={isBusy || !schemaApplied}>Run (Ctrl/Cmd+Enter)</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="md:col-span-2">
          <div className="card">
            <h4 className="text-white font-semibold mb-2">Task</h4>
            <p className="text-white/80 text-sm mb-3">{currentTask.title}</p>
            <p className="text-white/70 text-sm">{currentTask.prompt}</p>
            <div className="flex gap-2 mt-3">
              {SAMPLE_TASKS.map((t, i) => (
                <button key={t.id} className={`btn-secondary ${i===taskIndex ? 'border-white/60' : ''}`} onClick={() => loadTask(i)}>
                  {i+1}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="md:col-span-3">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            spellCheck={false}
            className="w-full h-48 md:h-56 rounded-xl p-3 bg-black/30 text-white font-mono text-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
            placeholder="Write your SQL query here..."
          />

          <div className="mt-3">
            {error && (
              <div className="card" style={{ borderColor: 'rgba(255,0,0,0.35)' }}>
                <div className="text-red-300 text-sm">{error}</div>
              </div>
            )}

            {results.length > 0 && results[0].values.length > 0 && (
              <div className="card overflow-auto">
                <table className="min-w-full text-left text-sm text-white/90">
                  <thead>
                    <tr>
                      {results[0].columns.map((c) => (
                        <th key={c} className="py-2 pr-4 text-white/70 font-semibold border-b border-white/10">{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results[0].values.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-white/5">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="py-2 pr-4 border-b border-white/10">{String(cell)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {results.length > 0 && results[0].values.length === 0 && !error && (
              <div className="card">
                <div className="text-white/80 text-sm">Query OK. No rows returned.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


