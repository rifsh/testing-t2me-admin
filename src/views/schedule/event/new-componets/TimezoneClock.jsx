import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const TimezoneClock = ({ timezone = "Asia/Dubai", className = "" }) => {
  const [currentTime, setCurrentTime] = useState(dayjs().tz(timezone));

  useEffect(() => {
    // Update every second
    const interval = setInterval(() => {
      setCurrentTime(dayjs().tz(timezone));
    }, 1000);

    return () => clearInterval(interval);
  }, [timezone]);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* <Clock size={14} className="text-blue-600 animate-pulse" /> */}
      <div className="flex flex-col">
        <span className="text-xs font-semibold text-gray-900">
          {currentTime.format("hh:mm:ss A")}
        </span>
        <span className="text-[10px] text-gray-500">
          {currentTime.format("MMM D, YYYY")} • {timezone}
        </span>
      </div>
    </div>
  );
};

export default TimezoneClock;
