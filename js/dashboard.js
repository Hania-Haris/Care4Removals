import {
    collection,
    getDocs,
    query,
    orderBy,
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    auth,
    db
} from "./firebase-config.js";


/* =========================
   ELEMENTS
   ========================= */

const bookingsList =
    document.getElementById("bookingsList");

const messagesList =
    document.getElementById("messagesList");

const statusFilter =
    document.getElementById("statusFilter");

const logoutBtn =
    document.getElementById("logoutBtn");

const adminEmail =
    document.getElementById("adminEmail");


/* =========================
   DATA
   ========================= */

let allBookings = [];

let allMessages = [];


/* =========================
   AUTH CHECK
   ========================= */

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            window.location.href =
                "login.html";

            return;
        }

        adminEmail.textContent =
            user.email;

        await loadBookings();

        await loadMessages();

    }
);


/* =========================
   LOAD BOOKINGS
   ========================= */

async function loadBookings() {

    try {

        const bookingsQuery =
            query(
                collection(db, "bookings"),
                orderBy(
                    "createdAt",
                    "desc"
                )
            );


        const snapshot =
            await getDocs(
                bookingsQuery
            );


        allBookings =
            snapshot.docs.map(
                (document) => ({

                    id: document.id,

                    ...document.data()

                })
            );


        updateStats();

        renderBookings(
            allBookings
        );


    } catch (error) {

        console.error(
            "Error loading bookings:",
            error
        );


        bookingsList.innerHTML = `
            <div class="empty-state">
                Unable to load enquiries.
            </div>
        `;

    }

}


/* =========================
   UPDATE BOOKING STATS
   ========================= */

function updateStats() {

    const counts = {

        new: 0,

        contacted: 0,

        quoted: 0,

        confirmed: 0,

        completed: 0

    };


    allBookings.forEach(
        (booking) => {

            if (
                counts[
                    booking.status
                ] !== undefined
            ) {

                counts[
                    booking.status
                ]++;

            }

        }
    );


    document.getElementById(
        "newCount"
    ).textContent =
        counts.new;


    document.getElementById(
        "contactedCount"
    ).textContent =
        counts.contacted;


    document.getElementById(
        "quotedCount"
    ).textContent =
        counts.quoted;


    document.getElementById(
        "confirmedCount"
    ).textContent =
        counts.confirmed;


    document.getElementById(
        "completedCount"
    ).textContent =
        counts.completed;

}


/* =========================
   RENDER BOOKINGS
   ========================= */

function renderBookings(
    bookings
) {

    if (!bookings.length) {

        bookingsList.innerHTML = `
            <div class="empty-state">
                No enquiries found.
            </div>
        `;

        return;
    }


    bookingsList.innerHTML =
        bookings.map(
            (booking) => {

                const date =
                    booking.createdAt
                        ?.toDate()
                        ?.toLocaleDateString(
                            "en-GB",
                            {
                                day: "numeric",
                                month: "short",
                                year: "numeric"
                            }
                        ) ||
                    "Unknown";


                const status =
                    booking.status ||
                    "new";


                return `

                    <div
                        class="booking-row"
                    >

                        <div>

                            <div
                                class="booking-customer"
                            >
                                ${escapeHtml(
                                    booking.customerName
                                )}
                            </div>

                            <div
                                class="booking-email"
                            >
                                ${escapeHtml(
                                    booking.email
                                )}
                            </div>

                        </div>


                        <div
                            class="booking-route"
                        >

                            ${escapeHtml(
                                booking.pickupAddress
                            )}

                            →

                            ${escapeHtml(
                                booking.deliveryAddress
                            )}

                        </div>


                        <div
                            class="booking-date"
                        >
                            ${date}
                        </div>


                        <div>

                            <span
                                class="
                                    booking-status
                                    status-${status}
                                "
                            >
                                ${escapeHtml(
                                    status
                                )}
                            </span>

                        </div>


                        <button
                            class="view-booking"
                            data-id="${escapeHtml(
                                booking.id
                            )}"
                        >
                            View
                        </button>

                    </div>

                `;

            }
        ).join("");


    document
        .querySelectorAll(
            ".view-booking"
        )
        .forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    () => {

                        const id =
                            button.dataset.id;

                        window.location.href =
                            `booking.html?id=${id}`;

                    }
                );

            }
        );

}


/* =========================
   LOAD CONTACT MESSAGES
   ========================= */

async function loadMessages() {

    if (!messagesList) {
        return;
    }


    try {

        const messagesQuery =
            query(
                collection(
                    db,
                    "contactMessages"
                ),
                orderBy(
                    "createdAt",
                    "desc"
                )
            );


        const snapshot =
            await getDocs(
                messagesQuery
            );


        allMessages =
            snapshot.docs.map(
                (document) => ({

                    id: document.id,

                    ...document.data()

                })
            );


        renderMessages(
            allMessages
        );


    } catch (error) {

        console.error(
            "Error loading contact messages:",
            error
        );


        messagesList.innerHTML = `
            <div class="empty-state">
                Unable to load contact messages.
            </div>
        `;

    }

}


