"use client";

import { useEffect } from "react";

export default function ClientasInteractions() {
  useEffect(() => {
    const nav = document.getElementById("mainNav");
    const cDot = document.getElementById("cDot");
    const cRing = document.getElementById("cRing");
    const authWrap = document.getElementById("authWrap");
    const authClose = document.getElementById("authClose");

    const handleScroll = () => {
      if (!nav) return;

      if (window.scrollY > 40) {
        nav.classList.add("scrolled");
      } else {
        nav.classList.remove("scrolled");
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (cDot) {
        cDot.style.left = `${e.clientX}px`;
        cDot.style.top = `${e.clientY}px`;
      }

      if (cRing) {
        cRing.style.left = `${e.clientX}px`;
        cRing.style.top = `${e.clientY}px`;
      }
    };

    const hoverTargets = document.querySelectorAll(
      "a, button, .svc-card, .mode-card, .bc-card, .faq-item, .dist-card"
    );

    const addHover = () => document.body.classList.add("cursor-hover");
    const removeHover = () => document.body.classList.remove("cursor-hover");

    hoverTargets.forEach((el) => {
      el.addEventListener("mouseenter", addHover);
      el.addEventListener("mouseleave", removeHover);
    });

    const openAuthButtons = document.querySelectorAll(".open-auth");

    const openAuth = (tab?: string) => {
      if (!authWrap) return;

      authWrap.classList.add("open");

      if (tab) {
        const tabs = document.querySelectorAll(".auth-tab");
        const panels = document.querySelectorAll(".auth-panel");

        tabs.forEach((t) => t.classList.remove("active"));
        panels.forEach((p) => p.classList.remove("show"));

        const activeTab = document.querySelector(
          `.auth-tab[data-tab="${tab}"]`
        );
        const activePanel = document.getElementById(`panel-${tab}`);

        activeTab?.classList.add("active");
        activePanel?.classList.add("show");
      }
    };

    const closeAuth = () => {
      authWrap?.classList.remove("open");
    };

    openAuthButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        const tab = (button as HTMLElement).dataset.tab || "login";
        openAuth(tab);
      });
    });

    authClose?.addEventListener("click", closeAuth);

    authWrap?.addEventListener("click", (e) => {
      if (e.target === authWrap) closeAuth();
    });

    const authTabs = document.querySelectorAll(".auth-tab");
    const switchLinks = document.querySelectorAll("[data-switch]");

    const switchTab = (tab: string) => {
      document
        .querySelectorAll(".auth-tab")
        .forEach((t) => t.classList.remove("active"));
      document
        .querySelectorAll(".auth-panel")
        .forEach((p) => p.classList.remove("show"));

      document.querySelector(`.auth-tab[data-tab="${tab}"]`)?.classList.add("active");
      document.getElementById(`panel-${tab}`)?.classList.add("show");
    };

    authTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const tabName = (tab as HTMLElement).dataset.tab;
        if (tabName) switchTab(tabName);
      });
    });

    switchLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const tabName = (link as HTMLElement).dataset.switch;
        if (tabName) switchTab(tabName);
      });
    });
        const svcTabButtons = document.querySelectorAll(".svc-tab-btn");

    svcTabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const panel = (button as HTMLElement).dataset.panel;
        if (!panel) return;

        document
          .querySelectorAll(".svc-tab-btn")
          .forEach((btn) => btn.classList.remove("active"));

        document
          .querySelectorAll(".svc-panel")
          .forEach((item) => item.classList.remove("show"));

        button.classList.add("active");
        document.getElementById(`panel-${panel}`)?.classList.add("show");
      });
    });

        const initMap = () => {
      const mapEl = document.getElementById("lima-map");
      if (!mapEl) return;
      if ((window as any).__beluMapInitialized) return;

      const L = (window as any).L;
      if (!L) return;

      (window as any).__beluMapInitialized = true;

      const map = L.map("lima-map", {
        center: [-12.098, -77.03],
        zoom: 12,
        scrollWheelZoom: false,
      });

      L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  {
    attribution: '&copy; OpenStreetMap &copy; CartoDB',
    subdomains: "abcd",
    maxZoom: 20,
  }
).addTo(map);

      const districts = [
        { name: "Miraflores", coords: [-12.1211, -77.0297] },
        { name: "San Isidro", coords: [-12.0975, -77.0365] },
        { name: "Surco", coords: [-12.145, -76.991] },
        { name: "Monterrico", coords: [-12.102, -76.965] },
        { name: "La Molina", coords: [-12.089, -76.946] },
        { name: "Barranco", coords: [-12.149, -77.021] },
        { name: "San Borja", coords: [-12.108, -76.998] },
        { name: "San Miguel", coords: [-12.076, -77.088] },
        { name: "Pueblo Libre", coords: [-12.076, -77.063] },
        { name: "Magdalena", coords: [-12.091, -77.067] },
      ];

      const pinIcon = L.divIcon({
        className: "belu-pin-wrap",
        html: `
          <div class="belu-pin">
            <span class="ring"></span>
            <span class="ring2"></span>
            <span class="core"></span>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      districts.forEach((district) => {
        L.marker(district.coords, { icon: pinIcon }).addTo(map);

        L.marker(district.coords, {
          icon: L.divIcon({
            className: "belu-label-wrap",
            html: `<div class="belu-label">${district.name}<span class="priority-tag"></span></div>`,
            iconSize: [120, 30],
            iconAnchor: [60, -12],
          }),
        }).addTo(map);
      });
    };

    const loadLeaflet = () => {
      if ((window as any).L) {
        initMap();
        return;
      }

      const existingScript = document.getElementById("leaflet-script");
      if (existingScript) {
        existingScript.addEventListener("load", initMap);
        return;
      }

      const script = document.createElement("script");
      script.id = "leaflet-script";
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = initMap;
      document.body.appendChild(script);
    };

    loadLeaflet();

        const faqItems = document.querySelectorAll(".faq-item");

    faqItems.forEach((item) => {
      item.addEventListener("click", () => {
        item.classList.toggle("open");
      });
    });

    const revealEls = document.querySelectorAll(".rev, .rev-l, .rev-r");

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
          }
        });
      },
      { threshold: 0.15 }
    );

    revealEls.forEach((el) => revealObserver.observe(el));

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mousemove", handleMouseMove);

    handleScroll();
    

        return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);

      hoverTargets.forEach((el) => {
        el.removeEventListener("mouseenter", addHover);
        el.removeEventListener("mouseleave", removeHover);
      });

      faqItems.forEach((item) => {
        item.replaceWith(item.cloneNode(true));
      });

      revealObserver.disconnect();
    };
  }, []);

  return null;
}