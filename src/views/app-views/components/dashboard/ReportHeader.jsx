import React from "react";
import { Select, DatePicker, message } from "antd";
import dayjs from "dayjs";
import { exportToPdf, exportToExcel } from "utils/exportUtils";

const { Option } = Select;
const { RangePicker } = DatePicker;

const ReportHeader = ({
  activeSegment,
  setActiveSegment,
  timeFilter,
  setTimeFilter,
  customDateRange,
  setCustomDateRange,
  reportRef,
}) => {
  const handleTimeFilterChange = (value) => {
    setTimeFilter(value);
    setCustomDateRange([]);
  };

  const disabledCustomDate = (current) => {
    if (!customDateRange[0]) return false;
    const tooLate =
      customDateRange[0] && current.diff(customDateRange[0], "month") >= 3;
    const tooEarly =
      customDateRange[1] && customDateRange[1].diff(current, "month") >= 3;
    return !!tooEarly || !!tooLate;
  };

  const handleDateRangeChange = (dates) => {
    if (dates && dates[0] && dates[1]) {
      const monthDiff = dates[1].diff(dates[0], "month");
      if (monthDiff > 3) {
        message.error("Maximum date range allowed is 3 months");
        return;
      }
    }
    setCustomDateRange(dates);
    if (dates && dates.length === 2) {
      setTimeFilter("custom");
    }
  };

  const handleExportPDF = async () => {
    exportToPdf(reportRef, "MyReport.pdf");
  };

  const handleExportCSV = () => {
    exportToExcel(reportRef, "MyReport.xlsx");
  };

  const filterControls = (
    <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap">
      <Select
        className="w-full rounded-2xl border-none bg-white/40 text-sm sm:w-40"
        value={timeFilter}
        onChange={handleTimeFilterChange}
        dropdownStyle={{ borderRadius: 12 }}
      >
        <Option value="last-month">Last Month</Option>
        <Option value="last-3-months">Last 3 Months</Option>
        <Option value="last-year">Last Year</Option>
        <Option value="custom">Custom Range</Option>
      </Select>

      {timeFilter === "custom" && (
        <RangePicker
          value={customDateRange}
          onChange={handleDateRangeChange}
          className="w-full rounded-2xl border-none bg-white/40 text-sm sm:w-64"
          disabledDate={disabledCustomDate}
          onCalendarChange={(dates) => dates && setCustomDateRange(dates)}
        />
      )}

      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
        <button
          onClick={handleExportPDF}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white/90 px-5 py-2 text-sm font-semibold text-blue-600 shadow hover:bg-white sm:w-auto"
        >
          Export PDF
        </button>
        <button
          onClick={handleExportCSV}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-500 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-blue-600 sm:w-auto"
        >
          Export CSV
        </button>
      </div>
    </div>
  );

  return (
    <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-blue-500 via-blue-500 to-blue-600 text-white shadow-2xl">
      <div className="relative overflow-hidden p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/20 blur-0" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/10" />
        <div className="relative z-10 flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
              Organizer analytics
            </p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight text-white">
              Sharpen your insights with professional reports
            </h1>
            <p className="mt-4 text-sm text-white/80">
              Switch between event and movie performance to explore revenue,
              attendance, and venue outcomes with your live data.
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <span className="text-xs font-medium uppercase tracking-wide text-white/70">
              Active segment
            </span>
            <div className="flex gap-2 rounded-full bg-white/20 p-1 shadow-lg backdrop-blur">
              {["events", "movies"].map((segment) => (
                <button
                  key={segment}
                  onClick={() => setActiveSegment(segment)}
                  className={`rounded-full px-5 py-2 text-sm capitalize transition-all ${
                    activeSegment === segment
                      ? "bg-white text-blue-600 shadow"
                      : "text-white/80 hover:bg-white/10"
                  }`}
                >
                  {segment}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="relative z-10 mt-6">{filterControls}</div>
      </div>
    </section>
  );
};

export default ReportHeader;