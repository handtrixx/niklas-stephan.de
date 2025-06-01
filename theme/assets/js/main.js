start();

function start() {
  //if the user has a theme stored in local storage, set it
  const storeTheme = localStorage.getItem("theme");
  if (storeTheme === "light") {
    document.documentElement.setAttribute("data-ui-theme", "light");
  }
  if (storeTheme === "dark") {
    document.documentElement.setAttribute("data-ui-theme", "dark");
  }

  //if the user has a fontsize stored in local storage, set it
  const storeFontsize = localStorage.getItem("fontsize");
  if (storeFontsize) {
    document.documentElement.style.fontSize = storeFontsize;
  }

  console.log(
    "%cniklas-stephan.de",
    "color: white; background-color: red; font-size: 20px; font-weight: bold; padding: 4px;"
  );
  console.log('type "help();" to list all available commands.');

}

function help() {
  console.log("version 0.1");
  console.log('"help();" - shows this help');
  console.log('"themeswitch();" - switches the theme between light and dark');
}

function themeswitch() {
  const currentTheme = document.documentElement.getAttribute("data-ui-theme");
  if (currentTheme === "light") {
    document.documentElement.setAttribute("data-ui-theme", "dark");
    localStorage.setItem("theme", "dark");
  } else {
    document.documentElement.setAttribute("data-ui-theme", "light");
    localStorage.setItem("theme", "light");
  }
}

function fontswitch(task) {
  const root = document.documentElement;
  const currentFontSize = parseInt(
    getComputedStyle(root).getPropertyValue("font-size")
  );

  switch (task) {
    case "smaller":
      root.style.fontSize = currentFontSize
        ? currentFontSize - 1 + "px"
        : "1rem";
      localStorage.setItem("fontsize", root.style.fontSize);
      break;
    case "bigger":
      root.style.fontSize = currentFontSize
        ? currentFontSize + 1 + "px"
        : "1rem";
      localStorage.setItem("fontsize", root.style.fontSize);
      break;
    case "reset":
      root.style.removeProperty("font-size");
      localStorage.removeItem("fontsize");
      break;
    default:
      root.style.removeProperty("font-size");
      localStorage.removeItem("fontsize");
  }
}

function togglePageAssistant() {
  const assistantButton = document.getElementById("page-assistant-toggler");
  const pageContent = document.getElementById("page-content");
  const pageAssistant = document.getElementById("page-assistant");
  const footer = document.getElementById("footer");

  if (pageAssistant.classList.contains("d-none")) {
    pageAssistant.classList.remove("d-none");
    pageContent.classList.add("d-none");
    footer.classList.add("d-none");
    
    
  }
  else {
    pageAssistant.classList.add("d-none");
    pageContent.classList.remove("d-none");
    footer.classList.remove("d-none");
   
  }
}

function toggleDropdown(button) {
  const dropdownContent = button.nextElementSibling;
  const isExpanded = button.getAttribute('aria-expanded') === 'true';
  
  // Close all other open dropdowns
  document.querySelectorAll('.dropdown-content.show').forEach(dropdown => {
      if (dropdown !== dropdownContent) {
          dropdown.classList.remove('show');
          dropdown.style.display = 'none';
      }
  });

  // Toggle current dropdown
  if (!isExpanded) {
      dropdownContent.classList.add('show');
      dropdownContent.style.display = 'block';
      button.setAttribute('aria-expanded', 'true');
  } else {
      dropdownContent.classList.remove('show');
      dropdownContent.style.display = 'none';
      button.setAttribute('aria-expanded', 'false');
  }

  // Close dropdown when clicking outside
  document.addEventListener('click', function closeDropdown(e) {
      if (!button.contains(e.target) && !dropdownContent.contains(e.target)) {
          dropdownContent.classList.remove('show');
          dropdownContent.style.display = 'none';
          button.setAttribute('aria-expanded', 'false');
          document.removeEventListener('click', closeDropdown);
      }
  });
}