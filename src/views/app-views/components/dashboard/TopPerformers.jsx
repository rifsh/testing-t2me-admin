import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { APP_PREFIX_PATH } from "configs/AppConfig";

const TopPerformers = ({ activeSegment, organizerInfo, userTheaterList }) => {
  const topPerformers = useMemo(() => {
    const source =
      activeSegment === "events" ? organizerInfo?.events : userTheaterList;
    if (!source) return [];

    return [...source].sort((a, b) => {
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
  }, [activeSegment, organizerInfo, userTheaterList]);

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">
          {activeSegment === "events" ? "Top Events" : "Top Theaters"}
        </h3>
      </div>
      <div className="space-y-3">
        {topPerformers?.map((item) => {
          const isEventItem = activeSegment === "events";
          const itemId = isEventItem ? item.id : item.theater_id;
          const itemName = isEventItem ? item.event_name : item.theater_name;
          const itemRevenue = isEventItem
            ? item.event_revenue
            : item.theatre_revenue || 0;

          return (
            <div key={itemId} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center text-white font-semibold">
                    {itemName?.[0]}
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {itemName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {Number(itemRevenue).toFixed(2)} AED
                  </p>
                </div>
              </div>
              <Link
                to={`${APP_PREFIX_PATH}/organizer/reports/${
                  isEventItem ? "event-details" : "theater-details"
                }/${itemId}`}
                className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                View
              </Link>
            </div>
          );
        })}
        {topPerformers.length === 0 && (
          <p className="text-xs text-gray-500 text-center py-4">
            No data available
          </p>
        )}
      </div>
    </section>
  );
};

export default TopPerformers;
