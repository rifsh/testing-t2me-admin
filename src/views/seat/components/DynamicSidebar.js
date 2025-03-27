import React from "react";
import { Button, Drawer } from "antd";
import { RightOutlined, LeftOutlined } from "@ant-design/icons";
import { useSidebar } from "utils/hooks/useSidebar";
import SeatStatistics from "./SeatStatistics"; // Import the new component
import SeatManagementSidebar from "./SeatManagementSidebar";

const DynamicSidebar = () => {
  const { isSidebarOpen, closeSidebar, sidebarContent } = useSidebar();

  return (
    <Drawer
      title="Seat Management"
      placement="right"
      onClose={closeSidebar}
      open={isSidebarOpen}
      width={350}
      destroyOnClose
      extra={
        <Button
          icon={isSidebarOpen ? <RightOutlined /> : <LeftOutlined />}
          onClick={closeSidebar}
        />
      }
    >
      {sidebarContent || <SeatManagementSidebar />}
    </Drawer>
  );
};
export default DynamicSidebar;