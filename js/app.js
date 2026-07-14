"use strict";

const STORAGE_KEYS = {
    permit: "aufenthaltPlaner.permit",
    documents: "aufenthaltPlaner.documents",
    appointment: "aufenthaltPlaner.appointment",
    applicationStatus: "aufenthaltPlaner.applicationStatus",
    theme: "aufenthaltPlaner.theme"
};

const statusSteps = [
    "Nicht begonnen",
    "Termin angefragt",
    "Termin erhalten",
    "Unterlagen vorbereitet",
    "Antrag eingereicht",
    "In Bearbeitung",
    "Weitere Unterlagen erforderlich",
    "Genehmigt",
    "Karte wird hergestellt",
    "Abgeschlossen"
];

const permitForm = document.querySelector("#permitForm");
const permitExpiryInput = document.querySelector("#permitExpiry");
const permitTypeInput = document.querySelector("#permitType");
const permitResult = document.querySelector("#permitResult");
const daysRemainingElement = document.querySelector("#daysRemaining");
const permitStatusElement = document.querySelector("#permitStatus");
const currentDateElement = document.querySelector("#currentDate");
const heroPermitStatus = document.querySelector("#heroPermitStatus");
const heroAppointmentStatus = document.querySelector(
    "#heroAppointmentStatus"
);
const heroDocumentStatus = document.querySelector(
    "#heroDocumentStatus"
);
const permitTask = document.querySelector("#permitTask span:last-child");
const appointmentTask = document.querySelector("#appointmentTask span:last-child");
const documentsTask = document.querySelector("#documentsTask span:last-child");
const applicationStatusInput = document.querySelector(
    "#applicationStatus"
);
const applicationStatusCard = document.querySelector(
    "#applicationStatusCard"
);
const progressText = document.querySelector("#progressText");
const progressBar = document.querySelector("#progressBar");
const progressTrack = document.querySelector("#progressTrack");

const documentCheckboxes = Array.from(
    document.querySelectorAll("[data-document]")
);
const documentProgress = document.querySelector("#documentProgress");
const resetDocumentsButton = document.querySelector(
    "#resetDocumentsButton"
);

const appointmentForm = document.querySelector("#appointmentForm");
const appointmentDateInput = document.querySelector("#appointmentDate");
const appointmentTimeInput = document.querySelector("#appointmentTime");
const appointmentOfficeInput = document.querySelector(
    "#appointmentOfficeInput"
);

const permitProgressBar = document.querySelector(
    "#permitProgressBar"
);

const permitProgressTrack = document.querySelector(
    "#permitProgressTrack"
);

const permitProgressLabel = document.querySelector(
    "#permitProgressLabel"
);
const appointmentPurposeInput = document.querySelector(
    "#appointmentPurpose"
);
const appointmentResult = document.querySelector("#appointmentResult");
const nextAppointment = document.querySelector("#nextAppointment");
const appointmentOffice = document.querySelector("#appointmentOffice");

const navItems = Array.from(document.querySelectorAll(".nav-item"));
const sections = Array.from(document.querySelectorAll(".page-section"));

const themeButton = document.querySelector("#themeButton");

const deleteAllDataButton = document.querySelector(
    "#deleteAllDataButton"
    );
const quickActionButtons = Array.from(
    document.querySelectorAll(".quick-action-button")
);

function saveToStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function loadFromStorage(key, fallbackValue) {
    const savedValue = localStorage.getItem(key);

    if (savedValue === null) {
        return fallbackValue;
    }

    try {
        return JSON.parse(savedValue);
    } catch (error) {
        console.error(`Gespeicherte Daten konnten nicht gelesen werden: ${key}`);
        return fallbackValue;
    }
}

function parseLocalDate(dateString) {
    const [year, month, day] = dateString
        .split("-")
        .map(Number);

    return new Date(year, month - 1, day);
}

function calculateDaysRemaining(dateString) {
    const today = new Date();
    const targetDate = parseLocalDate(dateString);

    today.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);

    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const difference = targetDate.getTime() - today.getTime();

    return Math.ceil(difference / millisecondsPerDay);
}

function formatGermanDate(dateString) {
    const date = parseLocalDate(dateString);

    return new Intl.DateTimeFormat("de-DE", {
        day: "2-digit",
        month: "long",
        year: "numeric"
    }).format(date);
}

