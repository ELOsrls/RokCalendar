// Configurazione Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAGdQa0SdgpjnfYGOKq6Iuzan_IUmquY3Q",
    authDomain: "rokcalendar-502a7.firebaseapp.com",
    databaseURL: "https://rokcalendar-502a7-default-rtdb.europe-west1.firebasedatabase.app/",
    projectId: "rokcalendar-502a7",
    storageBucket: "rokcalendar-502a7.firebasestorage.app",
    messagingSenderId: "232572972605",
    appId: "1:232572972605:web:606cb95729e96523914454"
  };
// Inizializza Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Array dei collaboratori
const collaborators = [
    "Mario Rossi", "Luigi Verdi", "Anna Bianchi", "Paolo Neri", 
    "Elena Russo", "Marco Bruno", "Laura Galli", "Andrea Costa", 
    "Sofia Romano", "Luca Ferrari", "Giulia Marino", "Roberto Greco", 
    "Chiara Leone", "Davide Serra", "Francesca Conti"
];

// Funzioni di utilità
function formatDate(date) {
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

function formatDateWithDay(date) {
    const days = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
    return `${days[date.getDay()]} ${formatDate(date)}`;
}

function isWeekend(date) {
    return date.getDay() === 0 || date.getDay() === 6;
}

function isToday(date) {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
}

let colorPickerTimeout;

// Aggiungi questa variabile all'inizio del file, fuori da tutte le funzioni
let selectedCell = null;

function showColorPicker(cell) {
    selectedCell = cell;
    const colorPicker = document.getElementById('colorPicker');
    
    // Posiziona il color picker in alto a destra se la cella è attiva
    if (cell.classList.contains('active')) {
        colorPicker.style.position = 'fixed';
        colorPicker.style.top = '20px';
        colorPicker.style.right = '20px';
        colorPicker.style.left = 'auto';
    } else {
        // Altrimenti posizionalo vicino alla cella
        const cellRect = cell.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        
        colorPicker.style.position = 'absolute';
        let leftPosition = cellRect.right + 5;
        if (leftPosition + colorPicker.offsetWidth > windowWidth) {
            leftPosition = cellRect.left - colorPicker.offsetWidth - 5;
        }
        colorPicker.style.left = leftPosition + 'px';
        colorPicker.style.top = cellRect.top + 'px';
    }
    
    colorPicker.style.display = 'block';
    
    // Pulizia dei timer esistenti
    if (colorPickerTimeout) {
        clearTimeout(colorPickerTimeout);
    }
    
    // Timer per nascondere il color picker
    colorPickerTimeout = setTimeout(() => {
        colorPicker.style.display = 'none';
        selectedCell = null;
    }, 10000); // 10 secondi
}

function scrollToToday() {
    const today = new Date();
    const formattedDate = formatDate(today);
    
    // Trova la cella con la data odierna
    const todayCell = document.querySelector(`td[data-date="${formattedDate}"]`);
    
    if (todayCell) {
        // Scorri alla riga odierna con un piccolo offset verso l'alto
        todayCell.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Funzioni Firebase
function saveToFirebase(cell) {
    if (!cell.dataset.date) return;
    
    const date = cell.dataset.date;
    const col = cell.dataset.col;
    const safeDate = date.replace(/[/.]/g, '_');
    
    const data = {
        text: cell.innerHTML,
        backgroundColor: cell.style.backgroundColor || ''
    };
    
    db.ref(`calendar/${safeDate}/${col}`).set(data)
        .then(() => {
            console.log('Dato salvato con successo');
            console.log('a capo');
        })
        .catch(error => {
            console.error('Errore nel salvataggio:', error);
            // Potresti aggiungere qui una gestione degli errori visibile all'utente
        });
}

function loadDataFromFirebase() {
    // Rimuovi eventuali listener precedenti
    db.ref('calendar').off();
    
    // Aggiungi il listener per i cambiamenti
    db.ref('calendar').on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            Object.keys(data).forEach(safeDate => {
                const date = safeDate.replace(/_/g, '/');
                Object.keys(data[safeDate]).forEach(col => {
                    const cell = document.querySelector(`td[data-date="${date}"][data-col="${col}"]`);
                    if (cell) {
                        const cellData = data[safeDate][col];
                        // Aggiorna solo se il contenuto è diverso
                        if (cell.innerHTML !== cellData.text) {
                            cell.innerHTML = cellData.text || '';
                            adjustRowHeight(cell);  // Aggiusta l'altezza dopo il caricamento
                        }
                        cell.style.backgroundColor = cellData.backgroundColor || '';
                    }
                });
            });
        }
    });
}

