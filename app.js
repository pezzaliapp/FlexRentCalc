// app.js
let coefficients = {};
let expenses = {};

function importCoefficients() {
    const fileInput = document.getElementById("fileCoefficients");
    if (fileInput.files.length === 0) {
        alert("Seleziona un file di coefficienti.");
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
            let startIndex = jsonData.findIndex(row => row.includes("Importo")) + 1;
            
            for (let i = startIndex; i < jsonData.length; i++) {
                let row = jsonData[i];
                let importo = parseFloat(row[0]);
                if (isNaN(importo)) continue;
                coefficients[importo] = {
                    12: parseFloat(row[1]) || 0,
                    18: parseFloat(row[2]) || 0,
                    24: parseFloat(row[3]) || 0,
                    36: parseFloat(row[4]) || 0,
                    48: parseFloat(row[5]) || 0,
                    60: parseFloat(row[6]) || 0
                };
            }
            alert("Coefficienti caricati correttamente!");
        } catch (error) {
            console.error("Errore nel caricamento del file Excel:", error);
            alert("Errore nel caricamento del file di coefficienti.");
        }
    };
    reader.readAsArrayBuffer(file);
}

function importExpenses() {
    const fileInput = document.getElementById("fileExpenses");
    if (fileInput.files.length === 0) {
        alert("Seleziona un file delle spese di contratto.");
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

            expenses = {};
            for (let i = 1; i < jsonData.length; i++) {
                let row = jsonData[i];
                let range = row[0]; 
                let spesa = parseFloat(row[1]);
                expenses[range] = spesa;
            }
            alert("Spese di contratto caricate correttamente!");
        } catch (error) {
            console.error("Errore nel caricamento del file Excel:", error);
            alert("Errore nel caricamento del file delle spese.");
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
        alert("Dati mancanti per l'importo selezionato. Assicurati di aver caricato il file corretto.");
        return;
    }

    let coeff = coefficients[importo][durata];
    let rataMensile = importo * coeff;

    let speseContratto = Object.entries(expenses).find(([range, value]) =>
        range.includes("<") ? importo < parseFloat(range.replace("< ", "")) :
        range.includes("-") ? importo >= parseFloat(range.split("-")[0]) && importo <= parseFloat(range.split("-")[1]) :
        importo >= parseFloat(range)
    )?.[1] || 0;

    document.getElementById("rataMensile").textContent = rataMensile.toFixed(2) + " €";
    document.getElementById("speseContratto").textContent = speseContratto.toFixed(2) + " €";
}
