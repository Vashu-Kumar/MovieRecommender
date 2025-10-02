import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AiOutlineSearch } from 'react-icons/ai';
import './MovieApp.css';


const API_KEY = import.meta.env.VITE_TMBD_API_KEY;


const MovieApp = () => {
  const [movies, setMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popularity.desc');
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [expandedMovieId, setExpandedMovieId] = useState(null);


  // Fetch genres
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await axios.get(
          'https://api.themoviedb.org/3/genre/movie/list',
          { params: { api_key: API_KEY } }
        );
        setGenres(response.data.genres);
        
      } catch (error) {
        console.error("Error fetching genres:", error);
      }
    };
    fetchGenres();
  }, []);
  
  //  Fetch movies (auto-update when filters/search change)
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        let endpoint = '';
        let params = { api_key: API_KEY };
        
        if (searchQuery) {
          endpoint = 'https://api.themoviedb.org/3/search/movie';
          params.query = searchQuery;
        } else {
          endpoint = 'https://api.themoviedb.org/3/discover/movie';
          params.sort_by = sortBy;  
          if (selectedGenre) params.with_genres = selectedGenre;
        }
        const response = await axios.get(endpoint, { params });

       // console.log("Movies response:", response.data);


        setMovies(response.data.results || []);
      } catch (error) {
        console.error("Error fetching movies:", error);
      }
    };

    fetchMovies();
  }, [searchQuery, sortBy, selectedGenre]);

  // Handlers
  const handleSearchChange = (e) => setSearchQuery(e.target.value);
  const handleSortChange = (e) => setSortBy(e.target.value);
  const handleGenreChange = (e) => setSelectedGenre(e.target.value);

  const toggleDescription = (movieId) => {
    setExpandedMovieId(expandedMovieId === movieId ? null : movieId);
  };

  return (
    <div>
      {/* Search bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search movies..."
          value={searchQuery}
          onChange={handleSearchChange}
          className='search-input'
        />
        <button className="search-button">
          <AiOutlineSearch />
        </button>
      </div>

      {/* Filters */}
      <div className="filters">
        <label htmlFor="sort-by">Sort By:</label>
        <select id="sort-by" value={sortBy} onChange={handleSortChange}>
          <option value="popularity.desc">Popularity Descending</option>
          <option value="popularity.asc">Popularity Ascending</option>
          <option value="vote_average.desc">Rating Descending</option>
          <option value="vote_average.asc">Rating Ascending</option>
          <option value="release_date.desc">Release Date Descending</option>
          <option value="release_date.asc">Release Date Ascending</option>
        </select>

        <label htmlFor="genre">Genre:</label>
        <select id="genre" value={selectedGenre} onChange={handleGenreChange}>
          <option value="">All Genres</option>
          {genres.map((genre) => (
            <option key={genre.id} value={genre.id}>{genre.name}</option>
          ))}
        </select>
      </div>

      {/* Movie list */}
      <div className="movie-wrapper">
        {movies.length === 0 ? (
          <p>No movies found.</p>
        ) : (
          movies.map((movie) => (
            <div key={movie.id} className="movie">
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
              />
              <h2>{movie.title}</h2>
              <p className='rating'>Rating: {movie.vote_average}</p>
              {expandedMovieId === movie.id ? (
                <p>{movie.overview}</p>
              ) : (
                <p>{movie.overview?.substring(0, 150)}...</p>
              )}
              <button onClick={() => toggleDescription(movie.id)} className='read-more'>
                {expandedMovieId === movie.id ? 'Show Less' : 'Read More'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MovieApp;
