import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);
const RevenueDistributionChart = ({ activeTab, userReportsData }) => {
  const chartData = useMemo(() => {
    return {
      labels: userReportsData.map((org) => org.username).slice(0, 10),
      datasets: [
        {
          label: `${activeTab === "events" ? "Event" : "Movie"} Revenue`,
          data: userReportsData.map((org) => org.total_revenue || 0).slice(0, 10),
          backgroundColor: "rgba(79, 70, 229, 0.6)",
          borderColor: "rgba(79, 70, 229, 1)",
          borderWidth: 2,
          borderRadius: 8,
        },
      ],
    };
  }, [activeTab, userReportsData]);

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Revenue Distribution
      </h3>
      <div className="h-80">
        <Bar
          data={chartData}
          options={{
            maintainAspectRatio: false,
            responsive: true,
            plugins: {
              legend: { display: false },
              tooltip: {
                bodyFont: { size: 14 },
                callbacks: {
                  label: (context) => {
                    const value = context.parsed.y;
                    return `Revenue: ${value.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`;
                  },
                },
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: { font: { size: 12 } },
              },
              x: {
                ticks: { font: { size: 12 } },
              },
            },
          }}
        />
      </div>
    </section>
  );
};

export default RevenueDistributionChart;
