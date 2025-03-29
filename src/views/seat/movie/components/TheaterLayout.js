import React from "react";
import { Typography, Row, Col, Card, Divider } from "antd";
import ConfigPanel from "./ConfigPanel";
import SeatTypeSelector from "./ToolsPanel/SeatTypeSelector";
import CategorySelector from "./ToolsPanel/CategorySelector";
import SelectionControls from "./ToolsPanel/SelectionControls";
import TheaterGrid from "./TheaterGrid";

const { Title } = Typography;

const TheaterLayout = () => {
  return (
    <div style={{ padding: "16px", maxWidth: "1400px", margin: "0 auto" }}>
      <Title level={2}>Theater Layout Tool</Title>

      <Row gutter={[16, 16]}>
        {/* Left Side - Tools Panel */}
        <Col xs={24} lg={6}>
          <Card style={{ marginBottom: "16px" }}>
            <Title level={4}>Configuration</Title>
            <ConfigPanel />

            <Divider />

            <Title level={4}>Tools</Title>
            <div style={{ marginBottom: "16px" }}>
              <SeatTypeSelector />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <CategorySelector />
            </div>

            <Divider />

            <SelectionControls />
          </Card>
        </Col>

        {/* Right Side - Theater Grid */}
        <Col xs={24} lg={18}>
          <TheaterGrid />
        </Col>
      </Row>
    </div>
  );
};

export default TheaterLayout;