function generateCalendar() {
    const tbody = document.getElementById('calendar-body');
    tbody.innerHTML = '';
    
    // Imposta la data di inizio al 1° gennaio 2024
    const startDate = new Date(2024, 0, 1);
    // Imposta la data di fine al 31 dicembre 2027
    const endDate = new Date(2027, 11, 31);
    const today = new Date();
    
    // Calcola il numero di giorni tra le date
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    
    for (let i = 0; i < days; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        
        const row = document.createElement('tr');
        const formattedDate = formatDate(currentDate);
        
        // Cella data
        const dateCell = document.createElement('td');
        dateCell.textContent = formatDateWithDay(currentDate);
        dateCell.dataset.date = formattedDate;
        dateCell.dataset.isDate = 'true';
        
        // Evidenzia solo la cella della data se è oggi
        if (isToday(currentDate)) {
            dateCell.classList.add('today');
        }
        
        row.appendChild(dateCell);
        
        if (isWeekend(currentDate)) {
            row.classList.add('weekend');
        }
        
        if (currentDate.getDate() === 1) {
            row.classList.add('month-separator');
        }
        
        // Celle collaboratori
        collaborators.forEach((_, index) => {
            const cell = document.createElement('td');
            cell.contentEditable = true;
            cell.dataset.date = formattedDate;
            cell.dataset.col = index;
            
            // Aggiungi l'event listener per l'input
            cell.addEventListener('input', () => {
                adjustRowHeight(cell);
                saveToFirebase(cell);
                if (colorPickerTimeout) {
                    resetColorPickerTimer();
                }
            });
            
            // Gestisci l'a capo
            cell.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const selection = window.getSelection();
                    const range = selection.getRangeAt(0);
                    const br = document.createElement('br');
                    range.deleteContents();
                    range.insertNode(br);
                    range.setStartAfter(br);
                    range.setEndAfter(br);
                    selection.removeAllRanges();
                    selection.addRange(range);
                    
                    adjustRowHeight(cell);
                    saveToFirebase(cell);
                    
                    if (colorPickerTimeout) {
                        resetColorPickerTimer();
                    }
                }
            });
            
            // Gestisci l'altezza automatica
            cell.addEventListener('input', () => {
                cell.style.height = 'auto';
                cell.style.height = cell.scrollHeight > 20 ? cell.scrollHeight + 'px' : '20px';
                
                if (colorPickerTimeout) {
                    resetColorPickerTimer();
                }
            });
            
            row.appendChild(cell);
        });
        
        tbody.appendChild(row);
    }
    
    // Aggiungi questa chiamata alla fine della funzione
    setTimeout(scrollToToday, 100); // Piccolo delay per assicurarsi che il DOM sia completamente caricato
}

// Gestione eventi
function initializeEvents() {
    const calendar = document.getElementById('calendar');
    const colorPicker = document.getElementById('colorPicker');
    
    // Gestione click celle
    calendar.addEventListener('click', (e) => {
        if (e.target.tagName === 'TD') {
            showColorPicker(e.target);
        }
    });
    
    // Gestione input testo
    calendar.addEventListener('input', (e) => {
        if (e.target.tagName === 'TD' && e.target.dataset.date) {
            saveToFirebase(e.target);
            // Reset del timer quando si digita
            if (colorPicker.style.display === 'block') {
                // Pulisci i timer esistenti
                if (colorPickerTimeout) {
                    clearTimeout(colorPickerTimeout);
                }
                
                // Nuovo timeout per nascondere il color picker
                colorPickerTimeout = setTimeout(() => {
                    colorPicker.style.display = 'none';
                    e.target.classList.remove('selected-cell');
                }, 10000);
            }
        }
    });
    
    // Gestione colorazione
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (selectedCell) {
                const color = btn.dataset.color;
                selectedCell.style.backgroundColor = color;
                
                // Salva in Firebase
                saveToFirebase(selectedCell);
                
                // Reset del timer
                resetColorPickerTimer();
            }
        });
    });
    
    // Chiudi color picker quando si clicca fuori
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.color-picker') && !e.target.closest('td')) {
            colorPicker.style.display = 'none';
        }
    });
    
    // Pulsante "Vai a Oggi"
    document.getElementById('todayBtn').addEventListener('click', scrollToToday);
}

// Inizializzazione calendario
function initializeCalendar() {
    const headerRow = document.getElementById('header-row');
    headerRow.innerHTML = '<th>Data</th>';
    collaborators.forEach((collaborator, index) => {
        const th = document.createElement('th');
        th.textContent = collaborator;
        th.dataset.colIndex = index;
        headerRow.appendChild(th);
    });

    generateCalendar();
    initializeEvents();
    loadDataFromFirebase();
}

// Avvio dell'applicazione
document.addEventListener('DOMContentLoaded', initializeCalendar);

// Modifica la gestione del click sulla cella
function handleCellClick(event) {
    const cell = event.target;
    if (cell.tagName === 'TD') {
        // Rimuovi la classe active da tutte le celle
        document.querySelectorAll('td').forEach(td => td.classList.remove('active'));
        
        // Aggiungi la classe active alla cella cliccata
        cell.classList.add('active');
        
        selectedCell = cell;
        showColorPicker(cell);
    }
}

