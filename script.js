const API_KEY = "c2df83fc";
let selectedGenres = [];

const genreToMovies = {
  Action: ["Mad Max: Fury Road", "John Wick", "Die Hard"],
  Adventure: ["Indiana Jones", "The Revenant", "Life of Pi"],
  Animation: ["Toy Story", "Coco", "Spirited Away"],
  Comedy: ["The Hangover", "Superbad", "Step Brothers"],
  Crime: ["The Godfather", "Pulp Fiction", "Se7en"],
  Documentary: ["The Social Dilemma", "Blackfish", "13th"],
  Drama: ["Shawshank Redemption", "Fight Club", "Forrest Gump"],
  Family: ["Finding Nemo", "Paddington", "Frozen"],
  Fantasy: ["Harry Potter", "The Hobbit", "Pan's Labyrinth"],
  History: ["Schindler's List", "Lincoln", "Dunkirk"],
  Horror: ["The Conjuring", "It", "Hereditary"],
  Music: ["Whiplash", "Bohemian Rhapsody", "La La Land"],
  Mystery: ["Gone Girl", "Shutter Island", "The Sixth Sense"],
  Romance: ["Titanic", "The Notebook", "Pride & Prejudice"],
  "Science Fiction": ["Inception", "Interstellar", "The Matrix"],
  Thriller: ["Prisoners", "Zodiac", "The Silence of the Lambs"],
  War: ["1917", "Saving Private Ryan", "Hacksaw Ridge"],
  Western: ["The Good, the Bad and the Ugly", "Django Unchained", "Unforgiven"]
};

const genreContainer = document.getElementById('genre-container');
const yearPref = document.getElementById('year-pref');
const getRecBtn = document.getElementById('get-recommendations');
const backBtn = document.getElementById('back-btn');
const prefSection = document.getElementById('preferences-section');
const resultsSection = document.getElementById('results-section');
const recContainer = document.getElementById('recommendations-container');

function initApp() {
  createGenreButtons();
  setupEventListeners();
}

function createGenreButtons() {
  genreContainer.innerHTML = '';
  Object.keys(genreToMovies).forEach(genre => {
    const btn = document.createElement('button');
    btn.className = 'genre-btn';
    btn.textContent = genre;
    btn.addEventListener('click', () => toggleGenreSelection(genre, btn));
    genreContainer.appendChild(btn);
  });
}

function toggleGenreSelection(genre, btn) {
  if (selectedGenres.includes(genre)) {
    selectedGenres = selectedGenres.filter(g => g !== genre);
    btn.classList.remove('selected');
  } else {
    selectedGenres.push(genre);
    btn.classList.add('selected');
  }
}

function setupEventListeners() {
  getRecBtn.addEventListener('click', getRecommendations);
  backBtn.addEventListener('click', () => {
    resultsSection.classList.add('hidden');
    prefSection.classList.remove('hidden');
  });
}

async function getRecommendations() {
  if (selectedGenres.length === 0) {
    alert('Please select at least one genre');
    return;
  }

  recContainer.innerHTML = '<p class="loading">Loading recommendations...</p>';
  resultsSection.classList.remove('hidden');
  prefSection.classList.add('hidden');

  try {
    const allTitles = selectedGenres.flatMap(genre => genreToMovies[genre]);
    const movies = await Promise.all(allTitles.map(title => fetchMovieByTitle(title)));

    const filtered = filterMovies(movies.filter(Boolean));
    displayRecommendations(filtered.slice(0, 10));
  } catch (err) {
    console.error(err);
    recContainer.innerHTML = '<p class="error">Failed to fetch movies. Try again later.</p>';
  }
}

async function fetchMovieByTitle(title) {
  try {
    const response = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&t=${encodeURIComponent(title)}`);
    const data = await response.json();
    if (data.Response === "True") {
      return {
        title: data.Title,
        year: parseInt(data.Year) || 0,
        rating: parseFloat(data.imdbRating) || 0,
        genres: data.Genre ? data.Genre.split(", ").slice(0, 2) : [],
        description: data.Plot || "No description available",
        poster: data.Poster && data.Poster !== "N/A" ? data.Poster : null
      };
    }
    return null;
  } catch (error) {
    console.error("Fetch error:", error);
    return null;
  }
}

function filterMovies(movies) {
  const yearValue = parseInt(yearPref.value);
  if (yearValue === 0) {
    return movies.filter(m => m.year < 2000);
  } else if (yearValue === 2) {
    return movies.filter(m => m.year >= 2010);
  }
  return movies;
}

function displayRecommendations(recommendations) {
  recContainer.innerHTML = '';
  if (recommendations.length === 0) {
    recContainer.innerHTML = '<p class="no-results">No movies match your filters.</p>';
    return;
  }

  recommendations.forEach(movie => {
    const card = document.createElement('div');
    card.className = 'movie-card';

    const posterHTML = movie.poster
      ? `<img src="${movie.poster}" alt="${movie.title}" class="movie-poster">`
      : `<div class="movie-poster">${movie.title.charAt(0)}</div>`;

    card.innerHTML = `
      ${posterHTML}
      <div class="movie-info">
        <h3 class="movie-title">${movie.title}</h3>
        <div class="movie-meta">
          <span>${movie.year} • ${movie.genres.join(', ')}</span><br>
          <span>⭐ ${movie.rating}/10</span>
        </div>
        <p>${movie.description}</p>
      </div>
    `;

    recContainer.appendChild(card);
  });
}

document.addEventListener('DOMContentLoaded', initApp);
