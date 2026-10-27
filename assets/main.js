(function () {
  "use strict";

  const data = window.PORTFOLIO;
  if (!data || !Array.isArray(data.projects)) return;

  const site = data.site || {};
  const projects = data.projects;
  const personalProjects = Array.isArray(data.personalProjects)
    ? data.personalProjects
    : [];
  const total = projects.length;
  const collections = {
    professional: projects,
    personal: personalProjects
  };

  const $ = (selector, scope) => (scope || document).querySelector(selector);
  const $$ = (selector, scope) => Array.from((scope || document).querySelectorAll(selector));
  const pad = (value) => String(value).padStart(2, "0");
  const displayNumber = (index, length) => pad(length - index);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const canHover = window.matchMedia("(hover: hover)").matches;

  const escapeHTML = (value) =>
    String(value == null ? "" : value).replace(/[&<>"']/g, (character) => {
      const map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      };
      return map[character];
    });

  const arrowIcon =
    '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  /* ------------------------------------------------------------------ */
  /* Content bindings                                                    */
  /* ------------------------------------------------------------------ */

  const initials =
    site.initials ||
    String(site.name || "Your Name")
      .trim()
      .split(/\s+/)
      .map((word) => word.charAt(0))
      .slice(0, 2)
      .join("")
      .toUpperCase();

  $$("[data-bind]").forEach((element) => {
    const key = element.dataset.bind;

    if (key === "email") {
      const textTarget = element.querySelector("span") || element;
      textTarget.textContent = site.email || "hello@example.com";
      if (element.tagName === "A") {
        element.href = "mailto:" + (site.email || "hello@example.com");
      }
      return;
    }

    if (key === "initials") {
      element.textContent = initials;
      return;
    }

    if (site[key]) element.textContent = site[key];
  });

  const yearElement = $("#year");
  if (yearElement) yearElement.textContent = new Date().getFullYear();

  const socialTemplate = (social) => {
    const url = social.url || "#";
    const placeholder = url === "#";
    const external = /^https?:/i.test(url);
    return (
      '<a class="social-link' +
      (placeholder ? " is-placeholder" : "") +
      '" href="' +
      escapeHTML(url) +
      '"' +
      (external ? ' target="_blank" rel="noopener noreferrer"' : "") +
      (placeholder
        ? ' data-placeholder="true" aria-disabled="true" title="Add your profile URL in assets/projects.js"'
        : "") +
      ">" +
      escapeHTML(social.label) +
      arrowIcon +
      "</a>"
    );
  };

  const socials = Array.isArray(site.socials) ? site.socials : [];
  ["#socials", "#mobile-socials"].forEach((selector) => {
    const container = $(selector);
    if (container) container.innerHTML = socials.map(socialTemplate).join("");
  });

  $$('[data-placeholder="true"]').forEach((link) => {
    link.addEventListener("click", (event) => event.preventDefault());
  });

  const skillList = $("#skill-list");
  if (skillList) {
    skillList.innerHTML = (site.skills || [])
      .map((skill) => "<li>" + escapeHTML(skill) + "</li>")
      .join("");
  }

  /* ------------------------------------------------------------------ */
  /* Intro loader                                                        */
  /* ------------------------------------------------------------------ */

  const loader = $("#loader");
  const loaderBar = $("#loader-bar");
  const loaderPct = $("#loader-pct");
  const readyCallbacks = [];
  let loaderFinished = false;

  function onReady(callback) {
    if (loaderFinished || document.documentElement.classList.contains("is-ready")) {
      callback();
    } else {
      readyCallbacks.push(callback);
    }
  }

  function finishLoading() {
    if (loaderFinished) return;
    loaderFinished = true;
    document.documentElement.classList.add("is-ready");

    if (loader) {
      loader.classList.add("is-done");
      window.setTimeout(() => {
        if (loader.parentNode) loader.parentNode.removeChild(loader);
      }, 900);
    }

    try {
      sessionStorage.setItem("portfolio-visited", "1");
    } catch (error) {
      /* storage can be unavailable in private or file contexts */
    }

    readyCallbacks.splice(0).forEach((callback) => callback());
  }

  function runLoader() {
    const duration = 720;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(eased * 100);

      if (loaderPct) loaderPct.textContent = pad(value);
      if (loaderBar) loaderBar.style.width = value + "%";

      if (progress < 1) {
        window.requestAnimationFrame(tick);
      } else {
        window.setTimeout(finishLoading, 160);
      }
    }

    window.requestAnimationFrame(tick);
  }

  let visited = false;
  try {
    visited = sessionStorage.getItem("portfolio-visited") === "1";
  } catch (error) {
    visited = false;
  }

  if (reduceMotion || visited) {
    if (loaderPct) loaderPct.textContent = "100";
    if (loaderBar) loaderBar.style.width = "100%";
    window.requestAnimationFrame(finishLoading);
  } else {
    runLoader();
  }

  /* ------------------------------------------------------------------ */
  /* Marquee                                                             */
  /* ------------------------------------------------------------------ */

  const marqueeTrack = $("#marquee-track");
  if (marqueeTrack) {
    const items = projects
      .map(
        (project) =>
          '<span class="marquee__item">' +
          escapeHTML(project.title) +
          '<span class="marquee__dot" aria-hidden="true"></span></span>'
      )
      .join("");

    marqueeTrack.innerHTML =
      '<div class="marquee__group">' +
      items +
      '</div><div class="marquee__group" aria-hidden="true">' +
      items +
      "</div>";
    marqueeTrack.style.setProperty("--marquee-duration", total * 4.4 + "s");
  }

  /* ------------------------------------------------------------------ */
  /* Project grid                                                        */
  /* ------------------------------------------------------------------ */

  const grid = $("#work-grid");
  const workCount = $("#work-count");
  const workEmpty = $("#work-empty");
  const workHint = $("#work-hint");
  const filtersWrap = $("#professional-filters");
  const workTabs = $$("[data-work-tab]");
  const workPanel = $("#work-panel");
  const workEyebrow = $("#work-eyebrow");
  const workTitle = $("#work-title");
  const workLead = $("#work-lead");
  const workHeadCopy = $("#work-head-copy");
  const workToolbar = $(".work-toolbar");
  const filterButtons = $$(".filter");
  const workMap = $("#work-map");
  const mapNodesContainer = $("#map-nodes");
  const mapLabel = $("#map-label");
  const mapMeta = $("#map-meta");
  const mapRouteBase = $(".work-map__route-base");
  const mapRouteGlow = $(".work-map__route-glow");
  const mapBriefing = $("#map-briefing");
  const mapBriefingImage = $("#map-briefing-image");
  const mapBriefingIndex = $("#map-briefing-index");
  const mapBriefingStatus = $("#map-briefing-status");
  const mapBriefingEyebrow = $("#map-briefing-eyebrow");
  const mapBriefingTitle = $("#map-briefing-title");
  const mapBriefingMeta = $("#map-briefing-meta");
  const mapBriefingSummary = $("#map-briefing-summary");
  const mapBriefingCta = $("#map-briefing-cta");
  const viewButtons = $$("[data-work-view]");

  let activeWorkTab = "professional";
  let activeWorkView = "map";
  let activeFilter = "all";
  let selectedMapIndex = 0;
  let mapNodes = [];
  let currentMapOrder = [];
  let currentNavigationOrder = [];
  let cardObserver = null;

  const workCopy = {
    professional: {
      eyebrow: "Shipped work",
      title:
        'Professional <br><span class="text-dim">Projects.</span>',
      lead:
        "Nine titles shipped with teams across five series — the games I've " +
        "helped build professionally. Open any card for the full story."
    },
    personal: {
      eyebrow: "Beyond the day job",
      title: 'Personal <br><span class="text-dim">projects.</span>',
      lead:
        "Small games, tools and experiments I build on my own time — a place to " +
        "try ideas, break things and learn. Open any card for the full story."
    }
  };

  const coverThemes = {
    ember: {
      accent: "#ff9a4d",
      deep: "#7a2f0b",
      base: "#140a06",
      glow: "#ff7a2f"
    },
    ocean: {
      accent: "#67e8d5",
      deep: "#0f766e",
      base: "#04100f",
      glow: "#2dd4bf"
    },
    violet: {
      accent: "#c4b5fd",
      deep: "#5b21b6",
      base: "#0d0718",
      glow: "#a78bfa"
    }
  };
  const coverThemeOrder = ["ember", "ocean", "violet"];

  function generatedCover(project, index, collection) {
    const themeName =
      project.coverTheme || coverThemeOrder[index % coverThemeOrder.length];
    const theme = coverThemes[themeName] || coverThemes.ember;
    const type = escapeHTML(
      String(
        project.type || (collection === "personal" ? "Personal" : "Project")
      ).toUpperCase()
    );
    const topLabel =
      collection === "personal" ? "PERSONAL PROJECT" : "SELECTED WORK";
    const shapeIndex = index % 3;
    const glyph =
      shapeIndex === 0
        ? '<circle cx="600" cy="375" r="92" fill="none" stroke="' +
          theme.accent +
          '" stroke-width="6"/><circle cx="600" cy="375" r="16" fill="' +
          theme.accent +
          '"/>'
        : shapeIndex === 1
          ? '<path d="M600 282L688 438H512Z" fill="none" stroke="' +
            theme.accent +
            '" stroke-width="6" stroke-linejoin="round"/><circle cx="600" cy="386" r="14" fill="' +
            theme.accent +
            '"/>'
          : '<rect x="520" y="295" width="160" height="160" transform="rotate(45 600 375)" fill="none" stroke="' +
            theme.accent +
            '" stroke-width="6"/><circle cx="600" cy="375" r="14" fill="' +
            theme.accent +
            '"/>';

    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 750">' +
      "<defs>" +
      '<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="' +
      theme.deep +
      '"/>' +
      '<stop offset="1" stop-color="' +
      theme.base +
      '"/>' +
      "</linearGradient>" +
      '<radialGradient id="glow" cx="52%" cy="44%" r="58%">' +
      '<stop offset="0" stop-color="' +
      theme.glow +
      '" stop-opacity=".42"/>' +
      '<stop offset=".6" stop-color="' +
      theme.glow +
      '" stop-opacity=".08"/>' +
      '<stop offset="1" stop-color="' +
      theme.glow +
      '" stop-opacity="0"/>' +
      "</radialGradient>" +
      "</defs>" +
      '<rect width="1200" height="750" fill="url(#bg)"/>' +
      '<rect width="1200" height="750" fill="url(#glow)"/>' +
      '<g opacity=".22" fill="none" stroke="' +
      theme.accent +
      '">' +
      '<circle cx="600" cy="375" r="300" stroke-width="1"/>' +
      '<circle cx="600" cy="375" r="235" stroke-width="1"/>' +
      '<circle cx="600" cy="375" r="170" stroke-width="1"/>' +
      '<path d="M0 375h1200M600 0v750" stroke-width="1"/>' +
      "</g>" +
      "<g>" +
      glyph +
      "</g>" +
      '<text x="600" y="218" text-anchor="middle" fill="#f4efe6" fill-opacity=".62" font-family="Arial, Helvetica, sans-serif" font-size="22" letter-spacing="10">' +
      topLabel +
      "</text>" +
      '<text x="600" y="555" text-anchor="middle" fill="' +
      theme.accent +
      '" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="700" letter-spacing="9">' +
      type +
      "</text>" +
      "</svg>";

    return "data:image/svg+xml," + encodeURIComponent(svg);
  }

  function coverFor(project, index, collection) {
    return project.image || generatedCover(project, index, collection);
  }

  function cardMarkup(project, index, collection) {
    const isPersonal = collection === "personal";
    const cover = coverFor(project, index, collection);
    const meta = isPersonal
      ? escapeHTML(project.type || "Personal") +
        " · " +
        escapeHTML(project.year || "")
      : escapeHTML(project.genre || "") + " · " + escapeHTML(project.series || "");

    return (
      '<button class="project-card' +
      (isPersonal ? " project-card--personal" : "") +
      '" type="button" data-project="' +
      index +
      '" data-collection="' +
      collection +
      '" data-series="' +
      escapeHTML(project.filter || "") +
      '" aria-haspopup="dialog" aria-label="Open ' +
      escapeHTML(project.title) +
      ' details">' +
      '<span class="card-media">' +
      '<img src="' +
      escapeHTML(cover) +
      '" alt="' +
      escapeHTML(project.title) +
      ' cover art" loading="lazy" decoding="async" width="1200" height="750">' +
      '<span class="card-shine" aria-hidden="true"></span>' +
      '<span class="card-index">' +
      displayNumber(index, (collections[collection] || projects).length) +
      "</span>" +
      (isPersonal ? '<span class="card-badge">Personal</span>' : "") +
      '<span class="card-arrow" aria-hidden="true">' +
      arrowIcon +
      "</span>" +
      "</span>" +
      '<span class="card-info">' +
      '<span class="card-title">' +
      escapeHTML(project.title) +
      "</span>" +
      '<span class="card-meta">' +
      meta +
      "</span>" +
      "</span>" +
      "</button>"
    );
  }

  const mapLayouts = {
    professional: [
      { x: 12, y: 70 },
      { x: 22, y: 48 },
      { x: 33, y: 68 },
      { x: 44, y: 44 },
      { x: 55, y: 64 },
      { x: 66, y: 40 },
      { x: 77, y: 60 },
      { x: 87, y: 37 },
      { x: 79, y: 19 }
    ],
    personal: [
      { x: 20, y: 64 },
      { x: 50, y: 37 },
      { x: 80, y: 63 }
    ]
  };

  function mapPositionFor(index, collection) {
    const layout = mapLayouts[collection] || mapLayouts.professional;
    return (
      layout[index] || {
        x: 12 + (index % 5) * 18,
        y: 22 + Math.floor(index / 5) * 28
      }
    );
  }

  function mapNodeMarkup(project, index, collection, routePosition) {
    const isPersonal = collection === "personal";
    const cover = coverFor(project, index, collection);
    const position = mapPositionFor(routePosition, collection);
    const meta = isPersonal
      ? escapeHTML(project.type || "Personal")
      : escapeHTML(project.series || "Project");

    return (
      '<button class="map-node' +
      (isPersonal ? " map-node--personal" : "") +
      '" type="button" style="--mx:' +
      position.x +
      "%;--my:" +
      position.y +
      "%;--node-delay:" +
      index * 70 +
      'ms" data-map-index="' +
      index +
      '" data-collection="' +
      collection +
      '" data-series="' +
      escapeHTML(project.filter || "") +
      '" aria-haspopup="dialog" aria-label="Open ' +
      escapeHTML(project.title) +
      ' details">' +
      '<span class="map-node__ring">' +
      '<img src="' +
      escapeHTML(cover) +
      '" alt="" loading="lazy" decoding="async" width="1200" height="750">' +
      "</span>" +
      '<span class="map-node__index">' +
      displayNumber(index, (collections[collection] || projects).length) +
      "</span>" +
      '<span class="map-node__text">' +
      '<span class="map-node__label">' +
      escapeHTML(project.title) +
      "</span>" +
      '<span class="map-node__meta">' +
      meta +
      "</span>" +
      "</span>" +
      '<span class="map-node__arrow" aria-hidden="true">' +
      arrowIcon +
      "</span>" +
      "</button>"
    );
  }

  function renderMap(tab, collection) {
    if (!workMap) return;

    const isPersonal = tab === "personal";
    workMap.classList.toggle("work-map--personal", isPersonal);

    if (mapLabel) {
      mapLabel.textContent = isPersonal ? "Side quests" : "Campaign map";
    }
    if (mapMeta) {
      mapMeta.textContent =
        pad(collection.length) + (isPersonal ? " side quests" : " levels");
    }

    if (mapNodesContainer) {
      mapNodesContainer.innerHTML = collection
        .map((project, index) => ({ project, index }))
        .reverse()
        .map((entry, routePosition) =>
          mapNodeMarkup(entry.project, entry.index, tab, routePosition)
        )
        .join("");
      mapNodes = $$(".map-node", mapNodesContainer);
    } else {
      mapNodes = [];
    }

    const positions = collection.map((project, index) =>
      mapPositionFor(index, tab)
    );
    const route =
      positions
        .map((point, index) => (index === 0 ? "M" : "L") + point.x + " " + point.y)
        .join(" ") || "";

    if (mapRouteBase) mapRouteBase.setAttribute("d", route);
    if (mapRouteGlow) mapRouteGlow.setAttribute("d", route);

    currentMapOrder = collection.map((project, index) => index).reverse();
    selectedMapIndex = collection.length ? collection.length - 1 : 0;
  }

  function updateMapBriefing(index, collectionName) {
    const list = collections[collectionName] || projects;
    const project = list[index];
    if (!project || !mapBriefing) return;

    const isPersonal = collectionName === "personal";
    const cover = coverFor(project, index, collectionName);
    selectedMapIndex = index;

    if (mapBriefingImage) {
      mapBriefingImage.src = cover;
      mapBriefingImage.alt = project.title + " cover art";
      mapBriefingImage.style.opacity = "0";
      const revealImage = () => {
        mapBriefingImage.style.opacity = "1";
      };
      if (mapBriefingImage.complete) {
        window.requestAnimationFrame(revealImage);
      } else {
        mapBriefingImage.onload = revealImage;
      }
    }

    if (mapBriefingIndex) {
      mapBriefingIndex.textContent =
        displayNumber(index, list.length) + " / " + pad(list.length);
    }
    if (mapBriefingStatus) {
      mapBriefingStatus.textContent = isPersonal ? "Side quest" : "Shipped";
    }
    if (mapBriefingEyebrow) {
      mapBriefingEyebrow.textContent = isPersonal
        ? "Side quest"
        : "Selected project";
    }
    if (mapBriefingTitle) {
      mapBriefingTitle.textContent = project.title;
    }
    if (mapBriefingMeta) {
      mapBriefingMeta.textContent = (
        isPersonal
          ? [project.type, project.year]
          : [project.series, project.genre, project.year]
      )
        .filter(Boolean)
        .join(" · ");
    }
    if (mapBriefingSummary) {
      mapBriefingSummary.textContent = project.summary;
    }
    if (mapBriefingCta) {
      mapBriefingCta.setAttribute(
        "aria-label",
        "Open case study for " + project.title
      );
    }

    mapNodes.forEach((node) => {
      node.classList.toggle(
        "is-selected",
        Number(node.dataset.mapIndex) === index
      );
    });
  }

  function setWorkView(view, options) {
    const settings = options || {};
    if (view !== "map" && view !== "grid") return;

    activeWorkView = view;

    viewButtons.forEach((button) => {
      const active = button.dataset.workView === view;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    if (workMap) workMap.hidden = view !== "map";
    if (grid) grid.hidden = view !== "grid";

    if (view === "grid") {
      setupCards();
    } else {
      updateMapBriefing(selectedMapIndex, activeWorkTab);
    }

    if (settings.animate !== false && !reduceMotion) {
      const target = view === "map" ? workMap : grid;
      if (target) {
        target.animate(
          [
            { opacity: 0, transform: "translateY(8px)" },
            { opacity: 1, transform: "none" }
          ],
          {
            duration: 380,
            easing: "cubic-bezier(.22, 1, .36, 1)"
          }
        );
      }
    }
  }

  viewButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.workView === activeWorkView) return;
      setWorkView(button.dataset.workView, { animate: true });
    });
  });

  if (mapNodesContainer) {
    mapNodesContainer.addEventListener("pointerover", (event) => {
      const node = event.target.closest(".map-node");
      if (!node || node.disabled) return;
      const index = Number(node.dataset.mapIndex);
      if (index !== selectedMapIndex) {
        updateMapBriefing(index, activeWorkTab);
      }
    });

    mapNodesContainer.addEventListener("focusin", (event) => {
      const node = event.target.closest(".map-node");
      if (!node || node.disabled) return;
      const index = Number(node.dataset.mapIndex);
      if (index !== selectedMapIndex) {
        updateMapBriefing(index, activeWorkTab);
      }
    });

    mapNodesContainer.addEventListener("click", (event) => {
      const node = event.target.closest(".map-node");
      if (!node || node.disabled) return;
      const index = Number(node.dataset.mapIndex);
      updateMapBriefing(index, activeWorkTab);
      openProject(activeWorkTab, index, node, {
        order: currentMapOrder
      });
    });
  }

  if (mapBriefingCta) {
    mapBriefingCta.addEventListener("click", () => {
      const node =
        mapNodes.find(
          (entry) => Number(entry.dataset.mapIndex) === selectedMapIndex
        ) || null;
      openProject(activeWorkTab, selectedMapIndex, node, {
        order: currentMapOrder
      });
    });
  }

  filterButtons.forEach((button) => {
    const filter = button.dataset.filter;
    const count =
      filter === "all"
        ? projects.length
        : projects.filter((project) => project.filter === filter).length;
    const countElement = button.querySelector("span");
    if (countElement) countElement.textContent = pad(count);

    button.addEventListener("click", () => {
      if (activeWorkTab !== "professional") return;
      applyFilter(button.dataset.filter, { animate: true });
    });
  });

  $$('[data-tab-count="professional"]').forEach((element) => {
    element.textContent = pad(projects.length);
  });
  $$('[data-tab-count="personal"]').forEach((element) => {
    element.textContent = pad(personalProjects.length);
  });

  function bindTilt(card) {
    let frame = null;

    card.addEventListener("pointermove", (event) => {
      if (frame) return;

      frame = window.requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;

        card.style.setProperty("--tilt-x", (-y * 5.5).toFixed(2) + "deg");
        card.style.setProperty("--tilt-y", (x * 6.5).toFixed(2) + "deg");
        card.style.setProperty("--shine-x", ((x + 0.5) * 100).toFixed(1) + "%");
        card.style.setProperty("--shine-y", ((y + 0.5) * 100).toFixed(1) + "%");
        card.classList.add("is-tilting");
        frame = null;
      });
    });

    card.addEventListener("pointerleave", () => {
      card.classList.remove("is-tilting");
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
    });
  }

  function setupCards() {
    if (!grid) return;
    const currentCards = $$(".project-card", grid);

    if (!currentCards.length) return;

    if (!("IntersectionObserver" in window) || reduceMotion) {
      currentCards.forEach((card) => card.classList.add("is-visible"));
    } else {
      if (cardObserver) cardObserver.disconnect();
      cardObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            cardObserver.unobserve(entry.target);
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
      );

      currentCards.forEach((card, index) => {
        card.style.setProperty("--reveal-delay", (index % 3) * 80 + "ms");
        cardObserver.observe(card);
      });
    }

    if (finePointer && canHover && !reduceMotion) {
      currentCards.forEach(bindTilt);
    }
  }

  function applyFilter(filter, options) {
    const settings = options || {};
    if (activeWorkTab !== "professional") return;
    if (filter === activeFilter && !settings.force) return;
    activeFilter = filter;

    filterButtons.forEach((button) => {
      const active = button.dataset.filter === filter;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    const currentCards = $$(".project-card", grid);
    const previousRects = new Map();

    currentCards.forEach((card) => {
      if (!card.hidden) previousRects.set(card, card.getBoundingClientRect());
    });

    currentCards.forEach((card) => {
      card.hidden = filter !== "all" && card.dataset.series !== filter;
    });

    const visibleCards = currentCards.filter((card) => !card.hidden);
    if (workCount) {
      workCount.textContent =
        "Showing " + pad(visibleCards.length) + " of " + pad(projects.length);
    }
    if (workEmpty) workEmpty.hidden = visibleCards.length > 0;

    const activeMapIndices = [];
    mapNodes.forEach((node) => {
      const matches = filter === "all" || node.dataset.series === filter;
      node.classList.toggle("is-dimmed", !matches);
      node.disabled = !matches;
      if (matches) activeMapIndices.push(Number(node.dataset.mapIndex));
    });

    if (!activeMapIndices.includes(selectedMapIndex)) {
      selectedMapIndex = activeMapIndices.length ? activeMapIndices[0] : 0;
    }
    updateMapBriefing(selectedMapIndex, activeWorkTab);

    if (
      reduceMotion ||
      settings.animate === false ||
      activeWorkView !== "grid"
    ) {
      return;
    }

    visibleCards.forEach((card) => {
      const previous = previousRects.get(card);

      if (previous) {
        const next = card.getBoundingClientRect();
        const deltaX = previous.left - next.left;
        const deltaY = previous.top - next.top;

        if (Math.abs(deltaX) > 1 || Math.abs(deltaY) > 1) {
          card.animate(
            [
              { transform: "translate(" + deltaX + "px, " + deltaY + "px)" },
              { transform: "none" }
            ],
            {
              duration: 520,
              easing: "cubic-bezier(.22, 1, .36, 1)"
            }
          );
        }
      } else {
        card.animate(
          [
            { opacity: 0, transform: "scale(.96)" },
            { opacity: 1, transform: "none" }
          ],
          {
            duration: 440,
            easing: "cubic-bezier(.22, 1, .36, 1)"
          }
        );
      }
    });
  }

  function animateWorkSwitch() {
    if (reduceMotion) return;

    [workHeadCopy, workLead, workToolbar].forEach((element, index) => {
      if (!element) return;
      element.animate(
        [
          { opacity: 0, transform: "translateY(10px)" },
          { opacity: 1, transform: "none" }
        ],
        {
          duration: 420,
          delay: index * 40,
          easing: "cubic-bezier(.22, 1, .36, 1)",
          fill: "both"
        }
      );
    });
  }

  function setWorkHash(tab) {
    try {
      history.replaceState(
        { workTab: tab },
        "",
        tab === "personal" ? "#personal" : "#work"
      );
    } catch (error) {
      /* history can be restricted in some local contexts */
    }
  }

  function renderWork(tab, options) {
    const settings = options || {};
    const isPersonal = tab === "personal";
    const collection = collections[tab] || projects;
    const copy = workCopy[tab] || workCopy.professional;

    activeWorkTab = tab;

    workTabs.forEach((button) => {
      const active = button.dataset.workTab === tab;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", String(active));
      button.tabIndex = active ? 0 : -1;
    });

    if (workPanel) {
      workPanel.setAttribute(
        "aria-labelledby",
        isPersonal ? "tab-personal" : "tab-professional"
      );
    }
    if (workEyebrow) workEyebrow.textContent = copy.eyebrow;
    if (workTitle) workTitle.innerHTML = copy.title;
    if (workLead) workLead.textContent = copy.lead;
    if (filtersWrap) filtersWrap.hidden = isPersonal;
    if (workHint) workHint.hidden = !isPersonal;

    renderMap(tab, collection);

    if (grid) {
      grid.dataset.collection = tab;
      grid.innerHTML = collection
        .map((project, index) => cardMarkup(project, index, tab))
        .join("");
    }

    if (workEmpty) workEmpty.hidden = collection.length > 0;

    if (isPersonal) {
      if (workCount) {
        workCount.textContent = pad(collection.length) + " projects";
      }
      updateMapBriefing(selectedMapIndex, tab);
    } else {
      applyFilter(activeFilter, { force: true, animate: false });
    }

    setWorkView(activeWorkView, { animate: false });

    if (settings.animate !== false) animateWorkSwitch();
    if (settings.updateHash) setWorkHash(tab);
  }

  workTabs.forEach((button) => {
    button.addEventListener("click", () => {
      const tab = button.dataset.workTab;
      if (tab === activeWorkTab) return;
      renderWork(tab, { animate: true, updateHash: true });
      updateNavActive("work");
    });

    button.addEventListener("keydown", (event) => {
      if (
        event.key !== "ArrowLeft" &&
        event.key !== "ArrowRight" &&
        event.key !== "Home" &&
        event.key !== "End"
      ) {
        return;
      }

      event.preventDefault();
      const current = workTabs.indexOf(button);
      let nextIndex = current;

      if (event.key === "ArrowLeft") {
        nextIndex = (current - 1 + workTabs.length) % workTabs.length;
      } else if (event.key === "ArrowRight") {
        nextIndex = (current + 1) % workTabs.length;
      } else if (event.key === "Home") {
        nextIndex = 0;
      } else if (event.key === "End") {
        nextIndex = workTabs.length - 1;
      }

      const next = workTabs[nextIndex];
      next.focus();
      next.click();
    });
  });

  function goToWorkTab(tab) {
    if (tab !== activeWorkTab) {
      renderWork(tab, { animate: true, updateHash: true });
    } else {
      setWorkHash(tab);
    }

    updateNavActive("work");

    const workAnchor = document.getElementById("personal");
    if (workAnchor) {
      workAnchor.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start"
      });
    }
  }

  $$("[data-work-nav]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      if (menuOpen) setMenu(false);
      goToWorkTab(link.dataset.workNav);
    });
  });

  renderWork("professional", { animate: false, updateHash: false });

  const seriesCount = new Set(projects.map((project) => project.series)).size;

  $$('[data-stat="games"]').forEach((element) => {
    element.textContent = pad(total);
    if (element.hasAttribute("data-counter")) element.dataset.counter = total;
  });

  $$('[data-stat="series"]').forEach((element) => {
    element.textContent = pad(seriesCount);
    if (element.hasAttribute("data-counter")) {
      element.dataset.counter = seriesCount;
    }
  });

  /* ------------------------------------------------------------------ */
  /* Scroll reveals                                                      */
  /* ------------------------------------------------------------------ */

  const revealItems = $$("[data-reveal]");

  if (!("IntersectionObserver" in window) || reduceMotion) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  }

  /* ------------------------------------------------------------------ */
  /* Hero parallax                                                       */
  /* ------------------------------------------------------------------ */

  const visualStage = $("#visual-stage");
  const coverFan = $("#cover-fan");

  if (visualStage && coverFan && finePointer && !reduceMotion) {
    visualStage.addEventListener("pointermove", (event) => {
      const rect = visualStage.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      coverFan.style.setProperty("--parallax-x", (x * 20).toFixed(1) + "px");
      coverFan.style.setProperty("--parallax-y", (y * 16).toFixed(1) + "px");
      coverFan.style.setProperty("--parallax-rx", (-y * 6).toFixed(2) + "deg");
      coverFan.style.setProperty("--parallax-ry", (x * 8).toFixed(2) + "deg");
    });

    visualStage.addEventListener("pointerleave", () => {
      coverFan.style.setProperty("--parallax-x", "0px");
      coverFan.style.setProperty("--parallax-y", "0px");
      coverFan.style.setProperty("--parallax-rx", "0deg");
      coverFan.style.setProperty("--parallax-ry", "0deg");
    });
  }

  /* ------------------------------------------------------------------ */
  /* Counters                                                            */
  /* ------------------------------------------------------------------ */

  const counters = $$("[data-counter]");

  function animateCounter(element) {
    const target = Number(element.dataset.counter) || 0;

    if (reduceMotion) {
      element.textContent = pad(target);
      return;
    }

    const duration = 1200;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = pad(Math.round(eased * target));

      if (progress < 1) window.requestAnimationFrame(tick);
    }

    window.requestAnimationFrame(tick);
  }

  if (counters.length) {
    if (!("IntersectionObserver" in window)) {
      counters.forEach(animateCounter);
    } else {
      const counterObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          });
        },
        { threshold: 0.6 }
      );

      counters.forEach((counter) => counterObserver.observe(counter));
    }
  }

  /* ------------------------------------------------------------------ */
  /* Header, scroll progress, active nav                                 */
  /* ------------------------------------------------------------------ */

  const header = $("#site-header");
  const progressBar = $("#scroll-progress");
  const navLinks = $$("[data-nav]");
  const sections = ["work", "about", "contact"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  let scrollTicking = false;

  function updateScrollUI() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? Math.min(1, scrollTop / scrollable) : 0;

    if (header) header.classList.toggle("is-scrolled", scrollTop > 24);
    if (progressBar) progressBar.style.transform = "scaleX(" + progress + ")";

    if (scrollTop < 80) {
      navLinks.forEach((link) => link.classList.remove("is-active"));
    }

    scrollTicking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (scrollTicking) return;
      scrollTicking = true;
      window.requestAnimationFrame(updateScrollUI);
    },
    { passive: true }
  );

  updateScrollUI();

  function updateNavActive(sectionId) {
    navLinks.forEach((link) => {
      const href = link.getAttribute("href");
      const active =
        sectionId === "work"
          ? href === (activeWorkTab === "personal" ? "#personal" : "#work")
          : href === "#" + sectionId;
      link.classList.toggle("is-active", active);
    });
  }

  if ("IntersectionObserver" in window) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          updateNavActive(entry.target.id);
        });
      },
      { rootMargin: "-42% 0px -52% 0px", threshold: 0 }
    );

    sections.forEach((section) => navObserver.observe(section));
  }

  /* ------------------------------------------------------------------ */
  /* Cursor glow                                                         */
  /* ------------------------------------------------------------------ */

  const cursorGlow = $("#cursor-glow");

  if (cursorGlow && finePointer && !reduceMotion) {
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;

    window.addEventListener(
      "pointermove",
      (event) => {
        targetX = event.clientX;
        targetY = event.clientY;
      },
      { passive: true }
    );

    function glowLoop() {
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;
      cursorGlow.style.transform =
        "translate3d(" +
        currentX.toFixed(1) +
        "px, " +
        currentY.toFixed(1) +
        "px, 0) translate(-50%, -50%)";
      window.requestAnimationFrame(glowLoop);
    }

    glowLoop();
  }

  /* ------------------------------------------------------------------ */
  /* Mobile menu                                                         */
  /* ------------------------------------------------------------------ */

  const menuToggle = $("#menu-toggle");
  const mobileMenu = $("#mobile-menu");
  const pageMain = $("#main");
  const pageFooter = $(".site-footer");
  let menuOpen = false;

  function setMenu(open) {
    if (!menuToggle || !mobileMenu || menuOpen === open) return;
    menuOpen = open;

    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    mobileMenu.setAttribute("aria-hidden", String(!open));
    mobileMenu.inert = !open;
    if (pageMain) pageMain.inert = open;
    if (pageFooter) pageFooter.inert = open;
    document.body.classList.toggle("menu-open", open);

    if (open) {
      window.setTimeout(() => {
        mobileMenu.focus({ preventScroll: true });
      }, 60);
    }
  }

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () => setMenu(!menuOpen));

    $$("[data-menu-link]", mobileMenu).forEach((link) => {
      link.addEventListener("click", () => setMenu(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && menuOpen) {
        setMenu(false);
        menuToggle.focus({ preventScroll: true });
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 820 && menuOpen) setMenu(false);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Project dialog                                                      */
  /* ------------------------------------------------------------------ */

  const dialog = $("#project-dialog");
  const dialogShell = $("#dialog-shell");
  const dialogClose = $("#dialog-close");
  const dialogImage = $("#dialog-image");
  const dialogIndex = $("#dialog-index");
  const dialogSeries = $("#dialog-series");
  const dialogTitle = $("#dialog-title");
  const dialogTags = $("#dialog-tags");
  const dialogSummary = $("#dialog-summary");
  const dialogFacts = $("#dialog-facts");
  const dialogLists = $("#dialog-lists");
  const dialogResponsibilitiesWrap = $("#dialog-responsibilities-wrap");
  const dialogResponsibilities = $("#dialog-responsibilities");
  const dialogHighlightsWrap = $("#dialog-highlights-wrap");
  const dialogHighlights = $("#dialog-highlights");
  const dialogContent = $("#dialog-content");
  const dialogEyebrow = $("#dialog-eyebrow");
  const dialogLink = $("#dialog-link");
  const dialogLinks = $("#dialog-links");
  const dialogResponsibilitiesTitle = $("#dialog-responsibilities-title");
  const dialogCounter = $("#dialog-counter");
  const dialogPrev = $("#dialog-prev");
  const dialogNext = $("#dialog-next");

  let currentIndex = 0;
  let currentCollectionName = "professional";
  let currentCollection = projects;
  let lastTrigger = null;
  let dialogClosing = false;
  let closeTimer = null;

  function modalTargetFromHash() {
    const personalMatch = window.location.hash.match(/^#personal-(.+)$/);
    if (personalMatch) {
      const id = decodeURIComponent(personalMatch[1]);
      const index = personalProjects.findIndex(
        (project) => String(project.id) === id
      );
      if (index >= 0) return { collection: "personal", index };
    }

    const projectMatch = window.location.hash.match(/^#project-(.+)$/);
    if (projectMatch) {
      const id = decodeURIComponent(projectMatch[1]);
      const index = projects.findIndex(
        (project) => String(project.id) === id
      );
      if (index >= 0) return { collection: "professional", index };
    }

    return null;
  }

  function projectHash(collection, project) {
    return (collection === "personal" ? "#personal-" : "#project-") + project.id;
  }

  function writeProjectHash(collection, index, method) {
    const list = collections[collection] || projects;
    const project = list[index];
    if (!project) return;

    try {
      history[method](
        { collection, project: project.id },
        "",
        projectHash(collection, project)
      );
    } catch (error) {
      /* history can be restricted in some local contexts */
    }
  }

  function pushHash(collection, index) {
    writeProjectHash(collection, index, "pushState");
  }

  function replaceHash(collection, index) {
    writeProjectHash(collection, index, "replaceState");
  }

  function renderProject(collection, index) {
    const list = collections[collection] || projects;
    const project = list[index];
    if (!project) return;

    currentCollectionName = collection;
    currentCollection = list;
    currentIndex = index;

    const isPersonal = collection === "personal";
    const cover = coverFor(project, index, collection);

    dialogImage.src = cover;
    dialogImage.alt = project.title + " cover art";
    dialogImage.style.opacity = "0";
    const revealImage = () => {
      dialogImage.style.opacity = "1";
    };
    if (dialogImage.complete) {
      window.requestAnimationFrame(revealImage);
    } else {
      dialogImage.onload = revealImage;
    }

    dialogIndex.textContent =
      displayNumber(index, list.length) + " / " + pad(list.length);
    dialogSeries.textContent = isPersonal ? project.type : project.series;
    dialogEyebrow.textContent = isPersonal
      ? "Personal project"
      : "Professional project";
    dialogTitle.textContent = project.title;

    const tags = isPersonal
      ? ["Personal", project.type].concat(
          Array.isArray(project.tech) ? project.tech : []
        )
      : [project.series, project.genre];

    dialogTags.innerHTML = tags
      .filter(Boolean)
      .map((tag) => '<span class="tag">' + escapeHTML(tag) + "</span>")
      .join("");

    dialogSummary.textContent = project.summary;

    const facts = isPersonal
      ? [
          ["Year", project.year],
          ["Type", project.type],
          ["Role", project.role]
        ]
      : [
          ["Role", project.role || site.role],
          ["Year", project.year],
          ["Studio", project.studio],
          ["Platforms", project.platforms],
          ["Engine", project.engine]
        ];

    dialogFacts.innerHTML = facts
      .filter((fact) => fact[1])
      .map((fact) => {
        const value = String(fact[1]);
        const placeholder = /^add\b/i.test(value) || value === "20XX";
        return (
          "<div><dt>" +
          escapeHTML(fact[0]) +
          "</dt><dd" +
          (placeholder ? ' class="is-placeholder"' : "") +
          ">" +
          escapeHTML(value) +
          "</dd></div>"
        );
      })
      .join("");

    const responsibilities = isPersonal
      ? Array.isArray(project.features)
        ? project.features
        : []
      : Array.isArray(project.responsibilities)
        ? project.responsibilities
        : [];
    const highlights = isPersonal
      ? []
      : Array.isArray(project.highlights)
        ? project.highlights
        : [];
    const showHighlights =
      !isPersonal && responsibilities.length === 0 && highlights.length > 0;

    if (dialogResponsibilitiesTitle) {
      dialogResponsibilitiesTitle.textContent = isPersonal
        ? "What I built"
        : "Responsibilities";
    }
    if (dialogResponsibilitiesWrap) {
      dialogResponsibilitiesWrap.hidden = responsibilities.length === 0;
    }
    if (dialogResponsibilities) {
      dialogResponsibilities.innerHTML = responsibilities
        .map((responsibility) => "<li>" + escapeHTML(responsibility) + "</li>")
        .join("");
    }

    if (dialogHighlightsWrap) dialogHighlightsWrap.hidden = !showHighlights;
    if (dialogHighlights) {
      dialogHighlights.innerHTML = highlights
        .map((highlight) => "<li>" + escapeHTML(highlight) + "</li>")
        .join("");
    }

    if (dialogLists) {
      dialogLists.hidden =
        responsibilities.length === 0 && highlights.length === 0;
    }

    if (isPersonal) {
      dialogLink.hidden = true;

      const links = Array.isArray(project.links)
        ? project.links.filter((link) => link && link.url && link.url !== "#")
        : [];

      if (dialogLinks) {
        dialogLinks.hidden = links.length === 0;
        dialogLinks.innerHTML = links
          .map(
            (link, linkIndex) =>
              '<a class="btn ' +
              (linkIndex === 0 ? "btn--primary" : "btn--ghost") +
              '" href="' +
              escapeHTML(link.url) +
              '" target="_blank" rel="noopener noreferrer">' +
              escapeHTML(link.label || "Open") +
              arrowIcon +
              "</a>"
          )
          .join("");
      }
    } else {
      if (dialogLinks) {
        dialogLinks.hidden = true;
        dialogLinks.innerHTML = "";
      }

      if (project.link) {
        dialogLink.href = project.link;
        dialogLink.hidden = false;
      } else {
        dialogLink.hidden = true;
      }
    }

    const navigationOrder = currentNavigationOrder.length
      ? currentNavigationOrder
      : list.map((project, projectIndex) => projectIndex);
    const navigationPosition = navigationOrder.indexOf(index);
    const safePosition = navigationPosition >= 0 ? navigationPosition : 0;

    dialogCounter.textContent =
      displayNumber(index, list.length) + " / " + pad(list.length);
    dialogPrev.setAttribute(
      "aria-label",
      "Previous project: " +
        list[
          navigationOrder[
            (safePosition - 1 + navigationOrder.length) % navigationOrder.length
          ]
        ].title
    );
    dialogNext.setAttribute(
      "aria-label",
      "Next project: " +
        list[navigationOrder[(safePosition + 1) % navigationOrder.length]].title
    );

    if (dialogContent) dialogContent.scrollTop = 0;
  }

  function animateDialogIn(trigger) {
    if (!dialogShell) return;

    if (reduceMotion) return;

    if (dialogContent) {
      dialogContent.animate(
        [
          { opacity: 0, transform: "translateY(14px)" },
          { opacity: 1, transform: "none" }
        ],
        {
          duration: 480,
          delay: 150,
          easing: "cubic-bezier(.22, 1, .36, 1)",
          fill: "both"
        }
      );
    }

    if (!trigger) {
      dialogShell.animate(
        [
          { opacity: 0, transform: "translateY(20px) scale(.985)" },
          { opacity: 1, transform: "none" }
        ],
        {
          duration: 480,
          easing: "cubic-bezier(.22, 1, .36, 1)"
        }
      );
      return;
    }

    const from = trigger.getBoundingClientRect();
    const to = dialogShell.getBoundingClientRect();
    const scale = Math.max(0.18, Math.min(0.88, from.width / to.width));
    const translateX =
      from.left + from.width / 2 - (to.left + to.width / 2);
    const translateY =
      from.top + from.height / 2 - (to.top + to.height / 2);

    dialogShell.animate(
      [
        {
          transform:
            "translate(" +
            translateX +
            "px, " +
            translateY +
            "px) scale(" +
            scale +
            ")",
          opacity: 0.25
        },
        { transform: "translate(0, 0) scale(1)", opacity: 1 }
      ],
      {
        duration: 640,
        easing: "cubic-bezier(.16, 1, .3, 1)"
      }
    );
  }

  function animateContentSwap(direction) {
    if (reduceMotion) return;

    if (dialogContent) {
      dialogContent.animate(
        [
          {
            opacity: 0,
            transform: "translateX(" + direction * 18 + "px)"
          },
          { opacity: 1, transform: "none" }
        ],
        {
          duration: 320,
          easing: "cubic-bezier(.22, 1, .36, 1)"
        }
      );
    }

    const media = $(".dialog-media", dialogShell);
    if (media) {
      media.animate([{ opacity: 0.35 }, { opacity: 1 }], {
        duration: 320,
        easing: "ease-out"
      });
    }
  }

  function openProject(collection, index, trigger, options) {
    if (!dialog) return;

    const group = collections[collection] ? collection : "professional";
    const project = collections[group][index];
    if (!project) return;

    const settings = options || {};
    const updateHistory = settings.updateHistory !== false;
    const animate = settings.animate !== false;
    const direction = settings.direction || 1;
    const wasOpen = dialog.open;

    if (
      !wasOpen ||
      Array.isArray(settings.order) ||
      group !== activeWorkTab
    ) {
      currentNavigationOrder = Array.isArray(settings.order)
        ? settings.order
        : collections[group].map((project, projectIndex) => projectIndex);
    }

    if (group !== activeWorkTab) {
      renderWork(group, { animate: false, updateHash: false });
    }

    if (!wasOpen) {
      lastTrigger = trigger || null;
      renderProject(group, index);
      document.body.classList.add("modal-open");

      dialog.showModal();
      if (updateHistory) pushHash(group, index);

      if (dialogShell) dialogShell.focus({ preventScroll: true });

      window.requestAnimationFrame(() => {
        if (animate) animateDialogIn(trigger);
      });
    } else {
      renderProject(group, index);
      if (updateHistory) replaceHash(group, index);
      if (animate) animateContentSwap(direction);
    }
  }

  function closeProject(fromHistory) {
    if (!dialog || !dialog.open || dialogClosing) return;

    dialogClosing = true;
    const focusTarget = lastTrigger;
    let finished = false;

    function finish() {
      if (finished) return;
      finished = true;
      window.clearTimeout(closeTimer);
      dialog.close();
      dialogClosing = false;
      document.body.classList.remove("modal-open");

      if (focusTarget && document.contains(focusTarget)) {
        focusTarget.focus({ preventScroll: true });
      }

      if (!fromHistory) setWorkHash(activeWorkTab);
    }

    if (reduceMotion || !focusTarget || !dialogShell) {
      finish();
      return;
    }

    const target = focusTarget.getBoundingClientRect();
    const panel = dialogShell.getBoundingClientRect();
    const scale = Math.max(0.2, Math.min(0.7, target.width / panel.width));
    const translateX =
      target.left + target.width / 2 - (panel.left + panel.width / 2);
    const translateY =
      target.top + target.height / 2 - (panel.top + panel.height / 2);

    const animation = dialogShell.animate(
      [
        { transform: "translate(0, 0) scale(1)", opacity: 1 },
        {
          transform:
            "translate(" +
            translateX +
            "px, " +
            translateY +
            "px) scale(" +
            scale +
            ")",
          opacity: 0
        }
      ],
      {
        duration: 340,
        easing: "cubic-bezier(.4, 0, .2, 1)"
      }
    );

    animation.onfinish = finish;
    closeTimer = window.setTimeout(finish, 420);
  }

  function stepProject(direction) {
    if (!currentCollection.length) return;

    const order = currentNavigationOrder.length
      ? currentNavigationOrder
      : currentCollection.map((project, projectIndex) => projectIndex);
    const position = order.indexOf(currentIndex);
    const safePosition = position >= 0 ? position : 0;
    const nextPosition =
      (safePosition + direction + order.length) % order.length;

    openProject(currentCollectionName, order[nextPosition], null, {
      direction,
      order
    });
  }

  if (dialog) {
    if (grid) {
      grid.addEventListener("click", (event) => {
        const card = event.target.closest(".project-card");
        if (!card) return;
        openProject(
          card.dataset.collection,
          Number(card.dataset.project),
          card
        );
      });
    }

    if (dialogClose) {
      dialogClose.addEventListener("click", () => closeProject(false));
    }

    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) closeProject(false);
    });

    dialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      closeProject(false);
    });

    dialog.addEventListener("close", () => {
      dialogClosing = false;
      document.body.classList.remove("modal-open");
    });

    if (dialogPrev) {
      dialogPrev.addEventListener("click", () => stepProject(-1));
    }

    if (dialogNext) {
      dialogNext.addEventListener("click", () => stepProject(1));
    }

    document.addEventListener("keydown", (event) => {
      if (!dialog.open) return;

      if (event.key === "ArrowRight") {
        event.preventDefault();
        stepProject(1);
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        stepProject(-1);
      }
    });

    window.addEventListener("popstate", () => {
      const target = modalTargetFromHash();

      if (target) {
        if (
          !dialog.open ||
          target.collection !== currentCollectionName ||
          target.index !== currentIndex
        ) {
          openProject(target.collection, target.index, null, {
            updateHistory: false,
            animate: false
          });
        }
        return;
      }

      if (dialog.open) closeProject(true);

      const hash = window.location.hash;

      if (hash === "#personal" && activeWorkTab !== "personal") {
        renderWork("personal", { animate: false, updateHash: false });
      } else if (hash === "#work" && activeWorkTab !== "professional") {
        renderWork("professional", { animate: false, updateHash: false });
      }

      if (hash === "#personal" || hash === "#work") {
        updateNavActive("work");
      }
    });

    const initialTarget = modalTargetFromHash();

    if (initialTarget) {
      if (initialTarget.collection !== activeWorkTab) {
        renderWork(initialTarget.collection, {
          animate: false,
          updateHash: false
        });
      }

      const initialAnchor = document.getElementById("personal");
      if (initialAnchor) {
        window.requestAnimationFrame(() => {
          initialAnchor.scrollIntoView({ block: "start" });
        });
      }

      onReady(() => {
        window.setTimeout(() => {
          openProject(initialTarget.collection, initialTarget.index, null, {
            updateHistory: false,
            animate: false
          });
        }, 220);
      });
    } else if (window.location.hash === "#personal") {
      renderWork("personal", { animate: false, updateHash: false });
    }
  }

  /* ------------------------------------------------------------------ */
  /* Anchor scrolling + keyboard focus                                   */
  /* ------------------------------------------------------------------ */

  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", () => {
      if (menuOpen) setMenu(false);
    });
  });

  if (reduceMotion) {
    document.documentElement.style.scrollBehavior = "auto";
  }
})();
