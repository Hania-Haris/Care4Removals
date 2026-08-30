import {
    collection,
    getDocs,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    auth,
    db
} from "./firebase-config.js";


const bookingsList =
    document.getElementById("bookingsList");

const statusFilter =
    document.getElementById("statusFilter");

const logoutBtn =
    document.getElementById("logoutBtn");

const adminEmail =
    document.getElementById("adminEmail");


let allBookings = [];


/* =========================
   AUTH CHECK
   ========================= */

onAuthStateChanged(
    auth,
    (user) => {

        if (!user) {

            window.location.href =
                "login.html";

            return;

        }

        adminEmail.textContent =
            user.email;

        loadBookings();

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
                (doc) => ({
                    id: doc.id,
                    ...doc.data()
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
   UPDATE STATS
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
    ).textContent = counts.new;


    document.getElementById(
        "contactedCount"
    ).textContent = counts.contacted;


    document.getElementById(
        "quotedCount"
    ).textContent = counts.quoted;


    document.getElementById(
        "confirmedCount"
    ).textContent = counts.confirmed;


    document.getElementById(
        "completedCount"
    ).textContent = counts.completed;

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
                                ${status}
                            </span>

                        </div>


                        <button
                            class="view-booking"
                            data-id="${booking.id}"
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
   FILTER
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
                    booking.status === selected
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

            await signOut(auth);

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

function escapeHtml(value) {

    if (!value) return "";

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}