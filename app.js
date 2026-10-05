import { getCourses, createReg, request } from "./api.js";

const form      = document.getElementById("registration-form");
const statusEl  = document.getElementById("status");
const errorsEl  = document.getElementById("errors");
const submitBtn = document.getElementById("submit-btn");
const courseList = document.getElementById("course-list");

function setStatus(msg) { statusEl.textContent = msg; }
function clearErrors()  { errorsEl.innerHTML = ""; }
function showErrors(list) {
  clearErrors();
  for (const m of list) {
    const li = document.createElement("li");
    li.textContent = m;              // textContent → safe, no XSS
    errorsEl.appendChild(li);
  }
}

// Restore programme preference (localStorage persists across reloads)
const programme = document.getElementById("programme");
const saved = localStorage.getItem("programme");
if (saved) programme.value = saved;
programme.addEventListener("change", () =>
  localStorage.setItem("programme", programme.value)
);

// Load courses
(async () => {
  const { ok, data } = await getCourses();
  if (ok && Array.isArray(data)) {
    for (const c of data) {
      const li = document.createElement("li");
      li.textContent = `${c.code} — ${c.title}`;
      courseList.appendChild(li);
    }
  }
})();

// Submit handler
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearErrors();
  setStatus("Submitting…");
  submitBtn.disabled = true;

  const payload = Object.fromEntries(new FormData(form).entries());

  // Client-side validation (server is authoritative)
  const clientErrors = [];
  if (!payload.name?.trim())      clientErrors.push("Name is required.");
  if (!/^[0-9]{6,10}$/.test(payload.studentId ?? ""))
                                  clientErrors.push("Student ID must be 6–10 digits.");
  if (!payload.programme)         clientErrors.push("Programme is required.");
  if (!payload.course)            clientErrors.push("Course is required.");
  if (clientErrors.length) {
    showErrors(clientErrors);
    setStatus("Please fix the errors above.");
    submitBtn.disabled = false;
    return;
  }

  try {
    const { ok, status, data } = await createReg(payload);
    if (ok) {
      setStatus(`Registered successfully (id ${data.id}).`);
      form.reset();
    } else if (status === 409) {
      showErrors(["You are already registered for that course."]);
      setStatus("Duplicate registration rejected.");
    } else if (status === 400) {
      showErrors(data?.errors ?? ["Invalid data."]);
      setStatus("Validation failed.");
    } else {
      showErrors([`Unexpected error (HTTP ${status}).`]);
      setStatus("Request failed.");
    }
  } catch (err) {
    showErrors(["Network error — is the API running on http://localhost:3000?"]);
    setStatus("Network error.");
  } finally {
    submitBtn.disabled = false;
  }
});