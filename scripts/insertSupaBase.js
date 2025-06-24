require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Supabase credentials
const supabase = createClient(
  'https://jgarsrwneoyqqgolhtgm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnYXJzcnduZW95cXFnb2xodGdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2MTI5NTcsImV4cCI6MjA2NjE4ODk1N30.9VA5zWrVCZ5d0TNXMF3HkMtMNGzFCNXf_AzhlWek_54'
);

// Setting Paths
const logbookcontactPath = path.join(__dirname, '../data_files/logbookcontact.json');
const logbookPath = path.join(__dirname, '../data_files/logbook.json');
const userPath = path.join(__dirname, '../data_files/userprofile.json');

// Timestamp helper
const extractTimestamp = (ts) =>
  ts && ts._seconds ? new Date(ts._seconds * 1000).toISOString() : null;

//  Insert Users
async function insertUserProfiles() {
  const users = JSON.parse(fs.readFileSync(userPath, 'utf8'));

  for (const user of users) {
    const { error } = await supabase.from('user_profiles').upsert({
      id: user.id,
      first_name: user.firstName,
      last_name: user.lastName,
      call_sign: user.callSign,
      country: user.country,
      state: user.state,
      city: user.city,
      address: user.address,
      email: user.email,
      phone_number: user.phoneNumber,
      grid_square: user.gridSquare,
      bio: user.bio,
      latitude: user.coordinates?.latitude || null,
      longitude: user.coordinates?.longitude || null,
      cq_zone: user.cqZone,
      itu_zone: user.ituZone,
      timestamp: extractTimestamp(user.timestamp),
    });

    if (error) console.error(`User ${user.id} insert error:`, error.message);
  }
  console.log('Users inserted.');
}

// Insert Logbooks
async function insertLogbooks() {
  const logbooks = JSON.parse(fs.readFileSync(logbookPath, 'utf8'));

  for (const logbook of logbooks) {
    const { error } = await supabase.from('logbooks').upsert({
      id: logbook.id,
      user_id: logbook.uid,
      name: logbook.name,
      created_at: extractTimestamp(logbook.timestamp),
      my_antenna: logbook.myAntenna || '',
      my_radio: logbook.myRadio || '',
      contact_count: logbook.contactCount || 0,
      latitude: logbook.coordinates?.latitude || null,
      longitude: logbook.coordinates?.longitude || null,
      last_contact_timestamp: extractTimestamp(logbook.lastContactTimestamp),
    });

    if (error) console.error(`Logbook ${logbook.id} insert error:`, error.message);
  }
  console.log('Logbooks inserted.');
}

// Insert Contacts
async function insertLogbookContacts() {
  const contacts = JSON.parse(fs.readFileSync(logbookcontactPath, 'utf8'));

  // You can optionally validate logbook IDs using a `select` from Supabase here

  for (const contact of contacts) {
    const { error } = await supabase.from('logbook_contacts').upsert({
      id: contact.id,
      date: contact.date,
      user_id: contact.uid,
      their_callsign: contact.theirCallsign,
      my_callsign: contact.myCallSign,
      their_latitude: contact.theirCoordinates?.latitude || null,
      their_longitude: contact.theirCoordinates?.longitude || null,
      my_latitude: contact.myCoordinates?.latitude || null,
      my_longitude: contact.myCoordinates?.longitude || null,
      their_country: contact.theirCountry || null,
      my_country: contact.myCountry || null,
      their_state: contact.theirState || null,
      my_state: contact.myState || null,
      frequency: contact.frequency || null,
      band: contact.band || null,
      mode: contact.userMode || null,
      logbook_id: contact.logBookId || null,
      contact_timestamp: extractTimestamp(contact.contactTimeStamp),
    });

    if (error) console.error(`Contact ${contact.id} insert error:`, error.message);
  }
  console.log('Contacts inserted.');
}

// Run
async function run() {
  try {
    // await insertUserProfiles();
    // await insertLogbooks();
    await insertLogbookContacts();
  } catch (err) {
    console.error('Failed:', err.message);
  }
}

run();