/* =========================
   RENDER CONTACT MESSAGES
   ========================= */

function renderMessages(
    messages
) {

    if (!messages.length) {

        messagesList.innerHTML = `
            <div class="empty-state">
                No contact messages yet.
            </div>
        `;

        return;
    }


    messagesList.innerHTML =
        messages.map(
            (message) => {

                const date =
                    message.createdAt
                        ?.toDate()
                        ?.toLocaleDateString(
                            "en-GB",
                            {
                                day: "numeric",
                                month: "short",
                                year: "numeric"
                            }
                        ) ||
                    "Unknown";


                const status =
                    message.status ||
                    "new";


                const statusClass =
                    `message-status-${status}`;


                return `

                    <div
                        class="
                            message-row
                            ${statusClass}
                        "
                    >

                        <div>

                            <div
                                class="message-customer"
                            >
                                ${escapeHtml(
                                    message.name
                                )}
                            </div>

                            <div
                                class="message-contact"
                            >
                                ${escapeHtml(
                                    message.email
                                )}
                            </div>

                            <div
                                class="message-contact"
                            >
                                ${escapeHtml(
                                    message.phone
                                )}
                            </div>

                        </div>


                        <div>

                            <div
                                class="message-subject"
                            >
                                ${escapeHtml(
                                    message.subject
                                )}
                            </div>

                            <div
                                class="message-date"
                            >
                                ${date}
                            </div>

                        </div>


                        <div>

                            <div
                                class="message-preview"
                            >
                                ${escapeHtml(
                                    message.message
                                )}
                            </div>

                        </div>


                        <div
                            class="message-actions"
                        >

                            <select
                                class="message-status-select"
                                data-id="${escapeHtml(
                                    message.id
                                )}"
                            >

                                <option
                                    value="new"
                                    ${status === "new"
                                        ? "selected"
                                        : ""}
                                >
                                    New
                                </option>

                                <option
                                    value="read"
                                    ${status === "read"
                                        ? "selected"
                                        : ""}
                                >
                                    Read
                                </option>

                                <option
                                    value="replied"
                                    ${status === "replied"
                                        ? "selected"
                                        : ""}
                                >
                                    Replied
                                </option>

                            </select>


                            <button
                                class="save-message-btn"
                                data-id="${escapeHtml(
                                    message.id
                                )}"
                            >
                                Save
                            </button>

                        </div>

                    </div>

                `;

            }
        ).join("");


    attachMessageEvents();

}


/* =========================
   MESSAGE STATUS EVENTS
   ========================= */

function attachMessageEvents() {

    document
        .querySelectorAll(
            ".save-message-btn"
        )
        .forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    async () => {

                        const id =
                            button.dataset.id;


                        const select =
                            document.querySelector(
                                `.message-status-select[data-id="${CSS.escape(id)}"]`
                            );


                        if (!select) {
                            return;
                        }


                        const newStatus =
                            select.value;


                        button.disabled =
                            true;

                        button.textContent =
                            "Saving...";


                        try {

                            await updateDoc(
                                doc(
                                    db,
                                    "contactMessages",
                                    id
                                ),
                                {
                                    status:
                                        newStatus
                                }
                            );


                            const message =
                                allMessages.find(
                                    (item) =>
                                        item.id === id
                                );


                            if (message) {

                                message.status =
                                    newStatus;

                            }


                            renderMessages(
                                allMessages
                            );


                        } catch (error) {

                            console.error(
                                "Error updating message:",
                                error
                            );


                            button.disabled =
                                false;

                            button.textContent =
                                "Save";

                            alert(
                                "Unable to update message status."
                            );

                        }

                    }
                );

            }
        );

}


/* =========================
   BOOKING FILTER
   ========================= */

statusFilter.addEventListener(
    "change",
    () => {

        const selected =
            statusFilter.value;


        if (
            selected === "all"
        ) {

            renderBookings(
                allBookings
            );

            return;
        }


        renderBookings(
            allBookings.filter(
                (booking) =>
                    booking.status ===
                    selected
            )
        );

    }
);


/* =========================
   LOGOUT
   ========================= */

logoutBtn.addEventListener(
    "click",
    async () => {

        try {

            await signOut(
                auth
            );


            window.location.href =
                "login.html";


        } catch (error) {

            console.error(
                "Logout error:",
                error
            );

        }

    }
);


/* =========================
   SECURITY
   ========================= */

function escapeHtml(
    value
) {

    if (!value) {
        return "";
    }


    return String(value)

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