import {
    doc,
    getDoc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    auth,
    db
} from "./firebase-config.js";


const bookingContent =
    document.getElementById(
        "bookingContent"
    );

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );

const adminEmail =
    document.getElementById(
        "adminEmail"
    );


const params =
    new URLSearchParams(
        window.location.search
    );

const bookingId =
    params.get("id");


/* =========================
   AUTH
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

        if (!bookingId) {

            showError(
                "No booking was selected."
            );

            return;

        }

        loadBooking();

    }
);


/* =========================
   LOAD BOOKING
   ========================= */

async function loadBooking() {

    try {

        const bookingRef =
            doc(
                db,
                "bookings",
                bookingId
            );

        const bookingSnapshot =
            await getDoc(
                bookingRef
            );


        if (
            !bookingSnapshot.exists()
        ) {

            showError(
                "This enquiry could not be found."
            );

            return;

        }


        const booking =
            bookingSnapshot.data();


        renderBooking(
            booking
        );


    } catch (error) {

        console.error(
            "Error loading booking:",
            error
        );

        showError(
            "Unable to load this enquiry."
        );

    }

}


/* =========================
   RENDER
   ========================= */

function renderBooking(
    booking
) {

    const createdDate =
        booking.createdAt
            ?.toDate()
            ?.toLocaleString(
                "en-GB",
                {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                }
            ) ||
        "Unknown";


    const status =
        booking.status ||
        "new";


    bookingContent.className =
        "";


    bookingContent.innerHTML = `

        <div class="booking-detail-header">

            <div>

                <div class="eyebrow">

                    <span
                        class="eyebrow-dot"
                    ></span>

                    Removal enquiry

                </div>

                <h1>
                    ${escapeHtml(
                        booking.customerName
                    )}
                </h1>

                <div class="booking-id">
                    Booking ID:
                    ${escapeHtml(
                        bookingId
                    )}
                </div>

            </div>


            <span
                class="
                    booking-status
                    status-${status}
                "
            >
                ${escapeHtml(status)}
            </span>

        </div>


        <div class="detail-grid">


            <!-- CUSTOMER -->

            <section class="detail-card">

                <h2>
                    Customer details
                </h2>


                <div class="detail-item">

                    <span
                        class="detail-label"
                    >
                        Name
                    </span>

                    <div
                        class="detail-value"
                    >
                        ${escapeHtml(
                            booking.customerName
                        )}
                    </div>

                </div>


                <div class="detail-item">

                    <span
                        class="detail-label"
                    >
                        Email
                    </span>

                    <div
                        class="detail-value"
                    >

                        <a
                            class="contact-link"
                            href="mailto:${escapeAttribute(
                                booking.email
                            )}"
                        >
                            ${escapeHtml(
                                booking.email
                            )}
                        </a>

                    </div>

                </div>


                <div class="detail-item">

                    <span
                        class="detail-label"
                    >
                        Phone
                    </span>

                    <div
                        class="detail-value"
                    >

                        <a
                            class="contact-link"
                            href="tel:${escapeAttribute(
                                booking.phone
                            )}"
                        >
                            ${escapeHtml(
                                booking.phone
                            )}
                        </a>

                    </div>

                </div>

            </section>


            <!-- MOVE DATE -->

            <section class="detail-card">

                <h2>
                    Move details
                </h2>


                <div class="detail-item">

                    <span
                        class="detail-label"
                    >
                        Preferred moving date
                    </span>

                    <div
                        class="detail-value"
                    >
                        ${escapeHtml(
                            booking.movingDate ||
                            "Not specified"
                        )}
                    </div>

                </div>


                <div class="detail-item">

                    <span
                        class="detail-label"
                    >
                        Service
                    </span>

                    <div
                        class="detail-value"
                    >
                        ${escapeHtml(
                            booking.serviceType ||
                            "Not specified"
                        )}
                    </div>

                </div>


                <div class="detail-item">

                    <span
                        class="detail-label"
                    >
                        Enquiry received
                    </span>

                    <div
                        class="detail-value"
                    >
                        ${escapeHtml(
                            createdDate
                        )}
                    </div>

                </div>

            </section>


            <!-- PICKUP -->

            <section class="detail-card">

                <h2>
                    Current property
                </h2>


                <div class="detail-item">

                    <span
                        class="detail-label"
                    >
                        Address
                    </span>

                    <div
                        class="detail-value"
                    >
                        ${escapeHtml(
                            booking.pickupAddress
                        )}
                    </div>

                </div>


                <div class="detail-item">

                    <span
                        class="detail-label"
                    >
                        Property type
                    </span>

                    <div
                        class="detail-value"
                    >
                        ${escapeHtml(
                            booking.pickupPropertyType
                        )}
                    </div>

                </div>


                <div class="detail-item">

                    <span
                        class="detail-label"
                    >
                        Ground floor
                    </span>

                    <div
                        class="detail-value"
                    >
                        ${escapeHtml(
                            booking.pickupGroundFloor ||
                            "Not specified"
                        )}
                    </div>

                </div>

            </section>


            <!-- DELIVERY -->

            <section class="detail-card">

                <h2>
                    New property
                </h2>


                <div class="detail-item">

                    <span
                        class="detail-label"
                    >
                        Address
                    </span>

                    <div
                        class="detail-value"
                    >
                        ${escapeHtml(
                            booking.deliveryAddress
                        )}
                    </div>

                </div>


                <div class="detail-item">

                    <span
                        class="detail-label"
                    >
                        Property type
                    </span>

                    <div
                        class="detail-value"
                    >
                        ${escapeHtml(
                            booking.deliveryPropertyType
                        )}
                    </div>

                </div>


                <div class="detail-item">

                    <span
                        class="detail-label"
                    >
                        Ground floor
                    </span>

                    <div
                        class="detail-value"
                    >
                        ${escapeHtml(
                            booking.deliveryGroundFloor ||
                            "Not specified"
                        )}
                    </div>

                </div>

            </section>


            <!-- INSTRUCTIONS -->

            <section class="detail-card full">

                <h2>
                    Special instructions
                </h2>

                <div class="instructions-box">

                    ${escapeHtml(
                        booking.specialInstructions ||
                        "No special instructions were provided."
                    )}

                </div>

            </section>


            <!-- STATUS -->

            <section class="detail-card full">

                <h2>
                    Manage enquiry
                </h2>

                <div class="status-management">

                    <label
                        for="bookingStatus"
                    >
                        Update status
                    </label>

                    <select
                        id="bookingStatus"
                        class="booking-status-select"
                    >

                        ${createStatusOptions(
                            status
                        )}

                    </select>


                    <button
                        id="saveStatusBtn"
                        class="save-status-btn"
                    >
                        Save Status
                    </button>


                    <div
                        id="updateMessage"
                        class="update-message"
                    ></div>

                </div>

            </section>


        </div>

    `;


    setupStatusUpdate();

}


