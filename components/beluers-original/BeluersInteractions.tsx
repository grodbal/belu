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

      window.addEventListener("scroll", handleScroll);
      handleScroll();

      return () => {
        window.clearInterval(slider);
        window.removeEventListener("scroll", handleScroll);
        document.removeEventListener("keydown", handleKeydown);

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