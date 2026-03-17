let warrants = [];

window.onload = function () {
  loadOfficer();
  addWarrant();
};

function q(id) {
  return document.getElementById(id);
}

function saveOfficer() {
  const data = {
    officerName: q("officerName").value,
    rank: q("rank").value,
    badge: q("badge").value,
    agency: q("agency").value,
    ori: q("ori").value,
    officerPhone: q("officerPhone").value
  };

  localStorage.setItem("officerDefaults", JSON.stringify(data));
  alert("Officer defaults saved.");
}

function loadOfficer() {
  const raw = localStorage.getItem("officerDefaults");
  if (!raw) return;

  const data = JSON.parse(raw);

  Object.keys(data).forEach(function (key) {
    const el = q(key);
    if (el) el.value = data[key];
  });
}

function addWarrant(copyIndex) {
  let w = {
    charge: "",
    statute: "",
    cdr: "",
    narrative: ""
  };

  if (typeof copyIndex === "number" && warrants[copyIndex]) {
    w = {
      charge: warrants[copyIndex].charge,
      statute: warrants[copyIndex].statute,
      cdr: warrants[copyIndex].cdr,
      narrative: warrants[copyIndex].narrative
    };
  }

  warrants.push(w);
  renderWarrants();
}

function updateWarrant(index, field, value) {
  warrants[index][field] = value;
}

function removeWarrant(index) {
  warrants.splice(index, 1);
  renderWarrants();
}

function renderWarrants() {
  const container = q("warrants");
  container.innerHTML = "";

  warrants.forEach(function (w, i) {
    const block = document.createElement("div");
    block.className = "warrant-block";

    block.innerHTML = `
      <h3>Warrant ${i + 1}</h3>

      <input
        placeholder="Charge"
        value="${escapeHtml(w.charge)}"
        onchange="updateWarrant(${i}, 'charge', this.value)"
      />

      <input
        placeholder="Statute"
        value="${escapeHtml(w.statute)}"
        onchange="updateWarrant(${i}, 'statute', this.value)"
      />

      <input
        placeholder="CDR Code"
        value="${escapeHtml(w.cdr)}"
        onchange="updateWarrant(${i}, 'cdr', this.value)"
      />

      <textarea
        placeholder="Narrative"
        onchange="updateWarrant(${i}, 'narrative', this.value)"
      >${escapeHtml(w.narrative)}</textarea>

      <div class="row">
        <button onclick="addWarrant(${i})">Duplicate</button>
        <button onclick="removeWarrant(${i})">Delete</button>
      </div>
    `;

    container.appendChild(block);
  });
}

function clearCase() {
  const ids = [
    "defName",
    "dob",
    "defAddress",
    "incidentDate",
    "incidentTime",
    "caseNumber",
    "incidentLocation"
  ];

  ids.forEach(function (id) {
    const el = q(id);
    if (el) el.value = "";
  });

  warrants = [];
  q("downloads").innerHTML = "";
  addWarrant();
}

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function generatePDFs() {
  const downloads = q("downloads");
  downloads.innerHTML = "";

  const defName = q("defName").value || "Test Defendant";

  const link = document.createElement("a");
  link.href = "AD111.pdf";
  link.download = defName + " Warrant 1.pdf";
  link.textContent = "Download " + defName + " Warrant 1.pdf";

  downloads.appendChild(link);
  link.click();
}
