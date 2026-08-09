# Perinatal Triage Log

A mobile-friendly web app for filling out and amending perinatal triage records, based on the "May 2026" triage spreadsheet template.

## Features

- **New Entry** form covering every column from the original spreadsheet (referral details, Whooley/EPDS/GAD-7/RDAS scores, triage outcome, and Category A/B/C follow-up, all always visible), plus a Status (Active/Closed), Notes, and Follow-up Date field.
- **Burger menu** for navigating between viewing records and adding a new entry.
- **Records list** with search (name, surname, ID, mobile, email, and dates in `YYYY-MM-DD` or `DD/MM/YYYY` format) and filters (perinatal timepoint, risk category, status, Requires MDT Discussion, alert date). Tap a record to see the full detail view.
- **Follow-up alerts** — records whose Follow-up Date is today or in the past (and not Closed) surface as clickable "Due today" / "Overdue" notifications at the top of the records list, taking you straight to that record.
- **Amend** any record after the fact — useful since follow-up calls, MDT discussions, and AE referrals happen days after the initial triage.
- **Export** all records as CSV (always available) or Excel `.xlsx` (requires an internet connection to load the export library).
- **Delete** individual records, or clear all data from the device.

## Data storage

By default, all data is stored locally in the browser's `localStorage` — nothing is sent to a server. This means:

- Data persists across page reloads and browser restarts on the same device/browser.
- Data does **not** sync between devices or browsers.
- Clearing browser data/site data will erase all stored entries.

### Optional: link to a local file

On Chrome or Edge (desktop), the burger menu offers **Link to a File**. This uses the browser's File System
Access API to read and write a real `.json` file on disk — the exact same file, whether the app is running
locally (`http://localhost`) or from the hosted GitHub Pages site (both count as a "secure context"). After
linking:

- Every save, edit, or delete also writes the full record set to that file.
- Reopening the app tries to reconnect to the same file automatically (you may need to tap **Link to a File**
  again once per browser session to re-grant permission).
- **Unlink File** switches back to device-only storage.

This feature isn't available in Firefox, Safari, or mobile browsers — the menu option only appears when the
browser supports it.

## Running locally

No build step is required — it's plain HTML/CSS/JS.

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000` in a browser.
