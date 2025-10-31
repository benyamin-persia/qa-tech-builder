import React, { useEffect, useMemo, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from './ui/resizable';
import TetrisGame from './ui/TetrisGame';

/**
 * SQL for QA Testers - Learning Platform
 * Tailored for QA testing scenarios from "Learning SQL" book
 * 
 * QA Testing Focus:
 * - Test data validation & verification
 * - ETL/Data pipeline testing
 * - Database regression testing
 * - API ↔ Database cross-validation
 * - Defect detection through data analysis
 * - Performance & data quality checks
 */

// QA-focused chapter structure
const CHAPTERS = [
  { id: 1, title: 'SQL Basics for QA', skills: ['intro', 'select'], difficulty: 1 },
  { id: 2, title: 'Data Validation', skills: ['where', 'filter'], difficulty: 1 },
  { id: 3, title: 'Test Data Queries', skills: ['joins', 'data-check'], difficulty: 2 },
  { id: 4, title: 'Database Regression', skills: ['aggregates', 'comparison'], difficulty: 2 },
  { id: 5, title: 'ETL Testing', skills: ['subqueries', 'transforms'], difficulty: 3 },
  { id: 6, title: 'API-DB Validation', skills: ['joins', 'cross-check'], difficulty: 3 },
  { id: 7, title: 'Defect Detection', skills: ['analysis', 'anomalies'], difficulty: 3 },
  { id: 8, title: 'Performance Testing', skills: ['optimization'], difficulty: 3 }
];

// E-commerce Test Database with QA testing scenarios
const QA_E_COMMERCE_SCHEMA = `
-- E-commerce Test Database for QA Testing
-- Simulates real-world scenarios testers encounter

CREATE TABLE customers (
  customer_id INTEGER PRIMARY KEY,
  email VARCHAR(100) NOT NULL UNIQUE,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  created_at DATETIME NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  last_login DATETIME,
  test_user BOOLEAN DEFAULT 0
);

CREATE TABLE products (
  product_id INTEGER PRIMARY KEY,
  sku VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(50) NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN DEFAULT 1,
  created_at DATETIME NOT NULL
);

CREATE TABLE orders (
  order_id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  order_date DATETIME NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  total_amount DECIMAL(10,2) NOT NULL,
  shipping_address TEXT,
  FOREIGN KEY(customer_id) REFERENCES customers(customer_id)
);

CREATE TABLE order_items (
  order_item_id INTEGER PRIMARY KEY,
  order_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  FOREIGN KEY(order_id) REFERENCES orders(order_id),
  FOREIGN KEY(product_id) REFERENCES products(product_id)
);

CREATE TABLE payments (
  payment_id INTEGER PRIMARY KEY,
  order_id INTEGER NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) NOT NULL,
  transaction_date DATETIME NOT NULL,
  FOREIGN KEY(order_id) REFERENCES orders(order_id)
);

CREATE TABLE test_results (
  test_run_id INTEGER PRIMARY KEY,
  test_name VARCHAR(100) NOT NULL,
  executed_at DATETIME NOT NULL,
  passed BOOLEAN NOT NULL,
  failure_reason TEXT,
  execution_time_ms INTEGER
);

-- Seed Test Data
INSERT INTO customers VALUES
  (1, 'john.doe@example.com', 'John', 'Doe', '2025-01-01 10:00:00', 'active', '2025-01-15 14:30:00', 0),
  (2, 'jane.smith@example.com', 'Jane', 'Smith', '2025-01-02 11:00:00', 'active', '2025-01-14 09:15:00', 0),
  (3, 'test.user@qa.com', 'Test', 'User', '2025-01-03 12:00:00', 'active', '2025-01-16 16:45:00', 1),
  (4, 'bob.wilson@example.com', 'Bob', 'Wilson', '2025-01-04 13:00:00', 'inactive', '2025-01-05 08:20:00', 0),
  (5, 'alice.brown@example.com', 'Alice', 'Brown', '2025-01-05 14:00:00', 'active', '2025-01-16 10:00:00', 0);

INSERT INTO products VALUES
  (1, 'LAPTOP-001', 'Gaming Laptop', 1299.99, 'Electronics', 50, 1, '2024-12-01 00:00:00'),
  (2, 'PHONE-002', 'Smartphone Pro', 899.99, 'Electronics', 100, 1, '2024-12-01 00:00:00'),
  (3, 'HEADPHONE-003', 'Wireless Headphones', 199.99, 'Electronics', 75, 1, '2024-12-01 00:00:00'),
  (4, 'DESK-004', 'Standing Desk', 599.99, 'Furniture', 30, 1, '2024-12-01 00:00:00'),
  (5, 'CHAIR-005', 'Ergonomic Chair', 449.99, 'Furniture', 25, 1, '2024-12-01 00:00:00'),
  (6, 'MOUSE-006', 'Wireless Mouse', 49.99, 'Electronics', 0, 0, '2024-12-01 00:00:00'),
  (7, 'KEYBOARD-007', 'Mechanical Keyboard', 149.99, 'Electronics', -5, 1, '2024-12-01 00:00:00');

INSERT INTO orders VALUES
  (101, 1, '2025-01-10 09:00:00', 'completed', 1299.99, '123 Main St, Boston, MA'),
  (102, 2, '2025-01-10 10:30:00', 'completed', 899.99, '456 Oak Ave, Cambridge, MA'),
  (103, 1, '2025-01-11 14:20:00', 'pending', 199.99, '123 Main St, Boston, MA'),
  (104, 3, '2025-01-12 11:00:00', 'completed', 1049.98, '789 Pine Rd, Somerville, MA'),
  (105, 4, '2025-01-12 15:00:00', 'cancelled', 599.99, '321 Elm St, Quincy, MA'),
  (106, 2, '2025-01-13 09:30:00', 'completed', 949.98, '456 Oak Ave, Cambridge, MA'),
  (107, 5, '2025-01-13 16:00:00', 'shipped', 49.99, NULL);

INSERT INTO order_items VALUES
  (1001, 101, 1, 1, 1299.99, 1299.99),
  (1002, 102, 2, 1, 899.99, 899.99),
  (1003, 103, 3, 1, 199.99, 199.99),
  (1004, 104, 4, 1, 599.99, 599.99),
  (1005, 104, 5, 1, 449.99, 449.99),
  (1006, 105, 4, 1, 599.99, 599.99),
  (1007, 106, 2, 1, 899.99, 899.99),
  (1008, 106, 3, 1, 199.99, 199.99),
  (1009, 107, 6, 1, 49.99, 49.99);

INSERT INTO payments VALUES
  (2001, 101, 'credit_card', 1299.99, 'success', '2025-01-10 09:05:00'),
  (2002, 102, 'paypal', 899.99, 'success', '2025-01-10 10:35:00'),
  (2003, 103, 'credit_card', 199.99, 'pending', '2025-01-11 14:25:00'),
  (2004, 104, 'credit_card', 1049.98, 'success', '2025-01-12 11:05:00'),
  (2005, 106, 'paypal', 949.98, 'success', '2025-01-13 09:35:00');

INSERT INTO test_results VALUES
  (1, 'User Registration Test', '2025-01-15 09:00:00', 1, NULL, 1250),
  (2, 'Product Search Test', '2025-01-15 09:05:00', 1, NULL, 850),
  (3, 'Add to Cart Test', '2025-01-15 09:10:00', 0, 'Cart validation failed', 3200),
  (4, 'Checkout Flow Test', '2025-01-15 09:15:00', 1, NULL, 4500),
  (5, 'Payment Gateway Test', '2025-01-15 09:20:00', 0, 'Gateway timeout', 15000);
`;

// QA-specific tasks
const QA_TASKS = [
  // Chapter 1: SQL Basics for QA
  {
    id: 'c1-t1',
    chapter: 1,
    title: 'Verify Test Users',
    prompt: 'Write a query to list all test users from the customers table.',
    skills: ['select', 'filter'],
    difficulty: 1,
    qaContext: 'QA Testers often need to identify test data vs production data.',
    starter: `SELECT customer_id, email, first_name, last_name, status
FROM customers
WHERE test_user = 1;`,
    solution: `SELECT customer_id, email, first_name, last_name, status
FROM customers
WHERE test_user = 1;`,
    quiz: {
      question: 'Why is it important to filter test users in QA?',
      options: [
        'To avoid deleting production data',
        'To separate test results from real user data',
        'To improve query performance',
        'Both A and B'
      ],
      correct: 3,
      explanation: 'QA testers must distinguish test data from production to prevent accidental damage and ensure accurate testing.'
    },
    expectedRows: 1
  },
  {
    id: 'c1-t2',
    chapter: 1,
    title: 'Check Active Products',
    prompt: 'Find all active products with their SKU, name, and price.',
    skills: ['select', 'where'],
    difficulty: 1,
    qaContext: 'Verify product inventory and pricing data.',
    starter: `SELECT sku, name, price, stock_quantity
FROM products
WHERE active = 1;`,
    solution: `SELECT sku, name, price, stock_quantity
FROM products
WHERE active = 1;`,
    quiz: {
      question: 'What should QA testers check in product data?',
      options: [
        'Only product names',
        'Prices, availability, and active status',
        'Only stock quantities',
        'Nothing'
      ],
      correct: 1,
      explanation: 'QA should validate all product attributes including pricing, stock, and activation status to ensure correct display and functionality.'
    },
    expectedRows: 6
  },
  // Chapter 2: Data Validation
  {
    id: 'c2-t1',
    chapter: 2,
    title: 'Find Data Quality Issues',
    prompt: 'Identify products with invalid stock quantities (negative or zero stock for active products).',
    skills: ['where', 'filter'],
    difficulty: 1,
    qaContext: 'Data validation is critical to catch inconsistencies before they reach production.',
    starter: `SELECT product_id, sku, name, stock_quantity, active
FROM products
WHERE active = 1 AND stock_quantity <= 0;`,
    solution: `SELECT product_id, sku, name, stock_quantity, active
FROM products
WHERE active = 1 AND stock_quantity <= 0;`,
    quiz: {
      question: 'Why check for negative stock quantities in QA?',
      options: [
        'It improves performance',
        'It reveals data integrity issues',
        'It has no impact',
        'It creates better reports'
      ],
      correct: 1,
      explanation: 'Negative stock can cause errors in inventory management and order processing systems.'
    },
    expectedRows: 2
  },
  {
    id: 'c2-t2',
    chapter: 2,
    title: 'Validate Order Totals',
    prompt: 'Find orders where the sum of order items does NOT match the total_amount.',
    skills: ['joins', 'aggregates', 'validation'],
    difficulty: 2,
    qaContext: 'QA testers must validate calculated fields to ensure business logic is correct.',
    starter: `SELECT o.order_id, o.total_amount, SUM(oi.subtotal) AS calculated_total
FROM orders o
JOIN order_items oi ON o.order_id = oi.order_id
GROUP BY o.order_id, o.total_amount
HAVING SUM(oi.subtotal) != o.total_amount;`,
    solution: `SELECT o.order_id, o.total_amount, SUM(oi.subtotal) AS calculated_total
FROM orders o
JOIN order_items oi ON o.order_id = oi.order_id
GROUP BY o.order_id, o.total_amount
HAVING SUM(oi.subtotal) != o.total_amount;`,
    quiz: {
      question: 'Why is order total validation critical in QA?',
      options: [
        'To catch billing errors',
        'To ensure customer charges are accurate',
        'To meet financial compliance',
        'All of the above'
      ],
      correct: 3,
      explanation: 'Order totals affect billing accuracy, customer trust, and financial reporting compliance.'
    },
    expectedRows: 1
  },
  // Chapter 3: Test Data Queries
  {
    id: 'c3-t1',
    chapter: 3,
    title: 'Cross-Check API vs Database',
    prompt: 'Verify that all completed orders have corresponding payment records.',
    skills: ['joins', 'left join', 'data-check'],
    difficulty: 2,
    qaContext: 'QA testers must verify data consistency between different systems and APIs.',
    starter: `SELECT o.order_id, o.status, o.total_amount, p.payment_id, p.status AS payment_status
FROM orders o
LEFT JOIN payments p ON o.order_id = p.order_id
WHERE o.status = 'completed' AND p.payment_id IS NULL;`,
    solution: `SELECT o.order_id, o.status, o.total_amount, p.payment_id, p.status AS payment_status
FROM orders o
LEFT JOIN payments p ON o.order_id = p.order_id
WHERE o.status = 'completed' AND p.payment_id IS NULL;`,
    quiz: {
      question: 'What does a LEFT JOIN show in QA testing?',
      options: [
        'Only matching records',
        'All records from left table and matches from right',
        'All records from both tables',
        'Only non-matching records'
      ],
      correct: 1,
      explanation: 'LEFT JOIN reveals orphaned records - critical for finding missing data relationships.'
    },
    expectedRows: 1
  },
  {
    id: 'c3-t2',
    chapter: 3,
    title: 'Identify Orphaned Order Items',
    prompt: 'Find order items that exist without a valid order.',
    skills: ['joins', 'left join', 'orphan-detection'],
    difficulty: 2,
    qaContext: 'Detecting orphaned records helps identify data integrity issues and potential bugs.',
    starter: `SELECT oi.order_item_id, oi.order_id, oi.product_id, oi.quantity
FROM order_items oi
LEFT JOIN orders o ON oi.order_id = o.order_id
WHERE o.order_id IS NULL;`,
    solution: `SELECT oi.order_item_id, oi.order_id, oi.product_id, oi.quantity
FROM order_items oi
LEFT JOIN orders o ON oi.order_id = o.order_id
WHERE o.order_id IS NULL;`,
    quiz: {
      question: 'Why detect orphaned records in QA?',
      options: [
        'For documentation',
        'To find referential integrity violations',
        'To improve performance',
        'It is unnecessary'
      ],
      correct: 1,
      explanation: 'Orphaned records violate referential integrity and can cause application errors.'
    },
    expectedRows: 0
  },
  // Chapter 4: Database Regression
  {
    id: 'c4-t1',
    chapter: 4,
    title: 'Daily Sales Report',
    prompt: 'Generate a daily sales summary showing order count and total revenue per day.',
    skills: ['aggregates', 'groupby'],
    difficulty: 2,
    qaContext: 'QA testers write queries to verify business metrics and validate reports.',
    starter: `SELECT DATE(order_date) AS sale_date, 
       COUNT(*) AS order_count,
       SUM(total_amount) AS total_revenue
FROM orders
GROUP BY DATE(order_date)
ORDER BY sale_date DESC;`,
    solution: `SELECT DATE(order_date) AS sale_date, 
       COUNT(*) AS order_count,
       SUM(total_amount) AS total_revenue
FROM orders
GROUP BY DATE(order_date)
ORDER BY sale_date DESC;`,
    quiz: {
      question: 'Why do QA testers need aggregation queries?',
      options: [
        'To create dashboards',
        'To validate business rules and metrics',
        'To improve database design',
        'To test queries only'
      ],
      correct: 1,
      explanation: 'Aggregation helps validate business logic, reports, and ensures calculations are correct.'
    },
    expectedRows: 4
  },
  {
    id: 'c4-t2',
    chapter: 4,
    title: 'Product Performance Analysis',
    prompt: 'Find top 3 best-selling products by total quantity sold.',
    skills: ['aggregates', 'groupby', 'order'],
    difficulty: 2,
    qaContext: 'QA validates product ranking and sales analytics.',
    starter: `SELECT p.name, p.sku, SUM(oi.quantity) AS total_sold, SUM(oi.subtotal) AS total_revenue
FROM products p
JOIN order_items oi ON p.product_id = oi.product_id
GROUP BY p.product_id, p.name, p.sku
ORDER BY total_sold DESC
LIMIT 3;`,
    solution: `SELECT p.name, p.sku, SUM(oi.quantity) AS total_sold, SUM(oi.subtotal) AS total_revenue
FROM products p
JOIN order_items oi ON p.product_id = oi.product_id
GROUP BY p.product_id, p.name, p.sku
ORDER BY total_sold DESC
LIMIT 3;`,
    quiz: {
      question: 'What is the purpose of LIMIT in analytics queries?',
      options: [
        'To filter data',
        'To improve performance on large datasets',
        'To restrict result set size for reports',
        'All of the above'
      ],
      correct: 3,
      explanation: 'LIMIT is used for pagination, performance, and creating top-N reports.'
    },
    expectedRows: 3
  },
  // Chapter 5: ETL Testing
  {
    id: 'c5-t1',
    chapter: 5,
    title: 'Duplicate Detection',
    prompt: 'Find duplicate email addresses in the customers table.',
    skills: ['aggregates', 'subqueries'],
    difficulty: 3,
    qaContext: 'ETL processes can introduce duplicates - QA must detect them.',
    starter: `SELECT email, COUNT(*) AS occurrence_count
FROM customers
GROUP BY email
HAVING COUNT(*) > 1;`,
    solution: `SELECT email, COUNT(*) AS occurrence_count
FROM customers
GROUP BY email
HAVING COUNT(*) > 1;`,
    quiz: {
      question: 'Why detect duplicates in ETL testing?',
      options: [
        'To improve performance',
        'To ensure data quality and prevent business rule violations',
        'To create better indexes',
        'It is not important'
      ],
      correct: 1,
      explanation: 'Duplicates can violate business rules (e.g., unique email) and cause application errors.'
    },
    expectedRows: 0
  },
  {
    id: 'c5-t2',
    chapter: 5,
    title: 'Data Transformation Validation',
    prompt: 'Validate that all active customers have a recent login within the last 30 days.',
    skills: ['subqueries', 'date functions'],
    difficulty: 3,
    qaContext: 'QA validates data transformations and business rules in ETL pipelines.',
    starter: `SELECT customer_id, email, status, last_login,
       CAST((julianday('now') - julianday(last_login)) AS INTEGER) AS days_since_login
FROM customers
WHERE status = 'active'
  AND last_login < datetime('now', '-30 days');`,
    solution: `SELECT customer_id, email, status, last_login,
       CAST((julianday('now') - julianday(last_login)) AS INTEGER) AS days_since_login
FROM customers
WHERE status = 'active'
  AND last_login < datetime('now', '-30 days');`,
    quiz: {
      question: 'Why validate ETL transformations?',
      options: [
        'To ensure data integrity after transformation',
        'To verify business rules are preserved',
        'To catch transformation errors early',
        'All of the above'
      ],
      correct: 3,
      explanation: 'ETL validation ensures data quality, integrity, and business rule compliance.'
    },
    expectedRows: 1
  },
  // Chapter 6: API-DB Validation
  {
    id: 'c6-t1',
    chapter: 6,
    title: 'Verify Payment-Order Mapping',
    prompt: 'Check that all successful payments have matching order records.',
    skills: ['joins', 'cross-check'],
    difficulty: 3,
    qaContext: 'QA must validate data consistency between API transactions and database records.',
    starter: `SELECT p.payment_id, p.order_id, p.amount, o.status AS order_status
FROM payments p
LEFT JOIN orders o ON p.order_id = o.order_id
WHERE p.status = 'success' AND o.order_id IS NULL;`,
    solution: `SELECT p.payment_id, p.order_id, p.amount, o.status AS order_status
FROM payments p
LEFT JOIN orders o ON p.order_id = o.order_id
WHERE p.status = 'success' AND o.order_id IS NULL;`,
    quiz: {
      question: 'Why cross-check API and database records?',
      options: [
        'To validate transaction integrity',
        'To ensure payment orders are properly linked',
        'To detect sync issues between systems',
        'All of the above'
      ],
      correct: 3,
      explanation: 'Cross-system validation ensures transaction integrity and data synchronization.'
    },
    expectedRows: 0
  },
  // Chapter 7: Defect Detection
  {
    id: 'c7-t1',
    chapter: 7,
    title: 'Identify Anomalies in Orders',
    prompt: 'Find orders with missing shipping addresses (required field).',
    skills: ['analysis', 'anomalies'],
    difficulty: 3,
    qaContext: 'QA testers must detect data anomalies that could cause defects.',
    starter: `SELECT order_id, customer_id, order_date, status, shipping_address
FROM orders
WHERE shipping_address IS NULL OR shipping_address = '';`,
    solution: `SELECT order_id, customer_id, order_date, status, shipping_address
FROM orders
WHERE shipping_address IS NULL OR shipping_address = '';`,
    quiz: {
      question: 'Why detect missing required fields in QA?',
      options: [
        'To improve database design',
        'To prevent defects that cause runtime errors',
        'To reduce query performance',
        'It is not important'
      ],
      correct: 1,
      explanation: 'Missing required data can cause application failures, errors, and poor user experience.'
    },
    expectedRows: 1
  },
  {
    id: 'c7-t2',
    chapter: 7,
    title: 'Detect Failed Test Cases',
    prompt: 'Generate a report of all failed test cases with their failure reasons and execution times.',
    skills: ['where', 'filter'],
    difficulty: 1,
    qaContext: 'QA testers use SQL to analyze test results and identify patterns in failures.',
    starter: `SELECT test_run_id, test_name, executed_at, failure_reason, execution_time_ms
FROM test_results
WHERE passed = 0
ORDER BY executed_at DESC;`,
    solution: `SELECT test_run_id, test_name, executed_at, failure_reason, execution_time_ms
FROM test_results
WHERE passed = 0
ORDER BY executed_at DESC;`,
    quiz: {
      question: 'Why analyze test failures with SQL?',
      options: [
        'To identify failure patterns and trends',
        'To track slow-running tests',
        'To improve test coverage',
        'All of the above'
      ],
      correct: 3,
      explanation: 'SQL analysis helps QA teams optimize testing, identify problems, and improve quality.'
    },
    expectedRows: 2
  },
  // Chapter 8: Performance Testing
  {
    id: 'c8-t1',
    chapter: 8,
    title: 'Slow Test Identification',
    prompt: 'Find tests taking longer than 5 seconds to execute.',
    skills: ['optimization', 'performance'],
    difficulty: 1,
    qaContext: 'QA testers monitor test execution times to identify performance issues.',
    starter: `SELECT test_run_id, test_name, execution_time_ms, executed_at
FROM test_results
WHERE execution_time_ms > 5000
ORDER BY execution_time_ms DESC;`,
    solution: `SELECT test_run_id, test_name, execution_time_ms, executed_at
FROM test_results
WHERE execution_time_ms > 5000
ORDER BY execution_time_ms DESC;`,
    quiz: {
      question: 'Why identify slow tests in QA?',
      options: [
        'To improve CI/CD pipeline speed',
        'To optimize test execution time',
        'To identify performance bottlenecks',
        'All of the above'
      ],
      correct: 3,
      explanation: 'Monitoring test performance helps optimize pipelines and identify issues quickly.'
    },
    expectedRows: 1
  }
];

export default function SqlPlaygroundQA({ onProgressUpdate, showTetris = false }) {
  const [SQL, setSQL] = useState(null);
  const dbRef = useRef(null);
  const [schemaApplied, setSchemaApplied] = useState(false);
  const [taskIndex, setTaskIndex] = useState(0);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  // Zoom controls per column
  const [leftScale, setLeftScale] = useState(1);
  const [centerScale, setCenterScale] = useState(1);
  const [rightScale, setRightScale] = useState(1);
  const clampScale = (v) => Math.min(1.5, Math.max(0.8, Number.isFinite(v) ? v : 1));
  
  // Learning model state
  const [showSolution, setShowSolution] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState(null);
  const [mastery, setMastery] = useState({});
  const [showSchema, setShowSchema] = useState(true);
  
  const currentTask = useMemo(() => QA_TASKS[taskIndex], [taskIndex]);
  const currentChapter = useMemo(() => CHAPTERS.find(c => c.id === currentTask?.chapter), [currentTask]);
  const editorFontSize = Math.round(14 * centerScale);

  // Initialize SQL.js
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

  // Apply schema when ready
  useEffect(() => {
    if (!SQL || !dbRef.current || schemaApplied) return;
    try {
      dbRef.current.run('BEGIN;');
      dbRef.current.run(QA_E_COMMERCE_SCHEMA);
      dbRef.current.run('COMMIT;');
      setSchemaApplied(true);
      if (QA_TASKS.length > 0) setQuery(QA_TASKS[0].starter);
    } catch (e) {
      setError(`Schema error: ${e.message}`);
    }
  }, [SQL, schemaApplied]);

  // Load task when changed
  useEffect(() => {
    if (currentTask && schemaApplied) {
      setQuery(currentTask.starter);
      setResults([]);
      setError('');
      setShowSolution(false);
      setHintLevel(0);
      setShowQuiz(false);
      setQuizAnswer(null);
    }
  }, [taskIndex, schemaApplied]);

  // Notify parent of progress changes (guarded to avoid render loops)
  const lastProgressRef = useRef({ completed: -1, total: -1 });
  useEffect(() => {
    if (!onProgressUpdate) return;
    const completed = completedTasks.length;
    const total = QA_TASKS.length;
    if (lastProgressRef.current.completed !== completed || lastProgressRef.current.total !== total) {
      const progress = (completed / total) * 100;
      lastProgressRef.current = { completed, total };
      onProgressUpdate(completed, total, progress);
    }
  }, [completedTasks.length]);

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
        if (count > 2000) break;
      }
      stmt.free();

      const result = { columns: cols, values: rows };
      setResults([result]);
      checkCompletion(result);
      
    } catch (e) {
      setError(e.message);
    }
  };

  const checkCompletion = (result) => {
    if (!currentTask) return;
    const isValid = result.values.length >= 0;
    
    if (isValid && !completedTasks.includes(currentTask.id)) {
      setCompletedTasks([...completedTasks, currentTask.id]);
      const newMastery = { ...mastery };
      currentTask.skills.forEach(skill => {
        newMastery[skill] = (newMastery[skill] || 0) + 10;
      });
      setMastery(newMastery);
      setTimeout(() => setShowQuiz(true), 500);
    }
  };

  const loadTask = (idx) => {
    if (idx < 0 || idx >= QA_TASKS.length) return;
    setTaskIndex(idx);
  };

  const getHint = () => {
    if (!currentTask) return '';
    const hints = [
      'Think about what you need to SELECT and WHERE to filter.',
      currentTask.prompt,
      `Expected columns: ${currentTask.expectedColumns?.join(', ') || 'various'}`,
      currentTask.starter
    ];
    return hints[Math.min(hintLevel, hints.length - 1)] || '';
  };

  const showNextHint = () => {
    if (hintLevel < 3) {
      setHintLevel(hintLevel + 1);
    } else {
      setShowSolution(true);
    }
  };

  const handleQuizAnswer = (answerIdx) => {
    setQuizAnswer(answerIdx);
  };

  const nextTask = () => {
    if (taskIndex < QA_TASKS.length - 1) {
      loadTask(taskIndex + 1);
      setShowQuiz(false);
      setQuizAnswer(null);
    }
  };

  return (
    <div className="w-full h-full relative">
      {/* Main Content */}
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Left Sidebar - Chapters & Tasks */}
        <ResizablePanel defaultSize={20} minSize={10} maxSize={35}>
          <div className="card h-full flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold">Chapters & Tasks</h3>
              <div className="flex items-center gap-2">
                {onProgressUpdate && (
                  <div className="text-white/70 text-xs">
                    {completedTasks.length}/{QA_TASKS.length} ({Math.round((completedTasks.length / QA_TASKS.length) * 100)}%)
                  </div>
                )}
                <div className="flex items-center gap-0.5">
                  <button className="text-white/70 hover:text-white text-[10px] w-4 h-4 flex items-center justify-center" onClick={() => setLeftScale(s => clampScale(s - 0.1))}>−</button>
                  <button className="text-white/70 hover:text-white text-[10px] w-4 h-4 flex items-center justify-center" onClick={() => setLeftScale(s => clampScale(s + 0.1))}>+</button>
                </div>
              </div>
            </div>
            <div className="space-y-2 overflow-y-auto flex-1" style={{ fontSize: `${8 * leftScale}px` }}>
              {CHAPTERS.map(chapter => {
                const chapterTasks = QA_TASKS.filter(t => t.chapter === chapter.id);
                return (
                  <div key={chapter.id} className="border-b border-white/10 pb-2 mb-2">
                    <div className="text-white/80 font-medium mb-1">
                      Ch {chapter.id}: {chapter.title}
                    </div>
                    {chapterTasks.map((task, idx) => (
                      <button
                        key={task.id}
                        onClick={() => loadTask(QA_TASKS.indexOf(task))}
                        className={`w-full text-left px-2 py-1 rounded transition-all mb-1 ${
                          QA_TASKS.indexOf(task) === taskIndex
                            ? 'bg-blue-500/30 border border-blue-400 text-white'
                            : completedTasks.includes(task.id)
                            ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                            : 'text-white/60 hover:bg-white/10'
                        }`}
                      >
                        {completedTasks.includes(task.id) ? '✓ ' : ''}{idx + 1}. {task.title}
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle />

        {/* Center - Task & Editor */}
        <ResizablePanel defaultSize={50} minSize={30} maxSize={70}>
          {currentTask && (
            <div className="card h-full">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1" style={{ fontSize: `${14 * centerScale}px` }}>
                  <h3 className="text-sm font-bold text-white mb-1">{currentTask.title}</h3>
                  <p className="text-white/80 text-xs mb-1">
                    Chapter {currentTask.chapter} • Difficulty: {'★'.repeat(currentTask.difficulty)}
                  </p>
                  <div className="bg-blue-500/20 border border-blue-400/50 rounded-lg p-1.5 mb-1">
                    <p className="text-blue-100 text-xs">📋 {currentTask.qaContext}</p>
                  </div>
                  <p className="text-white/90 text-xs">{currentTask.prompt}</p>
                </div>
                <div className="flex items-center gap-0.5 ml-2">
                  <button className="text-white/70 hover:text-white text-[10px] w-4 h-4 flex items-center justify-center" onClick={() => setCenterScale(s => clampScale(s - 0.1))}>−</button>
                  <button className="text-white/70 hover:text-white text-[10px] w-4 h-4 flex items-center justify-center" onClick={() => setCenterScale(s => clampScale(s + 0.1))}>+</button>
                </div>
              </div>

              <div className="mb-4" style={{ height: '250px' }}>
                <Editor
                  height="250px"
                  defaultLanguage="sql"
                  value={query}
                  onChange={(value) => setQuery(value || '')}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: editorFontSize,
                    lineNumbers: 'on',
                    roundedSelection: false,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    wordWrap: 'on'
                  }}
                />
              </div>

              {hintLevel > 0 && !showSolution && (
                <div className="card mb-4 bg-yellow-500/20 border-yellow-400/50">
                  <div className="text-yellow-100 text-xs">{getHint()}</div>
                </div>
              )}

              {showSolution && (
                <div className="card mb-4 bg-green-500/20 border-green-400/50">
                  <div className="text-green-100 text-xs font-mono whitespace-pre">{currentTask.solution}</div>
                </div>
              )}

              {error && (
                <div className="card mb-4 bg-red-500/20 border-red-400/50">
                  <div className="text-red-100 text-xs font-mono">{error}</div>
                </div>
              )}

              {results.length > 0 && results[0].values.length > 0 && (
                <div className="card overflow-auto mb-4 max-h-[300px]">
                  <table className="min-w-full text-left text-xs text-white/90">
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
                  <div className="text-xs text-white/60 mt-2">
                    {results[0].values.length} row{results[0].values.length !== 1 ? 's' : ''} returned
                  </div>
                </div>
              )}

              {results.length > 0 && results[0].values.length === 0 && !error && (
                <div className="card mb-4 bg-blue-500/20 border-blue-400/50">
                  <div className="text-blue-100 text-xs">✓ Query executed successfully. No rows returned.</div>
                </div>
              )}

              <div className="flex gap-2 mb-4">
                <button
                  className="btn-secondary"
                  onClick={() => loadTask(taskIndex - 1)}
                  disabled={taskIndex === 0}
                >
                  ← Previous
                </button>
                <button
                  className="btn-primary flex-1"
                  onClick={runQuery}
                  disabled={isBusy || !schemaApplied}
                >
                  Run Query
                </button>
                <button
                  className="btn-secondary"
                  onClick={showNextHint}
                  disabled={hintLevel >= 3 && showSolution}
                >
                  {hintLevel === 0 ? 'Hint' : hintLevel < 3 ? `Hint ${hintLevel + 1}` : 'Show Solution'}
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => loadTask(taskIndex + 1)}
                  disabled={taskIndex === QA_TASKS.length - 1}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </ResizablePanel>

        <ResizableHandle />

        {currentTask && (
          <ResizablePanel defaultSize={30} minSize={15} maxSize={40}>
            {!showQuiz && (
              <div className="card h-full">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-semibold">Database Schema</h3>
                  <div className="flex items-center gap-0.5">
                    <button className="text-white/70 hover:text-white text-[10px] w-4 h-4 flex items-center justify-center" onClick={() => setRightScale(s => clampScale(s - 0.1))}>−</button>
                    <button className="text-white/70 hover:text-white text-[10px] w-4 h-4 flex items-center justify-center" onClick={() => setRightScale(s => clampScale(s + 0.1))}>+</button>
                    <button
                      onClick={() => setShowSchema(!showSchema)}
                      className="btn-secondary text-xs px-2 py-1"
                    >
                      {showSchema ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
                {showSchema && (
                  <div className="text-white/70 text-xs font-mono space-y-1" style={{ fontSize: `${12 * rightScale}px` }}>
                    <div className="text-white font-semibold mb-2">E-commerce Schema:</div>
                    <div><span className="text-blue-400">customers</span> (customer_id, email, first_name, last_name, status, test_user)</div>
                    <div><span className="text-blue-400">products</span> (product_id, sku, name, price, category, stock_quantity, active)</div>
                    <div><span className="text-blue-400">orders</span> (order_id, customer_id, order_date, status, total_amount, shipping_address)</div>
                    <div><span className="text-blue-400">order_items</span> (order_item_id, order_id, product_id, quantity, unit_price, subtotal)</div>
                    <div><span className="text-blue-400">payments</span> (payment_id, order_id, payment_method, amount, status, transaction_date)</div>
                    <div><span className="text-blue-400">test_results</span> (test_run_id, test_name, executed_at, passed, failure_reason, execution_time_ms)</div>
                  </div>
                )}
              </div>
            )}
            {showQuiz && currentTask.quiz && (
              <div className="card h-full">
                <h3 className="text-white font-semibold mb-3">Quick Quiz</h3>
                <p className="text-white/90 text-xs mb-3">{currentTask.quiz.question}</p>
                <div className="space-y-2 mb-3">
                  {currentTask.quiz.options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuizAnswer(idx)}
                      disabled={quizAnswer !== null}
                      className={`w-full text-left px-3 py-2 rounded text-xs transition-all ${
                        quizAnswer === idx
                          ? idx === currentTask.quiz.correct
                            ? 'bg-green-500/30 border border-green-400 text-green-100'
                            : 'bg-red-500/30 border border-red-400 text-red-100'
                          : quizAnswer !== null && idx === currentTask.quiz.correct
                          ? 'bg-green-500/20 border border-green-400/50 text-green-100'
                          : 'bg-white/10 hover:bg-white/20 text-white/80 border border-white/20'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                {quizAnswer !== null && (
                  <div className="mb-3">
                    <div className={`text-xs ${
                      quizAnswer === currentTask.quiz.correct ? 'text-green-300' : 'text-red-300'
                    }`}>
                      {quizAnswer === currentTask.quiz.correct ? '✓ Correct!' : '✗ Incorrect'}
                    </div>
                    <div className="text-white/70 text-xs mt-2">{currentTask.quiz.explanation}</div>
                  </div>
                )}
                {quizAnswer !== null && (
                  <button className="btn-primary w-full" onClick={nextTask}>
                    Continue
                  </button>
                )}
              </div>
            )}
          </ResizablePanel>
        )}
      </ResizablePanelGroup>
      
      {/* Back to Tutorial Button */}
      <button 
        className="btn-secondary absolute top-[-80px] right-0 z-0" 
        onClick={() => {
          if (window.onNavigateBackToTutorial) {
            window.onNavigateBackToTutorial();
          }
        }}
      >
        Back to Tutorial
      </button>

      {/* Floating Tetris Game */}
      {showTetris && (
        <div className="absolute bottom-4 right-4 z-50">
          <TetrisGame size="sm" speed="normal" />
        </div>
      )}
    </div>
  );
}


