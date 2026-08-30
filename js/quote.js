import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import { db } from "./firebase-config.js";


const quoteForm =
    document.getElementById("quoteForm");

const formMessage =
    document.getElementById("formMessage");

const submitButton =
    document.getElementById("submitQuote");


if (quoteForm) {

    quoteForm.addEventListener("submit", async (event) => {

        event.preventDefault();


        formMessage.className = "form-message";
        formMessage.textContent = "";

        submitButton.classList.add("submit-loading");

        submitButton.disabled = true;

        submitButton.innerHTML = "Sending...";


        const formData =
            new FormData(quoteForm);


        const bookingData = {

            customerName:
                formData.get("customerName").trim(),

            phone:
                formData.get("phone").trim(),

            email:
                formData.get("email").trim(),

            pickupAddress:
                formData.get("pickupAddress").trim(),

            pickupPropertyType:
                formData.get("pickupPropertyType"),

            pickupGroundFloor:
                formData.get("pickupGroundFloor"),

            deliveryAddress:
                formData.get("deliveryAddress").trim(),

            deliveryPropertyType:
                formData.get("deliveryPropertyType"),

            deliveryGroundFloor:
                formData.get("deliveryGroundFloor"),

            movingDate:
                formData.get("movingDate"),

            serviceType:
                formData.get("serviceType"),

            specialInstructions:
                formData.get("specialInstructions").trim(),

            status: "new",

            createdAt: serverTimestamp(),

            updatedAt: serverTimestamp()

        };


        try {

            await addDoc(
                collection(db, "bookings"),
                bookingData
            );


            formMessage.className =
                "form-message success";

            formMessage.textContent =
                "Thank you! Your removal enquiry has been received. Our team will be in touch shortly.";


            quoteForm.reset();


            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });


        } catch (error) {

            console.error(
                "Error submitting quote:",
                error
            );


            formMessage.className =
                "form-message error";

            formMessage.textContent =
                "Sorry, we couldn't submit your request. Please try again or contact us directly.";


        } finally {

            submitButton.classList.remove(
                "submit-loading"
            );

            submitButton.disabled = false;

            submitButton.innerHTML =
                "Request My Quote <span>→</span>";

        }

    });

}