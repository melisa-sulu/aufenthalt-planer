"use strict";

/* ==================================================
   AUFENTHALTPLANER
   Teil 1: Daten, Hilfsfunktionen und Darstellung
   ================================================== */

/* ==================================================
   STORAGE KEYS
   ================================================== */

const STORAGE_KEYS = {
    permit: "aufenthaltPlaner.v2.permit",
    documents: "aufenthaltPlaner.v2.documents",
    appointment: "aufenthaltPlaner.v2.appointment",
    applicationStatus: "aufenthaltPlaner.v2.applicationStatus",
    theme: "aufenthaltPlaner.v2.theme",
    note: "aufenthaltPlaner.v2.note",
    authority: "aufenthaltPlaner.v2.authority"
};

/* ==================================================
   STATIC DATA
   ================================================== */

const APPLICATION_STEPS = [
    {
        value: "Nicht begonnen",
        title: "Nicht begonnen",
        description: "Die Vorbereitung wurde noch nicht gestartet."
    },
    {
        value: "Termin angefragt",
        title: "Termin angefragt",
        description: "Eine Terminanfrage wurde an die Behörde gesendet."
    },
    {
        value: "Termin erhalten",
        title: "Termin erhalten",
        description: "Ein Behördentermin wurde bestätigt."
    },
    {
        value: "Unterlagen vorbereitet",
        title: "Unterlagen vorbereitet",
        description: "Die erforderlichen Unterlagen wurden zusammengestellt."
    },
    {
        value: "Antrag eingereicht",
        title: "Antrag eingereicht",
        description: "Der Antrag wurde bei der zuständigen Behörde eingereicht."
    },
    {
        value: "In Bearbeitung",
        title: "In Bearbeitung",
        description: "Der Antrag wird derzeit von der Behörde geprüft."
    },
    {
        value: "Weitere Unterlagen erforderlich",
        title: "Weitere Unterlagen erforderlich",
        description: "Die Behörde benötigt zusätzliche Dokumente."
    },
    {
        value: "Genehmigt",
        title: "Genehmigt",
        description: "Der Antrag wurde genehmigt."
    },
    {
        value: "Karte wird hergestellt",
        title: "Karte wird hergestellt",
        description: "Der elektronische Aufenthaltstitel wird produziert."
    },
    {
        value: "Abgeschlossen",
        title: "Abgeschlossen",
        description: "Das Verfahren wurde vollständig abgeschlossen."
    }
];

const DOCUMENT_INFORMATION = {
    Reisepass: {
        title: "Reisepass",
        description:
            "Ein gültiger Reisepass und eine Kopie der Datenseite werden häufig benötigt.",
        reason:
            "Der Reisepass dient als Identitäts- und Staatsangehörigkeitsnachweis."
    },

    "Biometrisches Passfoto": {
        title: "Biometrisches Passfoto",
        description:
            "Ein aktuelles biometrisches Foto nach den geltenden Vorgaben.",
        reason:
            "Das Foto wird für den elektronischen Aufenthaltstitel verwendet."
    },

    Meldebescheinigung: {
        title: "Meldebescheinigung",
        description:
            "Ein Nachweis über deinen aktuell gemeldeten Wohnsitz.",
        reason:
            "Die Behörde prüft damit deine örtliche Zuständigkeit und Adresse."
    },

    Krankenversicherung: {
        title: "Krankenversicherungsnachweis",
        description:
            "Eine aktuelle Bescheinigung deiner Krankenversicherung.",
        reason:
            "Ein ausreichender Krankenversicherungsschutz ist häufig erforderlich."
    },

    Immatrikulationsbescheinigung: {
        title: "Immatrikulationsbescheinigung",
        description:
            "Eine aktuelle Studienbescheinigung deiner Hochschule.",
        reason:
            "Sie weist nach, dass du derzeit an einer Hochschule eingeschrieben bist."
    },

    Finanzierungsnachweis: {
        title: "Finanzierungsnachweis",
        description:
            "Zum Beispiel ein Sperrkonto, Stipendium oder eine Verpflichtungserklärung.",
        reason:
            "Damit wird nachgewiesen, dass dein Lebensunterhalt gesichert ist."
    }
};

/* ==================================================
   DOM ELEMENTS
   ================================================== */

const sidebar = document.querySelector("#sidebar");
const mobileMenuButton = document.querySelector("#mobileMenuButton");

const navigationButtons = Array.from(
    document.querySelectorAll(".navigation-button")
);

const appPages = Array.from(
    document.querySelectorAll(".app-page")
);

const pageTargetButtons = Array.from(
    document.querySelectorAll("[data-page-target]")
);

const currentDateElement = document.querySelector("#currentDate");

/* Dashboard */

const dashboardPermitValue = document.querySelector(
    "#dashboardPermitValue"
);

const dashboardPermitDetail = document.querySelector(
    "#dashboardPermitDetail"
);

const dashboardPermitProgress = document.querySelector(
    "#dashboardPermitProgress"
);

const dashboardAppointmentValue = document.querySelector(
    "#dashboardAppointmentValue"
);

const dashboardAppointmentDetail = document.querySelector(
    "#dashboardAppointmentDetail"
);

const dashboardDocumentsValue = document.querySelector(
    "#dashboardDocumentsValue"
);

const dashboardDocumentsDetail = document.querySelector(
    "#dashboardDocumentsDetail"
);

const dashboardDocumentsProgress = document.querySelector(
    "#dashboardDocumentsProgress"
);

const dashboardApplicationValue = document.querySelector(
    "#dashboardApplicationValue"
);

const dashboardApplicationDetail = document.querySelector(
    "#dashboardApplicationDetail"
);

const dashboardApplicationProgress = document.querySelector(
    "#dashboardApplicationProgress"
);

const compactDocumentList = document.querySelector(
    "#compactDocumentList"
);

/* Permit */

const permitForm = document.querySelector("#permitForm");
const permitTypeInput = document.querySelector("#permitType");
const permitExpiryInput = document.querySelector("#permitExpiry");
const permitNoteInput = document.querySelector("#permitNote");

const permitDetailType = document.querySelector("#permitDetailType");
const permitDetailBadge = document.querySelector("#permitDetailBadge");
const permitDetailExpiry = document.querySelector("#permitDetailExpiry");
const permitDetailDays = document.querySelector("#permitDetailDays");
const permitRenewalDate = document.querySelector("#permitRenewalDate");

/* Documents */

const documentCheckboxes = Array.from(
    document.querySelectorAll("[data-document]")
);

const documentCards = Array.from(
    document.querySelectorAll("[data-document-card]")
);

const documentFilterButtons = Array.from(
    document.querySelectorAll("[data-document-filter]")
);

const documentDetailButtons = Array.from(
    document.querySelectorAll("[data-document-detail]")
);

const resetDocumentsButton = document.querySelector(
    "#resetDocumentsButton"
);

/* Appointments */

const appointmentForm = document.querySelector("#appointmentForm");
const appointmentDateInput = document.querySelector("#appointmentDate");
const appointmentTimeInput = document.querySelector("#appointmentTime");
const appointmentOfficeInput = document.querySelector("#appointmentOffice");
const appointmentAddressInput = document.querySelector(
    "#appointmentAddress"
);
const appointmentPurposeInput = document.querySelector(
    "#appointmentPurpose"
);

const appointmentPreviewMonth = document.querySelector(
    "#appointmentPreviewMonth"
);

const appointmentPreviewDay = document.querySelector(
    "#appointmentPreviewDay"
);

const appointmentPreviewYear = document.querySelector(
    "#appointmentPreviewYear"
);

const appointmentPreviewOffice = document.querySelector(
    "#appointmentPreviewOffice"
);

