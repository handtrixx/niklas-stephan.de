function toggleWikinav() {
  const nav = document.getElementById("wiki-nav");
  //get parent
  const parent = nav.parentElement;
  parent.classList.toggle("d-none");
  parent.classList.toggle("wiki-mega-menu");
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}
