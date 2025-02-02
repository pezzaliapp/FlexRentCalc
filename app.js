// app.js - Versione aggiornata con log di debug e gestione dei range delle spese

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
    header: false,      // Gestiamo manualmente eventuali intestazioni
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
  Le seguenti funzioni caricano i CSV verificando se la prima riga è un'intestazione.
  Se il primo campo della prima riga non è numerico, la riga viene saltata.
*/

function loadCoefficients(data) {
  coefficients = {}; // azzera i dati esistenti
  let startIndex = 0;
  if (data.length > 0 && isNaN(parseFloat(String(data[0][0]).trim().replace(',', '.')))) {
    startIndex = 1;
  }
  for (let i = startIndex; i < data.length; i++) {
    let row = data[i];
    console.log("Coefficienti - Riga " + i + ": ", row);
    if (row.length < 7) continue; // salta righe incomplete
    let key = parseFloat(String(row[0]).trim().replace(',', '.'));
    if (isNaN(key)) continue;
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

function loadExpenses(data) {
  expenses = {};
  let startIndex = 0;
  if (data.length > 0 && isNaN(parseFloat(String(data[0][0]).trim().replace(',', '.')))) {
    startIndex = 1;
  }
  for (let i = startIndex; i < data.length; i++) {
    let row = data[i];
    console.log("Spese - Riga " + i + ": ", row);
    if (row.length < 2) continue;
    let key = parseFloat(String(row[0]).trim().replace(',', '.'));
    if (isNaN(key)) continue;
    expenses[key] = parseFloat(String(row[1]).trim().replace(',', '.')) || 0;
  }
}

/**
 * Cerca il coefficiente per l'importo inserito.
 * Ordina le soglie dei coefficienti in ordine crescente e seleziona l'ultima soglia per cui l'importo è maggiore o uguale.
 */
function getCoefficientForAmount(amount, duration) {
  const keys = Object.keys(coefficients).map(Number).sort((a, b) => a - b);
  if (keys.length === 0) return null;
  let selectedKey = keys[0];
  for (let k of keys) {
    if (amount >= k) {
      selectedKey = k;
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
 * La logica per le spese è la seguente (in base ai limiti inferiori):
 *   - Se l'importo è ≥ 0 ma inferiore a 5001 → spesa = 75 €
 *   - Se l'importo è ≥ 5001 ma inferiore a 10001 → spesa = 100 €
 *   - Se l'importo è ≥ 10001 ma inferiore a 25001 → spesa = 150 €
 *   - Se l'importo è ≥ 25001 ma inferiore a 50001 → spesa = 225 €
 *   - Se l'importo è ≥ 50001 → spesa = 300 €
 * 
 * La funzione assume che il CSV delle spese sia strutturato con i limiti inferiori.
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

  // Calcolo delle spese di contratto usando i limiti inferiori dal CSV
  let speseContratto = 0;
  if (Object.keys(expenses).length > 0) {
    // Ordina le chiavi dei range in ordine crescente
    let expenseKeys = Object.keys(expenses).map(Number).sort((a, b) => a - b);
    console.log("Chiavi spese:", expenseKeys);
    let selectedExpenseKey = expenseKeys[0]; // se l'importo è inferiore a tutte le soglie, usa la minima
    for (let k of expenseKeys) {
      // Cerchiamo il massimo limite inferiore che non superi l'importo
      if (importo >= k) {
        selectedExpenseKey = k;
      } else {
        break;
      }
    }
    speseContratto = expenses[selectedExpenseKey];
    console.log("Importo:", importo, "selezionato range spese:", selectedExpenseKey, "→ spesa:", speseContratto);
  } else {
    speseContratto = 0;
  }

  document.getElementById("rataMensile").textContent = rataMensile.toFixed(2) + " €";
  document.getElementById("speseContratto").textContent = speseContratto.toFixed(2) + " €";
}