const appointmentPreviewTime = document.querySelector(
    "#appointmentPreviewTime"
);

const appointmentPreviewCountdown = document.querySelector(
    "#appointmentPreviewCountdown"
);

const largeAppointmentMonth = document.querySelector(
    "#largeAppointmentMonth"
);

const largeAppointmentDay = document.querySelector(
    "#largeAppointmentDay"
);

const largeAppointmentYear = document.querySelector(
    "#largeAppointmentYear"
);

const largeAppointmentOffice = document.querySelector(
    "#largeAppointmentOffice"
);

const largeAppointmentTime = document.querySelector(
    "#largeAppointmentTime"
);

const largeAppointmentAddress = document.querySelector(
    "#largeAppointmentAddress"
);

const largeAppointmentCountdown = document.querySelector(
    "#largeAppointmentCountdown"
);

/* Application */

const applicationStatusInput = document.querySelector(
    "#applicationStatus"
);

const applicationProgressText = document.querySelector(
    "#applicationProgressText"
);

const applicationProgressBar = document.querySelector(
    "#applicationProgressBar"
);

const applicationTimeline = document.querySelector(
    "#applicationTimeline"
);

/* FAQ */

const faqItems = Array.from(
    document.querySelectorAll(".faq-item")
);

/* Theme */

const themeButton = document.querySelector("#themeButton");
const settingsThemeButton = document.querySelector(
    "#settingsThemeButton"
);

/* Drawer */

const drawerBackdrop = document.querySelector("#drawerBackdrop");
const detailDrawer = document.querySelector("#detailDrawer");
const drawerCloseButton = document.querySelector(
    "#drawerCloseButton"
);
const drawerContent = document.querySelector("#drawerContent");
const drawerOpenButtons = Array.from(
    document.querySelectorAll("[data-open-drawer]")
);

/* Modal */

const modalBackdrop = document.querySelector("#modalBackdrop");
const modalCloseButton = document.querySelector("#modalCloseButton");
const modalContent = document.querySelector("#modalContent");
const modalOpenButtons = Array.from(
    document.querySelectorAll("[data-open-modal]")
);

/* Toast */

const toastContainer = document.querySelector("#toastContainer");

/* Settings */

const deleteAllDataButton = document.querySelector(
    "#deleteAllDataButton"
);

/* Other */

const exportButton = document.querySelector("#exportButton");

const informationTopicButtons = Array.from(
    document.querySelectorAll("[data-info-topic]")
);

/* ==================================================
   SAFE DOM HELPERS
   ================================================== */

function setText(element, value) {
    if (!element) {
        return;
    }

    element.textContent = value;
}

function setWidth(element, percentage) {
    if (!element) {
        return;
    }

    const safePercentage = Math.max(
        0,
        Math.min(100, Number(percentage) || 0)
    );

    element.style.width = `${safePercentage}%`;
}

/* ==================================================
   LOCAL STORAGE
   ================================================== */

function saveToStorage(key, value) {
    try {
        localStorage.setItem(
            key,
            JSON.stringify(value)
        );
    } catch (error) {
        console.error(
            "Daten konnten nicht gespeichert werden:",
            error
        );
    }
}

function loadFromStorage(key, fallbackValue) {
    const storedValue = localStorage.getItem(key);

    if (storedValue === null) {
        return fallbackValue;
    }

    try {
        return JSON.parse(storedValue);
    } catch (error) {
        console.error(
            "Gespeicherte Daten konnten nicht gelesen werden:",
            error
        );

        return fallbackValue;
    }
}

/* ==================================================
   DATE HELPERS
   ================================================== */

function parseLocalDate(dateString) {
    if (!dateString) {
        return null;
    }

    const parts = dateString
        .split("-")
        .map(Number);

    if (parts.length !== 3) {
        return null;
    }

    const [year, month, day] = parts;

    return new Date(
        year,
        month - 1,
        day
    );
}

function normalizeDate(date) {
    const copy = new Date(date);

    copy.setHours(0, 0, 0, 0);

    return copy;
}

function calculateDaysRemaining(dateString) {
    const targetDate = parseLocalDate(dateString);

    if (!targetDate) {
        return null;
    }

    const today = normalizeDate(new Date());
    const normalizedTarget = normalizeDate(targetDate);

    const millisecondsPerDay =
        1000 * 60 * 60 * 24;

    return Math.round(
        (
            normalizedTarget.getTime()
            -
            today.getTime()
        )
        /
        millisecondsPerDay
    );
}

function formatGermanDate(dateString) {
    const date = parseLocalDate(dateString);

    if (!date) {
        return "—";
    }

    return new Intl.DateTimeFormat(
        "de-DE",
        {
            day: "2-digit",
            month: "long",
            year: "numeric"
        }
    ).format(date);
}

function getMonthShort(dateString) {
    const date = parseLocalDate(dateString);

    if (!date) {
        return "—";
    }

    return new Intl.DateTimeFormat(
        "de-DE",
        {
            month: "short"
        }
    )
        .format(date)
        .replace(".", "")
        .toUpperCase();
}

function getDayNumber(dateString) {
    const date = parseLocalDate(dateString);

    if (!date) {
        return "—";
    }

    return String(date.getDate()).padStart(
        2,
        "0"
    );
}

function getYear(dateString) {
    const date = parseLocalDate(dateString);

    if (!date) {
        return String(new Date().getFullYear());
    }

    return String(date.getFullYear());
}

function calculateRenewalRecommendation(dateString) {
    const expiryDate = parseLocalDate(dateString);

    if (!expiryDate) {
        return "—";
    }

    const recommendationDate =
        new Date(expiryDate);

    recommendationDate.setDate(
        recommendationDate.getDate() - 90
    );

    return new Intl.DateTimeFormat(
        "de-DE",
        {
            day: "2-digit",
            month: "long",
            year: "numeric"
        }
    ).format(recommendationDate);
}

