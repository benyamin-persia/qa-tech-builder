import React, { useEffect, useMemo, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';

/**
 * SQL for QA Testers - Learning Platform
 * Based on "Learning SQL" by Alan Beaulieu, tailored for QA testing scenarios
 * 
 * QA Testing Focus:
 * - Test data validation & verification
 * - ETL/Data pipeline testing
 * - Database regression testing
 * - API ↔ Database cross-validation
 * - Defect detection through data analysis
 * - Performance & data quality checks
 * 
 * Learning Model Features:
 * 1. Retrieval practice: quiz questions after each task
 * 2. Spaced repetition: resurface past skills automatically
 * 3. Interleaving: mix problem types
 * 4. Worked examples → faded examples: progressive scaffolding
 * 5. Dual coding: schema diagrams + text
 * 6. Deliberate practice: targeted drills
 * 7. Immediate feedback: diff hints and explanations
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

// QA Testing Dataset - E-commerce System with Test Data
const QA_TEST_SCHEMA = `
-- E-commerce Test Database for QA Testing
CREATE TABLE branch (
  branch_id INTEGER PRIMARY KEY,
  name VARCHAR(20) NOT NULL,
  address VARCHAR(30),
  city VARCHAR(20),
  state VARCHAR(2),
  zip VARCHAR(12)
);

CREATE TABLE employee (
  emp_id INTEGER PRIMARY KEY,
  fname VARCHAR(20) NOT NULL,
  lname VARCHAR(20) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  superior_emp_id INTEGER,
  dept_id INTEGER,
  title VARCHAR(20),
  assigned_branch_id INTEGER,
  FOREIGN KEY(superior_emp_id) REFERENCES employee(emp_id),
  FOREIGN KEY(assigned_branch_id) REFERENCES branch(branch_id)
);

CREATE TABLE department (
  dept_id INTEGER PRIMARY KEY,
  name VARCHAR(20) NOT NULL
);

CREATE TABLE customer (
  cust_id INTEGER PRIMARY KEY,
  fed_id VARCHAR(12) NOT NULL,
  cust_type_cd VARCHAR(10) NOT NULL,
  address VARCHAR(30),
  city VARCHAR(20),
  state VARCHAR(2),
  postal_code VARCHAR(10)
);

CREATE TABLE individual (
  cust_id INTEGER PRIMARY KEY,
  fname VARCHAR(30) NOT NULL,
  lname VARCHAR(30) NOT NULL,
  birth_date DATE,
  FOREIGN KEY(cust_id) REFERENCES customer(cust_id)
);

CREATE TABLE business (
  cust_id INTEGER PRIMARY KEY,
  name VARCHAR(40) NOT NULL,
  state_id VARCHAR(10) NOT NULL,
  incorp_date DATE,
  FOREIGN KEY(cust_id) REFERENCES customer(cust_id)
);

CREATE TABLE product_type (
  product_type_cd VARCHAR(10) PRIMARY KEY,
  name VARCHAR(50) NOT NULL
);

CREATE TABLE product (
  product_cd VARCHAR(10) PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  product_type_cd VARCHAR(10) NOT NULL,
  date_offered DATE,
  date_retired DATE,
  FOREIGN KEY(product_type_cd) REFERENCES product_type(product_type_cd)
);

CREATE TABLE account (
  account_id INTEGER PRIMARY KEY,
  product_cd VARCHAR(10) NOT NULL,
  cust_id INTEGER NOT NULL,
  open_date DATE NOT NULL,
  close_date DATE,
  last_activity_date DATE,
  status VARCHAR(10) NOT NULL,
  open_branch_id INTEGER,
  open_emp_id INTEGER,
  avail_balance DECIMAL(10,2),
  pending_balance DECIMAL(10,2),
  FOREIGN KEY(product_cd) REFERENCES product(product_cd),
  FOREIGN KEY(cust_id) REFERENCES customer(cust_id),
  FOREIGN KEY(open_branch_id) REFERENCES branch(branch_id),
  FOREIGN KEY(open_emp_id) REFERENCES employee(emp_id)
);

CREATE TABLE transaction (
  txn_id INTEGER PRIMARY KEY,
  txn_date DATETIME NOT NULL,
  account_id INTEGER NOT NULL,
  txn_type_cd VARCHAR(10),
  amount DECIMAL(10,2) NOT NULL,
  teller_emp_id INTEGER,
  execution_branch_id INTEGER,
  funds_avail_date DATETIME,
  FOREIGN KEY(account_id) REFERENCES account(account_id),
  FOREIGN KEY(teller_emp_id) REFERENCES employee(emp_id),
  FOREIGN KEY(execution_branch_id) REFERENCES branch(branch_id)
);

-- Seed Data
INSERT INTO branch VALUES
  (1, 'Headquarters', '3882 Main St.', 'Waltham', 'MA', '02451'),
  (2, 'Woburn Branch', '422 Maple St.', 'Woburn', 'MA', '01801'),
  (3, 'Quincy Branch', '125 Presidential Way', 'Quincy', 'MA', '02169'),
  (4, 'So. NH Branch', '378 Maynard Ln.', 'Salem', 'NH', '03079');

INSERT INTO department VALUES
  (1, 'Operations'),
  (2, 'Loans'),
  (3, 'Administration');

INSERT INTO employee VALUES
  (1, 'Michael', 'Smith', '2001-06-22', NULL, NULL, 3, 'President', 1),
  (2, 'Susan', 'Barker', '2002-09-12', NULL, 1, 1, 'Vice President', 1),
  (3, 'Robert', 'Tyler', '2000-02-09', NULL, 1, 2, 'Treasurer', 1),
  (4, 'Susan', 'Hawthorne', '2002-04-24', NULL, 2, 1, 'Operations Manager', 2),
  (5, 'John', 'Gooding', '2003-11-14', NULL, 2, 3, 'Loan Manager', 1),
  (6, 'Helen', 'Fleming', '2004-03-17', NULL, 2, 1, 'Head Teller', 4),
  (7, 'Chris', 'Tucker', '2004-09-15', NULL, 2, 1, 'Teller', 1),
  (8, 'Sarah', 'Parker', '2002-12-02', NULL, 2, 1, 'Teller', 2),
  (9, 'Jane', 'Grossman', '2002-05-03', NULL, 2, 1, 'Teller', 2);

INSERT INTO customer VALUES
  (1, '111-11-1111', 'I', '47 Mockingbird Ln', 'Lynnfield', 'MA', '01940'),
  (2, '222-22-2222', 'I', '372 Clearwater Blvd', 'Woburn', 'MA', '01801'),
  (3, '333-33-3333', 'I', '18 Jessup Rd', 'Quincy', 'MA', '02169'),
  (4, '444-44-4444', 'B', '12 Business St', 'Boston', 'MA', '02115'),
  (5, '555-55-5555', 'B', '23 Main St', 'Salem', 'NH', '03079');

INSERT INTO individual VALUES
  (1, 'James', 'Hadley', '1972-04-22'),
  (2, 'Susan', 'Tingley', '1968-08-15'),
  (3, 'Frank', 'Tucker', '1958-02-06');

INSERT INTO business VALUES
  (4, 'Chilton Engineering', '12-345-678', '1995-05-01'),
  (5, 'Northeast Cooling Inc.', '23-456-789', '2001-01-01');

INSERT INTO product_type VALUES
  ('ACCOUNT', 'Customer Accounts'),
  ('LOAN', 'Individual and Business Loans'),
  ('INSURANCE', 'Insurance Offerings');

INSERT INTO product VALUES
  ('CHK', 'checking account', 'ACCOUNT', '2000-01-15', NULL),
  ('SAV', 'savings account', 'ACCOUNT', '2000-01-15', NULL),
  ('CD', 'certificate of deposit', 'ACCOUNT', '2000-01-15', NULL),
  ('MM', 'money market account', 'ACCOUNT', '2000-01-15', NULL),
  ('AUT', 'auto loan', 'LOAN', '2000-01-15', NULL),
  ('BUS', 'business line of credit', 'LOAN', '2000-01-15', NULL),
  ('BLN', 'personal line of credit', 'LOAN', '2000-01-15', NULL);

INSERT INTO account VALUES
  (1, 'CHK', 1, '2000-01-15', NULL, '2005-01-04', 'ACTIVE', 2, 10, 1057.75, 1057.75),
  (2, 'SAV', 1, '2000-01-15', NULL, '2004-12-19', 'ACTIVE', 2, 10, 500.00, 500.00),
  (3, 'CD', 1, '2004-06-30', '2004-06-30', '2004-06-30', 'CLOSED', 2, 10, 3000.00, 3000.00),
  (11, 'CHK', 2, '2001-03-12', NULL, '2004-12-27', 'ACTIVE', 2, 13, 2258.02, 2258.02),
  (12, 'MM', 2, '2001-03-12', NULL, '2004-12-11', 'ACTIVE', 2, 13, 5587.50, 5587.50),
  (21, 'CHK', 3, '2002-11-23', NULL, '2004-11-30', 'ACTIVE', 3, 11, 1057.75, 1057.75),
  (22, 'SAV', 3, '2002-11-23', NULL, '2004-12-05', 'ACTIVE', 3, 11, 525.75, 525.75),
  (31, 'CHK', 4, '2003-09-12', NULL, '2005-01-03', 'ACTIVE', 4, 14, 125.67, 125.67),
  (32, 'BUS', 4, '2004-03-22', NULL, '2004-11-14', 'ACTIVE', 4, 14, 10000.00, 10000.00);

INSERT INTO transaction VALUES
  (1, '2005-01-05 09:00:00', 1, 'DBT', 100.00, NULL, NULL, '2005-01-05 09:00:00'),
  (2, '2005-01-05 09:00:00', 21, 'DBT', 100.00, NULL, NULL, '2005-01-05 09:00:00'),
  (3, '2005-01-05 10:00:00', 1, 'CDT', 50.00, NULL, NULL, '2005-01-05 10:00:00'),
  (4, '2005-01-06 10:00:00', 11, 'CDT', 50.00, NULL, NULL, '2005-01-06 10:00:00'),
  (5, '2005-01-06 11:00:00', 1, 'DBT', 25.50, NULL, NULL, '2005-01-06 11:00:00'),
  (6, '2005-01-07 09:00:00', 21, 'CDT', 100.00, NULL, NULL, '2005-01-07 09:00:00');
`;

// Task definitions following the book progression
const TASKS = [
  // Chapter 3: Query Primer
  {
    id: 'c3-t1',
    chapter: 3,
    title: 'Basic SELECT',
    prompt: 'Show all employee first and last names from the employee table.',
    skills: ['select'],
    difficulty: 1,
    starter: `SELECT fname, lname
FROM employee;`,
    solution: `SELECT fname, lname
FROM employee;`,
    quiz: {
      question: 'What does SELECT do in SQL?',
      options: [
        'Deletes rows from a table',
        'Retrieves data from a table',
        'Updates table structure',
        'Creates new tables'
      ],
      correct: 1,
      explanation: 'SELECT retrieves data from tables without modifying them.'
    },
    expectedRows: 9
  },
  {
    id: 'c3-t2',
    chapter: 3,
    title: 'Column Aliases',
    prompt: 'Display employee first names as "First" and last names as "Last".',
    skills: ['select', 'alias'],
    difficulty: 1,
    starter: `SELECT fname AS "First", lname AS "Last"
FROM employee;`,
    solution: `SELECT fname AS "First", lname AS "Last"
FROM employee;`,
    quiz: {
      question: 'Why use column aliases?',
      options: [
        'To hide column names',
        'To create readable output labels',
        'To improve performance',
        'To encrypt data'
      ],
      correct: 1,
      explanation: 'Aliases make output more readable and professional.'
    },
    expectedRows: 9
  },
  {
    id: 'c3-t3',
    chapter: 3,
    title: 'WHERE Clause',
    prompt: 'Find all active checking accounts with balance greater than 1000.',
    skills: ['select', 'where'],
    difficulty: 1,
    starter: `SELECT account_id, avail_balance
FROM account
WHERE status = 'ACTIVE' 
  AND product_cd = 'CHK'
  AND avail_balance > 1000;`,
    solution: `SELECT account_id, avail_balance
FROM account
WHERE status = 'ACTIVE' 
  AND product_cd = 'CHK'
  AND avail_balance > 1000;`,
    quiz: {
      question: 'What operators can be used in WHERE?',
      options: [
        'Only = and !=',
        '=, !=, >, <, >=, <=, LIKE, IN, BETWEEN',
        'Only LIKE',
        'Only BETWEEN'
      ],
      correct: 1,
      explanation: 'WHERE supports many operators for flexible filtering.'
    },
    expectedRows: 2
  },
  {
    id: 'c3-t4',
    chapter: 3,
    title: 'ORDER BY',
    prompt: 'List all customers by city, then by last name within each city.',
    skills: ['select', 'order'],
    difficulty: 1,
    starter: `SELECT city, fname, lname
FROM individual
ORDER BY city, lname;`,
    solution: `SELECT city, fname, lname
FROM individual
ORDER BY city, lname;`,
    quiz: {
      question: 'What is the default sort order in ORDER BY?',
      options: ['DESC', 'ASC', 'Random', 'None'],
      correct: 1,
      explanation: 'ASC (ascending) is the default unless DESC is specified.'
    },
    expectedRows: 3
  },
  // Chapter 4: Multiple Tables
  {
    id: 'c4-t1',
    chapter: 4,
    title: 'INNER JOIN',
    prompt: 'Show all accounts with customer first and last names.',
    skills: ['joins', 'inner'],
    difficulty: 2,
    starter: `SELECT a.account_id, i.fname, i.lname
FROM account a
INNER JOIN individual i ON a.cust_id = i.cust_id;`,
    solution: `SELECT a.account_id, i.fname, i.lname
FROM account a
INNER JOIN individual i ON a.cust_id = i.cust_id;`,
    quiz: {
      question: 'What does INNER JOIN return?',
      options: [
        'All rows from both tables',
        'Only rows with matching keys',
        'Only rows from the left table',
        'Only rows from the right table'
      ],
      correct: 1,
      explanation: 'INNER JOIN returns only rows where the join condition matches.'
    },
    expectedRows: 6
  },
  {
    id: 'c4-t2',
    chapter: 4,
    title: 'LEFT JOIN',
    prompt: 'Show all branches and their assigned employees (including branches with no employees).',
    skills: ['joins', 'left'],
    difficulty: 2,
    starter: `SELECT b.name AS branch_name, e.fname, e.lname
FROM branch b
LEFT JOIN employee e ON b.branch_id = e.assigned_branch_id
ORDER BY b.name, e.lname;`,
    solution: `SELECT b.name AS branch_name, e.fname, e.lname
FROM branch b
LEFT JOIN employee e ON b.branch_id = e.assigned_branch_id
ORDER BY b.name, e.lname;`,
    quiz: {
      question: 'When should you use LEFT JOIN?',
      options: [
        'To get only matching rows',
        'To get all rows from the left table plus matches from the right',
        'To improve performance',
        'To filter data'
      ],
      correct: 1,
      explanation: 'LEFT JOIN preserves all rows from the left table, even without matches.'
    },
    expectedRows: 13
  },
  // Chapter 5: Advanced Joins
  {
    id: 'c5-t1',
    chapter: 5,
    title: 'Self Join',
    prompt: 'Show each employee with their manager\'s name.',
    skills: ['joins', 'self'],
    difficulty: 2,
    starter: `SELECT e.fname, e.lname, m.fname AS mgr_fname, m.lname AS mgr_lname
FROM employee e
LEFT JOIN employee m ON e.superior_emp_id = m.emp_id;`,
    solution: `SELECT e.fname, e.lname, m.fname AS mgr_fname, m.lname AS mgr_lname
FROM employee e
LEFT JOIN employee m ON e.superior_emp_id = m.emp_id;`,
    quiz: {
      question: 'What is a self join?',
      options: [
        'Joining a table to another identical table',
        'Joining a table to itself',
        'Joining tables randomly',
        'A type of UNION'
      ],
      correct: 1,
      explanation: 'Self joins connect rows within the same table using aliases.'
    },
    expectedRows: 9
  },
  {
    id: 'c5-t2',
    chapter: 5,
    title: 'Multiple Joins',
    prompt: 'Show account details with product name and customer name.',
    skills: ['joins', 'multiple'],
    difficulty: 2,
    starter: `SELECT a.account_id, p.name AS product_name, i.fname, i.lname
FROM account a
JOIN product p ON a.product_cd = p.product_cd
JOIN individual i ON a.cust_id = i.cust_id;`,
    solution: `SELECT a.account_id, p.name AS product_name, i.fname, i.lname
FROM account a
JOIN product p ON a.product_cd = p.product_cd
JOIN individual i ON a.cust_id = i.cust_id;`,
    quiz: {
      question: 'How many tables can you join in a query?',
      options: ['Only 2', 'Up to 10', 'No limit', 'Only 5'],
      correct: 2,
      explanation: 'SQL allows joining many tables, though performance degrades with complexity.'
    },
    expectedRows: 6
  },
  // Chapter 6: Aggregations
  {
    id: 'c6-t1',
    chapter: 6,
    title: 'COUNT and GROUP BY',
    prompt: 'Count accounts per customer.',
    skills: ['groupby', 'aggregates'],
    difficulty: 2,
    starter: `SELECT cust_id, COUNT(*) AS account_count
FROM account
GROUP BY cust_id;`,
    solution: `SELECT cust_id, COUNT(*) AS account_count
FROM account
GROUP BY cust_id;`,
    quiz: {
      question: 'What is GROUP BY used for?',
      options: [
        'To sort results',
        'To group rows with identical values for aggregation',
        'To filter rows',
        'To join tables'
      ],
      correct: 1,
      explanation: 'GROUP BY combines rows with identical values for aggregate functions.'
    },
    expectedRows: 4
  },
  {
    id: 'c6-t2',
    chapter: 6,
    title: 'SUM and AVG',
    prompt: 'Calculate total balance and average balance per customer.',
    skills: ['groupby', 'aggregates'],
    difficulty: 2,
    starter: `SELECT cust_id, 
       SUM(avail_balance) AS total_balance,
       AVG(avail_balance) AS avg_balance
FROM account
GROUP BY cust_id;`,
    solution: `SELECT cust_id, 
       SUM(avail_balance) AS total_balance,
       AVG(avail_balance) AS avg_balance
FROM account
GROUP BY cust_id;`,
    quiz: {
      question: 'What aggregate functions are available?',
      options: [
        'Only COUNT',
        'COUNT, SUM, AVG, MIN, MAX, and more',
        'Only SUM and AVG',
        'Only MIN and MAX'
      ],
      correct: 1,
      explanation: 'SQL provides many aggregate functions for summary statistics.'
    },
    expectedRows: 4
  },
  {
    id: 'c6-t3',
    chapter: 6,
    title: 'HAVING Clause',
    prompt: 'Find customers with more than 1 account.',
    skills: ['groupby', 'having'],
    difficulty: 2,
    starter: `SELECT cust_id, COUNT(*) AS account_count
FROM account
GROUP BY cust_id
HAVING COUNT(*) > 1;`,
    solution: `SELECT cust_id, COUNT(*) AS account_count
FROM account
GROUP BY cust_id
HAVING COUNT(*) > 1;`,
    quiz: {
      question: 'What is the difference between WHERE and HAVING?',
      options: [
        'No difference',
        'WHERE filters rows, HAVING filters groups',
        'WHERE is slower',
        'HAVING is optional'
      ],
      correct: 1,
      explanation: 'HAVING filters after grouping, WHERE filters before grouping.'
    },
    expectedRows: 2
  },
  // Chapter 8: Subqueries
  {
    id: 'c8-t1',
    chapter: 8,
    title: 'Subquery in WHERE',
    prompt: 'Find customers who have a checking account.',
    skills: ['subqueries'],
    difficulty: 3,
    starter: `SELECT fname, lname
FROM individual
WHERE cust_id IN (
  SELECT DISTINCT cust_id
  FROM account
  WHERE product_cd = 'CHK'
);`,
    solution: `SELECT fname, lname
FROM individual
WHERE cust_id IN (
  SELECT DISTINCT cust_id
  FROM account
  WHERE product_cd = 'CHK'
);`,
    quiz: {
      question: 'What is a subquery?',
      options: [
        'A table join',
        'A query nested inside another query',
        'A database backup',
        'A table name'
      ],
      correct: 1,
      explanation: 'Subqueries are queries used within other queries to filter or calculate.'
    },
    expectedRows: 3
  },
  {
    id: 'c8-t2',
    chapter: 8,
    title: 'Correlated Subquery',
    prompt: 'For each customer, find their highest balance account.',
    skills: ['subqueries', 'correlated'],
    difficulty: 3,
    starter: `SELECT a1.cust_id, a1.account_id, a1.avail_balance
FROM account a1
WHERE a1.avail_balance = (
  SELECT MAX(a2.avail_balance)
  FROM account a2
  WHERE a2.cust_id = a1.cust_id
);`,
    solution: `SELECT a1.cust_id, a1.account_id, a1.avail_balance
FROM account a1
WHERE a1.avail_balance = (
  SELECT MAX(a2.avail_balance)
  FROM account a2
  WHERE a2.cust_id = a1.cust_id
);`,
    quiz: {
      question: 'What makes a subquery correlated?',
      options: [
        'It uses aggregate functions',
        'It references columns from the outer query',
        'It joins tables',
        'It has a GROUP BY'
      ],
      correct: 1,
      explanation: 'Correlated subqueries depend on the outer query for their results.'
    },
    expectedRows: 4
  },
  // Chapter 10: Compound Queries
  {
    id: 'c10-t1',
    chapter: 10,
    title: 'UNION',
    prompt: 'List all individual and business customers.',
    skills: ['union'],
    difficulty: 3,
    starter: `SELECT 'Individual' AS cust_type, fname AS name
FROM individual
UNION
SELECT 'Business' AS cust_type, name
FROM business;`,
    solution: `SELECT 'Individual' AS cust_type, fname AS name
FROM individual
UNION
SELECT 'Business' AS cust_type, name
FROM business;`,
    quiz: {
      question: 'What does UNION do?',
      options: [
        'Joins tables horizontally',
        'Combines query results vertically',
        'Sorts results',
        'Filters duplicates'
      ],
      correct: 1,
      explanation: 'UNION stacks results from multiple queries into one result set.'
    },
    expectedRows: 5
  }
];

export default function SqlPlaygroundEnhanced() {
  const [SQL, setSQL] = useState(null);
  const dbRef = useRef(null);
  const [schemaApplied, setSchemaApplied] = useState(false);
  const [taskIndex, setTaskIndex] = useState(0);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  
  // Learning model state
  const [showSolution, setShowSolution] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState(null);
  const [mastery, setMastery] = useState({}); // Track skill mastery scores
  
  // Schema diagram visibility
  const [showSchema, setShowSchema] = useState(false);
  
  const currentTask = useMemo(() => TASKS[taskIndex], [taskIndex]);
  const currentChapter = useMemo(() => CHAPTERS.find(c => c.id === currentTask?.chapter), [currentTask]);

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
      dbRef.current.run(BANKING_SCHEMA);
      dbRef.current.run('COMMIT;');
      setSchemaApplied(true);
      // Load first task starter query
      if (TASKS.length > 0) setQuery(TASKS[0].starter);
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
      
      // Check if task is completed
      checkCompletion(result);
      
    } catch (e) {
      setError(e.message);
    }
  };

  const checkCompletion = (result) => {
    if (!currentTask) return;
    
    // Simple validation: check if we got rows
    const isValid = result.values.length > 0;
    
    if (isValid) {
      // Mark task as completed
      if (!completedTasks.includes(currentTask.id)) {
        setCompletedTasks([...completedTasks, currentTask.id]);
        
        // Update mastery scores for skills
        const newMastery = { ...mastery };
        currentTask.skills.forEach(skill => {
          newMastery[skill] = (newMastery[skill] || 0) + 10;
        });
        setMastery(newMastery);
        
        // Show quiz after completing task
        setTimeout(() => setShowQuiz(true), 500);
      }
    }
  };

  const loadTask = (idx) => {
    if (idx < 0 || idx >= TASKS.length) return;
    setTaskIndex(idx);
  };

  const getHint = () => {
    if (!currentTask) return '';
    const hints = [
      'Try starting with SELECT and FROM clauses.',
      currentTask.prompt,
      `Expected output columns: ${currentTask.expectedColumns?.join(', ') || 'various'}`,
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
    if (taskIndex < TASKS.length - 1) {
      loadTask(taskIndex + 1);
      setShowQuiz(false);
      setQuizAnswer(null);
    }
  };

  const progress = completedTasks.length / TASKS.length * 100;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header with Progress */}
      <div className="card slide-up mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-white">SQL Learning Path</h2>
          <div className="text-white/70 text-sm">
            {completedTasks.length} / {TASKS.length} completed
          </div>
        </div>
        <div className="w-full bg-white/20 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left Sidebar - Chapters & Tasks */}
        <div className="lg:col-span-1">
          <div className="card">
            <h3 className="text-white font-semibold mb-3">Chapters & Tasks</h3>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {CHAPTERS.map(chapter => {
                const chapterTasks = TASKS.filter(t => t.chapter === chapter.id);
                return (
                  <div key={chapter.id} className="border-b border-white/10 pb-2 mb-2">
                    <div className="text-white/80 text-sm font-medium mb-1">
                      Ch {chapter.id}: {chapter.title}
                    </div>
                    {chapterTasks.map((task, idx) => (
                      <button
                        key={task.id}
                        onClick={() => loadTask(TASKS.indexOf(task))}
                        className={`w-full text-left px-2 py-1 rounded text-sm transition-all mb-1 ${
                          TASKS.indexOf(task) === taskIndex
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
          
          {/* Skill Mastery */}
          {Object.keys(mastery).length > 0 && (
            <div className="card mt-4">
              <h3 className="text-white font-semibold mb-2">Mastery Progress</h3>
              {Object.entries(mastery).map(([skill, score]) => (
                <div key={skill} className="mb-2">
                  <div className="flex justify-between text-xs text-white/70 mb-1">
                    <span>{skill}</span>
                    <span>{Math.min(score, 100)}%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-1.5">
                    <div 
                      className="bg-blue-500 h-1.5 rounded-full transition-all"
                      style={{ width: `${Math.min(score, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Center - Task & Editor */}
        <div className="lg:col-span-2">
          {currentTask && (
            <div className="card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{currentTask.title}</h3>
                  <p className="text-white/80 text-sm mb-2">
                    Chapter {currentTask.chapter} • Difficulty: {'★'.repeat(currentTask.difficulty)}
                  </p>
                  <p className="text-white/90">{currentTask.prompt}</p>
                </div>
                <button
                  onClick={() => setShowSchema(!showSchema)}
                  className="btn-secondary text-xs px-3 py-1"
                >
                  {showSchema ? 'Hide' : 'Show'} Schema
                </button>
              </div>

              {/* Schema Diagram */}
              {showSchema && (
                <div className="mb-4 p-3 bg-black/30 rounded-lg border border-white/20">
                  <div className="text-white/70 text-xs font-mono space-y-1">
                    <div className="text-white font-semibold mb-2">Database Schema:</div>
                    <div><span className="text-blue-400">customer</span> (cust_id, fed_id, cust_type_cd, address, city, state, postal_code)</div>
                    <div><span className="text-blue-400">individual</span> (cust_id, fname, lname, birth_date) → customer</div>
                    <div><span className="text-blue-400">business</span> (cust_id, name, state_id, incorp_date) → customer</div>
                    <div><span className="text-blue-400">account</span> (account_id, product_cd, cust_id, open_date, status, avail_balance...) → customer, product, branch, employee</div>
                    <div><span className="text-blue-400">product</span> (product_cd, name, product_type_cd) → product_type</div>
                    <div><span className="text-blue-400">employee</span> (emp_id, fname, lname, dept_id, superior_emp_id, assigned_branch_id) → department, branch</div>
                    <div><span className="text-blue-400">transaction</span> (txn_id, account_id, amount, txn_date) → account, employee, branch</div>
                  </div>
                </div>
              )}

              {/* Monaco Editor */}
              <div className="mb-4" style={{ height: '250px' }}>
                <Editor
                  height="250px"
                  defaultLanguage="sql"
                  value={query}
                  onChange={(value) => setQuery(value || '')}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    roundedSelection: false,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    wordWrap: 'on'
                  }}
                />
              </div>

              {/* Controls */}
              <div className="flex gap-2 mb-4">
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
              </div>

              {/* Current Hint */}
              {hintLevel > 0 && !showSolution && (
                <div className="card mb-4 bg-yellow-500/20 border-yellow-400/50">
                  <div className="text-yellow-100 text-sm">{getHint()}</div>
                </div>
              )}

              {/* Solution */}
              {showSolution && (
                <div className="card mb-4 bg-green-500/20 border-green-400/50">
                  <div className="text-green-100 text-sm font-mono whitespace-pre">{currentTask.solution}</div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="card mb-4 bg-red-500/20 border-red-400/50">
                  <div className="text-red-100 text-sm font-mono">{error}</div>
                </div>
              )}

              {/* Results */}
              {results.length > 0 && results[0].values.length > 0 && (
                <div className="card overflow-auto mb-4 max-h-[300px]">
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
                  <div className="text-xs text-white/60 mt-2">
                    {results[0].values.length} row{results[0].values.length !== 1 ? 's' : ''} returned
                  </div>
                </div>
              )}

              {results.length > 0 && results[0].values.length === 0 && !error && (
                <div className="card mb-4 bg-blue-500/20 border-blue-400/50">
                  <div className="text-blue-100 text-sm">✓ Query executed successfully. No rows returned.</div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between">
                <button
                  className="btn-secondary"
                  onClick={() => loadTask(taskIndex - 1)}
                  disabled={taskIndex === 0}
                >
                  ← Previous
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => loadTask(taskIndex + 1)}
                  disabled={taskIndex === TASKS.length - 1}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Quiz */}
        {currentTask && (
          <div className="lg:col-span-1">
            {showQuiz && currentTask.quiz && (
              <div className="card sticky top-4">
                <h3 className="text-white font-semibold mb-3">Quick Quiz</h3>
                <p className="text-white/90 text-sm mb-3">{currentTask.quiz.question}</p>
                <div className="space-y-2 mb-3">
                  {currentTask.quiz.options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuizAnswer(idx)}
                      disabled={quizAnswer !== null}
                      className={`w-full text-left px-3 py-2 rounded text-sm transition-all ${
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
                    <div className={`text-sm ${
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
          </div>
        )}
      </div>
    </div>
  );
}

