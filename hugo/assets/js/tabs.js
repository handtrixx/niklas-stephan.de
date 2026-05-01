document.querySelectorAll("nav.tab").forEach((nav) => {
  const tabs = nav.querySelectorAll("a");

  tabs.forEach((tab) => {
    tab.addEventListener("click", (e) => {
      e.preventDefault();

      // Deactivate all tabs and panels in this nav
      tabs.forEach((t) => t.classList.remove("active"));
      nav.querySelectorAll("a").forEach((t) => {
        const panel = document.querySelector(t.getAttribute("href"));
        if (panel) panel.classList.remove("active");
      });

      // Activate clicked tab and its panel
      tab.classList.add("active");
      const panel = document.querySelector(tab.getAttribute("href"));
      if (panel) panel.classList.add("active");
    });
  });
});