function formatCurrentDate() {
    const today = new Date();

    return new Intl.DateTimeFormat(
        "de-DE",
        {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    ).format(today);
}

function getAppointmentCountdown(days) {
    if (days === null) {
        return "Termin hinzufügen";
    }

    if (days < 0) {
        return `Termin war vor ${Math.abs(days)} Tagen`;
    }

    if (days === 0) {
        return "Der Termin ist heute";
    }

    if (days === 1) {
        return "Der Termin ist morgen";
    }

    return `Termin in ${days} Tagen`;
}

/* ==================================================
   DATA ACCESS
   ================================================== */

function getPermitData() {
    return loadFromStorage(
        STORAGE_KEYS.permit,
        null
    );
}

function getAppointmentData() {
    return loadFromStorage(
        STORAGE_KEYS.appointment,
        null
    );
}

function getSelectedDocuments() {
    return loadFromStorage(
        STORAGE_KEYS.documents,
        []
    );
}

function getApplicationStatus() {
    return loadFromStorage(
        STORAGE_KEYS.applicationStatus,
        "Nicht begonnen"
    );
}

/* ==================================================
   PERMIT RENDERING
   ================================================== */

function getPermitProgressPercentage(days) {
    if (
        days === null
        ||
        days <= 0
    ) {
        return 0;
    }

    const maximumDays = 180;

    return Math.min(
        100,
        Math.round(
            (
                days
                /
                maximumDays
            )
            *
            100
        )
    );
}

function getPermitStatusInformation(days) {
    if (days === null) {
        return {
            text: "Kein Datum",
            className: "neutral"
        };
    }

    if (days < 0) {
        return {
            text: "Abgelaufen",
            className: "danger"
        };
    }

    if (days === 0) {
        return {
            text: "Läuft heute ab",
            className: "danger"
        };
    }

    if (days <= 14) {
        return {
            text: "Dringend",
            className: "danger"
        };
    }

    if (days <= 60) {
        return {
            text: "Bald ablaufend",
            className: "warning"
        };
    }

    return {
        text: "Gültig",
        className: "success"
    };
}

function renderPermitInformation() {
    const permit = getPermitData();

    if (
        !permit
        ||
        !permit.expiryDate
    ) {
        setText(
            dashboardPermitValue,
            "Noch nicht eingetragen"
        );

        setText(
            dashboardPermitDetail,
            "Kein Gültigkeitsdatum vorhanden"
        );

        setWidth(
            dashboardPermitProgress,
            0
        );

        setText(
            permitDetailType,
            "Noch nicht eingetragen"
        );

        setText(
            permitDetailExpiry,
            "—"
        );

        setText(
            permitDetailDays,
            "—"
        );

        setText(
            permitRenewalDate,
            "—"
        );

        if (permitDetailBadge) {
            permitDetailBadge.textContent =
                "Kein Datum";

            permitDetailBadge.className =
                "status-pill neutral";
        }

        return;
    }

    const days = calculateDaysRemaining(
        permit.expiryDate
    );

    const progress =
        getPermitProgressPercentage(days);

    const status =
        getPermitStatusInformation(days);

    if (permitTypeInput) {
        permitTypeInput.value =
            permit.type || "Aufenthaltserlaubnis";
    }

    if (permitExpiryInput) {
        permitExpiryInput.value =
            permit.expiryDate;
    }

    if (permitNoteInput) {
        permitNoteInput.value =
            permit.note || "";
    }

    setText(
        dashboardPermitValue,
        days < 0
            ? "Aufenthaltstitel abgelaufen"
            : days === 0
                ? "Läuft heute ab"
                : `Noch ${days} Tage gültig`
    );

    setText(
        dashboardPermitDetail,
        `${permit.type || "Aufenthaltstitel"} · bis ` +
        formatGermanDate(permit.expiryDate)
    );

    setWidth(
        dashboardPermitProgress,
        progress
    );

    setText(
        permitDetailType,
        permit.type || "Aufenthaltstitel"
    );

    setText(
        permitDetailExpiry,
        formatGermanDate(permit.expiryDate)
    );

    setText(
        permitDetailDays,
        days < 0
            ? `Seit ${Math.abs(days)} Tagen abgelaufen`
            : days === 0
                ? "Läuft heute ab"
                : `${days} Tage`
    );

    setText(
        permitRenewalDate,
        calculateRenewalRecommendation(
            permit.expiryDate
        )
    );

    if (permitDetailBadge) {
        permitDetailBadge.textContent =
            status.text;

        permitDetailBadge.className =
            `status-pill ${status.className}`;
    }
}

/* ==================================================
   DOCUMENT RENDERING
   ================================================== */

function renderDocumentCards() {
    const selectedDocuments =
        getSelectedDocuments();

    documentCheckboxes.forEach(
        (checkbox) => {
            checkbox.checked =
                selectedDocuments.includes(
                    checkbox.dataset.document
                );
        }
    );

    documentCards.forEach(
        (card) => {
            const documentName =
                card.dataset.documentCard;

            const isCompleted =
                selectedDocuments.includes(
                    documentName
                );

            card.classList.toggle(
                "completed-document",
                isCompleted
            );

            card.dataset.documentState =
                isCompleted
                    ? "completed"
                    : "missing";
        }
    );
}

function renderDocumentSummary() {
    const selectedDocuments =
        getSelectedDocuments();

    const totalDocuments =
        documentCheckboxes.length;

    const completedCount =
        selectedDocuments.length;

    const missingCount =
        totalDocuments - completedCount;

    const percentage =
        totalDocuments === 0
            ? 0
            : Math.round(
                (
                    completedCount
                    /
                    totalDocuments
                )
                *
                100
            );

    setText(
        dashboardDocumentsValue,
        `${completedCount} von ${totalDocuments}`
    );

    setText(
        dashboardDocumentsDetail,
        missingCount === 0
            ? "Alle Dokumente vorhanden"
            : `${missingCount} Dokumente fehlen`
    );

    setWidth(
        dashboardDocumentsProgress,
        percentage
    );

    renderCompactDocumentList(
        selectedDocuments
    );
}

function renderCompactDocumentList(
    selectedDocuments
) {
    if (!compactDocumentList) {
        return;
    }

    const documentNames = Object.keys(
        DOCUMENT_INFORMATION
    ).slice(0, 4);

    compactDocumentList.innerHTML =
        documentNames
            .map(
                (documentName) => {
                    const completed =
                        selectedDocuments.includes(
                            documentName
                        );

                    return `
                        <div class="compact-document-row">
                            <span class="document-status ${
                                completed
                                    ? "completed"
                                    : "pending"
                            }">
                                ${completed ? "✓" : "!"}
                            </span>

                            <span class="compact-document-name">
                                ${documentName}
                            </span>

                            <span class="compact-document-state">
                                ${
                                    completed
                                        ? "Vorhanden"
                                        : "Fehlt"
                                }
                            </span>
                        </div>
                    `;
                }
            )
            .join("");
}

/* ==================================================
   APPOINTMENT RENDERING
   ================================================== */

function renderAppointmentInformation() {
    const appointment =
        getAppointmentData();

    if (
        !appointment
        ||
        !appointment.date
    ) {
        setText(
            dashboardAppointmentValue,
            "Kein Termin"
        );

        setText(
            dashboardAppointmentDetail,
            "Noch nicht eingetragen"
        );

        setText(
            appointmentPreviewMonth,
            "—"
        );

        setText(
            appointmentPreviewDay,
            "—"
        );

        setText(
            appointmentPreviewYear,
            String(new Date().getFullYear())
        );

        setText(
            appointmentPreviewOffice,
            "Noch kein Termin gespeichert"
        );

        setText(
            appointmentPreviewTime,
            "Datum und Uhrzeit fehlen"
        );

        setText(
            appointmentPreviewCountdown,
            "Termin hinzufügen"
        );

        setText(
            largeAppointmentMonth,
            "—"
        );

        setText(
            largeAppointmentDay,
            "—"
        );

        setText(
            largeAppointmentYear,
            String(new Date().getFullYear())
        );

        setText(
            largeAppointmentOffice,
            "Noch kein Termin gespeichert"
        );

        setText(
            largeAppointmentTime,
            "Datum und Uhrzeit fehlen"
        );

        setText(
            largeAppointmentAddress,
            "Keine Adresse vorhanden"
        );

        setText(
            largeAppointmentCountdown,
            "Termin hinzufügen"
        );

        return;
    }

    const days =
        calculateDaysRemaining(
            appointment.date
        );

    const formattedTime =
        appointment.time
            ? `${appointment.time} Uhr`
            : "Keine Uhrzeit";

    if (appointmentDateInput) {
        appointmentDateInput.value =
            appointment.date;
    }

    if (appointmentTimeInput) {
        appointmentTimeInput.value =
            appointment.time || "";
    }

    if (appointmentOfficeInput) {
        appointmentOfficeInput.value =
            appointment.office || "";
    }

    if (appointmentAddressInput) {
        appointmentAddressInput.value =
            appointment.address || "";
    }

    if (appointmentPurposeInput) {
        appointmentPurposeInput.value =
            appointment.purpose || "";
    }

    setText(
        dashboardAppointmentValue,
        formatGermanDate(appointment.date)
    );

    setText(
        dashboardAppointmentDetail,
        `${formattedTime} · ` +
        (appointment.office || "Behörde")
    );

    setText(
        appointmentPreviewMonth,
        getMonthShort(appointment.date)
    );

    setText(
        appointmentPreviewDay,
        getDayNumber(appointment.date)
    );

    setText(
        appointmentPreviewYear,
        getYear(appointment.date)
    );

    setText(
        appointmentPreviewOffice,
        appointment.office || "Behörde"
    );

    setText(
        appointmentPreviewTime,
        `${formatGermanDate(appointment.date)} · ${formattedTime}`
    );

    setText(
        appointmentPreviewCountdown,
        getAppointmentCountdown(days)
    );

    setText(
        largeAppointmentMonth,
        getMonthShort(appointment.date)
    );

    setText(
        largeAppointmentDay,
        getDayNumber(appointment.date)
    );

    setText(
        largeAppointmentYear,
        getYear(appointment.date)
    );

    setText(
        largeAppointmentOffice,
        appointment.office || "Behörde"
    );

    setText(
        largeAppointmentTime,
        `${formatGermanDate(appointment.date)} · ${formattedTime}`
    );

    setText(
        largeAppointmentAddress,
        appointment.address ||
        "Keine Adresse vorhanden"
    );

    setText(
        largeAppointmentCountdown,
        getAppointmentCountdown(days)
    );
}

/* ==================================================
   APPLICATION STATUS RENDERING
   ================================================== */

function getApplicationStepIndex(status) {
    const index =
        APPLICATION_STEPS.findIndex(
            (step) =>
                step.value === status
        );

    return index < 0
        ? 0
        : index;
}

function getApplicationPercentage(status) {
    const currentIndex =
        getApplicationStepIndex(status);

    const maximumIndex =
        APPLICATION_STEPS.length - 1;

    return Math.round(
        (
            currentIndex
            /
            maximumIndex
        )
        *
        100
    );
}

function renderApplicationTimeline(status) {
    if (!applicationTimeline) {
        return;
    }

    const currentIndex =
        getApplicationStepIndex(status);

    applicationTimeline.innerHTML =
        APPLICATION_STEPS
            .map(
                (step, index) => {
                    const completed =
                        index < currentIndex;

                    const current =
                        index === currentIndex;

                    return `
                        <li class="
                            application-timeline-item
                            ${completed ? "completed" : ""}
                            ${current ? "current" : ""}
                        ">
                            <span class="application-timeline-marker">
                                ${
                                    completed
                                        ? "✓"
                                        : index + 1
                                }
                            </span>

                            <h3>${step.title}</h3>

                            <p>
                                ${step.description}
                            </p>
                        </li>
                    `;
                }
            )
            .join("");
}

function renderApplicationStatus() {
    const status =
        getApplicationStatus();

    const percentage =
        getApplicationPercentage(status);

    if (applicationStatusInput) {
        applicationStatusInput.value =
            status;
    }

    setText(
        dashboardApplicationValue,
        status
    );

    setText(
        dashboardApplicationDetail,
        `${percentage} % abgeschlossen`
    );

    setWidth(
        dashboardApplicationProgress,
        percentage
    );

    setText(
        applicationProgressText,
        `${percentage} %`
    );

    setWidth(
        applicationProgressBar,
        percentage
    );

    renderApplicationTimeline(status);
}

/* ==================================================
   COMPLETE RENDER
   ================================================== */

function renderApplication() {
    renderPermitInformation();
    renderDocumentCards();
    renderDocumentSummary();
    renderAppointmentInformation();
    renderApplicationStatus();
}
/* ==================================================
   NAVIGATION
   ================================================== */

function showPage(pageId) {
    appPages.forEach((page) => {
        page.classList.toggle(
            "active-page",
            page.id === pageId
        );
    });

    navigationButtons.forEach((button) => {
        button.classList.toggle(
            "active",
            button.dataset.page === pageId
        );
    });

    if (sidebar) {
        sidebar.classList.remove("mobile-open");
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function handlePageTarget(button) {
    const pageId = button.dataset.pageTarget;

    if (!pageId) {
        return;
    }

    showPage(pageId);
}

/* ==================================================
   MOBILE MENU
   ================================================== */

function toggleMobileMenu() {
    if (!sidebar) {
        return;
    }

    sidebar.classList.toggle("mobile-open");
}

function closeMobileMenuOnOutsideClick(event) {
    if (
        !sidebar ||
        !sidebar.classList.contains("mobile-open")
    ) {
        return;
    }

    const clickedInsideSidebar =
        sidebar.contains(event.target);

    const clickedMenuButton =
        mobileMenuButton &&
        mobileMenuButton.contains(event.target);

    if (
        !clickedInsideSidebar &&
        !clickedMenuButton
    ) {
        sidebar.classList.remove("mobile-open");
    }
}

/* ==================================================
   TOAST
   ================================================== */

function showToast(
    title,
    message,
    type = "success"
) {
    if (!toastContainer) {
        return;
    }

    const toast = document.createElement("div");

    toast.className = `toast ${type}`;

    const icon =
        type === "error"
            ? "!"
            : type === "warning"
                ? "!"
                : "✓";

    toast.innerHTML = `
        <div class="toast-icon">
            ${icon}
        </div>

        <div>
            <strong>${title}</strong>
            <span>${message}</span>
        </div>
    `;

    toastContainer.appendChild(toast);

    window.setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform =
            "translateX(25px)";

        window.setTimeout(() => {
            toast.remove();
        }, 220);
    }, 3200);
}

/* ==================================================
   PERMIT FORM
   ================================================== */

function handlePermitSubmit(event) {
    event.preventDefault();

    if (
        !permitTypeInput ||
        !permitExpiryInput
    ) {
        return;
    }

    const permitData = {
        type: permitTypeInput.value,
        expiryDate: permitExpiryInput.value,
        note: permitNoteInput
            ? permitNoteInput.value.trim()
            : ""
    };

    if (!permitData.expiryDate) {
        showToast(
            "Datum fehlt",
            "Bitte wähle ein Gültigkeitsdatum aus.",
            "warning"
        );

        permitExpiryInput.focus();

        return;
    }

    saveToStorage(
        STORAGE_KEYS.permit,
        permitData
    );

    renderApplication();

    showToast(
        "Aufenthalt gespeichert",
        "Die Aufenthaltsdaten wurden lokal gespeichert."
    );
}

/* ==================================================
   DOCUMENT SELECTION
   ================================================== */

function saveDocumentSelection() {
    const selectedDocuments =
        documentCheckboxes
            .filter(
                (checkbox) =>
                    checkbox.checked
            )
            .map(
                (checkbox) =>
                    checkbox.dataset.document
            );

    saveToStorage(
        STORAGE_KEYS.documents,
        selectedDocuments
    );

    renderDocumentCards();
    renderDocumentSummary();

    showToast(
        "Dokumentenstatus gespeichert",
        `${selectedDocuments.length} Dokumente sind als vorhanden markiert.`
    );
}

function resetDocumentSelection() {
    const confirmed = window.confirm(
        "Möchtest du alle Dokumentmarkierungen entfernen?"
    );

    if (!confirmed) {
        return;
    }

    documentCheckboxes.forEach(
        (checkbox) => {
            checkbox.checked = false;
        }
    );

    saveToStorage(
        STORAGE_KEYS.documents,
        []
    );

    renderDocumentCards();
    renderDocumentSummary();

    showToast(
        "Auswahl zurückgesetzt",
        "Alle Dokumentmarkierungen wurden entfernt.",
        "warning"
    );
}

/* ==================================================
   DOCUMENT FILTERS
   ================================================== */

function filterDocuments(filterValue) {
    documentCards.forEach((card) => {
        const state =
            card.dataset.documentState ||
            "missing";

        const visible =
            filterValue === "all" ||
            state === filterValue;

        card.style.display =
            visible
                ? "flex"
                : "none";
    });
}

function activateDocumentFilter(button) {
    documentFilterButtons.forEach(
        (filterButton) => {
            filterButton.classList.toggle(
                "active",
                filterButton === button
            );
        }
    );

    filterDocuments(
        button.dataset.documentFilter
    );
}

/* ==================================================
   APPOINTMENT FORM
   ================================================== */

function handleAppointmentSubmit(event) {
    event.preventDefault();

    if (
        !appointmentDateInput ||
        !appointmentTimeInput ||
        !appointmentOfficeInput
    ) {
        return;
    }

    const appointmentData = {
        date: appointmentDateInput.value,
        time: appointmentTimeInput.value,
        office:
            appointmentOfficeInput.value.trim(),
        address:
            appointmentAddressInput
                ? appointmentAddressInput.value.trim()
                : "",
        purpose:
            appointmentPurposeInput
                ? appointmentPurposeInput.value.trim()
                : ""
    };

    if (
        !appointmentData.date ||
        !appointmentData.time ||
        !appointmentData.office
    ) {
        showToast(
            "Angaben unvollständig",
            "Bitte fülle Datum, Uhrzeit und Behörde aus.",
            "warning"
        );

        return;
    }

    saveToStorage(
        STORAGE_KEYS.appointment,
        appointmentData
    );

    renderAppointmentInformation();

    showToast(
        "Termin gespeichert",
        "Der Behördentermin wurde lokal gespeichert."
    );
}

/* ==================================================
   APPLICATION STATUS
   ================================================== */

function handleApplicationStatusChange() {
    if (!applicationStatusInput) {
        return;
    }

    const selectedStatus =
        applicationStatusInput.value;

    saveToStorage(
        STORAGE_KEYS.applicationStatus,
        selectedStatus
    );

    renderApplicationStatus();

    showToast(
        "Antragsstatus aktualisiert",
        `Der Status wurde auf „${selectedStatus}“ gesetzt.`
    );
}

/* ==================================================
   DRAWER
   ================================================== */

function openDrawer(contentType) {
    if (
        !detailDrawer ||
        !drawerBackdrop ||
        !drawerContent
    ) {
        return;
    }

    drawerContent.innerHTML =
        createDrawerContent(contentType);

    detailDrawer.classList.add("open");
    drawerBackdrop.classList.add("visible");

    detailDrawer.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.style.overflow =
        "hidden";
}

function closeDrawer() {
    if (
        !detailDrawer ||
        !drawerBackdrop
    ) {
        return;
    }

    detailDrawer.classList.remove("open");
    drawerBackdrop.classList.remove("visible");

    detailDrawer.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.style.overflow =
        "";
}

function createDrawerContent(contentType) {
    if (contentType === "permit") {
        const permit = getPermitData();

        if (
            !permit ||
            !permit.expiryDate
        ) {
            return `
                <span class="drawer-section-label">
                    Aufenthaltstitel
                </span>

                <h2 class="drawer-title">
                    Noch keine Angaben
                </h2>

                <p class="drawer-description">
                    Trage zuerst deinen Aufenthaltstitel
                    und das Gültigkeitsdatum ein.
                </p>

                <button
                    type="button"
                    class="primary-button drawer-page-button"
                    data-drawer-page="permit"
                >
                    Aufenthalt eintragen
                </button>
            `;
        }

        const days =
            calculateDaysRemaining(
                permit.expiryDate
            );

        return `
            <span class="drawer-section-label">
                Aufenthaltstitel
            </span>

            <h2 class="drawer-title">
                ${permit.type}
            </h2>

            <p class="drawer-description">
                Übersicht über die aktuell gespeicherten
                Aufenthaltsdaten.
            </p>

            <div class="drawer-information-list">
                <div class="drawer-information-row">
                    <span>Art</span>
                    <strong>${permit.type}</strong>
                </div>

                <div class="drawer-information-row">
                    <span>Gültig bis</span>
                    <strong>
                        ${formatGermanDate(
                            permit.expiryDate
                        )}
                    </strong>
                </div>

                <div class="drawer-information-row">
                    <span>Verbleibende Zeit</span>
                    <strong>
                        ${
                            days < 0
                                ? `Seit ${Math.abs(days)} Tagen abgelaufen`
                                : `${days} Tage`
                        }
                    </strong>
                </div>

                <div class="drawer-information-row">
                    <span>Verlängerung empfohlen</span>
                    <strong>
                        ${calculateRenewalRecommendation(
                            permit.expiryDate
                        )}
                    </strong>
                </div>
            </div>

            <button
                type="button"
                class="primary-button drawer-page-button"
                data-drawer-page="permit"
            >
                Angaben bearbeiten
            </button>
        `;
    }

    if (contentType === "appointment") {
        const appointment =
            getAppointmentData();

        if (
            !appointment ||
            !appointment.date
        ) {
            return `
                <span class="drawer-section-label">
                    Termin
                </span>

                <h2 class="drawer-title">
                    Kein Termin gespeichert
                </h2>

                <p class="drawer-description">
                    Plane deinen nächsten Behördentermin.
                </p>

                <button
                    type="button"
                    class="primary-button drawer-page-button"
                    data-drawer-page="appointments"
                >
                    Termin hinzufügen
                </button>
            `;
        }

        const days =
            calculateDaysRemaining(
                appointment.date
            );

        return `
            <span class="drawer-section-label">
                Behördentermin
            </span>

            <h2 class="drawer-title">
                ${appointment.office}
            </h2>

            <p class="drawer-description">
                ${getAppointmentCountdown(days)}
            </p>

            <div class="drawer-information-list">
                <div class="drawer-information-row">
                    <span>Datum</span>
                    <strong>
                        ${formatGermanDate(
                            appointment.date
                        )}
                    </strong>
                </div>

                <div class="drawer-information-row">
                    <span>Uhrzeit</span>
                    <strong>
                        ${appointment.time} Uhr
                    </strong>
                </div>

                <div class="drawer-information-row">
                    <span>Adresse</span>
                    <strong>
                        ${appointment.address || "Nicht eingetragen"}
                    </strong>
                </div>

                <div class="drawer-information-row">
                    <span>Anliegen</span>
                    <strong>
                        ${appointment.purpose || "Nicht eingetragen"}
                    </strong>
                </div>
            </div>

            <button
                type="button"
                class="primary-button drawer-page-button"
                data-drawer-page="appointments"
            >
                Termin bearbeiten
            </button>
        `;
    }

    if (contentType === "profile") {
        return `
            <span class="drawer-section-label">
                Profil
            </span>

            <h2 class="drawer-title">
                Melisa Sülü
            </h2>

            <p class="drawer-description">
                Dein persönliches AufenthaltPlaner-Dashboard.
                Diese Demoversion speichert alle Angaben
                ausschließlich im Browser.
            </p>

            <div class="drawer-information-list">
                <div class="drawer-information-row">
                    <span>Speicherung</span>
                    <strong>Lokal im Browser</strong>
                </div>

                <div class="drawer-information-row">
                    <span>Sprache</span>
                    <strong>Deutsch</strong>
                </div>

                <div class="drawer-information-row">
                    <span>Version</span>
                    <strong>2.0</strong>
                </div>
            </div>
        `;
    }

    return `
        <span class="drawer-section-label">
            Details
        </span>

        <h2 class="drawer-title">
            Keine Informationen
        </h2>

        <p class="drawer-description">
            Für diesen Bereich sind keine Details verfügbar.
        </p>
    `;
}

function handleDrawerInternalClick(event) {
    const pageButton =
        event.target.closest(
            "[data-drawer-page]"
        );

    if (!pageButton) {
        return;
    }

    const targetPage =
        pageButton.dataset.drawerPage;

    closeDrawer();
    showPage(targetPage);
}

/* ==================================================
   EVENT LISTENERS — PART 2A
   ================================================== */

navigationButtons.forEach((button) => {
    button.addEventListener("click", () => {
        showPage(button.dataset.page);
    });
});

pageTargetButtons.forEach((button) => {
    button.addEventListener("click", () => {
        handlePageTarget(button);
    });
});

if (mobileMenuButton) {
    mobileMenuButton.addEventListener(
        "click",
        toggleMobileMenu
    );
}

document.addEventListener(
    "click",
    closeMobileMenuOnOutsideClick
);

if (permitForm) {
    permitForm.addEventListener(
        "submit",
        handlePermitSubmit
    );
}

documentCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener(
        "change",
        saveDocumentSelection
    );
});

