/ app.js - Corretto calcolo della rata mensile e selezione precisa del coefficiente
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

// Caricamento dei coefficienti con gestione precisa dei valori
function loadCoefficients(data) {
  coefficients = {};
  for (let i = 0; i < data.length; i++) {
    let row = data[i];
    if (row.length < 7) continue;
    let key = parseFloat(row[0].replace(',', '.'));
    if (isNaN(key)) continue;
    coefficients[key] = {
      12: parseFloat(row[1].replace(',', '.')) / 100 || 0,
      18: parseFloat(row[2].replace(',', '.')) / 100 || 0,
      24: parseFloat(row[3].replace(',', '.')) / 100 || 0,
      36: parseFloat(row[4].replace(',', '.')) / 100 || 0,
      48: parseFloat(row[5].replace(',', '.')) / 100 || 0,
      60: parseFloat(row[6].replace(',', '.')) / 100 || 0
    };
  }
  console.log("Coefficienti caricati:", coefficients);
}

// Caricamento delle spese con estrazione dei limiti inferiori
function loadExpenses(data) {
  expenses = {};
  for (let i = 0; i < data.length; i++) {
    let row = data[i];
    if (row.length < 2) continue;

    let rangeText = row[0].split("-")[0].trim();
    rangeText = rangeText.replace(".", "").replace(",", ".");
    let lowerBound = parseFloat(rangeText);

    if (isNaN(lowerBound)) continue;

    expenses[lowerBound] = parseFloat(row[1].replace(',', '.')) || 0;
  }

  let sortedKeys = Object.keys(expenses).map(Number).sort((a, b) => a - b);
  let sortedExpenses = {};
  sortedKeys.forEach(key => {
    sortedExpenses[key] = expenses[key];
  });
  expenses = sortedExpenses;

  console.log("Spese ordinate:", expenses);
}

// Seleziona il coefficiente corretto per l'importo e la durata
function getCoefficientForAmount(amount, duration) {
  const keys = Object.keys(coefficients).map(Number).sort((a, b) => a - b);
  if (keys.length === 0) return null;

  let selectedKey = null;
  for (let i = 0; i < keys.length; i++) {
    if (amount <= keys[i]) {
      selectedKey = keys[i];
      break;
    }
  }
  if (selectedKey === null) {
    selectedKey = keys[keys.length - 1]; // Usa il valore massimo se l'importo è superiore a tutte le soglie
  }

  console.log("Importo:", amount, "Coefficiente selezionato da:", selectedKey, "Durata:", duration, "Valore:", coefficients[selectedKey][duration]);

  return coefficients[selectedKey]?.[duration] || null;
}

// Calcolo della rata, spese e costi giornalieri/orari
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

  // Calcolo costo giornaliero e orario
  let costoGiornaliero = rataMensile / 22; // Supponiamo 22 giorni lavorativi al mese
  let costoOrario = costoGiornaliero / 8; // Supponiamo 8 ore lavorative al giorno

  console.log("Importo:", importo, "Rata Mensile:", rataMensile, "Spese selezionate:", speseContratto);
  console.log("Costo Giornaliero:", costoGiornaliero, "Costo Orario:", costoOrario);

  document.getElementById("rataMensile").textContent = rataMensile.toFixed(2) + " €";
  document.getElementById("speseContratto").textContent = speseContratto.toFixed(2) + " €";
  document.getElementById("costoGiornaliero").textContent = costoGiornaliero.toFixed(2) + " €";
  document.getElementById("costoOrario").textContent = costoOrario.toFixed(2) + " €";
}
