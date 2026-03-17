const { PDFDocument, StandardFonts, rgb } = PDFLib;

let warrants = [];

window.onload = () => {
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
  alert("Saved");
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
  if (!confirm("Clear case?")) return;

  ["defName","dob","defAddress","incidentDate","incidentTime","caseNumber","incidentLocation"]
    .forEach(id => q(id).value = "");

  warrants = [];
  q("downloads").innerHTML = "";
  addWarrant();
}

//
// DRAW HELPERS
//
function drawText(page, text, x, y) {
  if (!text) return;

  page.drawText(String(text), {
    x,
    y,
    size: 10,
    color: rgb(0, 0, 0)
  });
}

function drawWrapped(page, text, x, y) {
  if (!text) return;

  const words = text.split(" ");
  let line = "";
  let yPos = y;

  words.forEach(word => {
    const test = line + word + " ";

    if (test.length > 90) {
      page.drawText(line, { x, y: yPos, size: 9 });
      line = word + " ";
      yPos -= 12;
    } else {
      line = test;
    }
  });

  if (line) {
    page.drawText(line, { x, y: yPos, size: 9 });
  }
}

//
// MAIN GENERATOR
//
async function generatePDFs() {
  if (!warrants.length) {
    alert("Add a warrant first");
    return;
  }

  const pdfBytes = await fetch("AD111.pdf").then(r => r.arrayBuffer());

  q("downloads").innerHTML = "";

  for (let i = 0; i < warrants.length; i++) {

    const pdfDoc = await PDFDocument.load(pdfBytes);
    const page = pdfDoc.getPages()[0];
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    page.setFont(font);

    const w = warrants[i];

    // 🔹 BASIC TEST FIELDS ONLY

    drawText(page, q("ori").value, 440, 735);

    drawText(page, q("defName").value, 60, 650);
    drawText(page, q("defAddress").value, 60, 624);
    drawText(page, q("dob").value, 500, 572);

    drawText(page, q("agency").value, 60, 490);
    drawText(page, q("officerName").value, 275, 490);
    drawText(page, q("rank").value, 470, 490);

    drawText(page, q("badge").value, 60, 464);
    drawText(page, q("officerPhone").value, 285, 464);

    drawText(page, w.charge, 60, 382);
    drawText(page, w.statute, 335, 382);
    drawText(page, w.cdr, 505, 382);

    drawText(page, q("incidentDate").value, 60, 356);
    drawText(page, q("incidentTime").value, 185, 356);
    drawText(page, q("caseNumber").value, 325, 356);

    drawText(page, q("incidentLocation").value, 60, 330);

    drawWrapped(page, w.narrative, 55, 170);

    drawText(page, q("officerName").value, 60, 108);
    drawText(page, q("officerName").value, 315, 108);

    // save
    const bytes = await pdfDoc.save();

    const name = (q("defName").value || "Defendant") + " Warrant " + (i + 1) + ".pdf";

    const blob = new Blob([bytes], { type: "application/pdf" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = name;
    link.textContent = "Download " + name;

    q("downloads").appendChild(link);

    download(blob, name, "application/pdf");
  }
}