if (resetDocumentsButton) {
    resetDocumentsButton.addEventListener(
        "click",
        resetDocumentSelection
    );
}

documentFilterButtons.forEach((button) => {
    button.addEventListener("click", () => {
        activateDocumentFilter(button);
    });
});

if (appointmentForm) {
    appointmentForm.addEventListener(
        "submit",
        handleAppointmentSubmit
    );
}

if (applicationStatusInput) {
    applicationStatusInput.addEventListener(
        "change",
        handleApplicationStatusChange
    );
}

drawerOpenButtons.forEach((button) => {
    button.addEventListener("click", () => {
        openDrawer(
            button.dataset.openDrawer
        );
    });
});

if (drawerCloseButton) {
    drawerCloseButton.addEventListener(
        "click",
        closeDrawer
    );
}

if (drawerBackdrop) {
    drawerBackdrop.addEventListener(
        "click",
        closeDrawer
    );
}

if (drawerContent) {
    drawerContent.addEventListener(
        "click",
        handleDrawerInternalClick
    );
}
/* ==================================================
   MODAL
   ================================================== */

function openModal(contentType, extraData = null) {
    if (
        !modalBackdrop ||
        !modalContent
    ) {
        return;
    }

    modalContent.innerHTML =
        createModalContent(
            contentType,
            extraData
        );

    modalBackdrop.classList.add(
        "visible"
    );

    document.body.style.overflow =
        "hidden";

    const firstInput =
        modalContent.querySelector(
            "input, textarea, select, button"
        );

    if (firstInput) {
        window.setTimeout(() => {
            firstInput.focus();
        }, 100);
    }
}

