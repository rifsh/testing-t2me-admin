import React, { useState } from "react";
import {
  Layout,
  Menu,
  Breadcrumb,
  Card,
  Row,
  Col,
  Table,
  Progress,
  Avatar,
  List,
  Button,
} from "antd";
import {
  DashboardOutlined,
  CalendarOutlined,
  TeamOutlined,
  SettingOutlined,
} from "@ant-design/icons";

const { Header, Content, Sider, Footer } = Layout;

const DummyDashboard = () => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapsed = () => setCollapsed(!collapsed);

  const eventsData = [
    { key: 1, name: "Tech Conference 2024", date: "2024-12-10", status: "Active" },
    { key: 2, name: "Music Fest", date: "2024-12-15", status: "Upcoming" },
    { key: 3, name: "Charity Gala", date: "2024-12-20", status: "Completed" },
  ];

  const teamMembers = [
    { name: "Alice Johnson", role: "Coordinator" },
    { name: "Bob Smith", role: "Designer" },
    { name: "Charlie Lee", role: "Developer" },
  ];

  const tasks = [
    { task: "Setup Venue", progress: 80 },
    { task: "Invite Speakers", progress: 60 },
    { task: "Prepare Materials", progress: 40 },
  ];

  const columns = [
    { title: "Event Name", dataIndex: "name", key: "name" },
    { title: "Date", dataIndex: "date", key: "date" },
    { title: "Status", dataIndex: "status", key: "status" },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider collapsible collapsed={collapsed} onCollapse={toggleCollapsed}>
        <div className="logo" style={{ padding: "16px", color: "#fff" }}>
          Event Organizer
        </div>
        <Menu theme="dark" defaultSelectedKeys={["1"]} mode="inline">
          <Menu.Item key="1" icon={<DashboardOutlined />}>
            Dashboard
          </Menu.Item>
          <Menu.Item key="2" icon={<CalendarOutlined />}>
            Events
          </Menu.Item>
          <Menu.Item key="3" icon={<TeamOutlined />}>
            Team
          </Menu.Item>
          <Menu.Item key="4" icon={<SettingOutlined />}>
            Settings
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Header style={{ background: "#fff", padding: 0, textAlign: "center" }}>
          <h2>Event Organizer Dashboard</h2>
        </Header>
        <Content style={{ margin: "16px" }}>
          <Breadcrumb style={{ margin: "16px 0" }}>
            <Breadcrumb.Item>Home</Breadcrumb.Item>
            <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
          </Breadcrumb>
          <div style={{ padding: 24, background: "#fff", minHeight: 360 }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8}>
                <Card title="Upcoming Events" bordered={false}>
                  <Table
                    dataSource={eventsData}
                    columns={columns}
                    pagination={false}
                    size="small"
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Card title="Task Progress" bordered={false}>
                  {tasks.map((task) => (
                    <div key={task.task} style={{ marginBottom: "16px" }}>
                      <strong>{task.task}</strong>
                      <Progress percent={task.progress} />
                    </div>
                  ))}
                </Card>
              </Col>
              <Col xs={24} sm={24} md={8}>
                <Card title="Team Members" bordered={false}>
                  <List
                    itemLayout="horizontal"
                    dataSource={teamMembers}
                    renderItem={(item) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar>{item.name[0]}</Avatar>}
                          title={item.name}
                          description={item.role}
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
            </Row>
          </div>
        </Content>
        <Footer style={{ textAlign: "center" }}>
          Event Organizer Dashboard ©2024 Created by Your Company
        </Footer>
      </Layout>
    </Layout>
  );
};

export default DummyDashboard;
