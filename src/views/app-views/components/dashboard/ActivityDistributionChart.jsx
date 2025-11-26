import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";

const ActivityDistributionChart = ({ activeTab, userReportsData }) => {
  const chartData = useMemo(() => {
    return {
      labels: userReportsData.map((user) => user.username).slice(0, 10),
      datasets: [
        {
          label: `${activeTab === "events" ? "Events" : "Movies"} per Organizer`,
          data: userReportsData
            .map((user) => user.event_count || user.movie_count)
            .slice(0, 10),
          backgroundColor: [
            "#4f46e5",
            "#10b981",
            "#f59e0b",
            "#ef4444",
            "#8b5cf6",
            "#ec4899",
            "#14b8a6",
            "#f97316",
            "#64748b",
            "#84cc16",
          ],
          borderColor: "rgba(255, 255, 255, 0.8)",
          borderWidth: 1,
          borderRadius: 8,
        },
      ],
    };
  }, [activeTab, userReportsData]);

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Activity Distribution
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
                    return `Count: ${context.parsed.y}`;
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
                ticks: {
                  font: { size: 12 },
                  callback: (value) =>
                    userReportsData[value]?.username?.substring(0, 8) + "...",
                },
              },
            },
          }}
        />
      </div>
    </section>
  );
};

export default ActivityDistributionChart;