function closeModal() {
    if (!modalBackdrop) {
        return;
    }

    modalBackdrop.classList.remove(
        "visible"
    );

    document.body.style.overflow =
        "";
}

function createModalContent(
    contentType,
    extraData
) {
    if (
        contentType === "information"
        ||
        contentType === "permitInfo"
    ) {
        return `
            <p class="page-eyebrow">
                Allgemeine Information
            </p>

            <h2 id="modalTitle">
                Aufenthaltstitel im Blick behalten
            </h2>

            <p>
                Der AufenthaltPlaner hilft dir dabei,
                Fristen, Termine und Dokumente lokal
                in deinem Browser zu organisieren.
            </p>

            <p>
                Die angezeigten Hinweise sind allgemeiner
                Natur. Für verbindliche Informationen
                solltest du dich immer an deine zuständige
                Behörde wenden.
            </p>

            <div class="drawer-information-list">
                <div class="drawer-information-row">
                    <span>Datenspeicherung</span>
                    <strong>Lokal im Browser</strong>
                </div>

                <div class="drawer-information-row">
                    <span>Rechtsberatung</span>
                    <strong>Nicht enthalten</strong>
                </div>

                <div class="drawer-information-row">
                    <span>Offizielle Auskunft</span>
                    <strong>Zuständige Behörde</strong>
                </div>
            </div>
        `;
    }

    if (contentType === "note") {
        const savedNote =
            loadFromStorage(
                STORAGE_KEYS.note,
                ""
            );

        return `
            <p class="page-eyebrow">
                Persönliche Notiz
            </p>

            <h2 id="modalTitle">
                Notiz hinzufügen
            </h2>

            <p>
                Speichere eine kurze Erinnerung.
                Die Notiz bleibt auf diesem Gerät.
            </p>

            <form
                class="modal-form"
                id="noteForm"
            >
                <div class="form-group">
                    <label for="generalNote">
                        Notiz
                    </label>

                    <textarea
                        id="generalNote"
                        rows="7"
                        maxlength="700"
                        placeholder="Zum Beispiel: Unterlagen vor dem Termin kopieren."
                    >${escapeHtml(savedNote)}</textarea>
                </div>

                <button
                    type="submit"
                    class="primary-button"
                >
                    Notiz speichern
                </button>
            </form>
        `;
    }

    if (contentType === "authority") {
        const authority =
            loadFromStorage(
                STORAGE_KEYS.authority,
                {
                    name: "",
                    address: "",
                    phone: "",
                    website: "",
                    note: ""
                }
            );

        return `
            <p class="page-eyebrow">
                Persönliche Behörde
            </p>

            <h2 id="modalTitle">
                Kontakt speichern
            </h2>

            <p>
                Speichere die Kontaktdaten deiner
                zuständigen Ausländerbehörde.
            </p>

            <form
                class="modal-form"
                id="authorityForm"
            >
                <div class="form-group">
                    <label for="authorityName">
                        Name der Behörde
                    </label>

                    <input
                        type="text"
                        id="authorityName"
                        maxlength="120"
                        value="${escapeHtml(authority.name)}"
                        placeholder="z. B. Ausländerbehörde Karlsruhe"
                        required
                    >
                </div>

                <div class="form-group">
                    <label for="authorityAddress">
                        Adresse
                    </label>

                    <input
                        type="text"
                        id="authorityAddress"
                        maxlength="160"
                        value="${escapeHtml(authority.address)}"
                        placeholder="Straße, Hausnummer und Ort"
                    >
                </div>

                <div class="form-group">
                    <label for="authorityPhone">
                        Telefonnummer
                    </label>

                    <input
                        type="text"
                        id="authorityPhone"
                        maxlength="60"
                        value="${escapeHtml(authority.phone)}"
                        placeholder="+49 ..."
                    >
                </div>

                <div class="form-group">
                    <label for="authorityWebsite">
                        Website
                    </label>

                    <input
                        type="text"
                        id="authorityWebsite"
                        maxlength="200"
                        value="${escapeHtml(authority.website)}"
                        placeholder="https://..."
                    >
                </div>

                <div class="form-group">
                    <label for="authorityNote">
                        Notiz
                    </label>

                    <textarea
                        id="authorityNote"
                        rows="4"
                        maxlength="500"
                        placeholder="Öffnungszeiten oder persönliche Hinweise"
                    >${escapeHtml(authority.note)}</textarea>
                </div>

                <button
                    type="submit"
                    class="primary-button"
                >
                    Kontakt speichern
                </button>
            </form>
        `;
    }

    if (contentType === "officialNotice") {
        return `
            <p class="page-eyebrow">
                Wichtiger Hinweis
            </p>

            <h2 id="modalTitle">
                Offizielle Angaben prüfen
            </h2>

            <p>
                Zuständigkeiten, benötigte Dokumente,
                Bearbeitungszeiten und Öffnungszeiten
                können sich unterscheiden.
            </p>

            <p>
                Prüfe die aktuellen Informationen immer
                direkt bei deiner zuständigen Behörde.
            </p>
        `;
    }

    if (contentType === "notifications") {
        const permit =
            getPermitData();

        const appointment =
            getAppointmentData();

        const documents =
            getSelectedDocuments();

        const notificationItems = [];

        if (
            permit &&
            permit.expiryDate
        ) {
            const days =
                calculateDaysRemaining(
                    permit.expiryDate
                );

            if (days <= 60) {
                notificationItems.push(
                    days < 0
                        ? `Dein Aufenthaltstitel ist seit ${Math.abs(days)} Tagen abgelaufen.`
                        : `Dein Aufenthaltstitel läuft in ${days} Tagen ab.`
                );
            }
        } else {
            notificationItems.push(
                "Trage deinen Aufenthaltstitel ein."
            );
        }

        if (
            appointment &&
            appointment.date
        ) {
            const days =
                calculateDaysRemaining(
                    appointment.date
                );

            if (days >= 0 && days <= 7) {
                notificationItems.push(
                    getAppointmentCountdown(days)
                );
            }
        } else {
            notificationItems.push(
                "Es ist noch kein Termin gespeichert."
            );
        }

        const missingDocuments =
            documentCheckboxes.length -
            documents.length;

        if (missingDocuments > 0) {
            notificationItems.push(
                `${missingDocuments} Dokumente fehlen noch.`
            );
        }

        return `
            <p class="page-eyebrow">
                Benachrichtigungen
            </p>

            <h2 id="modalTitle">
                Aktuelle Hinweise
            </h2>

            <div class="drawer-information-list">
                ${
                    notificationItems.length > 0
                        ? notificationItems
                            .map(
                                (item) => `
                                    <div class="drawer-information-row">
                                        <span>Hinweis</span>
                                        <strong>
                                            ${escapeHtml(item)}
                                        </strong>
                                    </div>
                                `
                            )
                            .join("")
                        : `
                            <div class="drawer-information-row">
                                <span>Status</span>
                                <strong>
                                    Keine offenen Hinweise
                                </strong>
                            </div>
                        `
                }
            </div>
        `;
    }

    if (contentType === "documentDetail") {
        const information =
            DOCUMENT_INFORMATION[
                extraData
            ];

        if (!information) {
            return `
                <h2 id="modalTitle">
                    Dokumentinformation
                </h2>

                <p>
                    Für dieses Dokument sind keine
                    Informationen verfügbar.
                </p>
            `;
        }

        const selectedDocuments =
            getSelectedDocuments();

        const completed =
            selectedDocuments.includes(
                extraData
            );

        return `
            <p class="page-eyebrow">
                Dokumentinformation
            </p>

            <h2 id="modalTitle">
                ${escapeHtml(information.title)}
            </h2>

            <p>
                ${escapeHtml(information.description)}
            </p>

            <div class="drawer-information-list">
                <div class="drawer-information-row">
                    <span>Warum?</span>

                    <strong>
                        ${escapeHtml(information.reason)}
                    </strong>
                </div>

                <div class="drawer-information-row">
                    <span>Status</span>

                    <strong>
                        ${
                            completed
                                ? "Vorhanden"
                                : "Fehlt"
                        }
                    </strong>
                </div>
            </div>

            <button
                type="button"
                class="primary-button"
                data-modal-document-toggle="${escapeHtml(extraData)}"
            >
                ${
                    completed
                        ? "Als fehlend markieren"
                        : "Als vorhanden markieren"
                }
            </button>
        `;
    }

    if (contentType === "topic") {
        return createInformationTopicContent(
            extraData
        );
    }

    return `
        <h2 id="modalTitle">
            Information
        </h2>

        <p>
            Für diesen Bereich sind keine weiteren
            Informationen verfügbar.
        </p>
    `;
}

