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
        try {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

            coefficients = {};
            for (let i = 2; i < jsonData.length; i++) {
                let row = jsonData[i];
                let importo = row[1];
                if (!importo || isNaN(importo)) continue;
                coefficients[importo] = {
                    12: row[2] || 0,
                    18: row[3] || 0,
                    24: row[4] || 0,
                    36: row[5] || 0,
                    48: row[6] || 0,
                    60: row[7] || 0
                };
            }
            console.log("Coefficienti caricati:", coefficients);
            alert("Coefficienti caricati correttamente!");
        } catch (error) {
            console.error("Errore nel caricamento del file Excel:", error);
            alert("Errore nel caricamento del file. Controlla la struttura del file Excel.");
        }
    };
    reader.readAsArrayBuffer(file);
}

function calculateRent() {
    let importo = parseFloat(document.getElementById("importo").value);
    let durata = parseInt(document.getElementById("durata").value);

    if (!importo || !durata) {
        alert("Inserisci un importo e seleziona una durata.");
        return;
    }

    if (!coefficients[importo] || !coefficients[importo][durata]) {
        alert("Dati mancanti per l'importo selezionato. Assicurati di aver caricato un file valido.");
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

function toggleManualEntry() {
    const manualEntry = document.getElementById("manualEntry");
    manualEntry.style.display = manualEntry.style.display === "none" ? "block" : "none";
}

function addCoefficient() {
    let importo = parseFloat(document.getElementById("importoManual").value);
    let durata = parseInt(document.getElementById("durata").value);
    let coefficiente = parseFloat(document.getElementById("coefficiente").value);

    if (!importo || !durata || !coefficiente) {
        alert("Inserisci tutti i valori.");
        return;
    }

    if (!coefficients[importo]) coefficients[importo] = {};
    coefficients[importo][durata] = coefficiente;
    alert("Coefficiente aggiunto manualmente!");
}
