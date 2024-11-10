// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAGdQa0SdgpjnfYGOKq6Iuzan_IUmquY3Q",
    authDomain: "rokcalendar-502a7.firebaseapp.com",
    databaseURL: "https://rokcalendar-502a7-default-rtdb.europe-west1.firebasedatabase.app/",
    projectId: "rokcalendar-502a7",
    storageBucket: "rokcalendar-502a7.firebasestorage.app",
    messagingSenderId: "232572972605",
    appId: "1:232572972605:web:606cb95729e96523914454"
};

// Initialize Firebase
let db;
try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.database();
    console.log('Firebase inizializzato correttamente');
} catch (error) {
    console.error('Errore inizializzazione Firebase:', error);
}

document.addEventListener('DOMContentLoaded', () => {
    const collaborators = ["Generale", "Andrea", "Silvia", "Paolo", "Gianluca Papa", "Guido", "Marco", "Maurizio", "Niah", "Maurizio Bordiani", "Bellantonio", "Anna G"];
    
    // Funzione per formattare la data in YYYY-MM-DD
    function formatDate(date) {
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    }

    // Funzione per ottenere il nome del giorno in italiano
    function getDayName(date) {
        const days = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
        return days[date.getDay()];
    }

    const startDate = new Date(2024, 0, 1); // 1 gennaio 2024
    const endDate = new Date(2026, 11, 31); // 31 dicembre 2026
    const today = formatDate(new Date());

    // Lista delle festività italiane 2024-2026
    const holidays = [
        // 2024
        '2024-01-01', // Capodanno
        '2024-01-06', // Epifania
        '2024-03-31', // Pasqua
        '2024-04-01', // Lunedì dell'Angelo
        '2024-04-25', // Liberazione
        '2024-05-01', // Festa del Lavoro
        '2024-06-02', // Repubblica
        '2024-08-15', // Ferragosto
        '2024-11-01', // Tutti i Santi
        '2024-12-08', // Immacolata
        '2024-12-25', // Natale
        '2024-12-26', // Santo Stefano
        // 2025
        '2025-01-01', // Capodanno
        '2025-01-06', // Epifania
        '2025-04-20', // Pasqua
        '2025-04-21', // Lunedì dell'Angelo
        '2025-04-25', // Liberazione
        '2025-05-01', // Festa del Lavoro
        '2025-06-02', // Repubblica
        '2025-08-15', // Ferragosto
        '2025-11-01', // Tutti i Santi
        '2025-12-08', // Immacolata
        '2025-12-25', // Natale
        '2025-12-26', // Santo Stefano
        // 2026
        '2026-01-01', // Capodanno
        '2026-01-06', // Epifania
        '2026-04-05', // Pasqua
        '2026-04-06', // Lunedì dell'Angelo
        '2026-04-25', // Liberazione
        '2026-05-01', // Festa del Lavoro
        '2026-06-02', // Repubblica
        '2026-08-15', // Ferragosto
        '2026-11-01', // Tutti i Santi
        '2026-12-08', // Immacolata
        '2026-12-25', // Natale
        '2026-12-26'  // Santo Stefano
    ];

    const headerRow = document.getElementById('header-row');
    headerRow.innerHTML = `<th>Giorno</th>` + collaborators.map(name => `<th>${name}</th>`).join('');

    const calendarBody = document.getElementById('calendar-body');
    let currentDate = new Date(startDate);
    let lastMonth = currentDate.getMonth();

    while (currentDate <= endDate) {
        const row = document.createElement('tr');
        const dateStr = formatDate(currentDate);
        const dayName = getDayName(currentDate);
        const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
        const isHoliday = holidays.includes(dateStr);
        const isToday = dateStr === today;

        // Verifica se è l'inizio di un nuovo mese
        if (currentDate.getMonth() !== lastMonth) {
            row.classList.add('month-separator');
            lastMonth = currentDate.getMonth();
        }

        // Formatta la data in modo leggibile (DD/MM/YYYY)
        const formattedDate = `${currentDate.getDate().toString().padStart(2, '0')}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getFullYear()}`;

        // Applica la classe weekend-row per weekend e festività
        if (isWeekend || isHoliday) {
            row.classList.add('weekend-row');
        }

        // Crea la cella della data
        const dateCell = document.createElement('td');
        dateCell.textContent = `${dayName} ${formattedDate}`;
        dateCell.setAttribute('data-date', dateStr);
        
        // Applica la classe today alla cella della data odierna
        if (isToday) {
            dateCell.classList.add('today');
            console.log('Cella oggi trovata:', dateStr); // Debug
        }
        
        row.appendChild(dateCell);

        // Aggiungi le celle per ogni collaboratore
        collaborators.forEach(() => {
            const cell = document.createElement('td');
            cell.contentEditable = true;
            row.appendChild(cell);
        });

        calendarBody.appendChild(row);

        // Passa al giorno successivo
        currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
    }

    // Funzione per centrare la riga nella viewport
    function scrollToToday() {
        const todayRow = document.querySelector(`td[data-date="${today}"]`)?.parentElement;
        if (!todayRow) return;

        const container = document.querySelector('.calendar-container');
        const containerHeight = container.clientHeight;
        const rowTop = todayRow.offsetTop;
        const rowHeight = todayRow.clientHeight;
        
        // Calcola la posizione di scroll per centrare la riga
        const scrollPosition = rowTop - (containerHeight / 2) + (rowHeight / 2);
        
        container.scrollTo({
            top: scrollPosition,
            behavior: 'smooth'
        });
    }

    // Aggiungi l'event listener al pulsante
    document.getElementById('goToToday').addEventListener('click', scrollToToday);

    calendarBody.addEventListener('click', (e) => {
        if (e.target.tagName === 'TD') {
            const colorPicker = document.getElementById('colorPicker');
            const rect = e.target.getBoundingClientRect();
            const cell = e.target;
            
            colorPicker.style.display = 'block';
            colorPicker.style.top = `${rect.top - colorPicker.offsetHeight}px`;
            colorPicker.style.left = `${rect.left}px`;
            
            // Salva il riferimento diretto alla cella invece che gli indici
            colorPicker.dataset.targetCell = cell.cellIndex;
            colorPicker.dataset.targetRow = Array.from(calendarBody.rows).indexOf(cell.parentElement);
        }
    });

    // Funzione migliorata per il salvataggio nel database
    function saveToDatabase(cell) {
        if (!db) {
            console.error('Database non inizializzato');
            return;
        }

        const row = cell.parentElement;
        const dateKey = row.firstChild.getAttribute('data-date');
        const colIndex = Array.from(row.children).indexOf(cell);
        
        if (!dateKey || colIndex === 0) {
            console.log('Cella non valida per il salvataggio');
            return;
        }
        
        const path = `calendar/${dateKey}/${colIndex}`;
        const data = {
            text: cell.textContent || '',
            color: cell.style.backgroundColor || '',
            timestamp: Date.now()
        };

        console.log('Salvataggio:', path, data);

        db.ref(path).update(data)
            .then(() => console.log('Salvato con successo:', path))
            .catch(error => console.error('Errore nel salvataggio:', error));
    }

    // Gestione dell'input nelle celle con debounce ottimizzato
    function initializeCellListeners() {
        const calendarBody = document.getElementById('calendar-body');
        let debounceTimer;

        calendarBody.addEventListener('input', (e) => {
            if (e.target.tagName === 'TD') {
                const cell = e.target;
                
                // Cancella il timer precedente
                clearTimeout(debounceTimer);
                
                // Imposta un nuovo timer
                debounceTimer = setTimeout(() => {
                    saveToDatabase(cell);
                }, 300); // Ridotto a 300ms per una risposta più veloce
            }
        });
    }

    // Inizializzazione all'avvio
    initializeCellListeners();

    // Funzione di salvataggio migliorata
    function saveToDatabase(cell) {
        if (!db) {
            console.error('Database non inizializzato');
            return;
        }

        const row = cell.parentElement;
        const dateKey = row.firstChild.getAttribute('data-date');
        const colIndex = Array.from(row.children).indexOf(cell);
        
        if (!dateKey || colIndex === 0) {
            console.log('Cella non valida per il salvataggio');
            return;
        }
        
        const path = `calendar/${dateKey}/${colIndex}`;
        const data = {
            text: cell.textContent || '',
            color: cell.style.backgroundColor || '',
            timestamp: Date.now()
        };

        console.log('Salvataggio:', path, data);

        db.ref(path).update(data)
            .then(() => console.log('Salvato con successo:', path))
            .catch(error => console.error('Errore nel salvataggio:', error));
    }

    // Gestione dell'input nelle celle con debounce ottimizzato
    function initializeCellListeners() {
        const calendarBody = document.getElementById('calendar-body');
        let debounceTimer;

        calendarBody.addEventListener('input', (e) => {
            if (e.target.tagName === 'TD') {
                const cell = e.target;
                
                // Cancella il timer precedente
                clearTimeout(debounceTimer);
                
                // Imposta un nuovo timer
                debounceTimer = setTimeout(() => {
                    saveToDatabase(cell);
                }, 300); // Ridotto a 300ms per una risposta più veloce
            }
        });
    }

    // Inizializzazione all'avvio
    initializeCellListeners();

    // Gestione del color picker
    document.getElementById('colorPicker').addEventListener('click', (e) => {
        if (e.target.classList.contains('color-btn')) {
            const color = e.target.dataset.color;
            const rowIndex = parseInt(e.target.parentElement.dataset.targetRow);
            const cellIndex = parseInt(e.target.parentElement.dataset.targetCell);
            
            // Usa il riferimento diretto alla riga corretta
            const row = calendarBody.rows[rowIndex];
            if (row) {
                if (cellIndex === 0) {
                    // Se è la cella data, colora tutta la riga
                    Array.from(row.cells).forEach(cell => {
                        cell.style.backgroundColor = color;
                        saveToDatabase(cell);
                    });
                } else {
                    const cell = row.cells[cellIndex];
                    if (cell) {
                        cell.style.backgroundColor = color;
                        saveToDatabase(cell);
                    }
                }
            }

            e.target.parentElement.style.display = 'none';
        }
    });

    // Test iniziale della connessione al database
    db.ref('.info/connected').on('value', (snap) => {
        if (snap.val() === true) {
            console.log('Connesso al database');
        } else {
            console.log('Non connesso al database');
        }
    });

    // Caricamento dati iniziale
    function loadFromDatabase() {
        console.log('Inizio caricamento dati');
        db.ref('calendar').once('value')
            .then((snapshot) => {
                console.log('Dati ricevuti:', snapshot.val());
                const data = snapshot.val() || {};
                
                Object.entries(data).forEach(([dateKey, dateData]) => {
                    const row = document.querySelector(`td[data-date="${dateKey}"]`)?.parentElement;
                    if (!row) return;

                    Object.entries(dateData).forEach(([colIndex, cellData]) => {
                        const cell = row.children[colIndex];
                        if (!cell) return;

                        if (cellData.text) cell.textContent = cellData.text;
                        if (cellData.color) cell.style.backgroundColor = cellData.color;
                    });
                });
                console.log('Caricamento dati completato');
            })
            .catch(error => {
                console.error('Errore nel caricamento dati:', error);
            });
    }

    // Carica i dati iniziali
    loadFromDatabase();

    // Funzione per inizializzare i listener di Firebase
    function initializeRealtimeListeners() {
        // Listener per l'intero calendario
        db.ref('calendar').on('value', (snapshot) => {
            console.log('Ricevuto aggiornamento dal database');
            const data = snapshot.val() || {};
            updateCalendarFromDatabase(data);
        });
    }

    // Funzione per aggiornare il calendario dai dati del database
    function updateCalendarFromDatabase(data) {
        Object.entries(data).forEach(([dateKey, dateData]) => {
            const row = document.querySelector(`td[data-date="${dateKey}"]`)?.parentElement;
            if (!row) return;

            Object.entries(dateData).forEach(([colIndex, cellData]) => {
                const cell = row.children[colIndex];
                if (!cell) return;

                // Aggiorna solo se il contenuto è diverso
                if (cellData.text && cell.textContent !== cellData.text) {
                    cell.textContent = cellData.text;
                }
                if (cellData.color) {
                    cell.style.backgroundColor = cellData.color;
                }
            });
        });
    }

    // Inizializzazione all'avvio
    initializeRealtimeListeners();
});