/* ==================================================
   INFORMATION TOPICS
   ================================================== */

function createInformationTopicContent(
    topic
) {
    const topics = {
        fiction: {
            title: "Fiktionsbescheinigung",
            description:
                "Eine Fiktionsbescheinigung kann unter bestimmten Voraussetzungen einen vorläufigen Aufenthaltsstatus dokumentieren.",
            notice:
                "Die rechtliche Wirkung hängt vom Einzelfall und der konkreten Bescheinigung ab."
        },

        extension: {
            title: "Aufenthaltstitel verlängern",
            description:
                "Beginne frühzeitig mit der Vorbereitung und prüfe die Hinweise deiner zuständigen Behörde.",
            notice:
                "Bearbeitungszeiten und Terminverfügbarkeit können stark variieren."
        },

        documents: {
            title: "Benötigte Unterlagen",
            description:
                "Häufig werden Reisepass, Versicherungsnachweis, Wohnsitznachweis und Finanzierungsnachweis verlangt.",
            notice:
                "Die konkrete Dokumentenliste hängt von der Aufenthaltsart und der Behörde ab."
        }
    };

    const selectedTopic =
        topics[topic];

    if (!selectedTopic) {
        return `
            <h2 id="modalTitle">
                Information
            </h2>

            <p>
                Zu diesem Thema sind keine Informationen vorhanden.
            </p>
        `;
    }

    return `
        <p class="page-eyebrow">
            Hilfe &amp; Information
        </p>

        <h2 id="modalTitle">
            ${selectedTopic.title}
        </h2>

        <p>
            ${selectedTopic.description}
        </p>

        <div class="drawer-information-list">
            <div class="drawer-information-row">
                <span>Hinweis</span>

                <strong>
                    ${selectedTopic.notice}
                </strong>
            </div>
        </div>
    `;
}

