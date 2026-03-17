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
      if (q(id)) q(id).value = "";
    });

  warrants = [];
  q("downloads").innerHTML = "";
  addWarrant();
}

function drawText(page, text, x, y, size = 10) {
  if (!text) return;

  page.drawText(String(text), {
    x,
    y,
    size,
    color: rgb(0, 0, 0)
  });
}

function drawWrappedText(page, text, x, y, maxCharsPerLine = 90, lineHeight = 11, size = 9, maxLines = 8) {
  if (!text) return;

  const words = String(text).split(/\s+/);
  let line = "";
  let currentY = y;
  let lines = 0;

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;

    if (testLine.length > maxCharsPerLine) {
      page.drawText(line, {
        x,
        y: currentY,
        size,
        color: rgb(0, 0, 0)
      });

      currentY -= lineHeight;
      lines++;
      line = word;

      if (lines >= maxLines) break;
    } else {
      line = testLine;
    }
  }

  if (line && lines < maxLines) {
    page.drawText(line, {
      x,
      y: currentY,
      size,
      color: rgb(0, 0, 0)
    });
  }
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

    const templateBytes = await response.arrayBuffer();

    for (let i = 0; i < warrants.length; i++) {
      const pdfDoc = await PDFDocument.load(templateBytes);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const page = pdfDoc.getPages()[0];
      page.setFont(font);

      const w = warrants[i];

      // Basic test mapping
      drawText(page, q("ori").value, 440, 735, 10);

      drawText(page, q("defName").value, 60, 650, 10);
      drawText(page, q("defAddress").value, 60, 624, 10);
      drawText(page, q("dob").value, 500, 572, 10);

      drawText(page, q("agency").value, 60, 490, 10);
      drawText(page, q("officerName").value, 275, 490, 10);
      drawText(page, q("rank").value, 470, 490, 10);

      drawText(page, q("badge").value, 60, 464, 10);
      drawText(page, q("officerPhone").value, 285, 464, 10);

      drawText(page, w.charge, 60, 382, 10);
      drawText(page, w.statute, 335, 382, 10);
      drawText(page, w.cdr, 505, 382, 10);

      drawText(page, q("incidentDate").value, 60, 356, 10);
      drawText(page, q("incidentTime").value, 185, 356, 10);
      drawText(page, q("caseNumber").value, 325, 356, 10);

      drawText(page, q("incidentLocation").value, 60, 330, 10);

      drawWrappedText(page, w.narrative, 55, 170, 90, 11, 9, 8);

      drawText(page, q("officerName").value, 60, 108, 10);
      drawText(page, q("officerName").value, 315, 108, 10);

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const defName = q("defName").value || "Defendant";
      const fileName = `${defName} Warrant ${i + 1}.pdf`;

      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.textContent = `Download ${fileName}`;
      link.target = "_blank";
      link.rel = "noopener";

      downloads.appendChild(link);
    }
  } catch (err) {
    alert("PDF generation failed: " + err.message);
  }
}
