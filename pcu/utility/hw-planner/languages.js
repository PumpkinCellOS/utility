module.exports = {

en_US : {
    label: {
        none: {
            display: "(No label)"
        },
        noLabel: "No label",
        optional: {
            display: "Optional"
        }
    },
    error: {
        unknown: "Unknown error"
    },
    status: {
        e: "Evaluation pending",
        f: "Further information needed",
        i: "In progress",
        n: "Not started",
        p: "Preparation done",
        u: "Unknown",
        v: "Done",
        x: "Canceled",
        expiredAfter: "Expired after {1} days",
    },
    time: {
        today: "Today",
        tommorow: "Tommorow",
        ago: "{1} {2} ago",
        left: "{1} {2} left",
        nday: (value) => value == 1 ? "day" : "days",
        nhour: (value) => value == 1 ? "hour" : "hours",
        nminute: (value) => value == 1 ? "minute" : "minutes",
        tooLate: "Too late, need {1} day(s)",
        hours: "hours",
        days: "days",
        expired: "expired",
        recently: "Recently",
    },
    progress: {
        user: "Loading user data...",
        loading: "Loading...",
        generating: "Generating...",
    },
    exe: {
        book: "Book",
        chapter: "Chapter",
        page: "Page",
        point: "p.",
        topic: "Topic",
        ex: "Ex."
    },
    form: {
        editor: {
            name: "Topic editor"
        },
        filters: {
            name: "Filters",
            todo: "Filters section is currently disabled (not implemented)"
        },
        requestLog: {
            name: "Request log"
        },
        statistics: {
            name: "Statistics"
        },
        ok: "OK",
        cancel: "Cancel",
        save: "Save",
        delete: "Delete"
    },
    field: {
        description: {
            has: "Has description",
            placeholder: "Enter detailed description..."
        },
        
        addTime: "Add time",
        isExerciseList: "Is exercise list",
        optional: "Optional",
        subject: {
            name: "Subject",
            placeholder: "3-character Subject ID"
        },
        topic: {
            name: "Topic",
            placeholder: "Topic"
        },
        topicLabel: "Label (task type)",
        turnInTime: "Turn-in time",
        status: "Status"
    },
    controls: {
        addObject: "Add object",
        filters: "Filters",
        lssTltGen: "LSS TLT Gen",
        modify: "Modify",
        requestLog: "Request log",
        showAll: "Show all",
        statistics: "Statistics"
    },
    request: {
        time: "Request time",
        modify: {
            delete: "modified {1} (deleted)",
            normal: "modified {2} of {1}"
        }
    },
    cmp: {
        least: "at least",
        most: "at most",
        exact: "exactly"
    },
    dataTable: {
        nothing: "Nothing to display. Add a new task with the 'Add object' button."
    },
    todo: "[TODO]"
},

pl_PL : {
    label: {
        none: {
            display: "(Brak etykiety)"
        },
        optional: {
            display: "Dla ch??tnych",
        },
        noLabel: "Brak etykiety"
    },
    error: {
        unknown: "Nieznany b????d"
    },
    status: {
        e: "Oczekuje na ocen??",
        f: "Wymaga dodatkowych informacji",
        i: "W trakcie",
        n: "Nie rozpocz??ty",
        p: "Przygotowany",
        u: "Nieznany",
        v: "Zrobiony",
        x: "Anulowany",
        expiredAfter: "Wygas??o po {1} dniach",
    },
    time: {
        today: "Dzisiaj",
        tommorow: "Jutro",
        ago: "{1} {2} temu",
        left: "Zosta??o {1} {2}",
        nday: (value) => value[0] == 1 ? "dzie??" : "dni",
        nhour: (value) => value[0] == 1 ? "godzina" : ((value[0] < 10 || value[0] > 20) && value[0] % 10 < 5 && value[0] % 10 > 1) ? "godziny" : "godzin",
        nminute: (value) => value[0] == 1 ? "minuta" : ((value[0] < 10 || value[0] > 20) && value[0] % 10 < 5 && value[0] % 10 > 1) ? "minuty" : "minut",
        tooLate: "Za p????no, wymaga {1} dni",
        hours: "godzin",
        days: "dni",
        expired: "wygas??o",
        recently: "Przed chwil??",
    },
    progress: {
        generating: "Generowanie...",
        loading: "??adowanie...",
        user: "??adowanie danych u??ytkownika...",
    },
    exe: {
        book: "Ksi????ka",
        chapter: "Rozdzia??",
        page: "Strona",
        point: "p.",
        topic: "Temat",
        ex: "Zad."
    },
    form: {
        editor: {
            name: "Edytor zada??"
        },
        filters: {
            name: "Filtry",
            todo: "Sekcja filtr??w jest aktualnie wy????czona (nie zaimplementowano)"
        },
        requestLog: {
            name: "Dziennik zmian"
        },
        statistics: {
            name: "Statystyki"
        },
        ok: "OK",
        cancel: "Anuluj",
        save: "Zapisz",
        delete: "Usu??"
    },
    field: {
        description: {
            has: "Ma opis",
            placeholder: "Podaj dok??adny opis zadania..."
        },
        addTime: "Dodano",
        isExerciseList: "Jest list?? zada??",
        optional: "Dla ch??tnych",
        status: "Status",
        subject: {
            name: "Przedmiot",
            placeholder: "3-znakowy ID przedmiotu"
        },
        topic: {
            name: "Temat",
            placeholder: "Temat"
        },
        topicLabel: "Etykieta (typ zadania)",
        turnInTime: "Zwrot"
    },
    controls: {
        addObject: "Dodaj obiekt",
        filters: "Filtry",
        lssTltGen: "LSS TLT Gen",
        modify: "Zmie??",
        requestLog: "Dziennik zmian",
        showAll: "Poka?? wszystkie",
        statistics: "Statystyki",
    },
    request: {
        time: "Czas ????dania",
        modify: {
            delete: "zmodyfikowa?? {1} (usuni??te)",
            normal: "zmodyfikowa?? {2} z przedmiotu {1}"
        }
    },
    cmp: {
        least: "przynajmniej",
        most: "najwi??cej",
        exact: "dok??adnie"
    },
    dataTable: {
        nothing: "Brak danych do wy??wietlenia. Dodaj nowe zadanie za pomoc?? przycisku 'Dodaj obiekt'."
    },
    todo: "[TODO]"
},

}
