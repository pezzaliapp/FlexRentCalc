// app.js
let coefficients = {};

function importCoefficients() {
    const fileInput = document.getElementById("fileUpload");
    if (fileInput.files.length === 0) {
        alert("Seleziona un file Excel.");
        return;
    }
    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = function (event) {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        coefficients = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        alert("Coefficienti caricati!");
    };
    reader.readAsArrayBuffer(file);
}

function toggleManualEntry() {
    const manualEntry = document.getElementById("manualEntry");
    manualEntry.style.display = manualEntry.style.display === "none" ? "block" : "none";
}

function addCoefficient() {
    let importo = document.getElementById("importo").value;
    let durata = document.getElementById("durata").value;
    let coefficiente = document.getElementById("coefficiente").value;
    if (!importo || !durata || !coefficiente) {
        alert("Inserisci tutti i valori.");
        return;
    }
    if (!coefficients[importo]) coefficients[importo] = {};
    coefficients[importo][durata] = parseFloat(coefficiente);
    alert("Coefficiente aggiunto!");
}

function calculateRent() {
    let importo = parseFloat(document.getElementById("importo").value);
    let durata = parseInt(document.getElementById("durata").value);
    if (!importo || !durata || !coefficients[importo] || !coefficients[importo][durata]) {
        alert("Dati non validi o coefficienti mancanti.");
        return;
    }
    let coeff = coefficients[importo][durata];
    let rataMensile = importo * coeff;
    let speseContratto = importo < 5000 ? 75 : importo < 10000 ? 100 : importo < 25000 ? 150 : importo < 50000 ? 225 : 300;
    let costoGiornaliero = rataMensile / 22;
    let costoOrario = costoGiornaliero / 8;

    document.getElementById("rataMensile").textContent = rataMensile.toFixed(2) + " €";
    document.getElementById("speseContratto").textContent = speseContratto.toFixed(2) + " €";
    document.getElementById("costoGiornaliero").textContent = costoGiornaliero.toFixed(2) + " €";
    document.getElementById("costoOrario").textContent = costoOrario.toFixed(2) + " €";
}
