import React from "react";
import { Button, Drawer } from "antd";
import { RightOutlined, LeftOutlined } from "@ant-design/icons";
import { useSidebar } from "utils/hooks/useSidebar";


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
      {sidebarContent}
    </Drawer>
  );
};

export default DynamicSidebar;