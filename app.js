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
    dynamicTyping: true,  // Converte automaticamente i numeri
    skipEmptyLines: true,
    header: false,
    complete: function(results) {
      console.log("Dati CSV elaborati:", results.data);
      const data = results.data;
      try {
        if (type === "coefficients") {
          if (Object.keys(coefficients).length > 0) {
            if (confirm("I coefficienti CSV sono già stati caricati. Vuoi sostituirli? (Premi OK per sostituire, Annulla per unire)")) {
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
            if (confirm("Le spese CSV sono già state caricate. Vuoi sostituirle? (Premi OK per sostituire, Annulla per unire)")) {
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

// Carica (sostituendo) i coefficienti dal CSV
function loadCoefficients(data) {
  coefficients = {}; // azzera i dati esistenti
  for (let i = 0; i < data.length; i++) {
    let row = data[i];
    if (row.length < 7) continue; // Salta righe incomplete
    let key = Number(String(row[0]).trim());
    if (isNaN(key)) continue; // Salta la riga di intestazione (o righe non valide)
    coefficients[key] = {
      12: (Number(row[1]) || 0) / 100,
      18: (Number(row[2]) || 0) / 100,
      24: (Number(row[3]) || 0) / 100,
      36: (Number(row[4]) || 0) / 100,
      48: (Number(row[5]) || 0) / 100,
      60: (Number(row[6]) || 0) / 100
    };
  }
  alert("Coefficienti caricati correttamente!");
  console.log("Coefficienti:", coefficients);
}

// Unisce (merge) i coefficienti dal CSV con quelli già esistenti
function mergeCoefficients(data) {
  for (let i = 0; i < data.length; i++) {
    let row = data[i];
    if (row.length < 7) continue;
    let key = Number(String(row[0]).trim());
    if (isNaN(key)) continue;
    coefficients[key] = {
      12: (Number(row[1]) || 0) / 100,
      18: (Number(row[2]) || 0) / 100,
      24: (Number(row[3]) || 0) / 100,
      36: (Number(row[4]) || 0) / 100,
      48: (Number(row[5]) || 0) / 100,
      60: (Number(row[6]) || 0) / 100
    };
  }
  alert("Coefficienti aggiornati (merge) correttamente!");
  console.log("Coefficienti dopo merge:", coefficients);
}

// Carica (sostituendo) le spese dal CSV
function loadExpenses(data) {
  expenses = {};
  for (let i = 0; i < data.length; i++) {
    let row = data[i];
    if (row.length < 2) continue;
    let key = Number(String(row[0]).trim());
    if (isNaN(key)) continue;
    expenses[key] = Number(row[1]) || 0;
  }
  alert("Spese di contratto caricate correttamente!");
  console.log("Spese:", expenses);
}

// Unisce (merge) le spese dal CSV con quelle già esistenti
function mergeExpenses(data) {
  for (let i = 0; i < data.length; i++) {
    let row = data[i];
    if (row.length < 2) continue;
    let key = Number(String(row[0]).trim());
    if (isNaN(key)) continue;
    expenses[key] = Number(row[1]) || 0;
  }
  alert("Spese di contratto aggiornate (merge) correttamente!");
  console.log("Spese dopo merge:", expenses);
}

// Converte una stringa in formato europeo in numero
function parseEuropeanFloat(value) {
  if (!value) return 0;
  value = value.replace(/€/g, '')
               .replace(/\s/g, '')
               .replace(/\./g, '')
               .replace(',', '.');
  return parseFloat(value) || 0;
}
  
// Formatta un numero in formato europeo
function formatNumber(value) {
  return value.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Calcola il noleggio utilizzando i coefficienti e le spese caricati.
 * Se i dati CSV non sono disponibili, viene mostrato un alert.
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
  
  // Selezione del coefficiente:
  // Ordina le chiavi (importi) in ordine crescente
  let keys = Object.keys(coefficients).map(Number).sort((a, b) => a - b);
  let selectedKey = null;
  // Cerca il primo range per cui l'importo inserito è minore o uguale
  for (let k of keys) {
    if (importo <= k) {
      selectedKey = k;
      break;
    }
  }
  // Se nessun range è trovato (importo superiore a tutti), usa il più alto disponibile
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
      // Ordina le chiavi delle spese in ordine crescente
      let expenseKeys = Object.keys(expenses).map(Number).sort((a, b) => a - b);
      let expenseKey = null;
      for (let ek of expenseKeys) {
        if (importo <= ek) {
          expenseKey = ek;
          break;
        }
      }
      // Se non viene trovato alcun range, usa il più alto disponibile
      if (expenseKey === null) {
        expenseKey = expenseKeys[expenseKeys.length - 1];
      }
      speseContratto = expenses[expenseKey];
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
