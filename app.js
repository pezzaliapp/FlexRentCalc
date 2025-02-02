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

  // Se l'importo è inferiore a 5000, le spese di contratto sono forzate a 75€,
  // altrimenti viene cercata la spesa appropriata
  let speseContratto;
  if (importo < 5000) {
    speseContratto = 75;
  } else {
    speseContratto = Object.entries(expenses)
      .filter(([range, value]) => importo >= parseFloat(range))
      .sort((a, b) => parseFloat(b[0]) - parseFloat(a[0]))[0]?.[1] || 0;
  }

  document.getElementById("rataMensile").textContent = rataMensile.toFixed(2) + " €";
  document.getElementById("speseContratto").textContent = speseContratto.toFixed(2) + " €";
}
