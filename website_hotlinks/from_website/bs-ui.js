/*
 * bs-ui.js: shared BombSquad-style UI behaviour.
 * Include on every page with:  <script src="bs-ui.js" defer></script>
 *
 * HTML hooks (no per-page JS needed):
 *   .bs-btn                    click sound + hover tap sound
 *   data-sound="meow"          play a named sound INSTEAD of the click
 *   data-href="/page"          button navigates there
 *   data-back                  button goes history.back()
 *   data-open-modal="id"       swish + open <dialog id="id">
 *   data-close-modal[="id"]    close that dialog (or the nearest one if empty)
 *   data-template="id"         replaced on load by the contents of <template id="id">
 */
(function () {
  "use strict";

  const BS_AUDIO_BASE =
    "https://github.com/themlikyrug/chocolate-bombsquad/raw/refs/heads/main/ba_data/audio/";

  // Add new sounds here. A value can be a URL or an array (random pick).
  const SOUNDS = {
    click: BS_AUDIO_BASE + "click01.ogg",
    tap: BS_AUDIO_BASE + "tap.ogg",
    swish: ["swish.ogg", "swish2.ogg", "swish3.ogg"].map((f) => BS_AUDIO_BASE + f),
    meow: "https://github.com/mell-py/mells-goodies/raw/refs/heads/main/website_hotlinks/undertale_meow.mp3",
    dooropen: "https://github.com/mell-py/mells-goodies/raw/refs/heads/main/website_hotlinks/fpa_door.mp3",
    doorclose: "https://github.com/mell-py/mells-goodies/raw/refs/heads/main/website_hotlinks/fpa_door_close.mp3",
  };

  function playSound(name) {
    const entry = SOUNDS[name];
    if (!entry) return;
    const url = Array.isArray(entry)
      ? entry[Math.floor(Math.random() * entry.length)]
      : entry;
    // Autoplay can be blocked until the first user gesture; ignore that.
    new Audio(url).play().catch(() => {});
  }

  function openModal(id) {
    const dialog = document.getElementById(id);
    if (!dialog) return;
    playSound("swish");
    dialog.showModal();
  }

  function closeModal(id) {
    const dialog = document.getElementById(id);
    if (!dialog) return;
    playSound("swish");
    dialog.close();
  }

  // Replace <div data-template="x"> with the contents of <template id="x">.
  function expandTemplates(root = document) {
    root.querySelectorAll("[data-template]").forEach((slot) => {
      const tpl = document.getElementById(slot.dataset.template);
      if (tpl) slot.replaceWith(tpl.content.cloneNode(true));
    });
  }


  // Event delegation: works for buttons added later, with no per-button listeners.
  function bindEvents() {
    // Click events
    document.addEventListener("click", (e) => {
      const btn = e.target.closest(".bs-btn");
      if (!btn) return;
  
      // Custom sound replaces the default click.
      playSound(btn.dataset.sound || "click");
  
      if (btn.hasAttribute("data-back")) history.back();
      if (btn.dataset.href) location.href = btn.dataset.href;
      if (btn.dataset.openModal) openModal(btn.dataset.openModal);
  
      if (btn.hasAttribute("data-close-modal")) {
        const id = btn.dataset.closeModal;
        if (id) closeModal(id);
        else btn.closest("dialog")?.close();
      }
    });
  
    // Hover enter events (delegated)
    document.addEventListener("mouseover", (e) => {
      const btn = e.target.closest(".bs-btn, .door");
      if (!btn || btn.contains(e.relatedTarget)) return;
  
      if (btn.matches(".door")) {
        playSound("dooropen");
      } else {
        playSound("tap");
      }
    });
  
    // Hover leave events (delegated)
    document.addEventListener("mouseout", (e) => {
      const btn = e.target.closest(".door");
      if (!btn || btn.contains(e.relatedTarget)) return;
  
      playSound("doorclose");
    });
  }


  function init() {
    expandTemplates();
    bindEvents();
  }

  // Expose for inline use or other scripts: BS.playSound("meow"), BS.openModal("x")
  window.BS = { playSound, openModal, closeModal, SOUNDS };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
