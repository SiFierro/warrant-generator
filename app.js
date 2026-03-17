let warrants = [];

window.onload = () => {
  loadOfficer();
};

function saveOfficer() {
  const data = {
    name: officerName.value,
    rank: rank.value,
    badge: badge.value,
    agency: agency.value,
    ori: ori.value
  };
  localStorage.setItem("officer", JSON.stringify(data));
  alert("Saved");
}

function loadOfficer() {
  const data = JSON.parse(localStorage.getItem("officer"));
  if (!data) return;
  officerName.value = data.name;
  rank.value = data.rank;
  badge.value = data.badge;
  agency.value = data.agency;
  ori.value = data.ori;
}

function addWarrant(copyIndex = null) {
  let w = {
    charge: "",
    statute: "",
    cdr: "",
    narrative: ""
  };

  if (copyIndex !== null) {
    w = {...warrants[copyIndex]};
  }

  warrants.push(w);
  renderWarrants();
}

function renderWarrants() {
  const container = document.getElementById("warrants");
  container.innerHTML = "";

  warrants.forEach((w, i) => {
    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <h3>Warrant ${i+1}</h3>

      <input placeholder="Charge"
        value="${w.charge}"
        onchange="update(${i}, 'charge', this.value)">

      <input placeholder="Statute"
        value="${w.statute}"
        onchange="update(${i}, 'statute', this.value)">

      <input placeholder="CDR Code"
        value="${w.cdr}"
        onchange="update(${i}, 'cdr', this.value)">

      <textarea placeholder="Elements / Narrative"
        onchange="update(${i}, 'narrative', this.value)">
        ${w.narrative}
      </textarea>

      <button onclick="addWarrant(${i})">Duplicate</button>
      <button onclick="removeWarrant(${i})">Delete</button>
    `;

    container.appendChild(div);
  });
}

function update(index, field, value) {
  warrants[index][field] = value;
}

function removeWarrant(i) {
  warrants.splice(i, 1);
  renderWarrants();
}

function clearCase() {
  if (confirm("Clear all case data?")) {
    warrants = [];
    document.querySelectorAll("input, textarea").forEach(el => {
      if (!el.closest(".card")?.innerText.includes("Officer"))
        el.value = "";
    });
    renderWarrants();
  }
}

async function generatePDFs() {
  alert("PDF generation coming next step — we’ll wire your actual AD111 fields next.");
}
