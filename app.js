// app.js - Versione aggiornata con correzione dei coefficienti e spese di contratto,
// e con rilevazione automatica dell'intestazione nei file CSV

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
    header: false,      // Non usiamo l'opzione header; gestiamo manualmente eventuali intestazioni
    skipEmptyLines: true,
    complete: function(results) {
      console.log("Dati CSV elaborati:", results.data);
      const csvData = results.data;
      try {
        if (type === "coefficients") {
          loadCoefficients(csvData);
          alert("Coefficienti caricati correttamente!");
          console.log("Coefficienti:", coefficients);
          localStorage.setItem("coefficients", JSON.stringify(coefficients));
        } else if (type === "expenses") {
          loadExpenses(csvData);
          alert("Spese di contratto caricate correttamente!");
          console.log("Spese:", expenses);
          localStorage.setItem("expenses", JSON.stringify(expenses));
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

/* 
  Funzioni per caricare i CSV con rilevazione automatica dell'intestazione.
  Se la prima riga contiene un valore non numerico nel primo campo, viene considerata un'intestazione.
*/

// Carica i coefficienti (sostituendo eventuali dati già presenti)
function loadCoefficients(data) {
  coefficients = {}; // azzera i dati esistenti
  let startIndex = 0;
  if (data.length > 0 && isNaN(parseFloat(String(data[0][0]).trim().replace(',', '.')))) {
    startIndex = 1;
  }
  for (let i = startIndex; i < data.length; i++) {
    let row = data[i];
    if (row.length < 7) continue; // Salta righe incomplete
    let key = parseFloat(String(row[0]).trim().replace(',', '.'));
    if (isNaN(key)) continue;
    // I coefficienti sono espressi in percentuale; li convertiamo in decimale dividendo per 100
    coefficients[key] = {
      12: (parseFloat(String(row[1]).trim().replace(',', '.')) || 0) / 100,
      18: (parseFloat(String(row[2]).trim().replace(',', '.')) || 0) / 100,
      24: (parseFloat(String(row[3]).trim().replace(',', '.')) || 0) / 100,
      36: (parseFloat(String(row[4]).trim().replace(',', '.')) || 0) / 100,
      48: (parseFloat(String(row[5]).trim().replace(',', '.')) || 0) / 100,
      60: (parseFloat(String(row[6]).trim().replace(',', '.')) || 0) / 100
    };
  }
}

// Carica le spese di contratto (sostituendo eventuali dati già presenti)
function loadExpenses(data) {
  expenses = {};
  let startIndex = 0;
  if (data.length > 0 && isNaN(parseFloat(String(data[0][0]).trim().replace(',', '.')))) {
    startIndex = 1;
  }
  for (let i = startIndex; i < data.length; i++) {
    let row = data[i];
    if (row.length < 2) continue;
    let key = parseFloat(String(row[0]).trim().replace(',', '.'));
    if (isNaN(key)) continue;
    expenses[key] = parseFloat(String(row[1]).trim().replace(',', '.')) || 0;
  }
}

/**
 * Cerca il coefficiente per l'importo inserito.
 * La logica: si ordinano le soglie dei coefficienti in ordine crescente e si seleziona l'ultima soglia
 * per cui l'importo è maggiore o uguale (se l'importo supera tutte le soglie, si usa quella più alta).
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

/**
 * Calcola il noleggio utilizzando i coefficienti e le spese di contratto caricati.
 * Le spese seguono la logica:
 *   - Se l'importo è ≤ 5000 → 75 €
 *   - Se è compreso tra 5001 e 10000 → 100 €
 *   - Se è compreso tra 10001 e 25000 → 150 €
 *   - Se è compreso tra 25001 e 50000 → 225 €
 *   - Se è compreso tra 50001 e 100000 → 300 €
 *   - Se è > 100000 → 300 €
 */
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

  // Calcolo delle spese di contratto secondo la logica del CSV:
  // Vogliamo utilizzare i range indicati nel CSV:
  //   - Se importo ≤ 5000, spesa = 75
  //   - Se 5001 ≤ importo ≤ 10000, spesa = 100
  //   - Se 10001 ≤ importo ≤ 25000, spesa = 150
  //   - Se 25001 ≤ importo ≤ 50000, spesa = 225
  //   - Se 50001 ≤ importo ≤ 100000, spesa = 300
  //   - Se importo > 100000, spesa = 300
  let speseContratto = 0;
  if (Object.keys(expenses).length > 0) {
    // Ordina le chiavi dei range delle spese in ordine crescente
    let expenseKeys = Object.keys(expenses).map(Number).sort((a, b) => a - b);
    let selectedExpenseKey = null;
    // Scorri le chiavi: cerca il primo range per cui l'importo è minore o uguale al limite
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
    speseContratto = 0; // Valore di default se non sono caricati dati CSV per le spese
  }

  document.getElementById("rataMensile").textContent = rataMensile.toFixed(2) + " €";
  document.getElementById("speseContratto").textContent = speseContratto.toFixed(2) + " €";
}
