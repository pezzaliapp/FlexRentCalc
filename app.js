// app.js - Versione aggiornata con gestione corretta delle spese di contratto
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
    header: false,
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

// Funzione per caricare i coefficienti
function loadCoefficients(data) {
  coefficients = {};
  for (let i = 0; i < data.length; i++) {
    let row = data[i];
    if (row.length < 7) continue;
    let key = parseFloat(row[0].replace(',', '.'));
    if (isNaN(key)) continue;
    coefficients[key] = {
      12: (parseFloat(row[1].replace(',', '.')) || 0) / 100,
      18: (parseFloat(row[2].replace(',', '.')) || 0) / 100,
      24: (parseFloat(row[3].replace(',', '.')) || 0) / 100,
      36: (parseFloat(row[4].replace(',', '.')) || 0) / 100,
      48: (parseFloat(row[5].replace(',', '.')) || 0) / 100,
      60: (parseFloat(row[6].replace(',', '.')) || 0) / 100
    };
  }
}

// Funzione per caricare le spese di contratto
function loadExpenses(data) {
  expenses = {};
  for (let i = 0; i < data.length; i++) {
    let row = data[i];
    if (row.length < 2) continue;
    
    // Estraiamo il limite inferiore dell'intervallo
    let rangeText = row[0].split("-")[0].trim(); 
    rangeText = rangeText.replace(".", "").replace(",", ".");
    let lowerBound = parseFloat(rangeText);

    if (isNaN(lowerBound)) continue;

    expenses[lowerBound] = parseFloat(row[1].replace(',', '.')) || 0;
  }

  // Ordiniamo le soglie delle spese per essere sicuri che siano in ordine crescente
  let sortedKeys = Object.keys(expenses).map(Number).sort((a, b) => a - b);
  let sortedExpenses = {};
  sortedKeys.forEach(key => {
    sortedExpenses[key] = expenses[key];
  });
  expenses = sortedExpenses;

  console.log("Spese ordinate:", expenses);
}

/**
 * Cerca il coefficiente per l'importo inserito.
 * Seleziona l'ultima soglia disponibile che è minore o uguale all'importo.
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
  return coefficients[selectedKey]?.[duration] || null;
}

/**
 * Calcola il noleggio utilizzando i coefficienti e le spese di contratto.
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

  // Trova la spesa di contratto corretta basata sulle soglie caricate
  let speseContratto = 0;
  if (Object.keys(expenses).length > 0) {
    let expenseKeys = Object.keys(expenses).map(Number).sort((a, b) => a - b);
    let selectedExpenseKey = expenseKeys[0];
    for (let k of expenseKeys) {
      if (importo >= k) {
        selectedExpenseKey = k;
      } else {
        break;
      }
    }
    speseContratto = expenses[selectedExpenseKey] || 0;
  }

  console.log("Importo:", importo, "Spese selezionate:", speseContratto);

  document.getElementById("rataMensile").textContent = rataMensile.toFixed(2) + " €";
  document.getElementById("speseContratto").textContent = speseContratto.toFixed(2) + " €";
}
