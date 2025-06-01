
document.addEventListener('DOMContentLoaded', function () {
  const container = document.querySelector('.post-container');

  //get all headline contents and ids of them in the container
  const headlines = Array.from(container.querySelectorAll('h2, h3')).map(headline => ({
    content: headline.textContent,
    id: headline.id,
    selector: headline.tagName.toLowerCase(),
    element: headline // Store reference to the actual element
  }));
  
  //add items as li childs to item with id: "content-index-list"
  const contentIndexList = document.getElementById('content-index-list');
  headlines.forEach(headline => {
    const listItem = document.createElement('li');
    listItem.className = 'content-index-item';
    //add second class for selector
    listItem.classList.add(`level-${headline.selector}`);
    // Add data attribute to link with headline
    listItem.setAttribute('data-target', headline.id);
    listItem.textContent = headline.content;
    listItem.addEventListener('click', () => {
      document.getElementById(headline.id).scrollIntoView({ behavior: 'smooth' });
    });
    contentIndexList.appendChild(listItem);
  });

  //add a scrollspy to mark the currently scrolled headline from container at content-index-item as active
  window.addEventListener('scroll', () => {
    //get closest headline to current scroll position
    const scrollPosition = window.scrollY + 100; // Add offset for better UX
    let currentHeadline = null;
    
    // Find the headline that's currently in view
    for (let i = headlines.length - 1; i >= 0; i--) {
      const headline = headlines[i];
      const headlineElement = headline.element;
      const headlineTop = headlineElement.offsetTop;
      
      if (scrollPosition >= headlineTop) {
        currentHeadline = headline;
        break;
      }
    }
    
    // Remove active class from all items
    const allItems = contentIndexList.querySelectorAll('.content-index-item');
    allItems.forEach(item => item.classList.remove('active'));
    
    // Add active class to current item
    if (currentHeadline) {
      const activeItem = contentIndexList.querySelector(`[data-target="${currentHeadline.id}"]`);
      if (activeItem) {
        activeItem.classList.add('active');
      }
    }
  });
});

// ... rest of code remains same


function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}


function togglePostNav() {
  const postNav = document.getElementById('block-post-nav');
  if (postNav) {
    postNav.classList.toggle('d-none');
  }
}