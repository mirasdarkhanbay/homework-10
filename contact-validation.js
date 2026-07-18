// contact-validation.js
// Forms & Validation — client-side validation for #contact-form
// Uses the Constraint Validation API + ARIA to give accessible, inline feedback.
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const fieldIds = ['name', 'email', 'subject', 'message'];
  const submitBtn = document.getElementById('submit-btn');
  const submitSpinner = document.getElementById('submit-spinner');
  const submitLabel = document.getElementById('submit-label');
  const statusBox = document.getElementById('form-status');
  fieldIds.forEach((id) => {
    const el = document.getElementById(id);
    el.addEventListener('input', () => {
      if (el.getAttribute('aria-invalid') === 'true') {
        validateField(el);
      }
    });
    el.addEventListener('blur', () => validateField(el));
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    statusBox.hidden = true;
    let firstInvalid = null;
    let allValid = true;
    fieldIds.forEach((id) => {
      const el = document.getElementById(id);
      const isValid = validateField(el);
      if (!isValid) {
        allValid = false;
        if (!firstInvalid) firstInvalid = el;
      }
    });
    if (!allValid) {
      firstInvalid.focus();
      return;
    }
    simulateSubmit();
  });
  function validateField(el) {
    const errorEl = document.getElementById(el.id + '-error');
    if (el.validity.valid) {
      el.classList.remove('is-invalid');
      el.setAttribute('aria-invalid', 'false');
      if (errorEl) {
        errorEl.hidden = true;
        errorEl.textContent = '';
      }
      return true;
    }
    el.classList.add('is-invalid');
    el.setAttribute('aria-invalid', 'true');
    if (errorEl) {
      errorEl.textContent = getErrorMessage(el);
      errorEl.hidden = false;
    }
    return false;
  }
  function getErrorMessage(el) {
    const v = el.validity;
    const label = labelFor(el);
    if (v.valueMissing) return `${label} is required.`;
    if (v.typeMismatch) return `Please enter a valid ${el.type}.`;
    if (v.tooShort) return `${label} must be at least ${el.minLength} characters.`;
    if (v.tooLong) return `${label} must be under ${el.maxLength} characters.`;
    return el.validationMessage || `Please check the ${label.toLowerCase()} field.`;
  }
  function labelFor(el) {
    const label = document.querySelector(`label[for="${el.id}"]`);
    return label ? label.textContent.trim() : 'This field';
  }
  function simulateSubmit() {
    submitBtn.disabled = true;
    submitSpinner.hidden = false;
    submitLabel.textContent = 'Sending...';
    setTimeout(() => {
      submitBtn.disabled = false;
      submitSpinner.hidden = true;
      submitLabel.textContent = 'Send Message';
      form.reset();
      fieldIds.forEach((id) => {
        const el = document.getElementById(id);
        el.classList.remove('is-invalid');
        el.setAttribute('aria-invalid', 'false');
        const errorEl = document.getElementById(id + '-error');
        if (errorEl) {
          errorEl.hidden = true;
          errorEl.textContent = '';
        }
      });
      statusBox.hidden = false;
    }, 900);
  }
});
