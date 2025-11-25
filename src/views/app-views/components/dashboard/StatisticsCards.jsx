import React from "react";

const StatCard = ({ icon, label, value, sublabel }) => (
  <div className="rounded-3xl border border-white/60 bg-white p-6 shadow-sm">
    <div className="flex items-center gap-4">
      {icon}
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="mt-1 text-3xl font-semibold text-gray-900">
          {value ?? "—"}
        </p>
        <p className="text-xs text-gray-400">{sublabel}</p>
      </div>
    </div>
  </div>
);

const StatisticsCards = ({
  activeSegment,
  organizerInfo,
  movieUserDetailsData,
}) => {
  const totalPrimaryCount =
    activeSegment === "events"
      ? organizerInfo?.total_events
      : movieUserDetailsData?.total_theaters;

  const totalRevenue =
    activeSegment === "events"
      ? organizerInfo?.total_revenue
      : movieUserDetailsData?.total_revenue;

  const totalParticipation =
    activeSegment === "events"
      ? organizerInfo?.total_attendees
      : movieUserDetailsData?.total_tickets;

  const IconBriefcase = () => (
    <div className="rounded-2xl bg-blue-50 p-4 text-blue-500">
      <svg
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        />
      </svg>
    </div>
  );

  const IconCurrency = () => (
    <div className="rounded-2xl bg-green-50 p-4 text-green-500">
      <svg
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </div>
  );

  const IconPeople = () => (
    <div className="rounded-2xl bg-blue-50 p-4 text-blue-500">
      <svg
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    </div>
  );

  return (
    <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      <StatCard
        icon={<IconBriefcase />}
        label={activeSegment === "events" ? "Total events" : "Total theaters"}
        value={totalPrimaryCount}
        sublabel="Currently managed items"
      />

      <StatCard
        icon={<IconCurrency />}
        label="Total revenue"
        value={totalRevenue ? Number(totalRevenue).toFixed(2) : "—"}
        sublabel={
          organizerInfo?.total_revenue_by_country?.[0]?.currency_code || "AED"
        }
      />

      <StatCard
        icon={<IconPeople />}
        label={
          activeSegment === "movies" ? "Tickets sold" : "Total attendees"
        }
        value={totalParticipation}
        sublabel="Engagement across the period"
      />
    </section>
  );
};

export default StatisticsCards;