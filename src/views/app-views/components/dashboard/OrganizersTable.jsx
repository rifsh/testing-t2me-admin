import React from "react";
import { Table, Spin } from "antd";
import { Link } from "react-router-dom";
import { APP_PREFIX_PATH } from "configs/AppConfig";

const OrganizersTable = ({
  activeTab,
  userReportsData,
  pagination,
  handlePagination,
  isLoading,
}) => {
  const columns = [
    {
      title: "Organizer",
      dataIndex: "username",
      render: (text, record) => (
        <Link
          to={
            activeTab === "events"
              ? `${APP_PREFIX_PATH}/super-admin/organizer-details/${record.id}`
              : `${APP_PREFIX_PATH}/super-admin/movie-organizer-detail/${record.id}`
          }
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          {text}
        </Link>
      ),
      fixed: "left",
      width: 160,
    },
    {
      title: "Email",
      dataIndex: "email",
      width: 220,
    },
    {
      title: activeTab === "events" ? "Events" : "Movies",
      dataIndex: activeTab === "events" ? "event_count" : "movie_count",
      width: 130,
      render: (count) => (
        <span className="inline-flex items-center justify-center w-8 h-8 bg-indigo-50 text-indigo-600 rounded-full font-semibold">
          {count}
        </span>
      ),
    },
    {
      title: "Revenue",
      dataIndex: "revenue_by_country",
      width: 180,
      render: (revenueByCountry, record) => {
        const primaryRevenue = revenueByCountry?.[0] || {};
        const totalRevenue = record.total_revenue || 0;

        return (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-green-600">
              {totalRevenue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            {primaryRevenue.currency_code && (
              <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                {primaryRevenue.currency_code}
              </span>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        {activeTab === "events" ? "Event Organizers" : "Movie Organizers"}
      </h3>
      <div className="overflow-x-auto">
        <Table
          columns={columns}
          dataSource={userReportsData}
          rowKey="id"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onChange: (page, pageSize) =>
              handlePagination(page, pageSize, "", activeTab),
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} organizers`,
          }}
          loading={isLoading}
          scroll={{ x: 800 }}
          rowClassName="hover:bg-gray-50"
        />
      </div>
    </section>
  );
};

export default OrganizersTable;