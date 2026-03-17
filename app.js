let warrants = [];

window.onload = function () {
  loadOfficer();
  addWarrant();
};

// helper
function q(id) {
  return document.getElementById(id);
}

//
// OFFICER SAVE / LOAD
//
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

//
// WARRANT HANDLING
//
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
        value="${w.charge}"
        onchange="updateWarrant(${i}, 'charge', this.value)" />

      <input placeholder="Statute"
        value="${w.statute}"
        onchange="updateWarrant(${i}, 'statute', this.value)" />

      <input placeholder="CDR Code"
        value="${w.cdr}"
        onchange="updateWarrant(${i}, 'cdr', this.value)" />

      <textarea placeholder="Narrative"
        onchange="updateWarrant(${i}, 'narrative', this.value)">${w.narrative}</textarea>

      <div class="row">
        <button onclick="addWarrant(${i})">Duplicate</button>
        <button onclick="removeWarrant(${i})">Delete</button>
      </div>
    `;

    container.appendChild(div);
  });
}

//
// CLEAR
//
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

//
// GENERATE PDF (SAFE TEST VERSION)
//
function generatePDFs() {
  const downloads = q("downloads");
  downloads.innerHTML = "";

  if (!warrants.length) {
    alert("Add at least one warrant");
    return;
  }

  const defName = q("defName").value || "Test Defendant";

  // create ONE test download link per warrant
  warrants.forEach((w, i) => {
    const fileName = `${defName} Warrant ${i + 1}.pdf`;

    const link = document.createElement("a");
    link.href = "AD111.pdf"; // your uploaded PDF
    link.download = fileName;
    link.textContent = `Tap to download ${fileName}`;
    link.target = "_blank";

    downloads.appendChild(link);
  });
}
