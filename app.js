const { PDFDocument, StandardFonts, rgb } = PDFLib;

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
  Object.keys(data).forEach((key) => {
    const el = q(key);
    if (el) el.value = data[key];
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

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
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

  ["defName", "dob", "defAddress", "incidentDate", "incidentTime", "caseNumber", "incidentLocation"]
    .forEach((id) => {
      const el = q(id);
      if (el) el.value = "";
    });

  warrants = [];
  q("downloads").innerHTML = "";
  addWarrant();
}

function drawText(page, text, x, y, size = 12) {
  if (!text) return;
  page.drawText(String(text), {
    x,
    y,
    size,
    color: rgb(1, 0, 0) // RED so it is obvious
  });
}

async function generatePDFs() {
  const downloads = q("downloads");
  downloads.innerHTML = "";

  try {
    const response = await fetch("./AD111.pdf?v=" + Date.now());
    if (!response.ok) {
      alert("Could not load AD111.pdf");
      return;
    }

    const templateBytes = await response.arrayBuffer();
    const pdfDoc = await PDFDocument.load(templateBytes);
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const page = pdfDoc.getPages()[0];
    page.setFont(font);

    // giant obvious test text
    drawText(page, "TEST PDF WRITING WORKS", 140, 760, 18);
    drawText(page, "NAME: " + (q("defName").value || "NO NAME"), 140, 730, 16);
    drawText(page, "CHARGE: " + ((warrants[0] && warrants[0].charge) || "NO CHARGE"), 140, 705, 16);

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "TEST-WRITING.pdf";
    link.textContent = "Download TEST-WRITING.pdf";
    downloads.appendChild(link);
  } catch (err) {
    alert("PDF generation failed: " + err.message);
  }
}
