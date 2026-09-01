const mobileMenuBtn =
    document.getElementById("mobileMenuBtn");

const mobileNav =
    document.getElementById("mobileNav");


if (mobileMenuBtn && mobileNav) {

    mobileMenuBtn.addEventListener("click", () => {

        mobileNav.classList.toggle("active");

    });


    const mobileLinks =
        mobileNav.querySelectorAll("a");

    mobileLinks.forEach((link) => {

        link.addEventListener("click", () => {

            mobileNav.classList.remove("active");

        });

    });

}

// Subtle scroll-reveal for visual rhythm.
const revealItems = document.querySelectorAll("[data-reveal]");
if (revealItems.length && "IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("reveal-visible");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });
    revealItems.forEach(item => revealObserver.observe(item));
} else {
    revealItems.forEach(item => item.classList.add("reveal-visible"));
}
