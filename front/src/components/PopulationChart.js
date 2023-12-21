import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const PopulationChart = ({ labels, data }) => {
  const canvasRefPopulation = useRef();

  useEffect(() => {
    const ctx = canvasRefPopulation.current.getContext('2d');
    if (ctx) {
      // Détruire l'ancien graphique
      Chart.getChart(ctx)?.destroy();
    }
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Nombre d\'habitants par région',
            data: data,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }, [labels, data]);

  return (
    <div>
      <h3>Nombre d'habitants / région</h3>
      <canvas ref={canvasRefPopulation} width="400" height="200"></canvas>
    </div>
  );
};

export default PopulationChart;