function updatePermitDisplay(permit) {
    if (!permit || !permit.expiryDate) {
        daysRemainingElement.textContent = "Noch nicht eingetragen";
        permitStatusElement.textContent = "Kein Datum";
        permitStatusElement.className = "status-badge neutral";

        permitResult.textContent =
            "Trage ein Gültigkeitsdatum ein, um die verbleibenden Tage zu berechnen.";

        return;
    }

    const days = calculateDaysRemaining(permit.expiryDate);
    const formattedDate = formatGermanDate(permit.expiryDate);

    permitExpiryInput.value = permit.expiryDate;
    permitTypeInput.value = permit.type;

    if (days < 0) {
        daysRemainingElement.textContent = "Abgelaufen";
        permitStatusElement.textContent = "Abgelaufen";
        permitStatusElement.className = "status-badge danger";

        permitResult.textContent =
            `${permit.type}: seit ${Math.abs(days)} Tagen abgelaufen. ` +
            `Gültigkeitsdatum: ${formattedDate}.`;

        return;
    }

    if (days === 0) {
        daysRemainingElement.textContent = "Läuft heute ab";
        permitStatusElement.textContent = "Dringend";
        permitStatusElement.className = "status-badge danger";

        permitResult.textContent =
            `${permit.type}: läuft heute ab.`;

        return;
    }

    daysRemainingElement.textContent =
        days === 1
            ? "Noch 1 Tag"
            : `Noch ${days} Tage`;

    if (days <= 14) {
        permitStatusElement.textContent = "Dringend";
        permitStatusElement.className = "status-badge danger";
    } else if (days <= 60) {
        permitStatusElement.textContent = "Bald ablaufend";
        permitStatusElement.className = "status-badge warning";
    } else {
        permitStatusElement.textContent = "Gültig";
        permitStatusElement.className = "status-badge success";
    }

    permitResult.textContent =
        `${permit.type}: gültig bis ${formattedDate}. ` +
        `Es verbleiben ${days} Tage.`;
}

function handlePermitSubmit(event) {
    event.preventDefault();

    const expiryDate = permitExpiryInput.value;
    const type = permitTypeInput.value;

    if (!expiryDate) {
        permitResult.textContent =
            "Bitte wähle ein gültiges Datum aus.";
        return;
    }

    const permit = {
        expiryDate,
        type
    };

    saveToStorage(STORAGE_KEYS.permit, permit);
    updatePermitDisplay(permit);
    updateTasks();
    updateHeroStatus();
}

function updateApplicationStatus(status) {
    const statusIndex = statusSteps.indexOf(status);
    const maximumIndex = statusSteps.length - 1;

    const percentage =
        statusIndex < 0
            ? 0
            : Math.round((statusIndex / maximumIndex) * 100);

    applicationStatusInput.value = status;
    applicationStatusCard.textContent = status;
    progressText.textContent = `${percentage} %`;
    progressBar.style.width = `${percentage}%`;

    progressTrack.setAttribute(
        "aria-valuenow",
        String(percentage)
    );
}

function handleApplicationStatusChange() {
    const selectedStatus = applicationStatusInput.value;

    saveToStorage(
        STORAGE_KEYS.applicationStatus,
        selectedStatus
    );

    updateApplicationStatus(selectedStatus);
}

function getSelectedDocuments() {
    return documentCheckboxes
        .filter((checkbox) => checkbox.checked)
        .map((checkbox) => checkbox.dataset.document);
}

function updateDocumentProgress() {
    const selectedDocuments = getSelectedDocuments();

    documentProgress.textContent =
        `${selectedDocuments.length} von ${documentCheckboxes.length}`;
}

function saveDocumentSelection() {
    const selectedDocuments = getSelectedDocuments();

    saveToStorage(
        STORAGE_KEYS.documents,
        selectedDocuments
    );

    updateDocumentProgress();
    updateTasks();
    updateHeroStatus();
}

function loadDocumentSelection() {
    const selectedDocuments = loadFromStorage(
        STORAGE_KEYS.documents,
        []
    );

    documentCheckboxes.forEach((checkbox) => {
        checkbox.checked = selectedDocuments.includes(
            checkbox.dataset.document
        );
    });

    updateDocumentProgress();
}

function resetDocumentSelection() {
    const confirmed = window.confirm(
        "Möchtest du alle Markierungen entfernen?"
    );

    if (!confirmed) {
        return;
    }

    documentCheckboxes.forEach((checkbox) => {
        checkbox.checked = false;
    });

    saveDocumentSelection();
}

