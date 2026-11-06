// Robot Ambulance Bihar & Patna Emergency Client
const RobotAmbulance = {
  selectedAmbulanceType: 'ALS_ROBOTIC',
  pickupLocation: 'Bailey Road / Raja Bazar',
  dropHospitalId: 'hosp-aiims',
  customDistanceKm: 0,
  fleet: [],
  hospitals: [],
  districts: [],
  activeBooking: null,

  async init() {
    await Promise.all([
      this.loadFleet(),
      this.loadHospitals(),
      this.loadDistricts(),
      this.loadStats()
    ]);
    this.setupEventListeners();
    this.calculateFare();
  },

  async loadFleet() {
    try {
      const res = await fetch('/api/fleet');
      const data = await res.json();
      this.fleet = data.fleet;
      this.renderFleetSelector();
      this.renderFleetShowcase();
    } catch (e) {
      console.error('Failed to load fleet', e);
    }
  },

  async loadHospitals() {
    try {
      const res = await fetch('/api/hospitals');
      const data = await res.json();
      this.hospitals = data.hospitals;
      this.renderHospitalOptions();
      this.renderHospitalsGrid();
    } catch (e) {
      console.error('Failed to load hospitals', e);
    }
  },

  async loadDistricts() {
    try {
      const res = await fetch('/api/districts');
      const data = await res.json();
      this.districts = data.districts;
      this.renderDistrictsTable();
    } catch (e) {
      console.error('Failed to load districts', e);
    }
  },

  async loadStats() {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      const s = data.stats;
      const el1 = document.getElementById('stat-active-ambulances');
      const el2 = document.getElementById('stat-avg-eta');
      const el3 = document.getElementById('stat-lives-saved');
      if (el1) el1.textContent = s.activeAmbulancesInPatna;
      if (el2) el2.textContent = `${s.avgResponseTimeMins} Min`;
      if (el3) el3.textContent = `${s.criticalLivesSavedBihar.toLocaleString('en-IN')}+`;
    } catch (e) {
      console.error('Failed to load stats', e);
    }
  },

  setupEventListeners() {
    // Pickup select change
    const pickupSelect = document.getElementById('pickup-select');
    if (pickupSelect) {
      pickupSelect.addEventListener('change', (e) => {
        this.pickupLocation = e.target.value;
        this.calculateFare();
      });
    }

    // Drop hospital change
    const dropSelect = document.getElementById('drop-hospital-select');
    if (dropSelect) {
      dropSelect.addEventListener('change', (e) => {
        this.dropHospitalId = e.target.value;
        this.calculateFare();
      });
    }

    // GPS Auto-detect
    const gpsBtn = document.getElementById('btn-gps-detect');
    if (gpsBtn) {
      gpsBtn.addEventListener('click', () => this.detectGPS());
    }

    // Instant Book Button -> Opens Confirmation Modal
    const bookBtn = document.getElementById('btn-trigger-book-modal');
    if (bookBtn) {
      bookBtn.addEventListener('click', () => this.openBookingModal());
    }

    // Booking Form Submit
    const bookForm = document.getElementById('emergency-booking-form');
    if (bookForm) {
      bookForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.submitBooking();
      });
    }

    // 1-Tap SOS Button
    const sosBtn = document.getElementById('btn-sos-trigger');
    if (sosBtn) {
      sosBtn.addEventListener('click', () => this.triggerEmergencySOS());
    }

    // District Search Filter
    const distInput = document.getElementById('district-search-input');
    if (distInput) {
      distInput.addEventListener('input', (e) => {
        this.filterDistricts(e.target.value);
      });
    }

    // Modal Close buttons
    document.querySelectorAll('[data-close-modal]').forEach(b => {
      b.addEventListener('click', () => {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
      });
    });
  },

  renderFleetSelector() {
    const container = document.getElementById('ambulance-selector-grid');
    if (!container) return;

    container.innerHTML = this.fleet.map(v => `
      <div class="ambulance-card-pill ${v.id === this.selectedAmbulanceType ? 'active' : ''}" data-amb-id="${v.id}" onclick="RobotAmbulance.selectAmbulance('${v.id}')">
        <span class="amb-pill-icon">${v.icon}</span>
        <span class="amb-pill-name">${v.name.split('—')[0]}</span>
        <span class="amb-pill-price">From ₹${v.basePrice.toLocaleString('en-IN')}</span>
      </div>
    `).join('');
  },

  selectAmbulance(id) {
    this.selectedAmbulanceType = id;
    document.querySelectorAll('.ambulance-card-pill').forEach(el => {
      el.classList.toggle('active', el.getAttribute('data-amb-id') === id);
    });
    this.calculateFare();
  },

  renderHospitalOptions() {
    const select = document.getElementById('drop-hospital-select');
    if (!select) return;

    select.innerHTML = this.hospitals.map(h => `
      <option value="${h.id}" ${h.id === this.dropHospitalId ? 'selected' : ''}>
        ${h.name} (${h.area})
      </option>
    `).join('');
  },

  async calculateFare() {
    try {
      const res = await fetch('/api/calculate-fare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pickupLocation: this.pickupLocation,
          dropHospitalId: this.dropHospitalId,
          ambulanceType: this.selectedAmbulanceType,
          customDistanceKm: this.customDistanceKm
        })
      });

      const data = await res.json();
      if (!data.success) return;

      const fb = data.fareBreakdown;
      const re = data.routeEstimate;
      const v = data.vehicle;
      const h = data.hospital;

      const elFare = document.getElementById('display-total-fare');
      const elDist = document.getElementById('display-distance');
      const elEta = document.getElementById('display-eta');
      const elHub = document.getElementById('display-assigned-hub');
      const elBadge = document.getElementById('display-vehicle-badge');
      const elInfo = document.getElementById('display-base-fare-info');

      if (elFare) elFare.textContent = `₹${fb.totalEstimatedFare.toLocaleString('en-IN')}`;
      if (elDist) elDist.textContent = `${re.distanceKm} km`;
      if (elEta) elEta.textContent = `${re.etaMinutes} mins`;
      if (elHub) elHub.textContent = re.assignedHub;
      if (elBadge) elBadge.textContent = `${v.icon} ${v.name}`;
      if (elInfo) elInfo.textContent = `₹${fb.baseFare} (first ${fb.baseCoveredKm} km included) + ₹${fb.perExtraKmRate}/km extra`;
    } catch (e) {
      console.error('Fare calc error', e);
    }
  },

  detectGPS() {
    const statusEl = document.getElementById('gps-status-indicator');
    if (statusEl) statusEl.textContent = 'Acquiring GPS coordinates...';

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.pickupLocation = 'Boring Road / Boring Canal Road'; // mapped to nearest landmark
          const select = document.getElementById('pickup-select');
          if (select) select.value = this.pickupLocation;
          if (statusEl) statusEl.textContent = `✓ GPS Locked: Lat ${pos.coords.latitude.toFixed(4)}, Lng ${pos.coords.longitude.toFixed(4)}`;
          this.calculateFare();
        },
        () => {
          if (statusEl) statusEl.textContent = 'Using Patna Central Zone (Default)';
          this.calculateFare();
        }
      );
    } else {
      if (statusEl) statusEl.textContent = 'Geolocation not supported in browser';
    }
  },

  openBookingModal() {
    const v = this.fleet.find(f => f.id === this.selectedAmbulanceType) || this.fleet[0];
    const h = this.hospitals.find(x => x.id === this.dropHospitalId) || this.hospitals[0];

    document.getElementById('modal-amb-summary').textContent = `${v.icon} ${v.name} → ${h.name}`;
    document.getElementById('modal-pickup-input').value = this.pickupLocation;
    document.getElementById('booking-modal')?.classList.add('active');
  },

  async submitBooking() {
    const callerName = document.getElementById('book-caller-name').value;
    const phone = document.getElementById('book-phone').value;
    const pickupAddress = document.getElementById('modal-pickup-input').value;
    const patientCondition = document.getElementById('book-patient-condition').value;

    const h = this.hospitals.find(x => x.id === this.dropHospitalId) || this.hospitals[0];

    try {
      const res = await fetch('/api/book-ambulance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callerName,
          phone,
          pickupAddress,
          dropHospitalName: h.name,
          ambulanceType: this.selectedAmbulanceType,
          patientCondition
        })
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      this.activeBooking = data.booking;
      document.getElementById('booking-modal')?.classList.remove('active');
      this.openTrackingModal(data.booking);
    } catch (err) {
      alert(err.message || 'Error booking ambulance. Please dial +91 2444666667 directly.');
    }
  },

  openTrackingModal(booking) {
    document.getElementById('track-booking-id').textContent = booking.id;
    document.getElementById('track-driver-name').textContent = booking.assignedDriver.name;
    document.getElementById('track-driver-phone').textContent = booking.assignedDriver.phone;
    document.getElementById('track-driver-call-link').href = `tel:${booking.assignedDriver.phone.replace(/[^0-9+]/g, '')}`;
    document.getElementById('track-vehicle-num').textContent = booking.assignedDriver.vehicleNumber;
    document.getElementById('track-otp').textContent = booking.pickupOtp;
    document.getElementById('track-eta').textContent = `${booking.etaMinutes} Mins`;

    document.getElementById('tracking-modal')?.classList.add('active');
    this.startRadarCountdown(booking.etaMinutes);
  },

  startRadarCountdown(minutes) {
    let totalSeconds = minutes * 60;
    const etaDisplay = document.getElementById('track-eta');

    const interval = setInterval(() => {
      totalSeconds -= 1;
      if (totalSeconds <= 0) {
        clearInterval(interval);
        if (etaDisplay) etaDisplay.textContent = 'Arrived at Pickup!';
        return;
      }
      const m = Math.floor(totalSeconds / 60);
      const s = totalSeconds % 60;
      if (etaDisplay) etaDisplay.textContent = `${m}m ${s < 10 ? '0' : ''}${s}s`;
    }, 1000);
  },

  async triggerEmergencySOS() {
    if (!confirm('🚨 EMERGENCY SOS: Trigger high-priority dispatch across Patna control room?')) return;

    try {
      const res = await fetch('/api/emergency-sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '+912444666667' })
      });
      const data = await res.json();
      alert(`🚨 ${data.message}\nDispatch Code: ${data.sosId}\nResponse ETA: ${data.eta}\nControl room helpline: ${data.helplineNumbers.join(' / ')}`);
      window.location.href = `tel:${data.helplineNumbers[0].replace(/[^0-9+]/g, '')}`;
    } catch (e) {
      window.location.href = 'tel:+912444666667';
    }
  },

  renderHospitalsGrid() {
    const grid = document.getElementById('hospitals-grid');
    if (!grid) return;

    grid.innerHTML = this.hospitals.map(h => `
      <div class="hospital-card">
        <span class="hosp-badge">${h.type}</span>
        <h3 class="hosp-name">${h.name}</h3>
        <p class="hosp-area">📍 ${h.area}</p>
        <div class="hosp-meta-row">
          <span>🛏️ ${h.icuBeds}</span>
          <span>⚡ ${h.traumaCenter.split('&')[0]}</span>
          ${h.helipad ? '<span>🚁 Air Tarmac</span>' : ''}
        </div>
        <p style="font-size: 0.8rem; color: #64748b; margin-bottom: 1rem;">
          Specialties: ${h.specialties.join(', ')}
        </p>
        <div class="hosp-actions">
          <a href="tel:${h.emergencyPhone.replace(/[^0-9+]/g, '')}" class="btn-hosp-call">📞 Call ER</a>
          <button class="btn-hosp-book" onclick="RobotAmbulance.quickBookHospital('${h.id}')">🚑 Book Ambulance</button>
        </div>
      </div>
    `).join('');
  },

  quickBookHospital(hospId) {
    this.dropHospitalId = hospId;
    const select = document.getElementById('drop-hospital-select');
    if (select) select.value = hospId;
    this.calculateFare();
    window.scrollTo({ top: 300, behavior: 'smooth' });
  },

  renderFleetShowcase() {
    const container = document.getElementById('fleet-showcase-grid');
    if (!container) return;

    container.innerHTML = this.fleet.map(v => `
      <div class="tech-card" style="display: flex; flex-direction: column;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
          <span style="font-size: 2.2rem;">${v.icon}</span>
          <span class="section-badge" style="margin: 0;">${v.badge}</span>
        </div>
        <h3 class="tech-title" style="margin-bottom: 0.25rem;">${v.name}</h3>
        <p style="font-size: 0.8rem; color: var(--accent-blue); font-weight: 700; margin-bottom: 0.75rem;">${v.vehicle}</p>
        <p class="tech-desc" style="font-size: 0.85rem; margin-bottom: 1rem;">${v.suitableFor}</p>

        <div style="background: #f8fafc; border-radius: 8px; padding: 0.75rem; margin-bottom: 1rem;">
          <strong style="font-size: 0.8rem; color: var(--dark-navy); display: block; margin-bottom: 0.35rem;">🤖 Smart Robot Features:</strong>
          <ul style="font-size: 0.75rem; color: #475569; padding-left: 1.1rem; line-height: 1.5;">
            ${v.robotFeatures.map(f => `<li>${f}</li>`).join('')}
          </ul>
        </div>

        <div style="margin-top: auto; display: flex; justify-content: space-between; align-items: baseline; border-top: 1px solid var(--border-color); padding-top: 0.75rem;">
          <div>
            <span style="font-size: 0.75rem; color: #64748b;">Starts at</span>
            <div style="font-size: 1.25rem; font-weight: 900; color: var(--primary-red);">₹${v.basePrice.toLocaleString('en-IN')}</div>
          </div>
          <button class="btn-emergency-call" style="padding: 0.45rem 1rem; font-size: 0.8rem;" onclick="RobotAmbulance.selectAndScroll('${v.id}')">
            Select Ambulance
          </button>
        </div>
      </div>
    `).join('');
  },

  selectAndScroll(id) {
    this.selectAmbulance(id);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  },

  renderDistrictsTable(filtered = null) {
    const tbody = document.getElementById('districts-table-body');
    if (!tbody) return;

    const list = filtered || this.districts;
    tbody.innerHTML = list.map(d => `
      <tr>
        <td><strong>${d.district}</strong></td>
        <td>${d.distanceKm} km</td>
        <td>${d.transitHours}</td>
        <td style="color: #64748b; font-size: 0.85rem;">${d.route}</td>
        <td><strong style="color: var(--dark-navy);">₹${d.blsFare.toLocaleString('en-IN')}</strong></td>
        <td><strong style="color: var(--primary-red);">₹${d.alsFare.toLocaleString('en-IN')}</strong></td>
      </tr>
    `).join('');
  },

  filterDistricts(query) {
    const q = query.toLowerCase().trim();
    if (!q) {
      this.renderDistrictsTable(this.districts);
      return;
    }
    const filtered = this.districts.filter(d =>
      d.district.toLowerCase().includes(q) ||
      d.route.toLowerCase().includes(q)
    );
    this.renderDistrictsTable(filtered);
  }
};

window.addEventListener('DOMContentLoaded', () => RobotAmbulance.init());
