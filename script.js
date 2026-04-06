/* ============================================================
   Silverback Insurance — Construction Insurance Proposal Form
   script.js
   Handles: validation, conditional logic, percentage totals,
            signature pads, progress bar, Formsubmit submission
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // ── CONFIGURATION ──────────────────────────────────────────
  // Uses Formsubmit.co — no signup required.
  // Submissions are emailed to info@silverbackinsurance.com.au
  // On first submission, Formsubmit sends a confirmation email to activate.
  const FORMSUBMIT_URL = 'https://formsubmit.co/ajax/info@silverbackinsurance.com.au';

  const form = document.getElementById('proposalForm');
  const submitBtn = document.getElementById('submitBtn');
  const successOverlay = document.getElementById('successOverlay');

  // ── FOOTER YEAR ────────────────────────────────────────────
  document.getElementById('footerYear').textContent = new Date().getFullYear();

  // ── PROGRESS BAR ───────────────────────────────────────────
  const progressBar = document.getElementById('progressBar');
  const progressLabel = document.getElementById('progressLabel');
  const allSections = form.querySelectorAll('.form-section');
  const totalSections = allSections.length;

  function updateProgress() {
    let filledSections = 0;
    allSections.forEach(section => {
      const inputs = section.querySelectorAll('input, select, textarea');
      let hasValue = false;
      inputs.forEach(input => {
        if (input.type === 'radio' || input.type === 'checkbox') {
          if (input.checked) hasValue = true;
        } else if (input.value && input.value.trim() !== '') {
          hasValue = true;
        }
      });
      if (hasValue) filledSections++;
    });
    const pct = Math.round((filledSections / totalSections) * 100);
    progressBar.style.width = pct + '%';
    progressLabel.textContent = pct + '% complete';
  }

  // Debounced progress update
  let progressTimer;
  form.addEventListener('input', () => {
    clearTimeout(progressTimer);
    progressTimer = setTimeout(updateProgress, 300);
  });
  form.addEventListener('change', updateProgress);

  // ── PERCENTAGE TOTALS ──────────────────────────────────────
  function setupPercentageTotal(inputClass, totalId) {
    const inputs = document.querySelectorAll('.' + inputClass);
    const totalEl = document.getElementById(totalId);
    if (!totalEl) return;

    function calcTotal() {
      let sum = 0;
      inputs.forEach(inp => { sum += parseFloat(inp.value) || 0; });
      totalEl.textContent = sum + '%';
      totalEl.style.color = sum === 100 ? 'var(--color-success)' :
                             sum > 100 ? 'var(--color-error)' : '';
    }
    inputs.forEach(inp => inp.addEventListener('input', calcTotal));
  }

  setupPercentageTotal('contract-pct', 'contractPctTotal');
  setupPercentageTotal('project-pct', 'projectPctTotal');
  setupPercentageTotal('geo-pct', 'geoPctTotal');

  // ── PLANT TOTAL ────────────────────────────────────────────
  function setupCurrencyTotal(inputClass, totalId) {
    const inputs = document.querySelectorAll('.' + inputClass);
    const totalEl = document.getElementById(totalId);
    if (!totalEl) return;

    function calcTotal() {
      let sum = 0;
      inputs.forEach(inp => {
        const val = inp.value.replace(/[^0-9.]/g, '');
        sum += parseFloat(val) || 0;
      });
      totalEl.textContent = '$' + sum.toLocaleString('en-AU');
    }
    inputs.forEach(inp => inp.addEventListener('input', calcTotal));
  }

  setupCurrencyTotal('plant-value', 'plantTotal');

  // ── CONDITIONAL FIELD LOGIC ────────────────────────────────

  // Generic: show target if any radio in group has value "Yes"
  function setupYesConditional(radioClass, targetId) {
    const radios = document.querySelectorAll('.' + radioClass);
    const target = document.getElementById(targetId);
    if (!target || radios.length === 0) return;

    function check() {
      let anyYes = false;
      radios.forEach(r => { if (r.checked && r.value === 'Yes') anyYes = true; });
      target.classList.toggle('visible', anyYes);
    }
    radios.forEach(r => r.addEventListener('change', check));
  }

  setupYesConditional('disclosure-yn', 'disclosureDetails');
  setupYesConditional('risk-yn', 'riskDetails');
  setupYesConditional('liab-yn', 'liabDetails');

  // Single radio conditionals
  function setupSingleConditional(radioName, yesValue, targetId) {
    const target = document.getElementById(targetId);
    if (!target) return;
    document.querySelectorAll(`input[name="${radioName}"]`).forEach(r => {
      r.addEventListener('change', () => {
        target.classList.toggle('visible', r.value === yesValue && r.checked);
      });
    });
  }

  setupSingleConditional('hired_equipment', 'Yes', 'hiredDetails');
  setupSingleConditional('pollution_required', 'Yes', 'pollutionDetails');
  setupSingleConditional('builders_office', 'Yes', 'officeDetails');

  // Liability limit "Other"
  document.querySelectorAll('input[name="liability_limit"]').forEach(r => {
    r.addEventListener('change', () => {
      const target = document.getElementById('liabilityOther');
      if (target) target.classList.toggle('visible', r.value === 'Other' && r.checked);
    });
  });

  // Pollution limit "Other"
  document.querySelectorAll('input[name="pollution_limit"]').forEach(r => {
    r.addEventListener('change', () => {
      const target = document.getElementById('pollutionOther');
      if (target) target.classList.toggle('visible', r.value === 'Other' && r.checked);
    });
  });

  // ── SIGNATURE PADS ────────────────────────────────────────
  class SignaturePad {
    constructor(canvasId, wrapperId, hiddenInputId) {
      this.canvas = document.getElementById(canvasId);
      this.wrapper = document.getElementById(wrapperId);
      this.hiddenInput = document.getElementById(hiddenInputId);
      if (!this.canvas) return;

      this.ctx = this.canvas.getContext('2d');
      this.drawing = false;
      this.hasSignature = false;
      this.points = [];

      this.resize();
      window.addEventListener('resize', () => this.resize());

      // Mouse events
      this.canvas.addEventListener('mousedown', e => this.startDraw(e));
      this.canvas.addEventListener('mousemove', e => this.draw(e));
      this.canvas.addEventListener('mouseup', () => this.endDraw());
      this.canvas.addEventListener('mouseleave', () => this.endDraw());

      // Touch events
      this.canvas.addEventListener('touchstart', e => { e.preventDefault(); this.startDraw(e.touches[0]); }, { passive: false });
      this.canvas.addEventListener('touchmove', e => { e.preventDefault(); this.draw(e.touches[0]); }, { passive: false });
      this.canvas.addEventListener('touchend', () => this.endDraw());
    }

    resize() {
      const rect = this.canvas.parentElement.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      this.canvas.width = rect.width * dpr;
      this.canvas.height = this.canvas.offsetHeight * dpr;
      this.ctx.scale(dpr, dpr);
      this.ctx.strokeStyle = '#1a3f6f';
      this.ctx.lineWidth = 2;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
    }

    getPos(e) {
      const rect = this.canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    startDraw(e) {
      this.drawing = true;
      const pos = this.getPos(e);
      this.ctx.beginPath();
      this.ctx.moveTo(pos.x, pos.y);
    }

    draw(e) {
      if (!this.drawing) return;
      const pos = this.getPos(e);
      this.ctx.lineTo(pos.x, pos.y);
      this.ctx.stroke();
      this.hasSignature = true;
      this.wrapper.classList.add('has-signature');
    }

    endDraw() {
      this.drawing = false;
      if (this.hasSignature && this.hiddenInput) {
        this.hiddenInput.value = this.canvas.toDataURL('image/png');
      }
    }

    clear() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.hasSignature = false;
      this.wrapper.classList.remove('has-signature');
      if (this.hiddenInput) this.hiddenInput.value = '';
    }
  }

  const sigPad1 = new SignaturePad('signaturePad1', 'sigPad1Wrapper', 'sig1_signature');

  // Clear buttons
  document.querySelectorAll('.clear-signature').forEach(btn => {
    btn.addEventListener('click', () => {
      const padId = btn.getAttribute('data-pad');
      if (padId === 'signaturePad1') sigPad1.clear();
    });
  });

  // ── INLINE VALIDATION ─────────────────────────────────────
  function validateField(input) {
    const group = input.closest('.form-group');
    if (!group) return true;

    let valid = true;

    if (input.hasAttribute('required')) {
      if (input.type === 'radio') {
        const name = input.name;
        const checked = form.querySelector(`input[name="${name}"]:checked`);
        valid = !!checked;
        // Find the group's parent form-group
        const radioGroup = input.closest('.form-group');
        if (radioGroup) radioGroup.classList.toggle('error', !valid);
        return valid;
      }

      if (input.type === 'email') {
        valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);
      } else if (input.type === 'checkbox') {
        valid = input.checked;
      } else {
        valid = input.value.trim() !== '';
      }
    }

    group.classList.toggle('error', !valid);
    return valid;
  }

  // Live validation on blur
  form.querySelectorAll('input[required], select[required], textarea[required]').forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('change', () => validateField(input));
  });

  // ── FORM SUBMISSION ────────────────────────────────────────
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validate all required fields
    let isValid = true;
    let firstError = null;

    form.querySelectorAll('[required]').forEach(input => {
      if (!validateField(input)) {
        isValid = false;
        if (!firstError) firstError = input;
      }
    });

    // Check consent
    const consent = document.getElementById('consentCheck');
    const consentError = document.getElementById('consentError');
    if (!consent.checked) {
      isValid = false;
      consentError.style.display = 'block';
      if (!firstError) firstError = consent;
    } else {
      consentError.style.display = 'none';
    }

    if (!isValid) {
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstError.focus();
      }
      return;
    }

    // Disable button, show spinner
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    // Collect form data
    const formData = new FormData(form);

    // Remove large signature data URIs (they may exceed email limits)
    // Instead, add a note that signatures were captured
    if (sigPad1.hasSignature) {
      formData.set('sig1_signature', '[Signature captured digitally]');
    }

    // Formsubmit.co configuration fields
    formData.append('_subject', 'New Construction Insurance Proposal — ' + (formData.get('legal_name') || 'Unknown'));
    formData.append('_replyto', formData.get('email'));
    formData.append('_captcha', 'true'); // Enable captcha for spam protection
    formData.append('_template', 'table'); // Nicely formatted email table
    formData.append('submission_date', new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney' }));

    // Auto-response: send confirmation email back to the builder
    formData.append('_autoresponse',
      'Thank you for submitting your Construction Insurance Proposal to Silverback Insurance.\n\n' +
      'We have received your proposal and our team will review it shortly. ' +
      'If we need any additional information, we will be in touch.\n\n' +
      'If you have any questions in the meantime, please contact:\n' +
      'Petara Tanuvasa\n' +
      'Silverback Insurance\n' +
      'Phone: 0410 152 835\n' +
      'Email: info@silverbackinsurance.com.au\n\n' +
      'C.A.R No: 1283436 | Authorised Representative of Australian Broker Network'
    );

    try {
      const response = await fetch(FORMSUBMIT_URL, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });

      const data = await response.json();

      if (data.success === 'true' || data.success === true || response.ok) {
        successOverlay.classList.add('visible');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        alert('There was a problem submitting the form. Please try again or contact info@silverbackinsurance.com.au directly.');
      }
    } catch (err) {
      alert('Network error. Please check your internet connection and try again.\n\nAlternatively, contact info@silverbackinsurance.com.au directly.');
    } finally {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
    }
  });

  // ── INITIAL STATE ──────────────────────────────────────────
  updateProgress();

  // Set default date for sig1_date to today
  const today = new Date().toISOString().split('T')[0];
  const sig1Date = form.querySelector('input[name="sig1_date"]');
  if (sig1Date && !sig1Date.value) sig1Date.value = today;
});
