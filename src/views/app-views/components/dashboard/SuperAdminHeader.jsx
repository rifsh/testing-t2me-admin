import React from "react";
import { Select, DatePicker, message } from "antd";
import { exportToPdf, exportToExcel } from "utils/exportUtils";
import { APP_FEATURE_FLAGS } from "configs/AppConfig";

const { RangePicker } = DatePicker;
const { Option } = Select;

const SuperAdminHeader = ({
  activeTab,
  setActiveTab,
  timeFilter,
  setTimeFilter,
  customDateRange,
  setCustomDateRange,
  reportRef,
  isLoading,
  setApiLoading,
}) => {
  const handleExportPdf = async () => {
    try {
      setApiLoading((prev) => ({ ...prev, exports: true }));
      await exportToPdf(reportRef, "SuperAdmin-Report.pdf");
      message.success("PDF exported successfully");
    } catch (err) {
      message.error("Failed to export PDF");
    } finally {
      setApiLoading((prev) => ({ ...prev, exports: false }));
    }
  };

  const handleExportCsv = async () => {
    try {
      setApiLoading((prev) => ({ ...prev, exports: true }));
      await exportToExcel(reportRef, "SuperAdmin-Report.xlsx");
      message.success("Excel exported successfully");
    } catch (err) {
      message.error("Failed to export Excel");
    } finally {
      setApiLoading((prev) => ({ ...prev, exports: false }));
    }
  };

  const filterControls = (
    <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap">
      <Select
        value={timeFilter}
        onChange={(value) => {
          setTimeFilter(value);
          if (value !== "custom") setCustomDateRange([]);
        }}
        className="w-full rounded-2xl border-none bg-white/40 text-sm sm:w-40"
        dropdownStyle={{ borderRadius: 12 }}
        disabled={isLoading}
      >
        <Option value="last-month">Last Month</Option>
        <Option value="last-3-months">Last 3 Months</Option>
        <Option value="last-year">Last Year</Option>
        <Option value="custom">Custom Range</Option>
      </Select>

      {timeFilter === "custom" && (
        <RangePicker
          value={customDateRange}
          onChange={(dates) => {
            if (
              dates?.[0] &&
              dates?.[1] &&
              dates[1].diff(dates[0], "month") > 3
            ) {
              message.error("Maximum date range allowed is 3 months");
              return;
            }
            setCustomDateRange(dates);
          }}
          className="w-full rounded-2xl border-none bg-white/40 text-sm sm:w-64"
          disabled={isLoading}
        />
      )}

      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
        <button
          onClick={handleExportPdf}
          disabled={isLoading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white/90 px-5 py-2 text-sm font-semibold text-blue-600 shadow hover:bg-white disabled:opacity-50 sm:w-auto"
        >
          Export PDF
        </button>
        <button
          onClick={handleExportCsv}
          disabled={isLoading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-green-500 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-green-600 disabled:opacity-50 sm:w-auto"
        >
          Export Excel
        </button>
      </div>
    </div>
  );

  return (
    <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700 text-white shadow-2xl">
      <div className="relative overflow-hidden p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/20 blur-0" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/10" />
        
        <div className="relative z-10 flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
              Platform Analytics
            </p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight text-white">
              Monitor platform performance
            </h1>
            <p className="mt-4 text-sm text-white/80">
              Track organizer performance, revenue trends, and platform metrics
              across events and movies in real-time.
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <span className="text-xs font-medium uppercase tracking-wide text-white/70">
              Active Content Type
            </span>
            <div className="flex gap-2 rounded-full bg-white/20 p-1 shadow-lg backdrop-blur">
              {[
                { key: "events", enabled: APP_FEATURE_FLAGS.EVENT },
                { key: "movies", enabled: APP_FEATURE_FLAGS.MOVIE },
              ]
                .filter((tab) => tab.enabled)
                .map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    disabled={isLoading}
                    className={`rounded-full px-5 py-2 text-sm capitalize transition-all ${
                      activeTab === tab.key
                        ? "bg-white text-indigo-600 shadow"
                        : "text-white/80 hover:bg-white/10"
                    } disabled:opacity-50`}
                  >
                    {tab.key}
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

export default SuperAdminHeader;