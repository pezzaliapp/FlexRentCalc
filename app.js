// app.js - Aggiornato per leggere CSV invece di Excel
let coefficients = {};
let expenses = {};

function importCSV(fileInputId, type) {
    const fileInput = document.getElementById(fileInputId);
    if (fileInput.files.length === 0) {
        alert("Seleziona un file CSV.");
        return;
    }
    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = function (event) {
        try {
            const csvData = event.target.result.split("\n").map(row => row.split(";"));
            if (type === "coefficients") {
                coefficients = {};
                for (let i = 1; i < csvData.length; i++) {
                    let row = csvData[i];
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
            } else if (type === "expenses") {
                expenses = {};
                for (let i = 1; i < csvData.length; i++) {
                    let row = csvData[i];
                    let importoBeni = parseFloat(row[0]);
                    let spesaContratto = parseFloat(row[1]);
                    if (!isNaN(importoBeni) && !isNaN(spesaContratto)) {
                        expenses[importoBeni] = spesaContratto;
                    }
                }
                alert("Spese di contratto caricate correttamente!");
            }
        } catch (error) {
            console.error("Errore nella lettura del file CSV:", error);
            alert("Errore nel caricamento del file CSV.");
        }
    };
    reader.readAsText(file);
}

function calculateRent() {
    let importo = parseFloat(document.getElementById("importo").value);
    let durata = parseInt(document.getElementById("durata").value);
    
    if (!importo || !durata) {
        alert("Inserisci un importo e seleziona una durata.");
        return;
    }
    
    if (!coefficients[importo] || !coefficients[importo][durata]) {
        alert("Dati mancanti per l'importo selezionato. Carica un file CSV valido.");
        return;
    }
    
    let coeff = coefficients[importo][durata];
    let rataMensile = importo * coeff;

    let speseContratto = Object.entries(expenses).find(([range, value]) =>
        importo >= parseFloat(range))?.[1] || 0;
    
    document.getElementById("rataMensile").textContent = rataMensile.toFixed(2) + " €";
    document.getElementById("speseContratto").textContent = speseContratto.toFixed(2) + " €";
}
