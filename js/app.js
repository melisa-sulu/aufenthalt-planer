"use strict";

/*
    AufenthaltPlaner
    Veriler yalnızca tarayıcının localStorage alanında tutulur.
*/

const STORAGE_KEYS = {
    permit: "aufenthaltPlaner.permit",
    documents: "aufenthaltPlaner.documents",
    appointment: "aufenthaltPlaner.appointment",
    applicationStatus:
        "aufenthaltPlaner.applicationStatus",
    theme: "aufenthaltPlaner.theme"
};

const STATUS_STEPS = [
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

/* DOM ELEMENTS */

const currentDateElement =
    document.querySelector("#currentDate");

const permitForm =
    document.querySelector("#permitForm");

const permitExpiryInput =
    document.querySelector("#permitExpiry");

const permitTypeInput =
    document.querySelector("#permitType");

const permitResult =
    document.querySelector("#permitResult");

const heroPermitStatus =
    document.querySelector("#heroPermitStatus");

const permitProgressBar =
    document.querySelector("#permitProgressBar");

const permitProgressTrack =
    document.querySelector("#permitProgressTrack");

const permitProgressLabel =
    document.querySelector("#permitProgressLabel");

const permitProgressPercent =
    document.querySelector("#permitProgressPercent");

const heroAppointmentStatus =
    document.querySelector(
        "#heroAppointmentStatus"
    );

const heroAppointmentOffice =
    document.querySelector(
        "#heroAppointmentOffice"
    );

const heroDocumentStatus =
    document.querySelector(
        "#heroDocumentStatus"
    );

const heroDocumentMissing =
    document.querySelector(
        "#heroDocumentMissing"
    );

const applicationStatusInput =
    document.querySelector(
        "#applicationStatus"
    );

const progressText =
    document.querySelector("#progressText");

const progressBar =
    document.querySelector("#progressBar");

const progressTrack =
    document.querySelector("#progressTrack");

const documentCheckboxes =
    Array.from(
        document.querySelectorAll(
            "[data-document]"
        )
    );

const resetDocumentsButton =
    document.querySelector(
        "#resetDocumentsButton"
    );

const appointmentForm =
    document.querySelector(
        "#appointmentForm"
    );

const appointmentDateInput =
    document.querySelector(
        "#appointmentDate"
    );

const appointmentTimeInput =
    document.querySelector(
        "#appointmentTime"
    );

const appointmentOfficeInput =
    document.querySelector(
        "#appointmentOfficeInput"
    );

const appointmentPurposeInput =
    document.querySelector(
        "#appointmentPurpose"
    );

const appointmentResult =
    document.querySelector(
        "#appointmentResult"
    );

const permitTask =
    document.querySelector(
        "#permitTask span:last-child"
    );

const appointmentTask =
    document.querySelector(
        "#appointmentTask span:last-child"
    );

const documentsTask =
    document.querySelector(
        "#documentsTask span:last-child"
    );

const navItems =
    Array.from(
        document.querySelectorAll(
            ".nav-item"
        )
    );

const pageSections =
    Array.from(
        document.querySelectorAll(
            ".page-section"
        )
    );

const quickActionButtons =
    Array.from(
        document.querySelectorAll(
            ".quick-action-button"
        )
    );

const sidebarActionButtons =
    Array.from(
        document.querySelectorAll(
            ".sidebar-action"
        )
    );

const themeButton =
    document.querySelector(
        "#themeButton"
    );

const themeButtonText =
    document.querySelector(
        "#themeButtonText"
    );

const deleteAllDataButton =
    document.querySelector(
        "#deleteAllDataButton"
    );

/* STORAGE */

function saveToStorage(key, value) {
    localStorage.setItem(
        key,
        JSON.stringify(value)
    );
}

function loadFromStorage(
    key,
    fallbackValue
) {
    const savedValue =
        localStorage.getItem(key);

    if (savedValue === null) {
        return fallbackValue;
    }

    try {
        return JSON.parse(savedValue);
    } catch (error) {
        console.error(
            "Gespeicherte Daten konnten nicht gelesen werden:",
            key,
            error
        );

        return fallbackValue;
    }
}

/* DATE HELPERS */

function parseLocalDate(dateString) {
    const [
        year,
        month,
        day
    ] = dateString
        .split("-")
        .map(Number);

    return new Date(
        year,
        month - 1,
        day
    );
}

function calculateDaysRemaining(
    dateString
) {
    const today = new Date();

    const targetDate =
        parseLocalDate(dateString);

    today.setHours(
        0,
        0,
        0,
        0
    );

    targetDate.setHours(
        0,
        0,
        0,
        0
    );

    const millisecondsPerDay =
        1000 * 60 * 60 * 24;

    const difference =
        targetDate.getTime()
        -
        today.getTime();

    return Math.ceil(
        difference
        /
        millisecondsPerDay
    );
}

function formatGermanDate(
    dateString
) {
    const date =
        parseLocalDate(dateString);

    return new Intl.DateTimeFormat(
        "de-DE",
        {
            day: "2-digit",
            month: "long",
            year: "numeric"
        }
    ).format(date);
}

function updateCurrentDate() {
    const currentDate =
        new Date();

    const formattedDate =
        currentDate.toLocaleDateString(
            "de-DE",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );

    currentDateElement.textContent =
        `Heute: ${formattedDate}`;
}

/* DOCUMENT HELPERS */

function getSelectedDocuments() {
    return documentCheckboxes
        .filter(
            (checkbox) =>
                checkbox.checked
        )
        .map(
            (checkbox) =>
                checkbox.dataset.document
        );
}

function loadDocumentSelection() {
    const selectedDocuments =
        loadFromStorage(
            STORAGE_KEYS.documents,
            []
        );

    documentCheckboxes.forEach(
        (checkbox) => {
            checkbox.checked =
                selectedDocuments.includes(
                    checkbox.dataset.document
                );
        }
    );
}

/* PERMIT */

function updatePermitForm(
    permit
) {
    if (
        !permit
        ||
        !permit.expiryDate
    ) {
        permitResult.textContent =
            "Trage ein Gültigkeitsdatum ein, um die verbleibenden Tage zu berechnen.";

        return;
    }

    permitExpiryInput.value =
        permit.expiryDate;

    permitTypeInput.value =
        permit.type;

    const days =
        calculateDaysRemaining(
            permit.expiryDate
        );

    const formattedDate =
        formatGermanDate(
            permit.expiryDate
        );

    if (days < 0) {
        permitResult.textContent =
            `${permit.type}: seit ${Math.abs(days)} Tagen abgelaufen. ` +
            `Gültigkeitsdatum: ${formattedDate}.`;

        return;
    }

    if (days === 0) {
        permitResult.textContent =
            `${permit.type}: läuft heute ab.`;

        return;
    }

    permitResult.textContent =
        `${permit.type}: gültig bis ${formattedDate}. ` +
        `Es verbleiben ${days} Tage.`;
}

function updatePermitOverview(
    permit
) {
    if (
        !permit
        ||
        !permit.expiryDate
    ) {
        heroPermitStatus.textContent =
            "Noch nicht eingetragen";

        permitProgressLabel.textContent =
            "Kein Gültigkeitsdatum";

        permitProgressPercent.textContent =
            "0 %";

        permitProgressBar.style.width =
            "0%";

        permitProgressBar.style.background =
            "#94a3b8";

        permitProgressTrack.setAttribute(
            "aria-valuenow",
            "0"
        );

        return;
    }

    const days =
        calculateDaysRemaining(
            permit.expiryDate
        );

    const maximumDays = 180;

    const percentage =
        Math.max(
            0,
            Math.min(
                100,
                (
                    Math.max(
                        days,
                        0
                    )
                    /
                    maximumDays
                )
                *
                100
            )
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

    permitProgressLabel.textContent =
        days >= 0
            ? `${days} Tage verbleibend`
            : "Gültigkeit abgelaufen";

    permitProgressPercent.textContent =
        `${Math.round(percentage)} %`;

    permitProgressBar.style.width =
        `${percentage}%`;

    permitProgressTrack.setAttribute(
        "aria-valuenow",
        String(
            Math.round(
                percentage
            )
        )
    );

    if (days <= 14) {
        permitProgressBar.style.background =
            "#cb4d47";
    } else if (days <= 60) {
        permitProgressBar.style.background =
            "#d38d2a";
    } else {
        permitProgressBar.style.background =
            "#4c9d59";
    }
}

function handlePermitSubmit(
    event
) {
    event.preventDefault();

    const expiryDate =
        permitExpiryInput.value;

    const type =
        permitTypeInput.value;

    if (!expiryDate) {
        permitResult.textContent =
            "Bitte wähle ein gültiges Datum aus.";

        return;
    }

    saveToStorage(
        STORAGE_KEYS.permit,
        {
            expiryDate,
            type
        }
    );

    refreshApplication();
}

/* APPOINTMENTS */

function updateAppointmentForm(
    appointment
) {
    if (
        !appointment
        ||
        !appointment.date
    ) {
        appointmentResult.textContent =
            "Noch kein Termin gespeichert.";

        return;
    }

    appointmentDateInput.value =
        appointment.date;

    appointmentTimeInput.value =
        appointment.time;

    appointmentOfficeInput.value =
        appointment.office;

    appointmentPurposeInput.value =
        appointment.purpose || "";

    const days =
        calculateDaysRemaining(
            appointment.date
        );

    let timeMessage;

    if (days < 0) {
        timeMessage =
            `Der gespeicherte Termin war vor ${Math.abs(days)} Tagen.`;
    } else if (days === 0) {
        timeMessage =
            "Der Termin ist heute.";
    } else if (days === 1) {
        timeMessage =
            "Der Termin ist morgen.";
    } else {
        timeMessage =
            `Der Termin ist in ${days} Tagen.`;
    }

    const purposeMessage =
        appointment.purpose
            ? ` Anliegen: ${appointment.purpose}.`
            : "";

    appointmentResult.textContent =
        `${timeMessage} ` +
        `${appointment.office}, ` +
        `${formatGermanDate(appointment.date)} ` +
        `um ${appointment.time} Uhr.` +
        purposeMessage;
}

function updateAppointmentOverview(
    appointment
) {
    if (
        !appointment
        ||
        !appointment.date
    ) {
        heroAppointmentStatus.textContent =
            "Kein Termin";

        heroAppointmentOffice.textContent =
            "Noch nicht eingetragen";

        return;
    }

    heroAppointmentStatus.textContent =
        `${formatGermanDate(appointment.date)}, ` +
        `${appointment.time} Uhr`;

    heroAppointmentOffice.textContent =
        appointment.office;
}

function handleAppointmentSubmit(
    event
) {
    event.preventDefault();

    const appointment = {
        date:
            appointmentDateInput.value,

        time:
            appointmentTimeInput.value,

        office:
            appointmentOfficeInput
                .value
                .trim(),

        purpose:
            appointmentPurposeInput
                .value
                .trim()
    };

    if (
        !appointment.date
        ||
        !appointment.time
        ||
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

    refreshApplication();
}

/* DOCUMENT OVERVIEW */

function updateDocumentOverview(
    selectedDocuments
) {
    const completedDocuments =
        selectedDocuments.length;

    const totalDocuments =
        documentCheckboxes.length;

    const missingDocuments =
        totalDocuments
        -
        completedDocuments;

    heroDocumentStatus.textContent =
        `${completedDocuments} von ${totalDocuments} vorbereitet`;

    heroDocumentMissing.textContent =
        missingDocuments === 0
            ? "Alle Unterlagen vollständig"
            : `${missingDocuments} Unterlagen fehlen`;
}

function saveDocumentSelection() {
    saveToStorage(
        STORAGE_KEYS.documents,
        getSelectedDocuments()
    );

    refreshApplication();
}

function resetDocumentSelection() {
    const confirmed =
        window.confirm(
            "Möchtest du alle Markierungen entfernen?"
        );

    if (!confirmed) {
        return;
    }

    documentCheckboxes.forEach(
        (checkbox) => {
            checkbox.checked = false;
        }
    );

    saveDocumentSelection();
}

/* APPLICATION STATUS */

function updateApplicationStatus(
    status
) {
    const statusIndex =
        STATUS_STEPS.indexOf(status);

    const maximumIndex =
        STATUS_STEPS.length - 1;

    const percentage =
        statusIndex < 0
            ? 0
            : Math.round(
                (
                    statusIndex
                    /
                    maximumIndex
                )
                *
                100
            );

    applicationStatusInput.value =
        status;

    progressText.textContent =
        `${percentage} %`;

    progressBar.style.width =
        `${percentage}%`;

    progressTrack.setAttribute(
        "aria-valuenow",
        String(percentage)
    );
}

function handleApplicationStatusChange() {
    const selectedStatus =
        applicationStatusInput.value;

    saveToStorage(
        STORAGE_KEYS.applicationStatus,
        selectedStatus
    );

    updateApplicationStatus(
        selectedStatus
    );
}

/* TASKS */

function updateTasks(
    permit,
    appointment,
    selectedDocuments
) {
    if (
        !permit
        ||
        !permit.expiryDate
    ) {
        permitTask.textContent =
            "Aufenthaltstitel noch nicht eingetragen";
    } else {
        const days =
            calculateDaysRemaining(
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

    if (
        !appointment
        ||
        !appointment.date
    ) {
        appointmentTask.textContent =
            "Kein Termin vorhanden";
    } else {
        appointmentTask.textContent =
            `Termin am ${formatGermanDate(appointment.date)}`;
    }

    const missingDocuments =
        documentCheckboxes.length
        -
        selectedDocuments.length;

    documentsTask.textContent =
        missingDocuments === 0
            ? "Alle Unterlagen vorbereitet"
            : `${missingDocuments} Unterlagen fehlen`;
}

/* NAVIGATION */

function showSection(
    sectionId
) {
    pageSections.forEach(
        (section) => {
            section.classList.toggle(
                "active-section",
                section.id === sectionId
            );
        }
    );

    navItems.forEach(
        (item) => {
            item.classList.toggle(
                "active",
                item.dataset.section === sectionId
            );
        }
    );

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function handleSectionAction(
    button
) {
    const targetSection =
        button.dataset.targetSection;

    const focusElementId =
        button.dataset.focusElement;

    showSection(targetSection);

    if (!focusElementId) {
        return;
    }

    window.setTimeout(
        () => {
            const focusElement =
                document.getElementById(
                    focusElementId
                );

            if (!focusElement) {
                return;
            }

            focusElement.focus();

            focusElement.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        },
        120
    );
}

/* THEME */

function loadTheme() {
    const savedTheme =
        loadFromStorage(
            STORAGE_KEYS.theme,
            "light"
        );

    const darkModeEnabled =
        savedTheme === "dark";

    document.body.classList.toggle(
        "dark-mode",
        darkModeEnabled
    );

    themeButtonText.textContent =
        darkModeEnabled
            ? "Hellmodus"
            : "Dunkelmodus";
}

function toggleTheme() {
    const darkModeEnabled =
        document.body.classList.toggle(
            "dark-mode"
        );

    saveToStorage(
        STORAGE_KEYS.theme,
        darkModeEnabled
            ? "dark"
            : "light"
    );

    themeButtonText.textContent =
        darkModeEnabled
            ? "Hellmodus"
            : "Dunkelmodus";
}

/* DELETE DATA */

function deleteAllData() {
    const confirmed =
        window.confirm(
            "Alle lokal gespeicherten Daten wirklich löschen?"
        );

    if (!confirmed) {
        return;
    }

    Object.values(
        STORAGE_KEYS
    ).forEach(
        (key) => {
            localStorage.removeItem(key);
        }
    );

    window.location.reload();
}

/* REFRESH */

function refreshApplication() {
    const permit =
        loadFromStorage(
            STORAGE_KEYS.permit,
            null
        );

    const appointment =
        loadFromStorage(
            STORAGE_KEYS.appointment,
            null
        );

    const selectedDocuments =
        loadFromStorage(
            STORAGE_KEYS.documents,
            []
        );

    updatePermitForm(permit);

    updatePermitOverview(permit);

    updateAppointmentForm(
        appointment
    );

    updateAppointmentOverview(
        appointment
    );

    updateDocumentOverview(
        selectedDocuments
    );

    updateTasks(
        permit,
        appointment,
        selectedDocuments
    );
}

/* INITIALIZATION */

function initializeApplication() {
    const applicationStatus =
        loadFromStorage(
            STORAGE_KEYS.applicationStatus,
            "Nicht begonnen"
        );

    updateCurrentDate();

    loadTheme();

    loadDocumentSelection();

    updateApplicationStatus(
        applicationStatus
    );

    refreshApplication();
}

/* EVENT LISTENERS */

permitForm.addEventListener(
    "submit",
    handlePermitSubmit
);

appointmentForm.addEventListener(
    "submit",
    handleAppointmentSubmit
);

applicationStatusInput.addEventListener(
    "change",
    handleApplicationStatusChange
);

documentCheckboxes.forEach(
    (checkbox) => {
        checkbox.addEventListener(
            "change",
            saveDocumentSelection
        );
    }
);

resetDocumentsButton.addEventListener(
    "click",
    resetDocumentSelection
);

navItems.forEach(
    (item) => {
        item.addEventListener(
            "click",
            () => {
                showSection(
                    item.dataset.section
                );
            }
        );
    }
);

[
    ...quickActionButtons,
    ...sidebarActionButtons
].forEach(
    (button) => {
        button.addEventListener(
            "click",
            () => {
                handleSectionAction(
                    button
                );
            }
        );
    }
);

themeButton.addEventListener(
    "click",
    toggleTheme
);

deleteAllDataButton.addEventListener(
    "click",
    deleteAllData
);

initializeApplication(); 