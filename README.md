# FlexRentCalc
# Calcolo Rata Mensile e Spese di Contratto

## Descrizione

Questo progetto è un'applicazione web realizzata in JavaScript che consente di:

- Calcolare la rata mensile di un prestito.
- Includere nel calcolo le spese di contratto.
- Determinare i costi giornalieri e orari basandosi sulla rata mensile.

Il calcolo si basa su due file CSV:

- **Coefficienti:** Definisce i coefficienti applicati in base all'importo e alla durata del prestito.
- **Spese di Contratto:** Specifica le spese aggiuntive in base a soglie d'importo.

I dati possono essere salvati nel `localStorage` per facilitare il riutilizzo senza dover ricaricare i file CSV, attivando una funzione disattivata in open source.

## Caratteristiche

- **Caricamento dei file CSV**
  - Importazione dei coefficienti e delle spese di contratto tramite file CSV.
  - Parsing dei file CSV utilizzando la libreria [PapaParse](https://www.papaparse.com/).

- **Calcolo della rata mensile**
  - Selezione automatica del coefficiente corretto in base all'importo inserito e alla durata selezionata.
  - Calcolo della rata mensile applicando il coefficiente corrispondente.
  - Calcolo del costo giornaliero (ipotizzando 22 giorni lavorativi al mese) e del costo orario (ipotizzando 8 ore lavorative al giorno).

- **Gestione delle spese di contratto**
  - Selezione automatica della spesa di contratto in base alla soglia d'importo presente nel file CSV.

- **Persistenza locale**
  - Salvataggio dei dati caricati nel `localStorage` per un successivo utilizzo.

## Tecnologie Utilizzate

- **JavaScript (ES6+)**
- **PapaParse** per il parsing dei file CSV
- **HTML/CSS** per l'interfaccia utente
- **LocalStorage** per la memorizzazione locale dei dati

## Struttura del Progetto

/project-root
│
├── index.html         # Pagina principale con il markup e i riferimenti agli script
├── app.js             # Logica principale dell’applicazione
└── README.md          # Documentazione del progetto

## Requisiti

- Browser moderno con supporto per JavaScript ES6.
- Connessione a Internet per caricare la libreria PapaParse tramite CDN (o inclusa localmente).

## Installazione e Avvio

1. **Clonare il repository**

   ```bash
   git clone https://github.com/tuo-username/nome-del-repository.git
   cd nome-del-repository

2.	Verificare l’inclusione della libreria PapaParse
   
Assicurati che nel file index.html sia presente il riferimento a PapaParse, ad esempio:

<script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.2/papaparse.min.js"></script>
<script src="app.js"></script>

3.	Avviare l’applicazione
   
	•	Apri il file index.html in un browser.
	•	In alternativa, utilizza un server locale (ad es. Live Server per Visual Studio Code) per eseguire l’applicazione.

Formato dei File CSV

Coefficienti

Il file CSV dei coefficienti deve contenere almeno 7 colonne, strutturate come segue:
	1.	Importo Soglia: Valore numerico che funge da chiave per il coefficiente (es. 10000).
	2.	Coefficiente per 12 mesi: Percentuale (es. 2,5%).
	3.	Coefficiente per 18 mesi
	4.	Coefficiente per 24 mesi
	5.	Coefficiente per 36 mesi
	6.	Coefficiente per 48 mesi
	7.	Coefficiente per 60 mesi

	Nota: I valori percentuali vengono convertiti in decimali durante il parsing (es. 2,5% diventa 0.025).

Spese di Contratto

Il file CSV delle spese di contratto deve avere almeno 2 colonne:
	1.	Importo Soglia: Valore numerico che funge da chiave per la spesa (es. 5000).
	2.	Valore della Spesa: Importo numerico della spesa (es. 150).

Utilizzo dell’Applicazione
	1.	Caricamento dei CSV
	•	Seleziona il file CSV dei coefficienti tramite il controllo file con id="fileCoefficients".
	•	Seleziona il file CSV delle spese di contratto tramite il controllo file con id="fileExpenses".
	2.	Inserimento dei Dati
	•	Inserisci l’importo del prestito.
	•	Seleziona la durata (in mesi) desiderata.
	3.	Esecuzione del Calcolo
	•	Clicca sul pulsante per eseguire il calcolo.
	•	Verranno visualizzati:
	•	La rata mensile.
	•	Le spese di contratto.
	•	Il costo giornaliero e il costo orario.

Contribuire

Le proposte di miglioramento e le segnalazioni di bug sono sempre benvenute!
Se desideri contribuire al progetto:
	•	Forka il repository.
	•	Crea un branch per la tua funzionalità:

git checkout -b feature/tuo-nuovo-feature


	•	Committa le tue modifiche:

git commit -m "Aggiunta nuova funzionalità XYZ"


	•	Effettua il push e apri una Pull Request.

Licenza

Questo progetto è distribuito con la Licenza MIT (pezzaliapp).
Vedi il file LICENSE per ulteriori dettagli.

Contatti

Per domande o ulteriori informazioni, puoi scrivere a:
pezzalialssandro@gmail.com

