// backend_service/index.js
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// PostgreSQL connection
// const pool = new Pool({
//   user: 'shamoonshahid',
//   host: 'localhost',
//   database: 'hamradio',
//   password: 'cow.7???',
//   port: 5432,
// });

const pool = new Pool({
  user: 'postgres.jgarsrwneoyqqgolhtgm',
  host: 'aws-0-ap-southeast-1.pooler.supabase.com',
  database: 'postgres',
  password: 'cow.7???', // Replace with your real password
  port: 6543,
  ssl: {
    rejectUnauthorized: false
  }
});


// GET /users/:id
app.get('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM user_profiles WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ Error in /users/:id:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /logbooks/:userId
app.get('/logbooks/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query('SELECT * FROM logbooks WHERE user_id = $1', [userId]);
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error in /logbooks/:userId:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /contacts/:userId with pagination, search, sorting
app.get('/contacts/:userId', async (req, res) => {
  const { userId } = req.params;
  const {
    page = 1,
    limit = 20,
    sort = 'contact_timestamp',
    order = 'desc',
    search = ''
  } = req.query;

  const offset = (page - 1) * limit;

  const allowedSortFields = [
    'contact_timestamp',
    'date',
    'frequency',
    'band',
    'mode',
    'their_callsign',
    'my_callsign'
  ];
  const allowedOrder = ['asc', 'desc'];

  const sortField = allowedSortFields.includes(sort) ? sort : 'contact_timestamp';
  const sortOrder = allowedOrder.includes(order.toLowerCase()) ? order.toUpperCase() : 'DESC';

  try {
    // Paginated data
    const query = `
      SELECT * FROM logbook_contacts
      WHERE user_id = $1 AND (
        their_callsign ILIKE $2 OR
        my_callsign ILIKE $2
      )
      ORDER BY ${sortField} ${sortOrder}
      LIMIT $3 OFFSET $4
    `;
    const values = [userId, `%${search}%`, limit, offset];
    const result = await pool.query(query, values);

    // Total count
    const countQuery = `
      SELECT COUNT(*) FROM logbook_contacts
      WHERE user_id = $1 AND (
        their_callsign ILIKE $2 OR
        my_callsign ILIKE $2
      )
    `;
    const countResult = await pool.query(countQuery, [userId, `%${search}%`]);
    const totalCount = parseInt(countResult.rows[0].count, 10);

    res.json({
      contacts: result.rows,
      totalCount,
    });
  } catch (err) {
    console.error('❌ Error in /contacts/:userId:', err.message);
    res.status(500).json({ error: err.message });
  }
});


// Start server
app.listen(port, () => {
  console.log(`🚀 Server is running and listening on http://localhost:${port}`);
});
