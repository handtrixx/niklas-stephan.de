(function () {
  let fuse = null;

  async function initSearch() {
    try {
      const response = await fetch("/search-index.json");
      const data = await response.json();
      fuse = new Fuse(data, {
        keys: [
          { name: "title", weight: 0.7 },
          { name: "content", weight: 0.3 },
          { name: "section", weight: 0.2 },
        ],
        includeScore: true,
        threshold: 0.4,
        ignoreLocation: true,
      });
    } catch (e) {
      console.error("Search index could not be loaded.", e);
    }
  }

  function renderResults(hits, list) {
    list.innerHTML = "";
    if (hits.length === 0) {
      list.innerHTML = '<li class="search-no-results">No results found.</li>';
    } else {
      hits.slice(0, 10).forEach(function (item) {
        const li = document.createElement("li");
        li.innerHTML =
          '<a href="' +
          item.url +
          '">' +
          '<div class="search-result-title">' +
          item.title +
          "</div>" +
          '<div class="search-result-section">' +
          item.section +
          "</div>" +
          "</a>";
        list.appendChild(li);
      });
    }
    list.classList.add("visible");
  }

  document.addEventListener("DOMContentLoaded", function () {
    const input = document.getElementById("search-input");
    const list = document.getElementById("search-results");

    if (!input || !list) return;

    initSearch();

    input.addEventListener("input", function () {
      const query = input.value.trim();
      if (!fuse || query.length < 2) {
        list.classList.remove("visible");
        return;
      }
      const hits = fuse.search(query).map(function (r) {
        return r.item;
      });
      renderResults(hits, list);
    });

    document.addEventListener("click", function (e) {
      if (!e.target.closest("#search-wrapper")) {
        list.classList.remove("visible");
      }
    });
  });
})();
