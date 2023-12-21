import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import SearchBar from './components/SearchBar';
import Chart from 'chart.js/auto';
import PopulationChart from './components/PopulationChart';
import UnemploymentChart from './components/UnemploymentChart';
import ConstructionChart from './components/ConstructionChart';
import './styles.css';

const App = () => {
  const [data, setData] = useState([]);
  const [searchParams, setSearchParams] = useState({
    densiteMax: '', 
    densiteMin: '', 
    region: '',
    department: '', 
    populationMax: '', 
    populationMin: '', 
    housingMax: '', 
    housingMin: ''
    // Ajout d'autres filtres de recherche
  });

  const [currentPage, setCurrentPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedYear, setSelectedYear] = useState('2022');
  const [populationStats, setPopulationStats] = useState([]);
  const [unemploymentStats, setUnemploymentStats] = useState([]);
  const [constructionStats, setConstructionStats] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        
        // Filtrer des paramètres non vides
        const filteredParams = Object.fromEntries(
          Object.entries(searchParams).filter(([_, value]) => value !== '')
        );

        const response = await axios.get('http://127.0.0.1:5000/api/search', {
          params: { ...filteredParams, page: currentPage },
        });

        if (response.status !== 200) {
          throw new Error(`Error fetching search data: ${response.statusText}`);
        }

        const jsonData = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
        setData(jsonData);

        // Mise à jour du nombre total d'éléments pour la pagination
        const totalItemsHeader = response.headers['x-total-items'];
        setTotalItems(parseInt(totalItemsHeader, 10) || 0);

        // nbr habit / region
        await fetchPopulationStats();
        
        // taux chômage / region
        await fetchUnemploymentStats();
        
        // nombre construction / region
        await fetchConstructionStats();

      } catch (error) {
        console.error('Error fetching search data:', error.message);

        if (error.response) {
          console.log('Server Response:', error.response.data);
        }
      }
    };

    fetchData();
  }, [searchParams, currentPage, selectedYear]);

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prevParams) => ({
      ...prevParams,
      [name]: value,
    }));
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();

    // Réinitialiser la page à 0 lors de chaque nouvelle recherche
    setCurrentPage(0);

    try {
      // Filtrer des paramètres non vides
      const filteredParams = Object.fromEntries(
        Object.entries(searchParams).filter(([_, value]) => value !== '')
      );

      const response = await axios.get('http://127.0.0.1:5000/api/search', {
        params: { ...filteredParams, page: 0 },
      });

      if (response.status !== 200) {
        throw new Error(`Error fetching search data: ${response.statusText}`);
      }

      const jsonData = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
      setData(jsonData);

      // Mise à jour du nombre total d'éléments pour la pagination
      const totalItemsHeader = response.headers['x-total-items'];
      setTotalItems(parseInt(totalItemsHeader, 10) || 0);
    } catch (error) {
      console.error('Error fetching search data:', error.message);

      if (error.response) {
        console.log('Server Response:', error.response.data);
      }
    }
  };

  const renderColumnsHeader = ['densite_de_population_au_km2', 'nom_region', 'nom_departement', 'nombre_d_habitants', 'nombre_de_logements'];

  const renderTableHeader = () => {
    // if (data.length === 0) return null;

    // const header = Object.keys(data[0]);
    // return header.map((key, index) => <th key={index}>{key}</th>);
    return renderColumnsHeader.map((column, index) => <th key={index}>{column}</th>);
  };

  const renderTableData = () => {
    return data.map((entry, index) => {
      return (
        <tr key={index}>
          {renderColumnsHeader.map((column, i) => (
            <td key={i}>{entry[column]}</td>
          ))}
        </tr>
      );
    });
  };

  const fetchPopulationStats = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/stats/population', {
        params: {
          year: selectedYear,
        },
      });
  
      if (response.status !== 200) {
        throw new Error(`Error fetching population stats: ${response.statusText}`);
      }
  
      const jsonData = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
  
      // Créer le tableau de données pour Chart.js
      const labels = jsonData.map((entry) => entry.nom_region);
      const data = jsonData.map((entry) => entry.total_population);
  
      setPopulationStats({ labels, data });
    } catch (error) {
      console.error('Error fetching population stats:', error.message);
  
      if (error.response) {
        console.log('Server Response:', error.response.data);
      }
    }
  };

  const fetchUnemploymentStats = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/stats/unemployment', {
        params: {
          year: selectedYear,
        },
      });
  
      if (response.status !== 200) {
        throw new Error(`Error fetching unemployment stats: ${response.statusText}`);
      }
  
      const jsonData = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
  
      // Créer le tableau de données pour Chart.js
      const labels = jsonData.map((entry) => entry.nom_region);
      const data = jsonData.map((entry) => entry.average_unemployment_rate);
  
      setUnemploymentStats({ labels, data });
    } catch (error) {
      console.error('Error fetching unemployment stats:', error.message);
  
      if (error.response) {
        console.log('Server Response:', error.response.data);
      }
    }
  };

  const fetchConstructionStats = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/stats/construction', {
        params: {
          year: selectedYear,
        },
      });
  
      if (response.status !== 200) {
        throw new Error(`Error fetching construction stats: ${response.statusText}`);
      }
  
      const jsonData = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
  
      // Créer le tableau de données pour Chart.js
      const labels = jsonData.map((entry) => entry.nom_region);
      const data = jsonData.map((entry) => entry.average_construction_rate);
  
      setConstructionStats({ labels, data });
    } catch (error) {
      console.error('Error fetching construction stats:', error.message);
  
      if (error.response) {
        console.log('Server Response:', error.response.data);
      }
    }
  };
  

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <div>
      <h1>Application de logements et logements sociaux</h1>
      <h2>Tableau d'information générale</h2>
      <div>
        <SearchBar
          searchParams={searchParams}
          onSearchChange={handleSearchChange}
          onSearchSubmit={handleSearchSubmit}
        />
        {data.length > 0 ? (
          <div>
            <table>
              <thead>
                <tr>{renderTableHeader()}</tr>
              </thead>
              <tbody>{renderTableData()}</tbody>
            </table>
            
            <div className="pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
              >
                Précédent
              </button>
              <span>{`Page ${currentPage + 1} / ${Math.ceil(totalItems / 30)}`}</span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === Math.ceil(totalItems / 30) - 1}
              >
                Suivant
              </button>
            </div>

            <h2>Partie Graphique des Stats</h2>

            <div>
              <label htmlFor="yearSelector">Choisir une année :</label>
              <select
                id="yearSelector"
                onChange={(e) => setSelectedYear(e.target.value)}
                value={selectedYear}
              >
                <option value="2022">2022</option>
                <option value="2021">2021</option>
                <option value="2020">2020</option>
                <option value="2019">2019</option>
                <option value="2018">2018</option>
              </select>
            </div>

            <PopulationChart labels={populationStats.labels} data={populationStats.data} />
            <UnemploymentChart labels={unemploymentStats.labels} data={unemploymentStats.data} />
            <ConstructionChart labels={constructionStats.labels} data={constructionStats.data} />


          </div>
        ) : (
          <p>No data available</p>
        )}
      </div>
    </div>
  );
};

export default App;
