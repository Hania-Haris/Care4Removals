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
