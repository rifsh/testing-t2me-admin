import React from "react";

const SummaryCard = ({ title, value, icon, color }) => (
  <div className={`rounded-2xl p-4 ${color} border border-opacity-20`}>
    <div className="flex items-center gap-3 mb-2">
      <span className="text-2xl">{icon}</span>
      <h4 className="text-sm font-medium text-gray-600">{title}</h4>
    </div>
    <p className="text-2xl font-semibold text-gray-900">
      {typeof value === "number" ? value.toLocaleString() : value || "N/A"}
    </p>
  </div>
);

const PlatformSummary = ({ activeTab, reportData }) => {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Platform Summary
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <SummaryCard
          title={`Total ${activeTab === "events" ? "Events" : "Movies"}`}
          value={
            activeTab === "events"
              ? reportData?.total_events
              : reportData?.total_movies
          }
          icon="📊"
          color="bg-blue-50"
        />
        <SummaryCard
          title={`Active ${activeTab === "events" ? "Organizers" : "Theaters"}`}
          value={
            activeTab === "events"
              ? reportData?.active_users_in_events
              : reportData?.active_users_in_theatres
          }
          icon="✨"
          color="bg-green-50"
        />
        <SummaryCard
          title={`Total Revenue (${activeTab === "events" ? "Events" : "Movies"})`}
          value={
            activeTab === "events"
              ? `${reportData?.total_event_revenue?.toLocaleString() ?? 0} ${
                  reportData?.revenue_by_country?.[0]?.currency_code ?? ""
                }`
              : `${reportData?.total_movie_revenue?.toLocaleString() ?? 0} ${
                  reportData?.revenue_by_country?.[0]?.currency_code ?? ""
                }`
          }
          icon="💵"
          color="bg-yellow-50"
        />
      </div>
    </section>
  );
};

export default PlatformSummary;