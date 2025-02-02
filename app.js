// app.js - Versione aggiornata con ricerca del coefficiente più vicino

let coefficients = {};
let expenses = {};

document.addEventListener("DOMContentLoaded", function() {
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
            // Rimuove BOM ed uniforma i ritorni a capo
            let csvText = event.target.result.replace(/^\uFEFF/, '').replace(/\r/g, '');
            console.log("CSV caricato:", csvText);
            
            // Divide il file in righe e usa sia ',' che ';' come delimitatori
            const csvData = csvText.split("\n").map(row => row.split(/[,;]+/));
            console.log("Dati CSV elaborati:", csvData);
            
            if (type === "coefficients") {
                coefficients = {};
                // Si assume che la prima riga sia l'intestazione
                for (let i = 1; i < csvData.length; i++) {
                    let row = csvData[i];
                    if (row.length < 7) continue; // Salta righe incomplete
                    let imp = parseFloat(row[0].replace(',', '.'));
                    if (isNaN(imp)) continue;
                    coefficients[imp] = {
                        12: parseFloat(row[1].replace(',', '.')) || 0,
                        18: parseFloat(row[2].replace(',', '.')) || 0,
                        24: parseFloat(row[3].replace(',', '.')) || 0,
                        36: parseFloat(row[4].replace(',', '.')) || 0,
                        48: parseFloat(row[5].replace(',', '.')) || 0,
                        60: parseFloat(row[6].replace(',', '.')) || 0
                    };
                }
                alert("Coefficienti caricati correttamente!");
                console.log("Coefficienti:", coefficients);
            } else if (type === "expenses") {
                expenses = {};
                // Si assume che la prima riga sia l'intestazione
                for (let i = 1; i < csvData.length; i++) {
                    let row = csvData[i];
                    if (row.length < 2) continue;
                    let impBeni = parseFloat(row[0].replace(',', '.'));
                    let spesa = parseFloat(row[1].replace(',', '.'));
                    if (!isNaN(impBeni) && !isNaN(spesa)) {
                        expenses[impBeni] = spesa;
                    }
                }
                alert("Spese di contratto caricate correttamente!");
                console.log("Expenses:", expenses);
            }
        } catch (error) {
            console.error("Errore nella lettura del file CSV:", error);
            alert("Errore nel caricamento del file CSV.");
        }
    };
    reader.readAsText(file);
}

/**
 * Cerca il coefficiente per l'importo inserito.
 * Restituisce il coefficiente associato alla chiave più alta
 * che sia minore o uguale all'importo.
 */
function getCoefficientForAmount(amount, duration) {
    // Ottieni le chiavi (importi) come numeri e ordinale in modo crescente
    const keys = Object.keys(coefficients).map(Number).sort((a, b) => a - b);
    if (keys.length === 0) return null;
    
    // Se l'importo è inferiore alla chiave minima, non troviamo dati
    if (amount < keys[0]) return null;
    
    // Trova la chiave più grande che sia minore o uguale all'importo
    let selectedKey = keys[0];
    for (let i = 0; i < keys.length; i++) {
        if (keys[i] <= amount) {
            selectedKey = keys[i];
        } else {
            break;
        }
    }
    // Verifica se per quella chiave esiste il coefficiente per la durata richiesta
    if (coefficients[selectedKey] && coefficients[selectedKey][duration]) {
        return coefficients[selectedKey][duration];
    }
    return null;
}

function calculateRent() {
    let importo = parseFloat(document.getElementById("importo").value);
    let durata = parseInt(document.getElementById("durata").value);
    
    if (!importo || !durata) {
        alert("Inserisci un importo e seleziona una durata.");
        return;
    }
    
    // Ottieni il coefficiente usando la funzione di ricerca
    let coeff = getCoefficientForAmount(importo, durata);
    if (!coeff) {
        alert("Dati mancanti per l'importo selezionato. Carica un file CSV valido.");
        return;
    }
    
    let rataMensile = importo * coeff;
    
    // Cerca la spesa di contratto: usa il range più adeguato
    let speseContratto = Object.entries(expenses)
        .filter(([range, value]) => importo >= parseFloat(range))
        .sort((a, b) => parseFloat(b[0]) - parseFloat(a[0]))[0]?.[1] || 0;
    
    document.getElementById("rataMensile").textContent = rataMensile.toFixed(2) + " €";
    document.getElementById("speseContratto").textContent = speseContratto.toFixed(2) + " €";
}