function updateAppointmentDisplay(appointment) {
    if (!appointment || !appointment.date) {
        nextAppointment.textContent = "Kein Termin";
        appointmentOffice.textContent = "Noch nicht eingetragen";
        appointmentResult.textContent =
            "Noch kein Termin gespeichert.";

        return;
    }

    appointmentDateInput.value = appointment.date;
    appointmentTimeInput.value = appointment.time;
    appointmentOfficeInput.value = appointment.office;
    appointmentPurposeInput.value = appointment.purpose || "";

    const formattedDate = formatGermanDate(appointment.date);
    const days = calculateDaysRemaining(appointment.date);

    nextAppointment.textContent =
        `${formattedDate}, ${appointment.time} Uhr`;

    appointmentOffice.textContent = appointment.office;

    let timeMessage;

    if (days < 0) {
        timeMessage =
            `Der gespeicherte Termin war vor ${Math.abs(days)} Tagen.`;
    } else if (days === 0) {
        timeMessage = "Der Termin ist heute.";
    } else if (days === 1) {
        timeMessage = "Der Termin ist morgen.";
    } else {
        timeMessage = `Der Termin ist in ${days} Tagen.`;
    }

    const purposeMessage = appointment.purpose
        ? ` Anliegen: ${appointment.purpose}.`
        : "";

    appointmentResult.textContent =
        `${timeMessage} ${appointment.office}, ` +
        `${formattedDate} um ${appointment.time} Uhr.` +
        purposeMessage;
}

function handleAppointmentSubmit(event) {
    event.preventDefault();

    const appointment = {
        date: appointmentDateInput.value,
        time: appointmentTimeInput.value,
        office: appointmentOfficeInput.value.trim(),
        purpose: appointmentPurposeInput.value.trim()
    };

    if (
        !appointment.date ||
        !appointment.time ||
        !appointment.office
    ) {
        appointmentResult.textContent =
            "Bitte fülle Datum, Uhrzeit und Behörde aus.";
        return;
    }

    saveToStorage(
        STORAGE_KEYS.appointment,
        appointment
    );

    updateAppointmentDisplay(appointment);
    updateTasks();
    updateHeroStatus();
}

function showSection(sectionId) {
    sections.forEach((section) => {
        section.classList.toggle(
            "active-section",
            section.id === sectionId
        );
    });

    navItems.forEach((item) => {
        item.classList.toggle(
            "active",
            item.dataset.section === sectionId
        );
    });
}

function handleQuickAction(button) {
    const targetSection = button.dataset.targetSection;
    const focusElementId = button.dataset.focusElement;

    showSection(targetSection);

    if (!focusElementId) {
        return;
    }

    window.setTimeout(() => {
        const focusElement = document.getElementById(focusElementId);

        if (focusElement) {
            focusElement.focus();
            focusElement.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        }
    }, 100);
}

function loadTheme() {
    const savedTheme = loadFromStorage(
        STORAGE_KEYS.theme,
        "light"
    );

    const darkModeEnabled = savedTheme === "dark";

    document.body.classList.toggle(
        "dark-mode",
        darkModeEnabled
    );

    themeButton.textContent = darkModeEnabled
        ? "Hellmodus"
        : "Dunkelmodus";
}

function toggleTheme() {
    const darkModeEnabled =
        document.body.classList.toggle("dark-mode");

    const theme = darkModeEnabled ? "dark" : "light";

    saveToStorage(STORAGE_KEYS.theme, theme);

    themeButton.textContent = darkModeEnabled
        ? "Hellmodus"
        : "Dunkelmodus";
}

function deleteAllData() {
    const confirmed = window.confirm(
        "Alle lokal gespeicherten Daten wirklich löschen?"
    );

    if (!confirmed) {
        return;
    }

    Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
    });

    window.location.reload();
}

function initializeApplication() {
    const permit = loadFromStorage(
        STORAGE_KEYS.permit,
        null

    );

    const appointment = loadFromStorage(
        STORAGE_KEYS.appointment,
        null
    );

    const applicationStatus = loadFromStorage(
        STORAGE_KEYS.applicationStatus,
        "Nicht begonnen"
    );

    updatePermitDisplay(permit);
    updateAppointmentDisplay(appointment);
    updateApplicationStatus(applicationStatus);
    loadDocumentSelection();

    loadTheme();
     
    updateCurrentDate();
    updateTasks();
    updateHeroStatus();
}

permitForm.addEventListener(
    "submit",
    handlePermitSubmit
);

applicationStatusInput.addEventListener(
    "change",
    handleApplicationStatusChange
);

documentCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener(
        "change",
        saveDocumentSelection
    );
});

resetDocumentsButton.addEventListener(
    "click",
    resetDocumentSelection
);

appointmentForm.addEventListener(
    "submit",
    handleAppointmentSubmit
);

navItems.forEach((item) => {
    item.addEventListener("click", () => {
        showSection(item.dataset.section);
    });
});
quickActionButtons.forEach((button) => {
    button.addEventListener("click", () => {
        handleQuickAction(button);
    });
});

