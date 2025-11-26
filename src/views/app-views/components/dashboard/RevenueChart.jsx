import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const RevenueChart = ({ activeSegment, organizerInfo, userTheaterList }) => {
  const revenueTrendData = useMemo(() => {
    const source =
      activeSegment === "events" ? organizerInfo?.events : userTheaterList;

    if (!source || source.length === 0) {
      return {
        labels: ["No Data"],
        data: [0],
        backgroundColor: ["rgba(92, 195, 246, 0.3)"],
      };
    }

    const topItems = [...source].sort((a, b) => {
      const aRevenue =
        activeSegment === "events"
          ? Number(a?.event_revenue) || 0
          : Number(a?.theatre_revenue) || 0;
      const bRevenue =
        activeSegment === "events"
          ? Number(b?.event_revenue) || 0
          : Number(b?.theatre_revenue) || 0;
      return bRevenue - aRevenue;
    });

    const labels = topItems.map((item) =>
      activeSegment === "events"
        ? item.event_name.slice(0, 15)
        : item.theater_name.slice(0, 15)
    );

    const hintText = topItems.map((item) =>
      activeSegment === "events" ? item.event_name : item.theater_name
    );

    const data = topItems.map((item) =>
      activeSegment === "events"
        ? item.event_revenue
        : item.theatre_revenue || 0
    );

    const backgroundColor = data.map((_, index) => {
      if (index === 1) return "rgb(92, 177, 246)";
      return "rgba(92, 195, 246, 0.3)";
    });

    return { labels, hintText, data, backgroundColor };
  }, [activeSegment, organizerInfo, userTheaterList]);

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">
        Revenue Trend
      </h3>

      <div className="mt-6">
        <Bar
          data={{
            labels: revenueTrendData.labels,
            datasets: [
              {
                data: revenueTrendData.data,
                backgroundColor: revenueTrendData.backgroundColor,
                borderRadius: 8,
                barThickness: 40,
              },
            ],
          }}
          options={{
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  callback: function (value) {
                    return value.toLocaleString();
                  },
                },
              },
              x: {
                grid: { display: false },
                ticks: {
                  callback: function (value, index) {
                    const label = this.getLabelForValue(value);
                    return label;
                  },
                },
              },
            },
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  title: function (context) {
                    return revenueTrendData.hintText[context[0].dataIndex];
                  },
                  label: function (context) {
                    return `Revenue: ${Number(context.parsed.y).toFixed(
                      2
                    )} AED`;
                  },
                },
              },
            },
          }}
          height={180}
        />
      </div>
    </section>
  );
};

export default RevenueChart;
