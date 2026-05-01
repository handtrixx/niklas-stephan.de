(function () {
  const toc = document.querySelector("#TableOfContents");
  if (!toc) return;

  const links = Array.from(toc.querySelectorAll("a"));
  const headings = links
    .map((link) => {
      const id = link.getAttribute("href").slice(1);
      return document.getElementById(id);
    })
    .filter(Boolean);

  // Fold/unfold on click
  links.forEach((link) => {
    link.addEventListener("click", () => {
      const li = link.parentElement;
      const isOpen = li.classList.contains("open");

      // Close all
      toc
        .querySelectorAll("li.open")
        .forEach((el) => el.classList.remove("open"));

      // Open clicked one (toggle)
      if (!isOpen) {
        li.classList.add("open");
        // Also open parent li if nested
        let parent = li.parentElement?.closest("li");
        while (parent) {
          parent.classList.add("open");
          parent = parent.parentElement?.closest("li");
        }
      }
    });
  });

  // Scrollspy
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const id = entry.target.getAttribute("id");
        const activeLink = toc.querySelector(`a[href="#${id}"]`);
        if (!activeLink) return;

        // Remove active from all
        links.forEach((l) => l.classList.remove("active"));
        activeLink.classList.add("active");

        // Open parent li chain and close others
        toc
          .querySelectorAll("li.open")
          .forEach((el) => el.classList.remove("open"));
        let li = activeLink.parentElement;
        while (li && li !== toc) {
          if (li.tagName === "LI") li.classList.add("open");
          li = li.parentElement;
        }
      });
    },
    {
      rootMargin: "0px 0px -80% 0px",
      threshold: 0,
    },
  );

  headings.forEach((h) => observer.observe(h));
})();
