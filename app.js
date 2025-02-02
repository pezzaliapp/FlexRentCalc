// app.js

// Variabili globali per contenere i dati CSV
let coefficients = {};
let expenses = {};

// Al caricamento della pagina, imposta gli event listener e ripristina i dati da localStorage (se presenti)
document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("fileCoefficients").addEventListener("change", function() {
    importCSV(this, "coefficients");
  });
  document.getElementById("fileExpenses").addEventListener("change", function() {
    importCSV(this, "expenses");
  });
  
  // Ripristino dati salvati (se presenti)
  let storedCoeffs = localStorage.getItem("coefficients");
  if (storedCoeffs) {
    coefficients = JSON.parse(storedCoeffs);
    console.log("Coefficienti ripristinati da localStorage:", coefficients);
  }
  let storedExpenses = localStorage.getItem("expenses");
  if (storedExpenses) {
    expenses = JSON.parse(storedExpenses);
    console.log("Spese ripristinate da localStorage:", expenses);
  }
  
  // Modalità scura: impostazione iniziale
  if (JSON.parse(localStorage.getItem('darkMode'))) {
    document.body.classList.add('dark-mode');
  }
  
  // Ascoltatore per il toggle della modalità scura
  document.getElementById('darkModeToggle').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
  });
});

// Funzione per importare il CSV utilizzando PapaParse
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
    delimiter: ";",       // Forza l'uso del punto e virgola come separatore
    skipEmptyLines: true,
    header: false,
    // dynamicTyping: true non lo usiamo qui perché vogliamo controllare manualmente la conversione
    complete: function(results) {
      console.log("Dati CSV elaborati:", results.data);
      const data = results.data;
      try {
        if (type === "coefficients") {
          // Se già esistono coefficienti, chiedi se sostituirli oppure unirli
          if (Object.keys(coefficients).length > 0) {
            if (confirm("I coefficienti CSV sono già stati caricati. Vuoi sostituirli? (OK = sostituisci, Annulla = unisci)")) {
              loadCoefficients(data);
            } else {
              mergeCoefficients(data);
            }
          } else {
            loadCoefficients(data);
          }
          localStorage.setItem("coefficients", JSON.stringify(coefficients));
        } else if (type === "expenses") {
          if (Object.keys(expenses).length > 0) {
            if (confirm("Le spese CSV sono già state caricate. Vuoi sostituirle? (OK = sostituisci, Annulla = unisci)")) {
              loadExpenses(data);
            } else {
              mergeExpenses(data);
            }
          } else {
            loadExpenses(data);
          }
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

// FUNZIONI DI CARICAMENTO DEI CSV
// I dati vengono processati riga per riga: se la riga non contiene almeno il numero di colonne atteso, viene saltata.
// Vengono usati .trim() e parseFloat(...replace(',', '.')) per convertire correttamente i numeri.

function loadCoefficients(data) {
  coefficients = {}; // azzera i dati esistenti
  for (let i = 0; i < data.length; i++) {
    let row = data[i];
    console.log("Coefficienti - Riga " + i + ": ", row);
    if (row.length < 7) continue; // salta righe incomplete
    // Prova a convertire il primo campo in numero (soglia)
    let key = parseFloat(String(row[0]).trim().replace(',', '.'));
    if (isNaN(key)) continue; // ignora eventuali righe di intestazione
    coefficients[key] = {
      12: (parseFloat(String(row[1]).trim().replace(',', '.')) || 0) / 100,
      18: (parseFloat(String(row[2]).trim().replace(',', '.')) || 0) / 100,
      24: (parseFloat(String(row[3]).trim().replace(',', '.')) || 0) / 100,
      36: (parseFloat(String(row[4]).trim().replace(',', '.')) || 0) / 100,
      48: (parseFloat(String(row[5]).trim().replace(',', '.')) || 0) / 100,
      60: (parseFloat(String(row[6]).trim().replace(',', '.')) || 0) / 100
    };
  }
  alert("Coefficienti caricati correttamente!");
  console.log("Coefficienti:", coefficients);
}

function mergeCoefficients(data) {
  for (let i = 0; i < data.length; i++) {
    let row = data[i];
    console.log("Merge coefficienti - Riga " + i + ": ", row);
    if (row.length < 7) continue;
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
  alert("Coefficienti aggiornati (merge) correttamente!");
  console.log("Coefficienti dopo merge:", coefficients);
}

function loadExpenses(data) {
  expenses = {};
  for (let i = 0; i < data.length; i++) {
    let row = data[i];
    console.log("Spese - Riga " + i + ": ", row);
    if (row.length < 2) continue;
    let key = parseFloat(String(row[0]).trim().replace(',', '.'));
    if (isNaN(key)) continue;
    expenses[key] = parseFloat(String(row[1]).trim().replace(',', '.')) || 0;
  }
  alert("Spese di contratto caricate correttamente!");
  console.log("Spese:", expenses);
}

function mergeExpenses(data) {
  for (let i = 0; i < data.length; i++) {
    let row = data[i];
    console.log("Merge spese - Riga " + i + ": ", row);
    if (row.length < 2) continue;
    let key = parseFloat(String(row[0]).trim().replace(',', '.'));
    if (isNaN(key)) continue;
    expenses[key] = parseFloat(String(row[1]).trim().replace(',', '.')) || 0;
  }
  alert("Spese di contratto aggiornate (merge) correttamente!");
  console.log("Spese dopo merge:", expenses);
}

// Funzioni di conversione e formattazione

function parseEuropeanFloat(value) {
  if (!value) return 0;
  value = value.replace(/€/g, '')
               .replace(/\s/g, '')
               .replace(/\./g, '')
               .replace(',', '.');
  return parseFloat(value) || 0;
}
  
function formatNumber(value) {
  return value.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Calcola il noleggio utilizzando i coefficienti ed eventuali spese.
 * Se i dati CSV non sono stati caricati, viene mostrato un alert.
 */
function calculateRent() {
  let importo = parseEuropeanFloat(document.getElementById("importo").value);
  let durata = parseInt(document.getElementById("durata").value);
  if (!importo || !durata) {
    alert("Inserisci un importo e seleziona una durata.");
    return;
  }
  
  if (Object.keys(coefficients).length === 0) {
    alert("Dati dei coefficienti mancanti. Carica il file CSV dei coefficienti.");
    return;
  }
  
  // Seleziona il coefficiente corretto:
  // Ordina le chiavi (soglie) in ordine crescente
  let keys = Object.keys(coefficients).map(Number).sort((a, b) => a - b);
  let selectedKey = null;
  for (let k of keys) {
    if (importo <= k) {
      selectedKey = k;
      break;
    }
  }
  // Se l'importo supera tutte le soglie, usa il valore più alto
  if (selectedKey === null) {
    selectedKey = keys[keys.length - 1];
  }
  
  if (!coefficients[selectedKey] || !coefficients[selectedKey][durata]) {
    alert("Nessun coefficiente disponibile per l'importo inserito.");
    return;
  }
  
  let coeff = coefficients[selectedKey][durata];
  let rataMensile = importo * coeff;
  
  // Calcolo delle spese di contratto:
  // Se l'importo è inferiore a 5001, le spese fisse sono 75€
  let speseContratto = 0;
  if (importo < 5001) {
    speseContratto = 75;
  } else {
    if (Object.keys(expenses).length > 0) {
      let expenseKeys = Object.keys(expenses).map(Number).sort((a, b) => a - b);
      let selectedExpenseKey = null;
      for (let ek of expenseKeys) {
        if (importo <= ek) {
          selectedExpenseKey = ek;
          break;
        }
      }
      if (selectedExpenseKey === null) {
        selectedExpenseKey = expenseKeys[expenseKeys.length - 1];
      }
      speseContratto = expenses[selectedExpenseKey];
    }
  }
  
  // Calcola costo giornaliero e orario (si assumono 22 giorni lavorativi e 8 ore al giorno)
  let costoGiornaliero = rataMensile / 22;
  let costoOrario = costoGiornaliero / 8;
  
  // Aggiorna i risultati nel DOM
  document.getElementById("rataMensile").textContent = formatNumber(rataMensile) + " €";
  document.getElementById("speseContratto").textContent = formatNumber(speseContratto) + " €";
  document.getElementById("costoGiornaliero").textContent = formatNumber(costoGiornaliero) + " €";
  document.getElementById("costoOrario").textContent = formatNumber(costoOrario) + " €";
}
