import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const UnemploymentChart = ({ labels, data }) => {
  const canvasRefUnemployment = useRef();

  useEffect(() => {
    const ctx = canvasRefUnemployment.current.getContext('2d');
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
            label: 'Taux de chômage par région',
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
      <h3>Taux de chômage / région</h3>
      <canvas ref={canvasRefUnemployment} width="400" height="200"></canvas>
    </div>
  );
};

export default UnemploymentChart;
