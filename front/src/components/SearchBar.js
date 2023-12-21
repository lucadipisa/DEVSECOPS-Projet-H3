import React from 'react';

const SearchBar = ({ searchParams, onSearchChange, onSearchSubmit }) => {
  return (
    <form onSubmit={onSearchSubmit}>
      <label>
        Densité maximum:
        <input type="number" name="densiteMax" value={searchParams.densiteMax} onChange={onSearchChange} />
      </label>
      <label>
        Densité minimum:
        <input type="number" name="densiteMin" value={searchParams.densiteMin} onChange={onSearchChange} />
      </label>
      <label>
        Nom de la region:
        <input type="text" name="region" value={searchParams.region} onChange={onSearchChange} />
      </label>
      <label>
        Nom du départment:
        <input type="text" name="department" value={searchParams.department} onChange={onSearchChange} />
      </label>
      <label>
        Population maximum:
        <input type="number" name="populationMax" value={searchParams.populationMax} onChange={onSearchChange} />
      </label>
      <label>
        Population minimum:
        <input type="number" name="populationMin" value={searchParams.populationMin} onChange={onSearchChange} />
      </label>
      <label>
        Housing maximum:
        <input type="number" name="housingMax" value={searchParams.housingMax} onChange={onSearchChange} />
      </label>
      <label>
        Housing minimum:
        <input type="number" name="housingMin" value={searchParams.housingMin} onChange={onSearchChange} />
      </label>
      {/* Ajout d'autres input pour la recherche */}
      <button type="submit">Search</button>
    </form>
  );
};

export default SearchBar;
