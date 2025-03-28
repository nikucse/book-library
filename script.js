const api = 'https://api.freeapi.app/api/v1/public/books';

// initialize DOM Elements
const booksContainer = document.getElementById('books-container');
const searchInput = document.getElementById('search');
const sortSelect = document.getElementById('sort');
const gridViewBtn = document.getElementById('grid-view');
const listViewBtn = document.getElementById('list-view');
const noResults = document.getElementById('no-results');

// Application properties state
const state = {
  books: [],
  filteredBooks: [],
  startIndex: 0,
  currentView: 'grid',
  isLoading: false,
  searchQuery: '',
  sortBy: 'title',
};

// Load the books fromfree API
document.addEventListener('DOMContentLoaded', function () {
  fetchBooks();
});

// Search books based on title or Author
searchInput.addEventListener('input', (e) => {
  state.searchQuery = e.target.value.toLowerCase();
  filterAndRenderBooks();
});

// Sort and Desiplay books
sortSelect.addEventListener('change', (e) => {
  state.sortBy = e.target.value;
  sortAndRenderBooks();
});

// Books Showing in Grid View
gridViewBtn.addEventListener('click', () => {
  if (state.currentView !== 'grid') {
    state.currentView = 'grid';
    gridViewBtn.classList.add('bg-indigo-600', 'text-white');
    gridViewBtn.classList.remove('bg-white', 'hover:bg-gray-100');
    listViewBtn.classList.add('bg-white', 'hover:bg-gray-100');
    listViewBtn.classList.remove('bg-indigo-600', 'text-white');
    renderBooks();
  }
});

// Books Showing in List View
listViewBtn.addEventListener('click', () => {
  if (state.currentView !== 'list') {
    state.currentView = 'list';
    listViewBtn.classList.add('bg-indigo-600', 'text-white');
    listViewBtn.classList.remove('bg-white', 'hover:bg-gray-100');
    gridViewBtn.classList.add('bg-white', 'hover:bg-gray-100');
    gridViewBtn.classList.remove('bg-indigo-600', 'text-white');
    renderBooks();
  }
});

// Get All books from freeapi
async function fetchBooks() {
  try {
    const dataList = await getData();
    const newBooks = dataList.map((item) => {
      const {
        id,
        title,
        authors,
        publisher,
        publishedDate,
        imageLinks,
        infoLink,
      } = item.volumeInfo;
      return {
        id,
        title: title || 'No title available',
        authors: authors
          ? item.volumeInfo.authors.join(', ')
          : 'Unknown author',
        publisher: publisher || 'Unknown publisher',
        publishedDate: publishedDate || 'No date available',
        thumbnail: imageLinks?.thumbnail,
        infoLink,
      };
    });

    state.books = [...state.books, ...newBooks];
    state.filteredBooks = [...state.books];
    state.startIndex += 12;

    filterAndRenderBooks();
  } catch (error) {
    console.error('Error fetching books:', error);
  }
}

// Get data from FreeAPI end point
async function getData() {
  // FreeAPI.app endpoint
  const response = await fetch(api);
  const { data } = await response.json();
  const dataList = data.data;
  return dataList;
}

// Search books based on title or author
async function filterAndRenderBooks() {
  if (state.searchQuery) {
    state.filteredBooks = state.books.filter(
      (book) =>
        book.title.toLowerCase().includes(state.searchQuery) ||
        book.authors.toLowerCase().includes(state.searchQuery)
    );
  } else {
    state.filteredBooks = [...state.books];
  }

  if (state.filteredBooks.length === 0) {
    noResults.classList.remove('hidden');
    booksContainer.innerHTML = '';
  } else {
    noResults.classList.add('hidden');
    sortAndRenderBooks();
  }
}

// Display books in Grid View or List View
function renderBooks() {
  if (state.currentView === 'grid') {
    renderGridView();
  } else {
    renderListView();
  }
}

// Sort and Desiplay books based on title or date
function sortAndRenderBooks() {
  switch (state.sortBy) {
    case 'title':
      state.filteredBooks.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'date':
      state.filteredBooks.sort(
        (a, b) => new Date(b.publishedDate) - new Date(a.publishedDate)
      );
      break;
  }
  renderBooks();
}

// Show books in List View
function renderListView() {
  booksContainer.className = 'grid grid-cols-1 gap-4';

  booksContainer.innerHTML = state.filteredBooks
    .map(
      (book) => `
          <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div class="p-4 flex flex-col md:flex-row gap-4">
                  <div class="md:w-1/6 flex justify-center">
                      <img src="${book.thumbnail}" alt="${book.title}" class="h-32 object-contain">
                  </div>
                  <div class="md:w-5/6">
                      <h3 class="text-lg font-semibold mb-1">${book.title}</h3>
                      <p class="text-gray-600 mb-1">By ${book.authors}</p>
                      <p class="text-gray-500 text-sm mb-2">Published by ${book.publisher} (${book.publishedDate})</p>
                      <a href="${book.infoLink}" target="_blank" class="inline-block bg-indigo-600 hover:bg-indigo-700 text-white py-1 px-3 rounded text-sm transition-colors duration-300">
                          View Details
                      </a>
                  </div>
              </div>
          </div>
      `
    )
    .join('');
}

// Show book in Grid View
function renderGridView() {
  booksContainer.className =
    'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';

  booksContainer.innerHTML = state.filteredBooks
    .map(
      (book) => `
          <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div class="p-4 flex flex-col h-full">
                  <div class="flex justify-center mb-4">
                      <img src="${book.thumbnail}" alt="${book.title}" class="h-48 object-contain">
                  </div>
                  <div class="flex-grow">
                      <h3 class="text-lg font-semibold mb-1 line-clamp-2">${book.title}</h3>
                      <p class="text-gray-600 text-sm mb-1">By ${book.authors}</p>
                      <p class="text-gray-500 text-xs mb-2">Published by ${book.publisher} (${book.publishedDate})</p>
                  </div>
                  <a href="${book.infoLink}" target="_blank" class="mt-4 inline-block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded transition-colors duration-300">
                      View Details
                  </a>
              </div>
          </div>
      `
    )
    .join('');
}
