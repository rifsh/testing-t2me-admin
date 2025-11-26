import React from "react";

const StatCard = ({ title, value, icon, color }) => (
  <div className="rounded-3xl border border-white/60 bg-white p-6 shadow-sm">
    <div className="flex items-center gap-4">
      <div className={`rounded-2xl ${color} p-4 flex items-center justify-center text-2xl`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="mt-2 text-2xl font-semibold text-gray-900">
          {typeof value === "number" ? value.toLocaleString() : value || "N/A"}
        </p>
      </div>
    </div>
  </div>
);

const SuperAdminStats = ({ activeTab, reportData }) => {
  const stats = [
    {
      title: activeTab === "events" ? "Event Organizers" : "Movie Organizers",
      value:
        activeTab === "events"
          ? reportData?.total_users_in_events
          : reportData?.total_users_in_theatres,
      icon: "👥",
      color: "bg-blue-50",
    },
    {
      title: `Active ${activeTab === "events" ? "Organizers" : "Theaters"}`,
      value:
        activeTab === "events"
          ? reportData?.active_users_in_events
          : reportData?.active_users_in_theatres,
      icon: "✅",
      color: "bg-green-50",
    },
    {
      title: activeTab === "events" ? "Total Events" : "Total Movies",
      value:
        activeTab === "events" ? reportData?.total_events : reportData?.total_movies,
      icon: "📅",
      color: "bg-purple-50",
    },
    {
      title: `Total Revenue`,
      value:
        activeTab === "events"
          ? `${reportData?.total_event_revenue?.toFixed(2) ?? 0} ${
              reportData?.revenue_by_country?.[0]?.currency_code ?? ""
            }`
          : `${reportData?.total_movie_revenue?.toFixed(2) ?? 0} ${
              reportData?.revenue_by_country?.[0]?.currency_code ?? ""
            }`,
      icon: "💰",
      color: "bg-yellow-50",
    },
  ];

  return (
    <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          color={stat.color}
        />
      ))}
    </section>
  );
};

export default SuperAdminStats;