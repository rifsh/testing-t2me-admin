import React, { useState } from "react";
import { Tabs } from "antd";
import SeatStatistics from "./SeatStatistics";
import SeatCurve from "./SeatCurve";

const SeatManagementSidebar = () => {
  const [activeTab, setActiveTab] = useState("statistics");

  const tabItems = [
    {
      key: "statistics",
      label: "Seat Count & Stats",
      children: <SeatStatistics />,
    },
    {
      key: "curve",
      label: "Seat Configuration",
      children: <SeatCurve />,
    },
    // You can add more tabs here as needed
    {
      key: "categories",
      label: "Seat Categories",
      children: <div>Seat Category Management</div>,
    },
    {
      key: "layout",
      label: "Layout Options",
      children: <div>Layout and Arrangement Settings</div>,
    },
  ];

  return (
    <Tabs
      activeKey={activeTab}
      onChange={setActiveTab}
      items={tabItems}
      tabPosition="top"
      style={{ height: "100%" }}
    />
  );
};

export default SeatManagementSidebar;