// Aggiorna l'event listener per il click
calendar.addEventListener('click', handleCellClick);

// Aggiungi l'event listener per gestire il click fuori dalla cella
document.addEventListener('click', (e) => {
    if (!e.target.closest('td') && !e.target.closest('.color-picker')) {
        document.querySelectorAll('td').forEach(td => td.classList.remove('active'));
        const colorPicker = document.getElementById('colorPicker');
        colorPicker.style.display = 'none';
        selectedCell = null;
    }
});

calendar.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'TD' && e.key === 'Enter') {
        e.preventDefault();
        
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        
        // Crea un nuovo div per contenere la nuova riga
        const newLine = document.createElement('div');
        newLine.appendChild(document.createElement('br'));
        
        // Inserisci il div
        range.insertNode(newLine);
        
        // Sposta il cursore all'interno del nuovo div
        range.selectNodeContents(newLine);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        
        // Reset del timer del color picker se necessario
        if (colorPickerTimeout) {
            resetColorPickerTimer();
        }
    }
});

// Aggiungi questa funzione per gestire l'auto-resize
function autoResizeTextarea(textarea) {
    textarea.style.height = '1.4em';  // Reset all'altezza base
    textarea.style.height = textarea.scrollHeight + 'px';  // Espandi all'altezza del contenuto
}

// Aggiungi la funzione resetColorPickerTimer
function resetColorPickerTimer() {
    const colorPicker = document.getElementById('colorPicker');
    
    if (colorPickerTimeout) {
        clearTimeout(colorPickerTimeout);
    }
    
    colorPickerTimeout = setTimeout(() => {
        colorPicker.style.display = 'none';
        selectedCell = null;
    }, 10000);
}

// Aggiungi questa funzione per gestire l'altezza delle celle
function adjustRowHeight(cell) {
    const row = cell.parentElement;
    
    // Reset dell'altezza di tutte le celle nella riga
    Array.from(row.cells).forEach(cell => {
        cell.style.height = 'auto';
    });
    
    // Trova l'altezza massima del contenuto nella riga
    const maxHeight = Array.from(row.cells).reduce((max, cell) => {
        // Gestisci il caso di celle vuote o con solo spazi/br
        const content = cell.innerHTML.replace(/<br\s*\/?>/g, '').trim();
        const height = content ? cell.scrollHeight : 24; // 24px per celle vuote
        return Math.max(max, height);
    }, 24); // Altezza minima di default
    
    // Applica l'altezza a tutte le celle nella riga
    Array.from(row.cells).forEach(cell => {
        cell.style.height = `${maxHeight}px`;
    });
}

// Aggiungi questo al tuo JavaScript esistente
document.addEventListener('input', function(e) {
    if (e.target.tagName === 'TD') {
        const cell = e.target;
        if (!cell.textContent.trim()) {
            // Se la cella è vuota, rimuovi l'altezza inline
            cell.style.removeProperty('height');
        }
    }
});

// Modifica la gestione del click sui bottoni del color picker
document.querySelectorAll('.color-btn').forEach(button => {
    button.addEventListener('click', function() {
        if (selectedCell) {
            const color = this.dataset.color;
            
            // Se la cella selezionata è nella colonna delle date (prima colonna)
            if (selectedCell.cellIndex === 0) {
                // Trova la riga (tr) genitore
                const row = selectedCell.parentElement;
                
                // Seleziona tutte le celle dei collaboratori nella riga (16 celle)
                const cells = Array.from(row.cells).slice(1, 17);
                
                // Prepara un oggetto per l'aggiornamento batch
                const updates = {};
                
                cells.forEach(cell => {
                    // Applica il colore visivamente
                    cell.style.backgroundColor = color;
                    
                    const date = cell.dataset.date;
                    const col = cell.dataset.col;
                    
                    if (date && col) {
                        const safeDate = date.replace(/[/.]/g, '_');
                        updates[`${safeDate}/${col}`] = {
                            text: cell.innerHTML || '',
                            backgroundColor: color
                        };
                    }
                });
                
                // Esegui un singolo aggiornamento batch
                if (Object.keys(updates).length > 0) {
                    firebase.database().ref('calendar').update(updates)
                        .then(() => {
                            console.log('Colori aggiornati con successo');
                        })
                        .catch(error => {
                            console.error('Errore nell\'aggiornamento dei colori:', error);
                        });
                }
            } else {
                // Comportamento normale per le altre celle
                selectedCell.style.backgroundColor = color;
                saveToFirebase(selectedCell);
            }
            
            // Nascondi il color picker dopo la selezione
            document.getElementById('colorPicker').style.display = 'none';
        }
    });
});

// Assicurati che la funzione updateCellColor gestisca correttamente il salvataggio su Firebase
function updateCellColor(cell, color) {
    // Il tuo codice esistente per l'aggiornamento su Firebase
    const row = cell.parentElement.rowIndex;
    const col = cell.cellIndex;
    // ... resto del codice per Firebase
}

