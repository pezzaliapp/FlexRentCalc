// app.js - Versione aggiornata con correzione dei coefficienti e spese di contratto
let coefficients = {};
let expenses = {};

document.addEventListener("DOMContentLoaded", function() {
  // Aggiunge gli event listener agli input file
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
  if (!file.name.toLowerCase().endsWith(".csv")) {
    alert("Formato file non valido. Carica un file CSV.");
    return;
  }

  Papa.parse(file, {
    header: false,      // Se il CSV contiene una riga di intestazione, la saltiamo nel ciclo
    skipEmptyLines: true,
    complete: function(results) {
      console.log("Dati CSV elaborati:", results.data);
      const csvData = results.data;
      try {
        if (type === "coefficients") {
          coefficients = {};
          // Partiamo dalla seconda riga (indice 1) assumendo che la prima sia l'intestazione
          for (let i = 1; i < csvData.length; i++) {
            let row = csvData[i];
            if (row.length < 7) continue; // Salta righe incomplete
            let imp = parseFloat(row[0].replace(',', '.'));
            if (isNaN(imp)) continue;
            // Dividiamo per 100 per convertire il valore percentuale in decimale
            coefficients[imp] = {
              12: (parseFloat(row[1].replace(',', '.')) || 0) / 100,
              18: (parseFloat(row[2].replace(',', '.')) || 0) / 100,
              24: (parseFloat(row[3].replace(',', '.')) || 0) / 100,
              36: (parseFloat(row[4].replace(',', '.')) || 0) / 100,
              48: (parseFloat(row[5].replace(',', '.')) || 0) / 100,
              60: (parseFloat(row[6].replace(',', '.')) || 0) / 100
            };
          }
          alert("Coefficienti caricati correttamente!");
          console.log("Coefficienti:", coefficients);
        } else if (type === "expenses") {
          expenses = {};
          // Partiamo dalla seconda riga (indice 1) assumendo che la prima sia l'intestazione
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
        console.error("Errore nell'elaborazione dei dati CSV:", error);
        alert("Errore nel caricamento del file CSV.");
      }
    },
    error: function(error) {
      console.error("Errore nella lettura del file CSV:", error);
      alert("Errore nel caricamento del file CSV.");
    }
  });
}

/**
 * Cerca il coefficiente per l'importo inserito.
 * Se l'importo è inferiore al valore minimo presente, usa il coefficiente della chiave più piccola.
 * Altrimenti, seleziona la chiave più grande che sia minore o uguale all'importo.
 */
function getCoefficientForAmount(amount, duration) {
  const keys = Object.keys(coefficients).map(Number).sort((a, b) => a - b);
  if (keys.length === 0) return null;

  let selectedKey = keys[0];
  for (let i = 0; i < keys.length; i++) {
    if (amount >= keys[i]) {
      selectedKey = keys[i];
    } else {
      break;
    }
  }
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

  let coeff = getCoefficientForAmount(importo, durata);
  if (!coeff) {
    alert("Dati mancanti per l'importo selezionato. Carica un file CSV valido.");
    return;
  }

  let rataMensile = importo * coeff;

  // Calcolo delle spese di contratto secondo i range definiti nel CSV:
  // Ad esempio, il CSV dovrebbe contenere:
  // < 5000    → 75
  // 5000     → 100 (cioè da 5001 a 10000)
  // 10000    → 150 (da 10001 a 25000)
  // 25000    → 225 (da 25001 a 50000)
  // 50000    → 300 (da 50001 a 100000)
  // > 100000  → 300
  let speseContratto = 0;
  if (Object.keys(expenses).length > 0) {
    // Ordina le chiavi dei range delle spese in ordine crescente
    let expenseKeys = Object.keys(expenses).map(Number).sort((a, b) => a - b);
    let selectedExpenseKey = null;
    // Scorri le chiavi e seleziona il primo range per cui l'importo è minore o uguale
    for (let k of expenseKeys) {
      if (importo <= k) {
        selectedExpenseKey = k;
        break;
      }
    }
    // Se l'importo supera tutti i range, usa il più alto disponibile
    if (selectedExpenseKey === null) {
      selectedExpenseKey = expenseKeys[expenseKeys.length - 1];
    }
    speseContratto = expenses[selectedExpenseKey];
  } else {
    // In assenza di dati CSV per le spese, puoi decidere un valore di default
    speseContratto = 0;
  }

  document.getElementById("rataMensile").textContent = rataMensile.toFixed(2) + " €";
  document.getElementById("speseContratto").textContent = speseContratto.toFixed(2) + " €";
}
