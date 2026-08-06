# Perinatal Triage Log

A mobile-friendly web app for filling out and amending perinatal triage records, based on the "May 2026" triage spreadsheet template.

## Features

- **New Entry** form covering every column from the original spreadsheet (referral details, Whooley/EPDS/GAD-7/RDAS scores, triage outcome, and Category A/B/C follow-up), plus a Status (Active/Closed), Notes, and Follow-up Date field.
- **Category A/B/C sections** show or hide automatically based on the selected "Risk Category after Triage".
- **Burger menu** for navigating between viewing records and adding a new entry.
- **Records list** with search (name, surname, ID, mobile, email) and filters (perinatal timepoint, risk category, status, Requires MDT Discussion, alert date). Tap a record to see the full detail view.
- **Follow-up alerts** — records whose Follow-up Date is today or in the past (and not Closed) surface as clickable "Due today" / "Overdue" notifications at the top of the records list, taking you straight to that record.
- **Amend** any record after the fact — useful since follow-up calls, MDT discussions, and AE referrals happen days after the initial triage.
- **Export** all records as CSV (always available) or Excel `.xlsx` (requires an internet connection to load the export library).
- **Delete** individual records, or clear all data from the device.

## Data storage

All data is stored locally in the browser's `localStorage` — nothing is sent to a server. This means:

- Data persists across page reloads and browser restarts on the same device/browser.
- Data does **not** sync between devices or browsers.
- Clearing browser data/site data will erase all stored entries.

This is intended as a "device memory" first version; a shared/synced backend can be added later without changing the form itself.

## Running locally

No build step is required — it's plain HTML/CSS/JS.

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000` in a browser.
