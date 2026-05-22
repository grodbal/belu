"use client";

import { useEffect } from "react";

export default function BeluersInteractions() {
  useEffect(() => {
    const nav = document.getElementById("mainNav");
    const modalWrap = document.getElementById("modalWrap");
    const modalClose = document.getElementById("modalClose");
    const modalForm = document.getElementById("modalForm") as HTMLFormElement | null;
    const modalSuccess = document.getElementById("modalSuccess");

    const handleScroll = () => {
      if (!nav) return;
      nav.classList.toggle("scrolled", window.scrollY > 60);
    };

    const openModal = () => {
      if (!modalWrap) return;
      modalWrap.classList.add("open");
      document.body.style.overflow = "hidden";
    };

    const closeModal = () => {
      if (!modalWrap) return;
      modalWrap.classList.remove("open");
      document.body.style.overflow = "";
    };

    const openButtons = document.querySelectorAll(".open-modal");

    openButtons.forEach((button) => {
      button.addEventListener("click", openModal);
    });

    modalClose?.addEventListener("click", closeModal);

    modalWrap?.addEventListener("click", (event) => {
      if (event.target === modalWrap) {
        closeModal();
      }
    });

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    document.addEventListener("keydown", handleKeydown);

    modalForm?.addEventListener("submit", (event) => {
      event.preventDefault();

      modalForm.style.display = "none";

      const title = document.querySelector(".modal-form-title") as HTMLElement | null;
      const sub = document.querySelector(".modal-form-sub") as HTMLElement | null;

      if (title) title.style.display = "none";
      if (sub) sub.style.display = "none";

      modalSuccess?.classList.add("show");
    });

    const slides = [
      'DUPLICA TUS<br><span class="red">SERVICIOS.</span>',
      'COBRA LO QUE<br><span class="red">MERECES.</span>',
      'EL SISTEMA<br><span class="red">QUE TE FALTA.</span>',
      'MENOS TRÁFICO,<br><span class="red">MÁS DINERO.</span>',
    ];

    let slideIndex = 0;
    const heroSlide = document.getElementById("hs0");

    if (heroSlide) {
      heroSlide.style.transition = "opacity .6s ease, transform .6s ease";

      const slider = window.setInterval(() => {
        slideIndex = (slideIndex + 1) % slides.length;

        heroSlide.style.opacity = "0";
        heroSlide.style.transform = "translateY(-20px)";

        window.setTimeout(() => {
          heroSlide.innerHTML = slides[slideIndex];
          heroSlide.style.transition = "none";
          heroSlide.style.transform = "translateY(20px)";

          window.setTimeout(() => {
            heroSlide.style.transition = "opacity .6s ease, transform .6s ease";
            heroSlide.style.opacity = "1";
            heroSlide.style.transform = "translateY(0)";
          }, 50);
        }, 500);
      }, 3500);

          const revealEls = document.querySelectorAll(".beluers-original .rev, .beluers-original .rev-l, .beluers-original .rev-r");

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );

    revealEls.forEach((el) => revealObserver.observe(el));

        let compAnimated = false;

    const animateComp = () => {
      if (compAnimated) return;
      compAnimated = true;

      document.querySelectorAll(".beluers-original .count-num").forEach((el) => {
        const target = Number((el as HTMLElement).dataset.val || "0");
        const prefix = (el as HTMLElement).dataset.prefix || "";
        const duration = 1200;
        const steps = 50;
        const increment = target / steps;

        let current = 0;

        const timer = window.setInterval(() => {
          current = Math.min(current + increment, target);
          el.textContent = prefix + Math.round(current).toLocaleString("es-PE");

          if (current >= target) {
            window.clearInterval(timer);
          }
        }, duration / steps);
      });

      document
        .querySelectorAll(".beluers-original .comp-bar-fill")
        .forEach((bar) => {
          const width = (bar as HTMLElement).dataset.width || "0%";

          window.setTimeout(() => {
            (bar as HTMLElement).style.width = width;
          }, 200);
        });
    };

    const compEl = document.querySelector(".beluers-original .comp-outer");

    const compObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateComp();
            compObserver.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );

    if (compEl) {
      compObserver.observe(compEl);
    }

    const parallaxBg = document.getElementById("parallaxBg");

    const handleParallax = () => {
      if (!parallaxBg || !parallaxBg.parentElement) return;

      const rect = parallaxBg.parentElement.getBoundingClientRect();

      if (rect.top < window.innerHeight && rect.bottom > 0) {
        const progress =
          (window.innerHeight - rect.top) / (window.innerHeight + rect.height);

        parallaxBg.style.transform = `scale(1.1) translateY(${
          (progress - 0.5) * 40
        }px)`;
      }
    };  
    
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("scroll", handleParallax, { passive: true });
      handleScroll();

      return () => {
        window.clearInterval(slider);
        window.removeEventListener("scroll", handleScroll);
        window.removeEventListener("scroll", handleParallax);
        compObserver.disconnect();
        document.removeEventListener("keydown", handleKeydown);
        revealObserver.disconnect();

        openButtons.forEach((button) => {
          button.removeEventListener("click", openModal);
        });
      };
    }

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("keydown", handleKeydown);

      openButtons.forEach((button) => {
        button.removeEventListener("click", openModal);
      });
    };
  }, []);

  return null;
}