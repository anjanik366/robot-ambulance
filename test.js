process.env.NODE_ENV = 'test';
const http = require('http');
const app = require('./server');

const PORT = 3098;
let server;

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const reqHeaders = { 'Content-Type': 'application/json' };
    if (payload) {
      reqHeaders['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path,
        method,
        headers: reqHeaders
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: data });
          }
        });
      }
    );

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runTests() {
  console.log('🚑 Starting Automated Test Suite for Robot Ambulance Bihar...');
  await new Promise((resolve) => {
    server = app.listen(PORT, '127.0.0.1', resolve);
  });

  try {
    // 1. Health check
    console.log('1. Testing /api/health...');
    const health = await request('GET', '/api/health');
    if (health.status !== 200 || health.data.city !== 'Patna') {
      throw new Error(`Health check failed: ${JSON.stringify(health)}`);
    }
    console.log('   ✓ Health check passed (City: Patna, Bihar)');

    // 2. Hospitals Directory
    console.log('2. Testing /api/hospitals...');
    const hospRes = await request('GET', '/api/hospitals');
    if (hospRes.status !== 200 || hospRes.data.hospitals.length < 8) {
      throw new Error(`Hospitals fetch failed: ${JSON.stringify(hospRes)}`);
    }
    const aiims = hospRes.data.hospitals.find((h) => h.id === 'hosp-aiims');
    if (!aiims || !aiims.name.includes('AIIMS Patna')) {
      throw new Error('AIIMS Patna missing from directory');
    }
    console.log(`   ✓ Retrieved ${hospRes.data.hospitals.length} Patna premier hospitals`);

    // 3. Ambulance Fleet
    console.log('3. Testing /api/fleet...');
    const fleetRes = await request('GET', '/api/fleet');
    if (fleetRes.status !== 200 || fleetRes.data.fleet.length < 6) {
      throw new Error(`Fleet fetch failed: ${JSON.stringify(fleetRes)}`);
    }
    const roboticAls = fleetRes.data.fleet.find((f) => f.id === 'ALS_ROBOTIC');
    if (!roboticAls || !roboticAls.robotFeatures || roboticAls.robotFeatures.length === 0) {
      throw new Error('ALS Robotic ICU missing robot features');
    }
    console.log(`   ✓ Retrieved ${fleetRes.data.fleet.length} fleet types (Robotic ALS verified)`);

    // 4. Bihar Districts Tariffs
    console.log('4. Testing /api/districts...');
    const distRes = await request('GET', '/api/districts');
    if (distRes.status !== 200 || distRes.data.districts.length === 0) {
      throw new Error(`Districts fetch failed: ${JSON.stringify(distRes)}`);
    }
    console.log(`   ✓ Retrieved ${distRes.data.districts.length} Bihar district transfer rates`);

    // 5. Upfront Fare Calculation
    console.log('5. Testing /api/calculate-fare...');
    const fareRes = await request('POST', '/api/calculate-fare', {
      pickupLocation: 'Boring Road / Boring Canal Road',
      dropHospitalId: 'hosp-aiims',
      ambulanceType: 'ALS_ROBOTIC'
    });
    if (fareRes.status !== 200 || !fareRes.data.fareBreakdown || fareRes.data.fareBreakdown.totalEstimatedFare <= 0) {
      throw new Error(`Fare calculation failed: ${JSON.stringify(fareRes)}`);
    }
    console.log(`   ✓ Calculated upfront fare: ₹${fareRes.data.fareBreakdown.totalEstimatedFare} (ETA: ${fareRes.data.routeEstimate.etaMinutes} mins)`);

    // 6. Emergency Booking
    console.log('6. Testing /api/book-ambulance...');
    const bookRes = await request('POST', '/api/book-ambulance', {
      callerName: 'Sunil Kumar',
      phone: '+91 2444666667',
      pickupAddress: 'Road No 4, Rajendra Nagar, Patna',
      dropHospitalName: 'PMCH Super Emergency Wing',
      ambulanceType: 'ALS_ROBOTIC',
      patientCondition: 'Cardiac Chest Pain'
    });
    if (bookRes.status !== 201 || !bookRes.data.booking.id || !bookRes.data.booking.assignedDriver) {
      throw new Error(`Booking failed: ${JSON.stringify(bookRes)}`);
    }
    const booking = bookRes.data.booking;
    console.log(`   ✓ Booking created (ID: ${booking.id}, Vehicle: ${booking.assignedDriver.vehicleNumber}, OTP: ${booking.pickupOtp})`);

    // 7. Booking Tracking Status
    console.log('7. Testing /api/bookings/:id...');
    const trackRes = await request('GET', `/api/bookings/${booking.id}`);
    if (trackRes.status !== 200 || trackRes.data.booking.id !== booking.id) {
      throw new Error(`Tracking lookup failed: ${JSON.stringify(trackRes)}`);
    }
    console.log(`   ✓ Live tracking verified (Status: ${trackRes.data.booking.status})`);

    // 8. 1-Tap SOS Dispatch
    console.log('8. Testing /api/emergency-sos...');
    const sosRes = await request('POST', '/api/emergency-sos', { phone: '+91 2444666667' });
    if (sosRes.status !== 200 || !sosRes.data.sosId) {
      throw new Error(`SOS dispatch failed: ${JSON.stringify(sosRes)}`);
    }
    console.log(`   ✓ 1-Tap SOS verified (Alert Code: ${sosRes.data.sosId})`);

    // 9. Operational Stats
    console.log('9. Testing /api/stats...');
    const statsRes = await request('GET', '/api/stats');
    if (statsRes.status !== 200 || typeof statsRes.data.stats.activeAmbulancesInPatna !== 'number') {
      throw new Error(`Stats fetch failed: ${JSON.stringify(statsRes)}`);
    }
    console.log(`   ✓ Stats verified (${statsRes.data.stats.activeAmbulancesInPatna} active ambulances in Patna)`);

    console.log('\n🎉 ALL 9 AUTOMATED TESTS PASSED SUCCESSFULLY! 🌟');
  } catch (err) {
    console.error('\n❌ Test suite failed:', err);
    process.exitCode = 1;
  } finally {
    server.close();
  }
}

runTests();
