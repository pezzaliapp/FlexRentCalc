// app.js - Versione aggiornata per leggere file CSV con gestione avanzata
let coefficients = {};
let expenses = {};

document.addEventListener("DOMContentLoaded", function() {
    // Assicurati che gli input abbiano questi ID anche nel file HTML:
    // <input type="file" id="fileCoefficients" />
    // <input type="file" id="fileExpenses" />
    document.getElementById("fileCoefficients").addEventListener("change", function() {
        importCSV(this, "coefficients");
    });
    document.getElementById("fileExpenses").addEventListener("change", function() {
        importCSV(this, "expenses");
    });
});

function importCSV(input, type) {
    if (input.files.length === 0) {
        alert("Seleziona un file CSV.");
        return;
    }
    const file = input.files[0];
    if (!file.name.endsWith(".csv")) {
        alert("Formato file non valido. Carica un file CSV.");
        return;
    }
    const reader = new FileReader();
    reader.onload = function (event) {
        try {
            // Rimuove eventuale BOM e uniforma i ritorni a capo
            let csvText = event.target.result.replace(/^\uFEFF/, '').replace(/\r/g, '');
            console.log("CSV caricato:", csvText);
            
            // Divide il file in righe e usa sia ',' che ';' come delimitatori
            const csvData = csvText.split("\n").map(row => row.split(/[,;]+/));
            console.log("Dati CSV elaborati:", csvData);
            
            // Gestione dei coefficienti (si assume che la prima riga sia l'intestazione)
            if (type === "coefficients") {
                coefficients = {};
                for (let i = 1; i < csvData.length; i++) {
                    let row = csvData[i];
                    if (row.length < 7) continue; // Salta righe incomplete
                    let importo = parseFloat(row[0].replace(',', '.'));
                    if (isNaN(importo)) continue;
                    coefficients[importo] = {
                        12: parseFloat(row[1].replace(',', '.')) || 0,
                        18: parseFloat(row[2].replace(',', '.')) || 0,
                        24: parseFloat(row[3].replace(',', '.')) || 0,
                        36: parseFloat(row[4].replace(',', '.')) || 0,
                        48: parseFloat(row[5].replace(',', '.')) || 0,
                        60: parseFloat(row[6].replace(',', '.')) || 0
                    };
                }
                alert("Coefficienti caricati correttamente!");
            } 
            // Gestione delle spese di contratto (si assume che la prima riga sia l'intestazione)
            else if (type === "expenses") {
                expenses = {};
                for (let i = 1; i < csvData.length; i++) {
                    let row = csvData[i];
                    if (row.length < 2) continue;
                    let importoBeni = parseFloat(row[0].replace(',', '.'));
                    let spesaContratto = parseFloat(row[1].replace(',', '.'));
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

    // Cerca il range più appropriato per le spese di contratto
    let speseContratto = Object.entries(expenses).find(([range, value]) =>
        importo >= parseFloat(range))?.[1] || 0;
    
    document.getElementById("rataMensile").textContent = rataMensile.toFixed(2) + " €";
    document.getElementById("speseContratto").textContent = speseContratto.toFixed(2) + " €";
}