/* ==================================================
   MODAL FORM HANDLING
   ================================================== */

function handleModalSubmit(event) {
    const noteForm =
        event.target.closest(
            "#noteForm"
        );

    if (noteForm) {
        event.preventDefault();

        const noteInput =
            noteForm.querySelector(
                "#generalNote"
            );

        saveToStorage(
            STORAGE_KEYS.note,
            noteInput
                ? noteInput.value.trim()
                : ""
        );

        closeModal();

        showToast(
            "Notiz gespeichert",
            "Deine persönliche Notiz wurde lokal gespeichert."
        );

        return;
    }

    const authorityForm =
        event.target.closest(
            "#authorityForm"
        );

    if (authorityForm) {
        event.preventDefault();

        const authorityData = {
            name:
                authorityForm
                    .querySelector(
                        "#authorityName"
                    )
                    .value
                    .trim(),

            address:
                authorityForm
                    .querySelector(
                        "#authorityAddress"
                    )
                    .value
                    .trim(),

            phone:
                authorityForm
                    .querySelector(
                        "#authorityPhone"
                    )
                    .value
                    .trim(),

            website:
                authorityForm
                    .querySelector(
                        "#authorityWebsite"
                    )
                    .value
                    .trim(),

            note:
                authorityForm
                    .querySelector(
                        "#authorityNote"
                    )
                    .value
                    .trim()
        };

        if (!authorityData.name) {
            showToast(
                "Name fehlt",
                "Bitte trage den Namen der Behörde ein.",
                "warning"
            );

            return;
        }

        saveToStorage(
            STORAGE_KEYS.authority,
            authorityData
        );

        closeModal();

        showToast(
            "Kontakt gespeichert",
            "Die Behördendaten wurden lokal gespeichert."
        );
    }
}

function toggleDocumentFromModal(
    documentName
) {
    const checkbox =
        documentCheckboxes.find(
            (item) =>
                item.dataset.document ===
                documentName
        );

    if (!checkbox) {
        return;
    }

    checkbox.checked =
        !checkbox.checked;

    saveDocumentSelection();

    closeModal();
}

/* ==================================================
   FAQ
   ================================================== */

function toggleFaqItem(
    selectedItem
) {
    faqItems.forEach((item) => {
        if (item === selectedItem) {
            item.classList.toggle(
                "open"
            );
        } else {
            item.classList.remove(
                "open"
            );
        }
    });
}

