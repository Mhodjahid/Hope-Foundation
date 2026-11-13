const contactForm = document.querySelector("#contactForm");
const formFeedback = document.querySelector("#formFeedback");

if (contactForm && formFeedback) {
    contactForm.addEventListener("submit", (event) => {
        event.preventDefault();
        formFeedback.textContent = "Thanks for reaching out! This demo form needs a backend to deliver your message.";
        contactForm.reset();
    });
}

const pageScroller = document.querySelector("#pageScroller");

if (pageScroller) {
    const icon = pageScroller.querySelector("i");

    const updatePageScroller = () => {
        const scrollDown = window.scrollY < 100;
        const direction = scrollDown ? "down" : "up";
        icon.classList.toggle("bi-arrow-down", scrollDown);
        icon.classList.toggle("bi-arrow-up", !scrollDown);
        pageScroller.setAttribute("aria-label", `Scroll to ${direction === "down" ? "bottom" : "top"}`);
        pageScroller.setAttribute("title", `Scroll to ${direction === "down" ? "bottom" : "top"}`);
    };

    pageScroller.addEventListener("click", () => {
        const scrollDown = window.scrollY < 100;
        window.scrollTo({
            top: scrollDown ? document.documentElement.scrollHeight : 0,
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        });
    });

    window.addEventListener("scroll", updatePageScroller, { passive: true });
    updatePageScroller();
}

const navigation = document.querySelector("#mainNavigation");

if (navigation && window.bootstrap) {
    navigation.addEventListener("show.bs.offcanvas", () => {
        if (pageScroller) {
            pageScroller.hidden = true;
        }
    });

    navigation.addEventListener("hidden.bs.offcanvas", () => {
        if (pageScroller) {
            pageScroller.hidden = false;
        }
    });

    navigation.querySelectorAll(".nav-link").forEach((link) => {
        link.addEventListener("click", () => {
            if (window.matchMedia("(max-width: 991.98px)").matches) {
                window.bootstrap.Offcanvas.getOrCreateInstance(navigation).hide();
            }
        });
    });
}

const pageLoader = document.querySelector("#pageLoader");

const setPageLoading = (isLoading) => {
    document.documentElement.classList.toggle("is-page-loading", isLoading);
    document.body.classList.toggle("is-page-loading", isLoading);

    if (window.bootstrap) {
        document.querySelectorAll(".carousel").forEach((carouselElement) => {
            const carousel = window.bootstrap.Carousel.getInstance(carouselElement);
            if (carousel) {
                if (isLoading) {
                    carousel.pause();
                } else {
                    carousel.cycle();
                }
            }
        });
    }
};

if (pageLoader) {
    let navigationPending = pageLoader.classList.contains("is-active");

    if (navigationPending) {
        setPageLoading(true);
        window.setTimeout(() => {
            pageLoader.classList.remove("is-active");
            pageLoader.setAttribute("aria-hidden", "true");
            setPageLoading(false);
            navigationPending = false;
        }, 1000);
    }

    document.addEventListener("click", (event) => {
        if (!(event.target instanceof Element) || event.button !== 0
            || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
            return;
        }

        const link = event.target.closest("a[href]");
        if (!link || link.hasAttribute("download") || (link.target && link.target !== "_self")) {
            return;
        }

        const destination = new URL(link.href, window.location.href);
        const samePage = destination.origin === window.location.origin
            && destination.pathname === window.location.pathname
            && destination.search === window.location.search;

        if (samePage && destination.hash) {
            return;
        }

        event.preventDefault();
        if (navigationPending) {
            return;
        }

        navigationPending = true;
        pageLoader.classList.add("is-active");
        pageLoader.setAttribute("aria-hidden", "false");
        setPageLoading(true);

        window.setTimeout(() => {
            pageLoader.classList.remove("is-active");
            pageLoader.setAttribute("aria-hidden", "true");
            setPageLoading(false);
            navigationPending = false;
            window.location.href = destination.href;
        }, 1000);
    }, true);
}

const heroCarousel = document.querySelector("#home");

if (heroCarousel && window.bootstrap) {
    const carousel = window.bootstrap.Carousel.getOrCreateInstance(heroCarousel, {
        interval: 5000,
        pause: false,
    });

    if (document.body.classList.contains("is-page-loading")) {
        carousel.pause();
    } else {
        carousel.cycle();
    }
}

const testimonialCarousel = document.querySelector("#testimonialCarousel");

if (testimonialCarousel && window.bootstrap) {
    const carousel = window.bootstrap.Carousel.getOrCreateInstance(testimonialCarousel, {
        interval: 6000,
        pause: "hover",
    });

    if (document.body.classList.contains("is-page-loading")) {
        carousel.pause();
    } else {
        carousel.cycle();
    }
}

const allocationCard = document.querySelector(".allocation-card");

if (allocationCard) {
    const donutChart = allocationCard.querySelector(".donut-chart");
    const segments = [...allocationCard.querySelectorAll(".donut-segment")];
    const legendItems = [...allocationCard.querySelectorAll(".allocation-legend li")];
    const amount = allocationCard.querySelector("[data-allocation-amount]");
    const description = allocationCard.querySelector("[data-allocation-description]");

    if (donutChart && amount && description) {
        const updateAllocation = (key) => {
            const activeSegment = segments.find((segment) => segment.dataset.allocation === key);
            if (!activeSegment) {
                return;
            }

            donutChart.classList.add("has-active-segment");
            segments.forEach((segment) => {
                segment.classList.toggle("is-active", segment === activeSegment);
            });
            legendItems.forEach((item) => {
                item.classList.toggle("is-active", item.dataset.allocation === key);
            });
            amount.textContent = activeSegment.dataset.amount;
            description.textContent = `${activeSegment.dataset.name} · ${activeSegment.dataset.percent}%`;
        };

        const resetAllocation = () => {
            donutChart.classList.remove("has-active-segment");
            segments.forEach((segment) => segment.classList.remove("is-active"));
            legendItems.forEach((item) => item.classList.remove("is-active"));
            amount.textContent = "₹50 Lakh";
            description.textContent = "Total investment";
        };

        const allocationTarget = (target) => {
            return target instanceof Element ? target.closest("[data-allocation]") : null;
        };

        allocationCard.addEventListener("pointerover", (event) => {
            const target = allocationTarget(event.target);
            if (target) {
                updateAllocation(target.dataset.allocation);
            }
        });

        allocationCard.addEventListener("pointerout", (event) => {
            const target = allocationTarget(event.target);
            const nextTarget = allocationTarget(event.relatedTarget);
            const segmentHasFocus = segments.includes(document.activeElement);

            if (target && !nextTarget && !segmentHasFocus) {
                resetAllocation();
            }
        });

        segments.forEach((segment) => {
            segment.addEventListener("focus", () => updateAllocation(segment.dataset.allocation));
            segment.addEventListener("blur", (event) => {
                if (!segments.includes(event.relatedTarget)) {
                    resetAllocation();
                }
            });
            segment.addEventListener("click", () => updateAllocation(segment.dataset.allocation));
            segment.addEventListener("keydown", (event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    updateAllocation(segment.dataset.allocation);
                }
            });
        });
    }
}
