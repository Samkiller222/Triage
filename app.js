(function () {
  "use strict";

  var STORAGE_KEY = "triageEntries.v1";

  var FIELDS = [
    { key: "dateOfReferral", label: "Date of Referral / Triage 1", type: "date", section: "Referral Details", required: true },
    { key: "triager", label: "Name of Triager", type: "text", section: "Referral Details" },
    { key: "firstName", label: "Name", type: "text", section: "Referral Details", required: true },
    { key: "surname", label: "Surname", type: "text", section: "Referral Details", required: true },
    { key: "gender", label: "Gender", type: "select", options: ["Female", "Male"], section: "Referral Details" },
    { key: "idNumber", label: "ID", type: "text", section: "Referral Details" },
    { key: "mobile", label: "Mobile", type: "tel", section: "Referral Details" },
    { key: "email", label: "Email", type: "email", section: "Referral Details" },
    { key: "residence", label: "Residence", type: "select", options: ["Malta", "Gozo"], section: "Referral Details" },
    { key: "timepoint", label: "Perinatal Timepoint of Referral", type: "select", options: ["T1", "T2", "T3", "T4", "T5"], section: "Referral Details" },

    { key: "whooley1", label: "Whooley Q1", type: "select", options: ["Positive", "Negative"], section: "Screening Scores" },
    { key: "whooley2", label: "Whooley Q2", type: "select", options: ["Positive", "Negative"], section: "Screening Scores" },
    { key: "whooley3", label: "Whooley Q3", type: "select", options: ["Positive", "Negative"], section: "Screening Scores" },
    { key: "whooley4", label: "Whooley Q4", type: "select", options: ["Positive", "Negative"], section: "Screening Scores" },
    { key: "whooley5", label: "Whooley Q5", type: "select", options: ["Positive", "Negative"], section: "Screening Scores" },
    { key: "whooley6", label: "Whooley Q6", type: "select", options: ["Positive", "Negative"], section: "Screening Scores" },
    { key: "epdsTotal", label: "EPDS-Total", type: "number", section: "Screening Scores" },
    { key: "epdsQ10", label: "EPDS Q10", type: "select", options: ["Positive", "Negative"], section: "Screening Scores" },
    { key: "gad7Total", label: "GAD-7 Total", type: "number", section: "Screening Scores" },
    { key: "rdasTotal", label: "RDAS Total", type: "number", section: "Screening Scores" },
    { key: "riskCategoryScores", label: "Risk Category according to Scores", type: "select", options: ["A", "B", "C"], section: "Screening Scores" },

    { key: "firstCall", label: "1st Telephone Call", type: "select", options: ["Successful", "Unsuccessful", "Declined Triage"], section: "Triage" },
    { key: "riskCategoryTriage", label: "Risk Category after Triage", type: "select", options: ["A", "B", "C", "Triage Failed"], section: "Triage" },
    { key: "triageOutcome", label: "Triage Outcome", type: "select", options: ["Watchful Waiting", "In-Person Assessment", "Emergency Referral", "Declined In-Person Assessment", "Triage Failed"], section: "Triage" },
    { key: "discussedCoordinator", label: "Discussed with Co-ordinator", type: "select", options: ["Yes", "No"], section: "Triage" },

    { key: "catADate2", label: "Category A - Date of 2nd Call", type: "date", section: "Category A - Follow-up Calls" },
    { key: "catAOutcome2", label: "Category A - 2nd Call Outcome", type: "select", options: ["Successful", "Unsuccesful", "Not applicable (Cat B or C)"], section: "Category A - Follow-up Calls" },
    { key: "catADate3", label: "Category A - Date of 3rd Call", type: "date", section: "Category A - Follow-up Calls" },
    { key: "catAOutcome3", label: "Category A - 3rd Call Outcome", type: "select", options: ["Succesful", "Unsuccesful", "Not applicable (Cat B or C)"], section: "Category A - Follow-up Calls" },
    { key: "catATriageOutcome", label: "Category A - 2nd / 3rd Triage Outcome", type: "select", options: ["In-Person Assessment", "Emergency Referral", "Declined In Person Assessment", "MDT Discussion (x3 DNA)", "Not applicable (Cat B or C)"], section: "Category A - Follow-up Calls" },

    { key: "catBDate", label: "Category B - Date of In Person Assessment", type: "date", section: "Category B - In-Person Assessment" },
    { key: "requiresMDT", label: "Requires MDT Discussion", type: "select", options: ["Yes", "No"], section: "Category B - In-Person Assessment" },

    { key: "catCDateTime", label: "Category C - Date & Time of AE Referral", type: "datetime-local", section: "Category C - Emergency Referral" },
    { key: "catCHandover", label: "Category C - Handover to MDH emergency/Psychiatry - Specify", type: "text", section: "Category C - Emergency Referral" },
    { key: "catCOutcome", label: "Category C - Outcome Post AE review", type: "select", options: ["Admission", "Discharge with Perinatal CMHT FU", "Discharged but refused perinatal CMHT", "CRHT"], section: "Category C - Emergency Referral" },

    { key: "status", label: "Status", type: "select", options: ["Active", "Closed"], section: "Status" }
  ];

  var SECTIONS = [];
  FIELDS.forEach(function (f) {
    if (SECTIONS.indexOf(f.section) === -1) SECTIONS.push(f.section);
  });

  var RISK_SECTION_MAP = {
    A: "Category A - Follow-up Calls",
    B: "Category B - In-Person Assessment",
    C: "Category C - Emergency Referral"
  };
  var CONDITIONAL_SECTIONS = ["Category A - Follow-up Calls", "Category B - In-Person Assessment", "Category C - Emergency Referral"];

  // ---------- Storage ----------

  function loadEntries() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error("Failed to read stored entries", e);
      return [];
    }
  }

  function saveEntries(entries) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }

  var entries = loadEntries();
  var editingId = null;
  var currentDetailId = null;

  function uid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return "id-" + Date.now() + "-" + Math.random().toString(16).slice(2);
  }

  // ---------- Views ----------

  var views = {
    records: document.getElementById("view-records"),
    form: document.getElementById("view-form"),
    detail: document.getElementById("view-detail")
  };

  function showView(name) {
    Object.keys(views).forEach(function (k) {
      views[k].classList.toggle("hidden", k !== name);
    });
    window.scrollTo(0, 0);
  }

  // ---------- Side nav ----------

  var sideNav = document.getElementById("sideNav");
  var navOverlay = document.getElementById("navOverlay");
  var menuToggle = document.getElementById("menuToggle");

  function openNav() {
    sideNav.classList.add("open");
    navOverlay.classList.remove("hidden");
    sideNav.setAttribute("aria-hidden", "false");
    menuToggle.setAttribute("aria-expanded", "true");
  }
  function closeNav() {
    sideNav.classList.remove("open");
    navOverlay.classList.add("hidden");
    sideNav.setAttribute("aria-hidden", "true");
    menuToggle.setAttribute("aria-expanded", "false");
  }

  menuToggle.addEventListener("click", openNav);
  document.getElementById("closeNav").addEventListener("click", closeNav);
  navOverlay.addEventListener("click", closeNav);

  document.querySelectorAll(".nav-link[data-view]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      closeNav();
      var view = btn.getAttribute("data-view");
      if (view === "form") {
        startNewEntry();
      } else {
        renderRecords();
        showView("records");
      }
    });
  });

  document.getElementById("newEntryBtn").addEventListener("click", startNewEntry);

  // ---------- Toast ----------

  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.remove("hidden");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.add("hidden"); }, 2200);
  }

  // ---------- Form ----------

  var formEl = document.getElementById("triageForm");
  var formTitle = document.getElementById("formTitle");

  function buildForm() {
    var html = "";
    SECTIONS.forEach(function (section) {
      html += '<div class="form-section" data-section="' + escapeHtml(section) + '"><h3>' + escapeHtml(section) + "</h3>";
      FIELDS.filter(function (f) { return f.section === section; }).forEach(function (f) {
        html += '<div class="field"><label for="f_' + f.key + '">' + escapeHtml(f.label) +
          (f.required ? ' <span class="req">*</span>' : "") + "</label>";
        if (f.type === "select") {
          html += '<select id="f_' + f.key + '" name="' + f.key + '"' + (f.required ? " required" : "") + ">";
          html += '<option value=""></option>';
          f.options.forEach(function (opt) {
            html += '<option value="' + escapeHtml(opt) + '">' + escapeHtml(opt) + "</option>";
          });
          html += "</select>";
        } else {
          html += '<input id="f_' + f.key + '" name="' + f.key + '" type="' + f.type + '"' +
            (f.required ? " required" : "") + ">";
        }
        html += "</div>";
      });
      html += "</div>";
    });
    html += '<div class="form-actions">' +
      '<button type="button" id="cancelFormBtn" class="btn btn-ghost">Cancel</button>' +
      '<button type="submit" class="btn btn-primary btn-block">Save Entry</button>' +
      "</div>";
    formEl.innerHTML = html;
    document.getElementById("cancelFormBtn").addEventListener("click", function () {
      renderRecords();
      showView("records");
    });
    var riskEl = document.getElementById("f_riskCategoryTriage");
    if (riskEl) riskEl.addEventListener("change", updateConditionalSections);
    updateConditionalSections();
  }

  function updateConditionalSections() {
    var riskEl = document.getElementById("f_riskCategoryTriage");
    var showSection = riskEl ? RISK_SECTION_MAP[riskEl.value] : null;
    CONDITIONAL_SECTIONS.forEach(function (sectionName) {
      var el = formEl.querySelector('[data-section="' + CSS.escape(sectionName) + '"]');
      if (el) el.classList.toggle("hidden", sectionName !== showSection);
    });
  }

  function startNewEntry() {
    editingId = null;
    formTitle.textContent = "New Triage Entry";
    buildForm();
    formEl.reset();
    var statusEl = document.getElementById("f_status");
    if (statusEl) statusEl.value = "Active";
    showView("form");
  }

  function startEditEntry(id) {
    var entry = entries.find(function (e) { return e.id === id; });
    if (!entry) return;
    editingId = id;
    formTitle.textContent = "Amend Triage Entry";
    buildForm();
    FIELDS.forEach(function (f) {
      var el = document.getElementById("f_" + f.key);
      if (el && entry[f.key] != null) el.value = entry[f.key];
    });
    updateConditionalSections();
    showView("form");
  }

  formEl.addEventListener("submit", function (e) {
    e.preventDefault();
    var data = {};
    FIELDS.forEach(function (f) {
      var el = document.getElementById("f_" + f.key);
      data[f.key] = el ? el.value.trim() : "";
    });

    if (!data.firstName || !data.surname || !data.dateOfReferral) {
      toast("Please fill in Date, Name and Surname.");
      return;
    }

    if (editingId) {
      var idx = entries.findIndex(function (e) { return e.id === editingId; });
      if (idx > -1) {
        data.id = editingId;
        data.createdAt = entries[idx].createdAt;
        data.updatedAt = new Date().toISOString();
        entries[idx] = data;
      }
      toast("Entry updated.");
    } else {
      data.id = uid();
      data.createdAt = new Date().toISOString();
      data.updatedAt = data.createdAt;
      entries.push(data);
      toast("Entry saved.");
    }
    saveEntries(entries);
    editingId = null;
    renderRecords();
    showView("records");
  });

  // ---------- Records list ----------

  var recordsList = document.getElementById("recordsList");
  var recordCount = document.getElementById("recordCount");
  var emptyState = document.getElementById("emptyState");
  var searchInput = document.getElementById("searchInput");
  var filterTimepoint = document.getElementById("filterTimepoint");
  var filterRisk = document.getElementById("filterRisk");

  [searchInput, filterTimepoint, filterRisk].forEach(function (el) {
    el.addEventListener("input", renderRecords);
    el.addEventListener("change", renderRecords);
  });

  function riskChipClass(risk) {
    if (risk === "A") return "chip risk-A";
    if (risk === "B") return "chip risk-B";
    if (risk === "C") return "chip risk-C";
    return "chip";
  }

  function renderRecords() {
    var q = searchInput.value.trim().toLowerCase();
    var tp = filterTimepoint.value;
    var risk = filterRisk.value;

    var filtered = entries.filter(function (e) {
      if (tp && e.timepoint !== tp) return false;
      if (risk && e.riskCategoryTriage !== risk) return false;
      if (q) {
        var hay = [e.firstName, e.surname, e.idNumber, e.mobile, e.email].join(" ").toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });

    filtered.sort(function (a, b) {
      return (b.dateOfReferral || "").localeCompare(a.dateOfReferral || "") ||
        (b.updatedAt || "").localeCompare(a.updatedAt || "");
    });

    recordCount.textContent = filtered.length + " record" + (filtered.length === 1 ? "" : "s") +
      (entries.length !== filtered.length ? " (of " + entries.length + " total)" : "");

    emptyState.classList.toggle("hidden", entries.length !== 0);

    recordsList.innerHTML = filtered.map(function (e) {
      var name = escapeHtml((e.firstName || "") + " " + (e.surname || "")).trim() || "(no name)";
      var chips = "";
      if (e.timepoint) chips += '<span class="chip">' + escapeHtml(e.timepoint) + "</span>";
      if (e.riskCategoryTriage) chips += '<span class="' + riskChipClass(e.riskCategoryTriage) + '">Risk ' + escapeHtml(e.riskCategoryTriage) + "</span>";
      if (e.triageOutcome) chips += '<span class="chip">' + escapeHtml(e.triageOutcome) + "</span>";
      if (e.status) chips += '<span class="chip status-' + escapeHtml(e.status.toLowerCase()) + '">' + escapeHtml(e.status) + "</span>";
      return '<div class="record-card" data-id="' + e.id + '">' +
        '<div class="record-card-top"><span class="record-card-name">' + name + '</span>' +
        '<span class="record-card-date">' + escapeHtml(e.dateOfReferral || "") + "</span></div>" +
        '<div class="record-card-meta">' + chips + "</div>" +
        "</div>";
    }).join("");

    recordsList.querySelectorAll(".record-card").forEach(function (card) {
      card.addEventListener("click", function () {
        openDetail(card.getAttribute("data-id"));
      });
    });
  }

  // ---------- Detail view ----------

  var detailTitle = document.getElementById("detailTitle");
  var detailBody = document.getElementById("detailBody");

  function openDetail(id) {
    var entry = entries.find(function (e) { return e.id === id; });
    if (!entry) return;
    currentDetailId = id;
    detailTitle.textContent = ((entry.firstName || "") + " " + (entry.surname || "")).trim() || "(no name)";

    var html = "";
    SECTIONS.forEach(function (section) {
      var sectionFields = FIELDS.filter(function (f) { return f.section === section && entry[f.key]; });
      if (!sectionFields.length) return;
      html += '<div class="detail-section-title">' + escapeHtml(section) + "</div>";
      sectionFields.forEach(function (f) {
        html += '<div class="detail-row"><dt>' + escapeHtml(f.label) + "</dt><dd>" + escapeHtml(entry[f.key]) + "</dd></div>";
      });
    });
    if (!html) html = '<div class="detail-row"><dt>No details recorded yet.</dt><dd></dd></div>';
    detailBody.innerHTML = html;
    showView("detail");
  }

  document.getElementById("backToRecords").addEventListener("click", function () {
    renderRecords();
    showView("records");
  });

  document.getElementById("editRecordBtn").addEventListener("click", function () {
    if (currentDetailId) startEditEntry(currentDetailId);
  });

  document.getElementById("deleteRecordBtn").addEventListener("click", function () {
    if (!currentDetailId) return;
    if (!confirm("Delete this triage entry? This cannot be undone.")) return;
    entries = entries.filter(function (e) { return e.id !== currentDetailId; });
    saveEntries(entries);
    toast("Entry deleted.");
    renderRecords();
    showView("records");
  });

  // ---------- Export ----------

  function entriesToRows() {
    var header = FIELDS.map(function (f) { return f.label; });
    var rows = entries.slice().sort(function (a, b) {
      return (a.dateOfReferral || "").localeCompare(b.dateOfReferral || "");
    }).map(function (e) {
      return FIELDS.map(function (f) { return e[f.key] || ""; });
    });
    return { header: header, rows: rows };
  }

  function downloadBlob(blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function csvEscape(val) {
    var s = String(val == null ? "" : val);
    if (/[",\n]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"';
    return s;
  }

  document.getElementById("exportCsvBtn").addEventListener("click", function () {
    closeNav();
    if (!entries.length) { toast("No records to export."); return; }
    var data = entriesToRows();
    var lines = [data.header.map(csvEscape).join(",")];
    data.rows.forEach(function (r) { lines.push(r.map(csvEscape).join(",")); });
    var blob = new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8;" });
    downloadBlob(blob, "triage-log-" + todayStamp() + ".csv");
  });

  document.getElementById("exportXlsxBtn").addEventListener("click", function () {
    closeNav();
    if (!entries.length) { toast("No records to export."); return; }
    if (typeof XLSX === "undefined") {
      toast("Excel export needs an internet connection. Try Export as CSV instead.");
      return;
    }
    var data = entriesToRows();
    var ws = XLSX.utils.aoa_to_sheet([data.header].concat(data.rows));
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Triage Log");
    XLSX.writeFile(wb, "triage-log-" + todayStamp() + ".xlsx");
  });

  document.getElementById("clearDataBtn").addEventListener("click", function () {
    closeNav();
    if (!entries.length) { toast("No data to clear."); return; }
    if (!confirm("This will permanently delete all " + entries.length + " triage entries stored on this device. Continue?")) return;
    entries = [];
    saveEntries(entries);
    toast("All data cleared.");
    renderRecords();
    showView("records");
  });

  function todayStamp() {
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  // ---------- Utils ----------

  function escapeHtml(str) {
    return String(str == null ? "" : str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // ---------- Init ----------

  renderRecords();
  showView("records");
})();
