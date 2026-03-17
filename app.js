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

  Object.keys(data).forEach(key => {
    if (q(key)) q(key).value = data[key];
  });
}

function addWarrant(copyIndex = null) {
  let w = {
    charge: "",
    statute: "",
    cdr: "",
    narrative: ""
  };

  if (copyIndex !== null && warrants[copyIndex]) {
    w = { ...warrants[copyIndex] };
  }

  warrants.push(w);
  renderWarrants();
}

function removeWarrant(index) {
  warrants.splice(index, 1);
  renderWarrants();
}

function updateWarrant(index, field, value) {
  warrants[index][field] = value;
}

function renderWarrants() {
  const container = q("warrants");
  container.innerHTML = "";

  warrants.forEach((w, i) => {
    const div = document.createElement("div");
    div.className = "warrant-block";

    div.innerHTML = `
      <h3>Warrant ${i + 1}</h3>

      <input placeholder="Charge"
        value="${escapeHtml(w.charge)}"
        onchange="updateWarrant(${i}, 'charge', this.value)" />

      <input placeholder="Statute"
        value="${escapeHtml(w.statute)}"
        onchange="updateWarrant(${i}, 'statute', this.value)" />

      <input placeholder="CDR Code"
        value="${escapeHtml(w.cdr)}"
        onchange="updateWarrant(${i}, 'cdr', this.value)" />

      <textarea placeholder="Narrative"
        onchange="updateWarrant(${i}, 'narrative', this.value)">${escapeHtml(w.narrative)}</textarea>

      <div class="row">
        <button onclick="addWarrant(${i})">Duplicate</button>
        <button onclick="removeWarrant(${i})">Delete</button>
      </div>
    `;

    container.appendChild(div);
  });
}

function clearCase() {
  if (!confirm("Clear case data?")) return;

  ["defName","dob","defAddress","incidentDate","incidentTime","caseNumber","incidentLocation"]
    .forEach(id => {
      if (q(id)) q(id).value = "";
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

async function generatePDFs() {
  const downloads = q("downloads");
  downloads.innerHTML = "";

  if (!warrants.length) {
    alert("Add at least one warrant");
    return;
  }

  try {
    const response = await fetch("./AD111.pdf");

    if (!response.ok) {
      alert("Could not load AD111.pdf");
      return;
    }

    const pdfBlob = await response.blob();
    const defName = q("defName").value || "Test Defendant";

    warrants.forEach((w, i) => {
      const fileName = `${defName} Warrant ${i + 1}.pdf`;
      const objectUrl = URL.createObjectURL(pdfBlob);

      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = fileName;
      link.textContent = `Download ${fileName}`;

      downloads.appendChild(link);
    });
  } catch (err) {
    alert("PDF load failed: " + err.message);
  }
}
