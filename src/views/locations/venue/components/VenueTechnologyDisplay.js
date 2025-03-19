import React, { useEffect } from "react";
import { Tabs, Card, Typography, List, Space, Empty, Avatar } from "antd";
import {
    DesktopOutlined,
    SoundOutlined,
    SafetyOutlined,
    FundProjectionScreenOutlined,
    SoundFilled,
} from "@ant-design/icons";

const { TabPane } = Tabs;
const { Title, Paragraph } = Typography;

const VenueTechnologyDisplay = ({ venueData }) => {
    const data = {
        screenTech:
            venueData.screen_tech?.map((tech) => ({
                name: tech.name,
                description: tech.description,
            })) || [],
        audioTech:
            venueData.audio?.map((audio) => ({
                name: audio.name,
                description: audio.description,
            })) || [],
        accessibilityFeatures:
            venueData.accessibility?.map((feature) => ({
                name: feature.name,
                description: feature.description,
            })) || [],
    };

    useEffect(() => {
        console.log("Venue Data:", venueData);
        console.log("Processed Data:", data);
    }, [venueData]);

    const getIcon = (tabName) => {
        const icons = {
            screen: <FundProjectionScreenOutlined style={{ color: "#1890ff" }} />,
            audio: <SoundFilled style={{ color: "#52c41a" }} />,
            accessibility: <SafetyOutlined style={{ color: "#722ed1" }} />,
        };
        return icons[tabName] || <DesktopOutlined />;
    };

    const renderFeatureList = (features, tabKey) => {
        if (features.length === 0) {
            return <Empty description="No features available" />;
        }

        return (
            <List
                itemLayout="horizontal"
                dataSource={features}
                renderItem={(item) => (
                    <List.Item>
                        <Card
                            style={{ width: "100%", borderRadius: "8px" }}
                            bodyStyle={{ padding: "16px" }}
                        >
                            <List.Item.Meta
                                avatar={
                                    <Avatar
                                        icon={getIcon(tabKey)}
                                        size={48}
                                        style={{
                                            backgroundColor: "#f0f2f5",
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                        }}
                                    />
                                }
                                title={
                                    <Title level={4} style={{ margin: 0 }}>
                                        {item.name}
                                    </Title>
                                }
                                description={
                                    <Paragraph style={{ margin: "8px 0 0 0" }}>
                                        {item.description}
                                    </Paragraph>
                                }
                            />
                        </Card>
                    </List.Item>
                )}
                style={{ maxHeight: "600px", overflow: "auto", padding: "12px" }}
            />
        );
    };

    const tabBarStyle = {
        marginBottom: "12px",
    };

    return (
        <div style={{ padding: "12px", background: "#fff", borderRadius: "8px" }}>
            <Tabs
                defaultActiveKey="screen"
                type="card"
                size="large"
                tabBarStyle={tabBarStyle}
                className="venue-tech-tabs"
            >
                {[
                    { key: "screen", label: "Screen Technology", data: data.screenTech },
                    { key: "audio", label: "Audio Technology", data: data.audioTech },
                    {
                        key: "accessibility",
                        label: "Accessibility Features",
                        data: data.accessibilityFeatures,
                    },
                ].map((tab) => (
                    <TabPane
                        tab={
                            <Space>
                                {getIcon(tab.key)}
                                <span style={{ fontWeight: 500 }}>{tab.label}</span>
                            </Space>
                        }
                        key={tab.key}
                    >
                        {renderFeatureList(tab.data, tab.key)}
                    </TabPane>
                ))}
            </Tabs>
        </div>
    );
};

export default VenueTechnologyDisplay;
