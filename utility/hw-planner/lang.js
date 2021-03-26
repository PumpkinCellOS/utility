/*
    HW Planner i18n
    Sppmacd (c) 2021
*/

var LANG_en_US = 
{
    label: {
        none: {
            display: "(No label)"
        },
        noLabel: "No label"
    },
    serverError: {
        unknown: "Unknown error"
    },
    status: {
        u: "Unknown",
        i: "In progress",
        n: "Not started",
        x: "Canceled",
        e: "Evaluation pending",
        p: "Preparation done",
        v: "Done",
        f: "Further information needed"
    },
    dataTable: {
        subject: "Subject",
        topic: "Topic",
        added: "Add time",
        turnIn: "Turn-in time",
        status: "Status",
        modify: "Modify"
    },
    time: {
        today: "Today",
        tommorow: "Tommorow",
        daysAgo: "{1} {2} ago",
        daysLeft: "{1} {2} left",
        hoursLeft: "{1} {2} left",
        nday: {
            s: "day",
            p: "days"
        },
        nhour: {
            s: "hour",
            p: "hours"
        }
    },
    exe: {
        book: "Book",
        chapter: "Chapter",
        page: "Page",
        point: "p.",
        topic: "Topic",
        ex: "Ex."
    }
};

var LANG_pl_PL = 
{
    label: {
        none: {
            display: "(Brak etykiety)"
        },
        noLabel: "Brak etykiety"
    },
    serverError: {
        unknown: "Nieznany błąd"
    },
    status: {
        u: "Nieznany",
        i: "W trakcie",
        n: "Nie rozpoczęty",
        x: "Anulowany",
        e: "Oczekuje na ocenę",
        p: "Przygotowany",
        v: "Zrobiony",
        f: "Wymaga dodatkowych informacji"
    },
    dataTable: {
        subject: "Przedmiot",
        topic: "Temat",
        added: "Dodano",
        turnIn: "Zwrot",
        status: "Status",
        modify: "Zmień"
    },
    time: {
        today: "Dzisiaj",
        tommorow: "Jutro",
        daysAgo: "{1} {2} temu",
        daysLeft: "Zostało {1} {2}",
        hoursLeft: "Zostało {1} {2}",
        nday: {
            s: "dzień",
            p: "dni"
        },
        nhour: {
            s: "godzina",
            p: "godzin"
        }
    },
    progress: {
        generating: "Generowanie...",
        loading: "Ładowanie..."
    },
    exe: {
        book: "Książka",
        chapter: "Rozdział",
        page: "Strona",
        point: "p.",
        topic: "Temat",
        ex: "Ćw."
    }
};

var LANG = LANG_pl_PL;

function L(key)
{
    var keys = key.split(".");
    var currentVal = LANG;
    for(var k in keys)
    {
        var _key = keys[k];
        var currentNew = currentVal[_key];
        if(currentNew === undefined)
        {
            console.warn(Error(`TRANSLATION ERROR: No translation key '${_key}' in '${keys.slice(0, k).join(".")}'`));
            return "{" + key + "}(" + Array.from(arguments).slice(1).join(",") + ")";
        }
        currentVal = currentNew;
        lastKey = k;
    }
    for(var i = 1; i < arguments.length; i++)
    {
        currentVal = currentVal.replaceAll(`{${i}}`, arguments[i]);
    }
    return currentVal;
}
