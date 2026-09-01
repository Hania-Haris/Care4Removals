import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import { db } from "./firebase-config.js";

const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");
const submitButton = contactForm?.querySelector('button[type="submit"]');

if (contactForm) {

    contactForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        if (!contactForm.checkValidity()) {
            contactForm.reportValidity();
            return;
        }

        formStatus.className = "form-status";
        formStatus.textContent = "";

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.innerHTML = "Sending...";
        }

        const formData = new FormData(contactForm);

        const messageData = {
            name: formData.get("name").trim(),
            phone: formData.get("phone").trim(),
            email: formData.get("email").trim(),
            subject: formData.get("subject"),
            message: formData.get("message").trim(),

            status: "new",

            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        try {

            await addDoc(
                collection(db, "contactMessages"),
                messageData
            );

            formStatus.className = "form-status show";

            formStatus.textContent =
                "Thanks — your message has been received. We'll be in touch.";

            contactForm.reset();

        } catch (error) {

            console.error(
                "Error submitting contact message:",
                error
            );

            formStatus.className = "form-status show";

            formStatus.textContent =
                "Sorry, we couldn't send your message. Please try again or contact us directly.";

        } finally {

            if (submitButton) {
                submitButton.disabled = false;
                submitButton.innerHTML =
                    'Send Message <span>→</span>';
            }

        }

    });

}