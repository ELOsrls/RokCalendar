/******************************************************************************
 * CONFIGURAZIONE FIREBASE
 *****************************************************************************/

// Credenziali di accesso al progetto Firebase
// Queste informazioni sono necessarie per connettersi al database remoto
const firebaseConfig = {
    apiKey: "AIzaSyAGdQa0SdgpjnfYGOKq6Iuzan_IUmquY3Q",
    authDomain: "rokcalendar-502a7.firebaseapp.com",
    databaseURL: " https://rokcalendar-17104-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "rokcalendar-502a7",
    storageBucket: "rokcalendar-502a7.firebasestorage.app",
    messagingSenderId: "232572972605",
    appId: "1:232572972605:web:606cb95729e96523914454"
};

// Inizializzazione della connessione a Firebase
// Se l'inizializzazione fallisce, viene mostrato un errore in console
let db;
try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.database();
    console.log('Firebase inizializzato correttamente');
} catch (error) {
    console.error('Errore inizializzazione Firebase:', error);
}

/******************************************************************************
 * INIZIALIZZAZIONE APPLICAZIONE
 *****************************************************************************/

document.addEventListener('DOMContentLoaded', async () => {
    
    /**************************************************************************
     * CONFIGURAZIONE INIZIALE E COSTANTI
     **************************************************************************/
    
    let collaborators = [];

    // Funzione per caricare i collaboratori dal config.ini
    async function loadCollaborators() {
        try {
            const response = await fetch('config.ini');
            const data = await response.text();
            console.log('Contenuto config.ini:', data);
            
            const lines = data.split('\n')
                .map(line => line.trim())
                .filter(line => line && !line.startsWith(';'));
            
            const namesLine = lines.find(line => line.startsWith('names='));
            if (namesLine) {
                collaborators = [
                    
                    ...namesLine
                        .substring('names='.length)
                        .split(',')
                        .map(name => name.trim())
                        .filter(name => name)
                ];
                console.log('Lista collaboratori caricata:', collaborators);
            } else {
                throw new Error('Nessuna linea names= trovata nel file config.ini');
            }
        } catch (error) {
            console.error('Errore nel caricamento dei collaboratori:', error);
            collaborators = [
                "Generale",    // Colonna per eventi generali
                "Andrea",      // Collaboratori individuali
                "Silvia", 
                "Paolo"
            ];
        }
    }

    // Carica prima i collaboratori
    await loadCollaborators();
    console.log('Collaboratori caricati, procedo con la creazione del calendario');

    // Periodo temporale del calendario
    const startDate = new Date(2024, 0, 1);   // Inizio: 1 gennaio 2024
    const endDate = new Date(2026, 11, 31);   // Fine: 31 dicembre 2026
    const today = formatDate(new Date());      // Data odierna formattata

    /**************************************************************************
     * FUNZIONI DI UTILITÀ
     **************************************************************************/
    
    // Converte una data in formato stringa YYYY-MM-DD
    // Input: oggetto Date
    // Output: esempio "2024-01-01"
    function formatDate(date) {
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    }

    // Restituisce l'abbreviazione del giorno della settimana in italiano
    // Input: oggetto Date
    // Output: "Lun", "Mar", ecc.
    function getDayName(date) {
        const days = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
        return days[date.getDay()];
    }

    
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
            cell.style.border = '2px solid #000';
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

    // Funzione per salvare i dati nel database
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
            backgroundColor: cell.style.backgroundColor || '',
            html: cell.innerHTML || '',  // Salva l'HTML per mantenere la formattazione del testo colorato
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
        if (!e.target.classList.contains('color-btn')) return;
        
        const color = e.target.dataset.color;
        const selection = window.getSelection();
        const colorPicker = document.getElementById('colorPicker');
        
        const targetRow = colorPicker.dataset.targetRow;
        const targetCell = colorPicker.dataset.targetCell;
        
        if (targetRow === undefined || targetCell === undefined) return;
        
        const cell = document.getElementById('calendar-body').rows[targetRow].cells[targetCell];
        if (!cell) return;

        if (!selection.isCollapsed && cell.contains(selection.anchorNode)) {
            const range = selection.getRangeAt(0);
            const span = document.createElement('span');
            span.style.backgroundColor = color;
            range.surroundContents(span);
        } else {
            cell.style.backgroundColor = color;
        }
        
        saveToDatabase(cell);
        colorPicker.style.display = 'none';
    });

    // Test iniziale della connessione al database
    db.ref('.info/connected').on('value', (snap) => {
        if (snap.val() === true) {
            console.log('Connesso al database');
        } else {
            console.log('Non connesso al database');
        }
    });

    // Funzione per caricare i dati dal database
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

                        // Ripristina sia il testo che la formattazione
                        if (cellData.html) {
                            cell.innerHTML = cellData.html;  // Ripristina il testo colorato
                        } else {
                            cell.textContent = cellData.text || '';
                        }
                        
                        // Ripristina il colore di sfondo
                        if (cellData.backgroundColor) {
                            cell.style.backgroundColor = cellData.backgroundColor;
                        }
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
        Object.entries(data).forEach(([date, columns]) => {
            Object.entries(columns).forEach(([column, cellData]) => {
                const cell = document.querySelector(`td[data-date="${date}"][data-column="${column}"]`);
                if (cell) {
                    if (cellData.html) {
                        cell.innerHTML = cellData.html;  // Ripristina l'HTML salvato
                    } else {
                        cell.textContent = cellData.text || '';
                    }
                    cell.style.backgroundColor = cellData.color || '';
                }
            });
        });
    }

    // Inizializzazione all'avvio
    initializeRealtimeListeners();
    scrollToToday();

    // Funzione per impostare le dimensioni dei pulsanti del color picker
    function adjustColorPickerButtons() {
        const colorButtons = document.querySelectorAll('.color-btn'); // Seleziona tutti i pulsanti
        const isMobile = window.innerWidth <= 768; // Rileva se il client è su uno smartphone

        colorButtons.forEach(button => {
            if (isMobile) {
                button.style.width = '100px'; // Imposta la larghezza a 100px (doppio rispetto a un valore standard)
                button.style.height = '100px'; // Imposta l'altezza a 100px (doppio rispetto a un valore standard)
            } else {
                button.style.width = ''; // Ripristina la larghezza predefinita
                button.style.height = ''; // Ripristina l'altezza predefinita
            }
        });
    }

    // Chiama la funzione per regolare le dimensioni dei pulsanti
    adjustColorPickerButtons();

    // Aggiungi un event listener per regolare le dimensioni al ridimensionamento della finestra
    window.addEventListener('resize', adjustColorPickerButtons);
});
