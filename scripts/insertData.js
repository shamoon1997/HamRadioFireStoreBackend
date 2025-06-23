const { Pool } = require('pg');
const fs = require('fs');
const path = require("path");


const logbookcontactPath = path.join(__dirname, "../data_files/logbookcontact.json");
const logbookPath = path.join(__dirname, "../data_files/logbook.json");
const userPath = path.join(__dirname, "../data_files/userprofile.json");


// Configure PostgreSQL
const pool = new Pool({
  user: 'shamoonshahid',        
  host: 'localhost',
  database: 'hamradio',
  password: 'cow.7???',
  port: 5432,
});

// Helper to safely extract timestamp
const extractTimestamp = (ts) => {
  return ts && ts._seconds ? new Date(ts._seconds * 1000).toISOString() : null;
};

// Insert logbook contacts
async function insertLogbookContacts() {
  const data = JSON.parse(fs.readFileSync(logbookcontactPath, 'utf8'));

  // Fetch all valid logbook IDs from the database
  const { rows: logbookRows } = await pool.query('SELECT id FROM logbooks');
  const validLogbookIds = new Set(logbookRows.map(row => row.id));

  let insertedCount = 0, skippedCount = 0;

  for (const contact of data) {
    if (!validLogbookIds.has(contact.logBookId)) {
      console.warn(`Skipping contact ${contact.id}: logbook_id ${contact.logBookId} not found.`);
      skippedCount++;
      continue;
    }

    try {
      await pool.query(
        `INSERT INTO logbook_contacts (
          id, date, user_id, their_callsign, my_callsign,
          their_latitude, their_longitude,
          my_latitude, my_longitude,
          their_country, my_country,
          their_state, my_state,
          frequency, band, mode, logbook_id,
          contact_timestamp
        ) VALUES (
          $1, $2, $3, $4, $5,
          $6, $7,
          $8, $9,
          $10, $11,
          $12, $13,
          $14, $15, $16, $17, $18
        ) ON CONFLICT (id) DO NOTHING`,
        [
          contact.id,
          contact.date,
          contact.uid,
          contact.theirCallsign,
          contact.myCallSign,
          contact.theirCoordinates?.latitude || null,
          contact.theirCoordinates?.longitude || null,
          contact.myCoordinates?.latitude || null,
          contact.myCoordinates?.longitude || null,
          contact.theirCountry || null,
          contact.myCountry || null,
          contact.theirState || null,
          contact.myState || null,
          contact.frequency || null,
          contact.band || null,
          contact.userMode || null,
          contact.logBookId || null,
          extractTimestamp(contact.contactTimeStamp),
        ]
      );
      insertedCount++;
    } catch (err) {
      console.error(`Error inserting contact ${contact.id}:`, err.message);
    }
  }

  console.log(`Logbook contacts inserted: ${insertedCount}, Skipped (invalid logbook): ${skippedCount}`);
}


// Insert logbooks
async function insertLogbooks() {
  const data = JSON.parse(fs.readFileSync(logbookPath, 'utf8'));

  console.log(`Found ${data.length} logbooks to insert...`);
  for (const logbook of data) {
    try {
      await pool.query(
        `INSERT INTO logbooks (
          id, user_id, name, created_at,
          my_antenna, my_radio, contact_count,
          latitude, longitude, last_contact_timestamp
        ) VALUES (
          $1, $2, $3, $4,
          $5, $6, $7,
          $8, $9, $10
        ) ON CONFLICT (id) DO NOTHING`,
        [
          logbook.id,
          logbook.uid,
          logbook.name,
          extractTimestamp(logbook.timestamp),
          logbook.myAntenna || '',
          logbook.myRadio || '',
          logbook.contactCount || 0,
          logbook.coordinates?.latitude || null,
          logbook.coordinates?.longitude || null,
          extractTimestamp(logbook.lastContactTimestamp),
        ]
      );
      console.log(`Inserted logbook: ${logbook.id}`);
    } catch (err) {
      console.error(`Error inserting logbook ${logbook.id}:`, err.message);
    }
  }

  console.log("Finished inserting logbooks.\n");
}


// Insert user profiles
async function insertUserProfiles() {
  const data = JSON.parse(fs.readFileSync(userPath, 'utf8'));

  for (const user of data) {

    await pool.query(
      `INSERT INTO user_profiles (
        id, first_name, last_name, call_sign,
        country, state, city, address,
        email, phone_number, grid_square,
        bio, latitude, longitude,
        cq_zone, itu_zone, timestamp
      ) VALUES (
        $1, $2, $3, $4,
        $5, $6, $7, $8,
        $9, $10, $11,
        $12, $13, $14,
        $15, $16, $17
      ) ON CONFLICT (id) DO NOTHING`,
      [
        user.id,
        user.firstName,
        user.lastName,
        user.callSign,
        user.country,
        user.state,
        user.city,
        user.address,
        user.email,
        user.phoneNumber,
        user.gridSquare,
        user.bio,
        user.coordinates?.latitude || null,
        user.coordinates?.longitude || null,
        user.cqZone || null,
        user.ituZone || null,
        extractTimestamp(user.timestamp),
      ]
    );
  }

  console.log("User profiles inserted.");
}

// Main function
async function runInsert() {
  try {
    // await insertUserProfiles();
    // await insertLogbooks();
    await insertLogbookContacts();
  } catch (err) {
    console.error("Error inserting data:", err);
  } finally {
    await pool.end();
  }
}

runInsert();