/* =========================
   STATUS OPTIONS
   ========================= */

function createStatusOptions(
    currentStatus
) {

    const statuses = [
        "new",
        "contacted",
        "quoted",
        "confirmed",
        "completed",
        "cancelled"
    ];


    return statuses
        .map(
            (status) => `

                <option
                    value="${status}"
                    ${
                        status === currentStatus
                            ? "selected"
                            : ""
                    }
                >
                    ${capitalize(
                        status
                    )}
                </option>

            `
        )
        .join("");

}


/* =========================
   UPDATE STATUS
   ========================= */

function setupStatusUpdate() {

    const statusSelect =
        document.getElementById(
            "bookingStatus"
        );

    const saveButton =
        document.getElementById(
            "saveStatusBtn"
        );

    const message =
        document.getElementById(
            "updateMessage"
        );


    saveButton.addEventListener(
        "click",
        async () => {

            const newStatus =
                statusSelect.value;


            saveButton.disabled =
                true;

            saveButton.textContent =
                "Saving...";


            message.className =
                "update-message";

            message.textContent = "";


            try {

                await updateDoc(
                    doc(
                        db,
                        "bookings",
                        bookingId
                    ),
                    {
                        status: newStatus,
                        updatedAt:
                            serverTimestamp()
                    }
                );


                message.className =
                    "update-message success";

                message.textContent =
                    "Status updated successfully.";


            } catch (error) {

                console.error(
                    "Status update error:",
                    error
                );


                message.className =
                    "update-message error";

                message.textContent =
                    "Unable to update the status.";

            } finally {

                saveButton.disabled =
                    false;

                saveButton.textContent =
                    "Save Status";

            }

        }
    );

}


/* =========================
   LOGOUT
   ========================= */

logoutBtn.addEventListener(
    "click",
    async () => {

        await signOut(auth);

        window.location.href =
            "login.html";

    }
);


/* =========================
   HELPERS
   ========================= */

function capitalize(
    value
) {

    return value
        .charAt(0)
        .toUpperCase() +
        value.slice(1);

}


function escapeHtml(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

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


function escapeAttribute(
    value
) {

    return escapeHtml(value);

}


function showError(
    message
) {

    bookingContent.className =
        "error-detail";

    bookingContent.textContent =
        message;

}