import express from "express";
import cors from "cors";
import crypto from "crypto";
import { courses, registrations, newId } from "./data.js";

const app = express();
const PORT = 3000;
const UI_ORIGIN = "http://localhost:5500";

// --- CORS ---
// app.use(cors({
//   origin: UI_ORIGIN,
//   methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type"],
//   credentials: true,
//   exposedHeaders: ["ETag", "Location"],
// }));

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // for /inspect form data

// --- Validation helpers ---
function validate(body, { partial = false } = {}) {
  const errors = [];
  const required = ["name", "studentId", "programme", "course"];
  for (const f of required) {
    if (!partial || f in body) {
      if (typeof body[f] !== "string" || !body[f].trim())
        errors.push(`${f} is required.`);
    }
  }
  if (body.studentId && !/^[0-9]{6,10}$/.test(body.studentId))
    errors.push("studentId must be 6–10 digits.");
  if (body.course && !courses.some(c => c.code === body.course))
    errors.push("Unknown course code.");
  return errors;
}

function isDuplicate(studentId, course, ignoreId = null) {
  for (const [id, r] of registrations)
    if (id !== ignoreId && r.studentId === studentId && r.course === course)
      return true;
  return false;
}

// --- 1. GET /api/courses (with ETag + Cache-Control) ---
app.get("/api/courses", (req, res) => {
  const body = JSON.stringify(courses);
  const etag = `"${crypto.createHash("sha1").update(body).digest("hex")}"`;
  res.set("ETag", etag);
  res.set("Cache-Control", "public, max-age=60");
  if (req.headers["if-none-match"] === etag) return res.status(304).end();
  res.type("application/json").send(body);
});

// --- 2. GET /api/registrations/:id ---
app.get("/api/registrations/:id", (req, res) => {
  const r = registrations.get(req.params.id);
  if (!r) return res.status(404).json({ error: "Not found" });
  res.set("Cache-Control", "no-store");
  res.json(r);
});

// --- 3. POST /api/registrations ---
app.post("/api/registrations", (req, res) => {
  const errors = validate(req.body);
  if (errors.length) return res.status(400).json({ errors });
  if (isDuplicate(req.body.studentId, req.body.course))
    return res.status(409).json({ error: "Duplicate registration" });

  const id = newId();
  const record = { id, ...req.body };
  registrations.set(id, record);

  res.set("Location", `/api/registrations/${id}`);
  res.set("Cache-Control", "no-store");
  res.status(201).json(record);
});

// --- 4. PUT /api/registrations/:id ---
app.put("/api/registrations/:id", (req, res) => {
  if (!registrations.has(req.params.id))
    return res.status(404).json({ error: "Not found" });

  const errors = validate(req.body);
  if (errors.length) return res.status(400).json({ errors });
  if (isDuplicate(req.body.studentId, req.body.course, req.params.id))
    return res.status(409).json({ error: "Duplicate registration" });

  const updated = { id: req.params.id, ...req.body };
  registrations.set(req.params.id, updated);
  res.set("Cache-Control", "no-store");
  res.json(updated);
});

// --- 5. PATCH /api/registrations/:id (programme only) ---
app.patch("/api/registrations/:id", (req, res) => {
  const r = registrations.get(req.params.id);
  if (!r) return res.status(404).json({ error: "Not found" });
  const allowed = ["BSc Computer Science","BSc Information Technology","BBA","BEng Electrical"];
  if (!allowed.includes(req.body.programme))
    return res.status(422).json({ error: "Invalid programme" });

  r.programme = req.body.programme;
  res.set("Cache-Control", "no-store");
  res.json(r);
});

// --- 6. DELETE /api/registrations/:id ---
app.delete("/api/registrations/:id", (req, res) => {
  if (!registrations.delete(req.params.id))
    return res.status(404).json({ error: "Not found" });
  res.status(204).end();
});

// --- /inspect diagnostic route ---
app.all("/inspect", (req, res) => {
  res.json({
    method: req.method,
    path: req.path,
    query: req.query,
    headers: req.headers,
    body: req.body ?? null,
    accept: req.headers.accept,
    contentType: req.headers["content-type"],
  });
});

// --- Cookie demo route ---
app.get("/demo/cookie", (req, res) => {
  res.cookie("demo", "hello-from-server", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    // secure: true  // would be required over HTTPS in production
  });
  res.json({ ok: true });
});

app.listen(PORT, () =>
  console.log(`API on http://localhost:${PORT} — UI origin allowed: ${UI_ORIGIN}`)
);