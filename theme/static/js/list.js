
document.addEventListener('DOMContentLoaded', function() {
  const container = document.querySelector('.flex-blog-list .flex-container');
  const tagSelect = document.getElementById('tag-select');
  const sortSelect = document.getElementById('sort-select');
  const searchInput = document.querySelector('input[type="text"]');

  // Function to get all blog items
  function getAllItems() {
    return Array.from(container.getElementsByClassName('flex-item-blog'));
  }

  // Function to sort items
  function sortItems(items) {
    const sortValue = sortSelect.value;
    
    items.sort((a, b) => {
      if (sortValue === 'date-desc' || sortValue === 'date-asc') {
        const dateA = new Date(a.querySelector('em').textContent.split('.').reverse().join('-'));
        const dateB = new Date(b.querySelector('em').textContent.split('.').reverse().join('-'));
        return sortValue === 'date-asc' ? dateA - dateB : dateB - dateA;
      } else {
        const titleA = a.querySelector('.card-headline').textContent.toLowerCase();
        const titleB = b.querySelector('.card-headline').textContent.toLowerCase();
        return sortValue === 'name-asc' 
          ? titleA.localeCompare(titleB)
          : titleB.localeCompare(titleA);
      }
    });

    return items;
  }

  // Function to filter items by tag
  function filterItems(items) {
    const selectedTag = tagSelect.value;
    if (selectedTag === 'all') {
      items.forEach(item => item.style.display = '');
      return items;
    }
    
    return items.filter(item => {
      const hasTag = item.classList.contains(selectedTag);
      item.style.display = hasTag ? '' : 'none';
      return hasTag;
    });
  }

  // Function to filter items by search term
  function searchItems(items) {
    const searchTerm = searchInput.value.toLowerCase().trim();
    if (!searchTerm) {
      items.forEach(item => item.style.display = '');
      return items;
    }

    return items.filter(item => {
      const title = item.querySelector('.card-headline').textContent.toLowerCase();
      const content = item.querySelector('.card-text').textContent.toLowerCase();
      const isVisible = title.includes(searchTerm) || content.includes(searchTerm);
      item.style.display = isVisible ? '' : 'none';
      return isVisible;
    });
  }

  // Function to update the display
  function updateDisplay() {
    let items = getAllItems();
    
    // Apply all filters
    items = searchItems(items);
    items = filterItems(items);
    items = sortItems(items.filter(item => item.style.display !== 'none'));

    // Reorder visible items
    items.forEach(item => container.appendChild(item));
  }

  // Event listeners
  sortSelect.addEventListener('change', updateDisplay);
  tagSelect.addEventListener('change', updateDisplay);
  searchInput.addEventListener('input', updateDisplay);

  // Initial sort on page load
  updateDisplay();
});

function toggleBlogNav() {
    const blogNav = document.getElementById('block-blog-nav');
    if (blogNav) {
        blogNav.classList.toggle('d-none');
    }
}