/* ==================================================
   THEME
   ================================================== */

function applyTheme(theme) {
    const darkModeEnabled =
        theme === "dark";

    document.body.classList.toggle(
        "dark-mode",
        darkModeEnabled
    );

    if (settingsThemeButton) {
        settingsThemeButton.textContent =
            darkModeEnabled
                ? "Hellmodus"
                : "Dunkelmodus";
    }

    if (themeButton) {
        themeButton.textContent =
            darkModeEnabled
                ? "☾"
                : "☼";
    }
}

function loadTheme() {
    const savedTheme =
        loadFromStorage(
            STORAGE_KEYS.theme,
            "light"
        );

    applyTheme(savedTheme);
}

function toggleTheme() {
    const darkModeEnabled =
        document.body.classList.toggle(
            "dark-mode"
        );

    const selectedTheme =
        darkModeEnabled
            ? "dark"
            : "light";

    saveToStorage(
        STORAGE_KEYS.theme,
        selectedTheme
    );

    applyTheme(selectedTheme);

    showToast(
        "Farbschema geändert",
        darkModeEnabled
            ? "Der Dunkelmodus ist aktiviert."
            : "Der Hellmodus ist aktiviert."
    );
}

/* ==================================================
   EXPORT
   ================================================== */

function exportApplicationData() {
    const exportData = {
        exportedAt:
            new Date().toISOString(),

        permit:
            getPermitData(),

        documents:
            getSelectedDocuments(),

        appointment:
            getAppointmentData(),

        applicationStatus:
            getApplicationStatus(),

        note:
            loadFromStorage(
                STORAGE_KEYS.note,
                ""
            ),

        authority:
            loadFromStorage(
                STORAGE_KEYS.authority,
                null
            )
    };

    const fileContent =
        JSON.stringify(
            exportData,
            null,
            2
        );

    const blob =
        new Blob(
            [fileContent],
            {
                type:
                    "application/json"
            }
        );

    const downloadUrl =
        URL.createObjectURL(blob);

    const downloadLink =
        document.createElement("a");

    downloadLink.href =
        downloadUrl;

    downloadLink.download =
        "aufenthaltplaner-daten.json";

    document.body.appendChild(
        downloadLink
    );

    downloadLink.click();

    downloadLink.remove();

    URL.revokeObjectURL(
        downloadUrl
    );

    showToast(
        "Export erstellt",
        "Die lokal gespeicherten Daten wurden als JSON-Datei exportiert."
    );
}

/* ==================================================
   DELETE ALL DATA
   ================================================== */

function deleteAllData() {
    const confirmed =
        window.confirm(
            "Möchtest du wirklich alle lokal gespeicherten Daten löschen?"
        );

    if (!confirmed) {
        return;
    }

    Object.values(
        STORAGE_KEYS
    ).forEach((key) => {
        localStorage.removeItem(key);
    });

    documentCheckboxes.forEach(
        (checkbox) => {
            checkbox.checked = false;
        }
    );

    if (permitForm) {
        permitForm.reset();
    }

    if (appointmentForm) {
        appointmentForm.reset();
    }

    renderApplication();

    showToast(
        "Daten gelöscht",
        "Alle lokalen Angaben wurden entfernt.",
        "warning"
    );

    showPage("dashboard");
}

/* ==================================================
   SECURITY HELPERS
   ================================================== */

function escapeHtml(value) {
    return String(
        value ?? ""
    )
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );
}

/* ==================================================
   KEYBOARD HANDLING
   ================================================== */

function handleGlobalKeydown(event) {
    if (event.key !== "Escape") {
        return;
    }

    closeDrawer();
    closeModal();

    if (sidebar) {
        sidebar.classList.remove(
            "mobile-open"
        );
    }
}

/* ==================================================
   UPDATE NOTIFICATION COUNT
   ================================================== */

function updateNotificationCount() {
    const notificationCount =
        document.querySelector(
            ".notification-count"
        );

    if (!notificationCount) {
        return;
    }

    let count = 0;

    const permit =
        getPermitData();

    const appointment =
        getAppointmentData();

    const selectedDocuments =
        getSelectedDocuments();

    if (
        !permit ||
        !permit.expiryDate
    ) {
        count += 1;
    } else {
        const days =
            calculateDaysRemaining(
                permit.expiryDate
            );

        if (days <= 60) {
            count += 1;
        }
    }

    if (
        !appointment ||
        !appointment.date
    ) {
        count += 1;
    }

    if (
        selectedDocuments.length <
        documentCheckboxes.length
    ) {
        count += 1;
    }

    notificationCount.textContent =
        String(count);

    notificationCount.style.display =
        count > 0
            ? "grid"
            : "none";
}

/* ==================================================
   FULL REFRESH
   ================================================== */

function refreshFullApplication() {
    renderApplication();
    updateNotificationCount();
}

/* ==================================================
   INITIALIZATION
   ================================================== */

function initializeApplication() {
    setText(
        currentDateElement,
        `Heute: ${formatCurrentDate()}`
    );

    loadTheme();

    refreshFullApplication();

    filterDocuments("all");

    showPage("dashboard");
}

/* ==================================================
   EVENT LISTENERS — PART 2B
   ================================================== */

modalOpenButtons.forEach(
    (button) => {
        button.addEventListener(
            "click",
            () => {
                openModal(
                    button.dataset.openModal
                );
            }
        );
    }
);

informationTopicButtons.forEach(
    (button) => {
        button.addEventListener(
            "click",
            () => {
                openModal(
                    "topic",
                    button.dataset.infoTopic
                );
            }
        );
    }
);

documentDetailButtons.forEach(
    (button) => {
        button.addEventListener(
            "click",
            () => {
                openModal(
                    "documentDetail",
                    button.dataset.documentDetail
                );
            }
        );
    }
);

if (modalCloseButton) {
    modalCloseButton.addEventListener(
        "click",
        closeModal
    );
}

if (modalBackdrop) {
    modalBackdrop.addEventListener(
        "click",
        (event) => {
            if (
                event.target ===
                modalBackdrop
            ) {
                closeModal();
            }
        }
    );
}

if (modalContent) {
    modalContent.addEventListener(
        "submit",
        handleModalSubmit
    );

    modalContent.addEventListener(
        "click",
        (event) => {
            const toggleButton =
                event.target.closest(
                    "[data-modal-document-toggle]"
                );

            if (!toggleButton) {
                return;
            }

            toggleDocumentFromModal(
                toggleButton.dataset
                    .modalDocumentToggle
            );
        }
    );
}

faqItems.forEach((item) => {
    const question =
        item.querySelector(
            ".faq-question"
        );

    if (!question) {
        return;
    }

    question.addEventListener(
        "click",
        () => {
            toggleFaqItem(item);
        }
    );
});

if (themeButton) {
    themeButton.addEventListener(
        "click",
        toggleTheme
    );
}

if (settingsThemeButton) {
    settingsThemeButton.addEventListener(
        "click",
        toggleTheme
    );
}

if (exportButton) {
    exportButton.addEventListener(
        "click",
        exportApplicationData
    );
}

if (deleteAllDataButton) {
    deleteAllDataButton.addEventListener(
        "click",
        deleteAllData
    );
}

const notificationButton =
    document.querySelector(
        "#notificationButton"
    );

if (notificationButton) {
    notificationButton.addEventListener(
        "click",
        () => {
            openModal(
                "notifications"
            );
        }
    );
}

document.addEventListener(
    "keydown",
    handleGlobalKeydown
);

/* Uygulamanın başlangıç noktası */

initializeApplication();
if (window.lucide) {
    window.lucide.createIcons();
}
