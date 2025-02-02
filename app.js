// app.js

// Variabili globali per contenere i dati CSV
let coefficients = {};
let expenses = {};

// Al caricamento della pagina, impostiamo gli event listener e ripristiniamo i dati dal localStorage (se presenti)
document.addEventListener("DOMContentLoaded", function() {
  // Event listener per il caricamento dei file CSV
  document.getElementById("fileCoefficients").addEventListener("change", function() {
    importCSV(this, "coefficients");
  });
  document.getElementById("fileExpenses").addEventListener("change", function() {
    importCSV(this, "expenses");
  });
  
  // Ripristina eventuali dati salvati in localStorage
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

// Funzione di importazione CSV che utilizza PapaParse
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
    header: false,        // Il CSV può avere o meno un'intestazione
    skipEmptyLines: true,
    complete: function(results) {
      console.log("Dati CSV elaborati:", results.data);
      const csvData = results.data;
      try {
        if (type === "coefficients") {
          // Se abbiamo già dei coefficienti, chiediamo all'utente se sostituirli
          if (Object.keys(coefficients).length > 0) {
            if (confirm("I coefficienti CSV sono già stati caricati. Vuoi sostituirli? (Premi OK per sostituire, Annulla per unire)")) {
              loadCoefficients(csvData);
            } else {
              mergeCoefficients(csvData);
            }
          } else {
            loadCoefficients(csvData);
          }
          localStorage.setItem("coefficients", JSON.stringify(coefficients));
        } else if (type === "expenses") {
          // Stessa logica per le spese di contratto
          if (Object.keys(expenses).length > 0) {
            if (confirm("Le spese CSV sono già state caricate. Vuoi sostituirle? (Premi OK per sostituire, Annulla per unire)")) {
              loadExpenses(csvData);
            } else {
              mergeExpenses(csvData);
            }
          } else {
            loadExpenses(csvData);
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

// Funzione per caricare (sostituire) i coefficienti
function loadCoefficients(csvData) {
  coefficients = {}; // azzera i dati esistenti
  // Scorriamo tutte le righe; se il primo campo non è un numero, la consideriamo come header e la saltiamo
  for (let i = 0; i < csvData.length; i++) {
    let row = csvData[i];
    if (row.length < 7) continue; // Salta righe incomplete
    let imp = parseFloat(row[0].replace(',', '.'));
    if (isNaN(imp)) continue; // Probabilmente è l'intestazione
    // I coefficienti sono espressi in percentuale; li convertiamo in decimale dividendo per 100
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
}

// Funzione per unire (merge) i coefficienti con quelli già esistenti
function mergeCoefficients(csvData) {
  for (let i = 0; i < csvData.length; i++) {
    let row = csvData[i];
    if (row.length < 7) continue;
    let imp = parseFloat(row[0].replace(',', '.'));
    if (isNaN(imp)) continue;
    coefficients[imp] = {
      12: (parseFloat(row[1].replace(',', '.')) || 0) / 100,
      18: (parseFloat(row[2].replace(',', '.')) || 0) / 100,
      24: (parseFloat(row[3].replace(',', '.')) || 0) / 100,
      36: (parseFloat(row[4].replace(',', '.')) || 0) / 100,
      48: (parseFloat(row[5].replace(',', '.')) || 0) / 100,
      60: (parseFloat(row[6].replace(',', '.')) || 0) / 100
    };
  }
  alert("Coefficienti aggiornati (merge) correttamente!");
  console.log("Coefficienti dopo merge:", coefficients);
}

// Funzione per caricare (sostituire) le spese
function loadExpenses(csvData) {
  expenses = {};
  for (let i = 0; i < csvData.length; i++) {
    let row = csvData[i];
    if (row.length < 2) continue;
    let impBeni = parseFloat(row[0].replace(',', '.'));
    if (isNaN(impBeni)) continue;
    let spesa = parseFloat(row[1].replace(',', '.'));
    expenses[impBeni] = spesa;
  }
  alert("Spese di contratto caricate correttamente!");
  console.log("Spese:", expenses);
}

// Funzione per unire (merge) le spese con quelle già esistenti
function mergeExpenses(csvData) {
  for (let i = 0; i < csvData.length; i++) {
    let row = csvData[i];
    if (row.length < 2) continue;
    let impBeni = parseFloat(row[0].replace(',', '.'));
    if (isNaN(impBeni)) continue;
    let spesa = parseFloat(row[1].replace(',', '.'));
    expenses[impBeni] = spesa;
  }
  alert("Spese di contratto aggiornate (merge) correttamente!");
  console.log("Spese dopo merge:", expenses);
}

// Funzione per convertire un numero in formato europeo in float
function parseEuropeanFloat(value) {
  if (!value) return 0;
  // Rimuove simboli (es. "€"), spazi, eventuali punti usati per le migliaia e sostituisce la virgola con il punto
  value = value.replace(/€/g, '')
               .replace(/\s/g, '')
               .replace(/\./g, '')
               .replace(',', '.');
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
}
  
// Funzione per formattare un numero in formato europeo
function formatNumber(value) {
  return value.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Calcola il noleggio utilizzando i coefficienti ed le spese caricate.
 * Se i dati CSV non sono stati caricati, viene visualizzato un alert.
 */
function calculateRent() {
  let importo = parseEuropeanFloat(document.getElementById("importo").value);
  let durata = parseInt(document.getElementById("durata").value);

  if (!importo || !durata) {
    alert("Inserisci un importo e seleziona una durata.");
    return;
  }

  // Verifica che i coefficienti siano disponibili
  if (Object.keys(coefficients).length === 0) {
    alert("Dati dei coefficienti mancanti. Carica il file CSV dei coefficienti.");
    return;
  }

  // Calcolo delle spese di contratto:
  // Se l'importo è inferiore a 5001, le spese fisse sono 75€
  let speseContratto = 0;
  if (importo < 5001) {
    speseContratto = 75;
  } else {
    // Se sono stati caricati dati per le spese, usa il range più adatto
    if (Object.keys(expenses).length > 0) {
      speseContratto = Object.entries(expenses)
        .filter(([range, value]) => importo >= parseFloat(range))
        .sort((a, b) => parseFloat(b[0]) - parseFloat(a[0]))[0]?.[1] || 0;
    }
  }

  // Selezione del coefficiente:
  // Scorre le chiavi (max importo) in ordine crescente e usa il primo per cui l'importo è minore o uguale
  let rataMensile = 0;
  let keys = Object.keys(coefficients).map(Number).sort((a, b) => a - b);
  for (let maxImporto of keys) {
    if (importo <= maxImporto) {
      rataMensile = importo * coefficients[maxImporto][durata];
      break;
    }
  }

  if (rataMensile === 0) {
    alert("Nessun coefficiente disponibile per l'importo inserito.");
    return;
  }

  // Calcolo dei costi giornaliero e orario (22 giorni lavorativi e 8 ore al giorno)
  let costoGiornaliero = rataMensile / 22;
  let costoOrario = costoGiornaliero / 8;

  // Aggiorna i risultati nel DOM
  document.getElementById("rataMensile").textContent = formatNumber(rataMensile) + " €";
  document.getElementById("speseContratto").textContent = formatNumber(speseContratto) + " €";
  document.getElementById("costoGiornaliero").textContent = formatNumber(costoGiornaliero) + " €";
  document.getElementById("costoOrario").textContent = formatNumber(costoOrario) + " €";
}
