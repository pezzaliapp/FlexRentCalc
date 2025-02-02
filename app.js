// app.js - Corretto calcolo della rata con precisione massima dei coefficienti
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

// Caricamento delle spese di contratto
function loadExpenses(data) {
  expenses = {};
  for (let i = 0; i < data.length; i++) {
    let row = data[i];
    if (row.length < 2) continue;

    let rangeText = row[0].split("-")[0].trim();
    rangeText = rangeText.replace(".", "").replace(",", ".");
    let lowerBound = parseFloat(rangeText);

    if (isNaN(lowerBound)) continue;

    expenses[lowerBound] = parseFloat(row[1].replace(",", ".")) || 0;
  }

  let sortedKeys = Object.keys(expenses).map(Number).sort((a, b) => a - b);
  let sortedExpenses = {};
  sortedKeys.forEach(key => {
    sortedExpenses[key] = expenses[key];
  });
  expenses = sortedExpenses;

  console.log("Spese ordinate:", expenses);
}

// Caricamento dei coefficienti con precisione massima
function loadCoefficients(data) {
  coefficients = {};
  for (let i = 0; i < data.length; i++) {
    let row = data[i];
    if (row.length < 7) continue;
    let key = parseFloat(row[0].replace('.', '').replace(',', '.'));
    if (isNaN(key)) continue;
    
    coefficients[key] = {
      12: parseFloat(row[1].replace('%', '').replace(',', '.')) / 100 || 0,
      18: parseFloat(row[2].replace('%', '').replace(',', '.')) / 100 || 0,
      24: parseFloat(row[3].replace('%', '').replace(',', '.')) / 100 || 0,
      36: parseFloat(row[4].replace('%', '').replace(',', '.')) / 100 || 0,
      48: parseFloat(row[5].replace('%', '').replace(',', '.')) / 100 || 0,
      60: parseFloat(row[6].replace('%', '').replace(',', '.')) / 100 || 0
    };
  }
  console.log("Coefficienti caricati con precisione massima:", coefficients);
}

// Seleziona il coefficiente corretto con precisione
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

  console.log("Importo:", amount, "Coefficiente esatto da:", selectedKey, "Durata:", duration, "Valore preciso:", coefficients[selectedKey][duration]);

  return coefficients[selectedKey]?.[duration] || null;
}
