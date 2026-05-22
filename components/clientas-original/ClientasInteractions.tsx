"use client";

import { useEffect } from "react";

export default function ClientasInteractions() {
  useEffect(() => {
    const nav = document.getElementById("mainNav");
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

    const openAuth = (tab?: string) => {
      if (!authWrap) return;

      authWrap.classList.add("open");

      if (tab) {
        const tabs = document.querySelectorAll(".auth-tab");
        const panels = document.querySelectorAll(".auth-panel");

        tabs.forEach((item) => item.classList.remove("active"));
        panels.forEach((item) => item.classList.remove("show"));

        document
          .querySelector(`.auth-tab[data-tab="${tab}"]`)
          ?.classList.add("active");

        document.getElementById(`panel-${tab}`)?.classList.add("show");
      }
    };

    const closeAuth = () => {
      authWrap?.classList.remove("open");
    };

    const switchTab = (tab: string) => {
      document
        .querySelectorAll(".auth-tab")
        .forEach((item) => item.classList.remove("active"));

      document
        .querySelectorAll(".auth-panel")
        .forEach((item) => item.classList.remove("show"));

      document
        .querySelector(`.auth-tab[data-tab="${tab}"]`)
        ?.classList.add("active");

      document.getElementById(`panel-${tab}`)?.classList.add("show");
    };

    const openAuthButtons = document.querySelectorAll(".open-auth");
    const authTabs = document.querySelectorAll(".auth-tab");
    const switchLinks = document.querySelectorAll("[data-switch]");
    const svcTabButtons = document.querySelectorAll(".svc-tab-btn");
    const faqItems = document.querySelectorAll(".faq-item");
    const revealEls = document.querySelectorAll(".rev, .rev-l, .rev-r");

    openAuthButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();

        const tab = (button as HTMLElement).dataset.tab || "login";
        openAuth(tab);
      });
    });

    authClose?.addEventListener("click", closeAuth);

    authWrap?.addEventListener("click", (event) => {
      if (event.target === authWrap) {
        closeAuth();
      }
    });

    authTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const tabName = (tab as HTMLElement).dataset.tab;

        if (tabName) {
          switchTab(tabName);
        }
      });
    });

    switchLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();

        const tabName = (link as HTMLElement).dataset.switch;

        if (tabName) {
          switchTab(tabName);
        }
      });
    });

    svcTabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const panel = (button as HTMLElement).dataset.panel;

        if (!panel) return;

        document
          .querySelectorAll(".svc-tab-btn")
          .forEach((item) => item.classList.remove("active"));

        document
          .querySelectorAll(".svc-panel")
          .forEach((item) => item.classList.remove("show"));

        button.classList.add("active");
        document.getElementById(`panel-${panel}`)?.classList.add("show");
      });
    });

    faqItems.forEach((item) => {
      item.addEventListener("click", () => {
        item.classList.toggle("open");
      });
    });

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
          }
        });
      },
      {
        threshold: 0.15,
      }
    );

    revealEls.forEach((item) => {
      revealObserver.observe(item);
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
        L.marker(district.coords, {
          icon: pinIcon,
        }).addTo(map);

        L.marker(district.coords, {
          icon: L.divIcon({
            className: "belu-label-wrap",
            html: `<div class="belu-label">${district.name}<span class="priority-tag"></span></div>`,
            iconSize: [140, 30],
            iconAnchor: [70, -12],
          }),
        }).addTo(map);
      });
    };

    const loadLeafletCss = () => {
      if (document.getElementById("leaflet-css")) return;

      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";

      document.head.appendChild(link);
    };

    const loadLeaflet = () => {
      loadLeafletCss();

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

    window.addEventListener("scroll", handleScroll);

    handleScroll();
    loadLeaflet();

    return () => {
      window.removeEventListener("scroll", handleScroll);

      revealObserver.disconnect();
    };
  }, []);

  return null;
}