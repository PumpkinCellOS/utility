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
        }
    },
    field: {
        description: {
            has: "Has description",
            placeholder: "Enter detailed description..."
        },
        
        addTime: "Add time",
        isExerciseList: "Is exercise list",
        optional: "Optional",
        subject: "Subject",
        topic: "Topic",
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
        least: "is less than",
        most: "is more than",
        exact: "is equal to"
    },
    todo: "[TODO]"
},

pl_PL : {
    label: {
        none: {
            display: "(Brak etykiety)"
        },
        optional: {
            display: "Dla chętnych",
        },
        noLabel: "Brak etykiety"
    },
    error: {
        unknown: "Nieznany błąd"
    },
    status: {
        e: "Oczekuje na ocenę",
        f: "Wymaga dodatkowych informacji",
        i: "W trakcie",
        n: "Nie rozpoczęty",
        p: "Przygotowany",
        u: "Nieznany",
        v: "Zrobiony",
        x: "Anulowany",
        expiredAfter: "Wygasło po {1} dniach",
    },
    time: {
        today: "Dzisiaj",
        tommorow: "Jutro",
        ago: "{1} {2} temu",
        left: "Zostało {1} {2}",
        nday: (value) => value[0] == 1 ? "dzień" : "dni",
        nhour: (value) => value[0] == 1 ? "godzina" : ((value[0] < 10 || value[0] > 20) && value[0] % 10 < 5 && value[0] % 10 > 1) ? "godziny" : "godzin",
        nminute: (value) => value[0] == 1 ? "minuta" : ((value[0] < 10 || value[0] > 20) && value[0] % 10 < 5 && value[0] % 10 > 1) ? "minuty" : "minut",
        tooLate: "Za późno, wymaga {1} dni",
        hours: "godzin",
        days: "dni",
        expired: "wygasło",
        recently: "Przed chwilą",
    },
    progress: {
        generating: "Generowanie...",
        loading: "Ładowanie...",
        user: "Ładowanie danych użytkownika...",
    },
    exe: {
        book: "Książka",
        chapter: "Rozdział",
        page: "Strona",
        point: "p.",
        topic: "Temat",
        ex: "Zad."
    },
    form: {
        editor: {
            name: "Edytor zadań"
        },
        filters: {
            name: "Filtry",
            todo: "Sekcja filtrów jest aktualnie wyłączona (nie zaimplementowano)"
        },
        requestLog: {
            name: "Dziennik zmian"
        },
        statistics: {
            name: "Statystyki"
        },
    },
    field: {
        description: {
            has: "Ma opis",
            placeholder: "Podaj dokładny opis zadania..."
        },
        addTime: "Dodano",
        isExerciseList: "Jest listą zadań",
        optional: "Dla chętnych",
        status: "Status",
        subject: "Przedmiot",
        topic: "Temat",
        topicLabel: "Etykieta (typ zadania)",
        turnInTime: "Zwrot"
    },
    controls: {
        addObject: "Dodaj obiekt",
        filters: "Filtry",
        lssTltGen: "LSS TLT Gen",
        modify: "Zmień",
        requestLog: "Dziennik zmian",
        showAll: "Pokaż wszystkie",
        statistics: "Statystyki",
    },
    request: {
        time: "Czas żądania",
        modify: {
            delete: "zmodyfikował {1} (usunięte)",
            normal: "zmodyfikował {2} z przedmiotu {1}"
        }
    },
    cmp: {
        least: "jest mniejszy od",
        most: "jest większy od",
        exact: "jest równy"
    },
    todo: "[TODO]"
},

}