themeButton.addEventListener(
    "click",
    toggleTheme
);

deleteAllDataButton.addEventListener(
    "click",
    deleteAllData
);
function updateCurrentDate() {
    const today = new Date();

    const formattedDate = today.toLocaleDateString("de-DE", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    currentDateElement.textContent = `Heute: ${formattedDate}`;
}
function updateHeroStatus() {
    const permit = loadFromStorage(
        STORAGE_KEYS.permit,
        null
    );

    const appointment = loadFromStorage(
        STORAGE_KEYS.appointment,
        null
    );

    const selectedDocuments = loadFromStorage(
        STORAGE_KEYS.documents,
        []
    );

    if (!permit || !permit.expiryDate) {
        heroPermitStatus.textContent =
            "Noch nicht eingetragen";
    } else {
        const days = calculateDaysRemaining(
            permit.expiryDate
        );

        if (days < 0) {
            heroPermitStatus.textContent =
                `Seit ${Math.abs(days)} Tagen abgelaufen`;
        } else if (days === 0) {
            heroPermitStatus.textContent =
                "Läuft heute ab";
        } else if (days === 1) {
            heroPermitStatus.textContent =
                "Noch 1 Tag gültig";
        } else {
            heroPermitStatus.textContent =
                `Noch ${days} Tage gültig`;
        }
    }

    if (!appointment || !appointment.date) {
        heroAppointmentStatus.textContent =
            "Kein Termin";
    } else {
        const formattedDate = formatGermanDate(
            appointment.date
        );

        heroAppointmentStatus.textContent =
            `${formattedDate}, ${appointment.time} Uhr`;
    }

    heroDocumentStatus.textContent =
        `${selectedDocuments.length} von ` +
        `${documentCheckboxes.length} vorbereitet`;
        if (!permit || !permit.expiryDate) {
    permitProgressBar.style.width = "0%";
    permitProgressBar.style.background = "#94a3b8";

    permitProgressLabel.textContent =
        "Kein Gültigkeitsdatum";

    permitProgressTrack.setAttribute(
        "aria-valuenow",
        "0"
    );

    return;
}

const days = calculateDaysRemaining(
    permit.expiryDate
);

const maxDays = 180;

let percentage =
    Math.min(days, maxDays) / maxDays * 100;

percentage = Math.max(0, percentage);

permitProgressBar.style.width =
    `${percentage}%`;

permitProgressTrack.setAttribute(
    "aria-valuenow",
    Math.round(percentage)
);

permitProgressLabel.textContent =
    `${days} Tage verbleibend`;

if (days <= 14) {
    permitProgressBar.style.background =
        "#ef4444";
} else if (days <= 60) {
    permitProgressBar.style.background =
        "#f59e0b";
} else {
    permitProgressBar.style.background =
        "#22c55e";
}
}

function updateTasks() {
    const permit = loadFromStorage(
        STORAGE_KEYS.permit,
        null
    );

    const appointment = loadFromStorage(
        STORAGE_KEYS.appointment,
        null
    );

    const selectedDocuments = loadFromStorage(
        STORAGE_KEYS.documents,
        []
    );

    if (!permit || !permit.expiryDate) {
        permitTask.textContent =
            "Aufenthaltstitel noch nicht eingetragen";
    } else {
        const days = calculateDaysRemaining(
            permit.expiryDate
        );

        if (days < 0) {
            permitTask.textContent =
                `Aufenthaltstitel seit ${Math.abs(days)} Tagen abgelaufen`;
        } else if (days === 0) {
            permitTask.textContent =
                "Aufenthaltstitel läuft heute ab";
        } else if (days <= 60) {
            permitTask.textContent =
                `Verlängerung vorbereiten: noch ${days} Tage`;
        } else {
            permitTask.textContent =
                `Aufenthaltstitel noch ${days} Tage gültig`;
        }
    }

    if (!appointment || !appointment.date) {
        appointmentTask.textContent =
            "Kein Termin vorhanden";
    } else {
        const formattedDate = formatGermanDate(
            appointment.date
        );

        appointmentTask.textContent =
            `Termin am ${formattedDate}`;
    }

    const completedDocuments = selectedDocuments.length;
    const totalDocuments = documentCheckboxes.length;
    const missingDocuments =
        totalDocuments - completedDocuments;

    if (missingDocuments === 0) {
        documentsTask.textContent =
            "Alle Unterlagen vorbereitet";
    } else {
        documentsTask.textContent =
            `${missingDocuments} Unterlagen fehlen`;
    }
}

initializeApplication();