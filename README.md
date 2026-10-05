# ICT461 Unit 1 Lab — Course Registration Form

A standards-compliant, responsive course registration form built for ICT461 (Web Systems and Technology), Unit 1: Web Platform and Standards.

## What this is

A one-page course registration interface with semantic HTML, client-side validation, and a responsive layout — built incrementally and tracked through Git commit history.

## Run it

Open `index.html` directly in any browser. No build steps, no dependencies, no server required.

## Features

- Semantic HTML structure (`<main>`, `<form>`, properly linked `<label>`/`<input>` pairs)
- Required fields with correct input types (`text`, `select`)
- Client-side validation on all four fields (full name, student ID, programme, course), using `blur` events for text inputs and `change` events for dropdowns
- Accessible error messaging (`role="alert"`, error text tied to each field)
- Responsive CSS with a mobile breakpoint at 480px

## Project structure

- `index.html` — main page
- `styles.css` — all styling, including the responsive media query
- `screenshots/` — DevTools evidence (Elements panel, Network panel)
- `REFLECTION.md` — 300-word reflection on the build process

## Evidence of process

This project was built and committed in stages — structure, then validation, then full document, then CSS in layers, then responsiveness — rather than as one final dump. See the commit history for the full sequence.

## Note on validation

Client-side validation here is for user experience only. It does not replace server-side validation, which would be required in a real deployment to verify data and enforce rules a user cannot bypass.
