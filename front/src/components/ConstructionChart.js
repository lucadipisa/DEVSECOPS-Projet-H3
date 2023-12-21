import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const ConstructionChart = ({ labels, data }) => {
  const canvasRefConstruction = useRef();

  useEffect(() => {
    const ctx = canvasRefConstruction.current.getContext('2d');
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
        label: 'Moyenne du nombre de construction par région',
        data: data,
        backgroundColor: 'rgba(110, 51, 144, 0.5)', // Légèrement transparent pour un look moderne
        borderColor: 'rgba(110, 51, 144, 0.5)',
        borderWidth: 2,
      },
    ],
  },
  options: {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    layout: {
      padding: 10, // Ajoutez un peu de marge
    },
  },
});
  }, [labels, data]);

  return (
    <div className="chart-container">
      <h3>Moyenne du nombre de construction / région</h3>
      <canvas ref={canvasRefConstruction} width="200" height="200"></canvas>
    </div>
  );
};

export default ConstructionChart;
