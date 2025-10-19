import React, { useEffect, useState } from "react";
import {
    Card,
    Table,
    Button,
    Input,
    Alert,
    Typography,
    Space,
    Tooltip,
    Badge,
    Tag,
    Modal,
    Divider,
    Timeline,
    Select,
    Spin,
    Empty,
} from "antd";
import {
    CalendarOutlined,
    InfoCircleOutlined,
    EyeOutlined,
    FileTextOutlined,
    ClockCircleOutlined,
    CheckCircleFilled,
    CloseCircleFilled,
    FilterOutlined,
    ReloadOutlined,
    HistoryOutlined,
} from "@ant-design/icons";
import Flex from "components/shared-components/Flex";
import { useDispatch, useSelector } from "react-redux";
import Utils from "utils";
import { DEFAULT_PAGE_SIZE } from "constants/PageConstants";
import { fetchAllActivityLogs } from "store/slices/apschedulerSlice";
import { debounce } from "lodash";

const { Text, Paragraph, Title } = Typography;

// Helper function to format type string - made available to all components
const formatTypeString = (typeString) => {
    if (!typeString) return "";
    return typeString
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
};

// Helper function to get CSS color from color string
const getColorFromString = (colorStr) => {
    const colorMap = {
        blue: "#1890ff",
        green: "#52c41a",
        red: "#f5222d",
        purple: "#722ed1",
        orange: "#fa8c16",
        cyan: "#13c2c2",
        default: "#d9d9d9",
    };
    return colorMap[colorStr] || colorMap.default;
};

// Enhanced component to handle the batch details display with better UI
const BatchDetailsDisplay = ({ details, type }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    // Extract key metrics from batch details dynamically
    const extractMetrics = (text) => {
        if (!text) return [];

        // Match patterns like "Something: 123" dynamically
        const metricsRegex = /(\w+(?:\s+\w+)*): (\d+)/g;
        const metrics = [];
        let match;

        while ((match = metricsRegex.exec(text)) !== null) {
            const label = match[1];
            const value = match[2];

            // Only add non-zero values
            if (value !== "0") {
                // Determine color based on the type of metric
                let color = "blue";
                if (label.toLowerCase().includes("deleted")) color = "red";
                else if (label.toLowerCase().includes("updated")) color = "green";
                else if (label.toLowerCase().includes("released")) color = "purple";

                metrics.push({
                    label,
                    value,
                    color,
                });
            }
        }

        return metrics;
    };

    const metrics = extractMetrics(details);

    // Get batch type color based on the type string - dynamically
    const getTypeColor = (typeString) => {
        if (!typeString) return "default";

        const typeStr = typeString.toLowerCase();
        if (typeStr.includes("booking")) return "blue";
        if (typeStr.includes("event")) return "green";
        if (typeStr.includes("advertisement")) return "purple";
        if (typeStr.includes("delete")) return "red";
        if (typeStr.includes("update")) return "cyan";
        return "default";
    };

    const typeColor = getTypeColor(type);

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    // Format details for better readability in the modal
    const formatDetailsForModal = (text) => {
        if (!text) return "";
        return text.replace(/,/g, ",\n");
    };

    // Determine if there are any metrics
    const hasMetrics = metrics.length > 0;

    return (
        <div>
            <Space direction="vertical" style={{ width: "100%" }} size={4}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Tag color={typeColor}>{formatTypeString(type)}</Tag>
                    {hasMetrics && (
                        <div style={{ display: "flex", gap: "4px" }}>
                            {metrics.map((metric, index) => (
                                <Badge
                                    key={index}
                                    count={metric.value}
                                    showZero={false}
                                    style={{ backgroundColor: metric.color }}
                                    title={`${metric.label}: ${metric.value}`}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <div style={{ marginTop: "2px" }}>
                    <Paragraph
                        ellipsis={
                            !isExpanded
                                ? { rows: 1, expandable: true, symbol: "more" }
                                : false
                        }
                        style={{ marginBottom: 0 }}
                    >
                        {details || "No details available"}
                    </Paragraph>

                    <div style={{ marginTop: "4px", display: "flex", gap: "12px" }}>
                        {details && details.length > 80 && (
                            <Button
                                type="link"
                                size="small"
                                onClick={toggleExpand}
                                style={{ padding: 0, height: "auto" }}
                            >
                                {isExpanded ? "Show Less" : "Show More"}
                            </Button>
                        )}
                        <Button
                            type="link"
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={showModal}
                            style={{ padding: 0, height: "auto" }}
                        >
                            View Full Details
                        </Button>
                    </div>
                </div>
            </Space>

            <Modal
                title={
                    <Space>
                        <FileTextOutlined /> <span>{formatTypeString(type)} Details</span>
                    </Space>
                }
                open={isModalVisible}
                onCancel={handleCancel}
                footer={[
                    <Button key="close" onClick={handleCancel}>
                        Close
                    </Button>,
                ]}
                width={600}
            >
                <div
                    style={{
                        whiteSpace: "pre-wrap",
                        maxHeight: "400px",
                        overflow: "auto",
                        padding: "16px",
                        backgroundColor: "#f5f5f5",
                        borderRadius: "4px",
                    }}
                >
                    <Text>
                        {formatDetailsForModal(details) || "No details available"}
                    </Text>
                </div>

                {metrics.length > 0 && (
                    <div style={{ marginTop: "16px" }}>
                        <Text strong>Summary:</Text>
                        <div
                            style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "8px",
                                marginTop: "8px",
                            }}
                        >
                            {metrics.map((metric, index) => (
                                <Tag key={index} color={metric.color}>
                                    {metric.label}: {metric.value}
                                </Tag>
                            ))}
                        </div>
                    </div>
                )}

                <div style={{ marginTop: "16px" }}>
                    <Text type="secondary">
                        <ClockCircleOutlined /> Processed at: {new Date().toLocaleString()}
                    </Text>
                </div>
            </Modal>
        </div>
    );
};

// Simple Statistic component
const Statistic = ({ title, value, prefix, valueStyle = {} }) => {
    return (
        <div>
            <div style={{ color: "rgba(0,0,0,0.45)", fontSize: "14px" }}>{title}</div>
            <div
                style={{
                    fontSize: "24px",
                    fontWeight: "600",
                    marginTop: "4px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    ...valueStyle,
                }}
            >
                {prefix && <span>{prefix}</span>}
                {value}
            </div>
        </div>
    );
};

const ActivitySummary = ({ data, typeCountsFromAPI }) => {
    // Dynamically collect and aggregate metrics from data
    const aggregateMetrics = () => {
        console.log(typeCountsFromAPI, "typecounform api");

        if (!data || !Array.isArray(data) || data.length === 0) {
            return {
                totalLogs: 0,
                byType: {},
                actions: {},
            };
        }

        const metrics = {
            totalLogs: data.length,
            byType: {},
            actions: {},
        };

        data.forEach((log) => {
            // Count by type
            const type = log.types || "unknown";
            if (!metrics.byType[type]) {
                metrics.byType[type] = 0;
            }
            metrics.byType[type]++;

            // Dynamically count actions from batch_details
            if (log.batch_details) {
                const actionRegex = /(\w+(?:\s+\w+)*): (\d+)/g;
                let match;
                while ((match = actionRegex.exec(log.batch_details)) !== null) {
                    const action = match[1];
                    const count = parseInt(match[2], 10);

                    if (!metrics.actions[action]) {
                        metrics.actions[action] = 0;
                    }
                    metrics.actions[action] += count;
                }
            }
        });

        return metrics;
    };

    const metrics = aggregateMetrics();
    const totalLogs = typeCountsFromAPI
        ? Object.values(typeCountsFromAPI).reduce((a, b) => a + b, 0)
        : metrics.totalLogs;

    // Get type color dynamically
    const getTypeColor = (typeString) => {
        if (!typeString) return "default";

        const typeStr = typeString.toLowerCase();
        if (typeStr.includes("booking")) return "blue";
        if (typeStr.includes("event")) return "green";
        if (typeStr.includes("advertisement")) return "purple";
        if (typeStr.includes("delete")) return "red";
        if (typeStr.includes("update")) return "cyan";
        return "default";
    };

    // Get action color dynamically
    const getActionColor = (action) => {
        if (!action) return "default";

        const actionStr = action.toLowerCase();
        if (actionStr.includes("deleted")) return "red";
        if (actionStr.includes("released")) return "blue";
        if (actionStr.includes("updated")) return "green";
        if (actionStr.includes("coupon")) return "purple";
        if (actionStr.includes("schedule")) return "orange";
        return "default";
    };

    // Render type count cards based on API data
    const renderTypeCountCards = () => {
        if (!typeCountsFromAPI) return null;

        return Object.entries(typeCountsFromAPI)
            .map(([type, count]) => {
                if (type === "unknown") return null; // Skip unknown type or handle it differently
                const typeColor = getTypeColor(type);

                return (
                    <Card
                        key={type}
                        bordered={false}
                        size="small"
                        style={{
                            width: "200px",
                            borderLeft: `2px solid ${getColorFromString(typeColor)}`,
                        }}
                    >
                        <Statistic
                            title={formatTypeString(type)}
                            value={count}
                            valueStyle={{ color: getColorFromString(typeColor) }}
                        />
                    </Card>
                );
            })
            .filter(Boolean);
    };

    return (
        <div style={{ marginBottom: 24 }}>
            <Title level={4}>Activity Summary</Title>
            <Divider />
            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
                <Card bordered={false} size="small" style={{ width: "200px" }}>
                    <Statistic
                        title="Total Logs"
                        value={totalLogs}
                        prefix={<HistoryOutlined />}
                    />
                </Card>

                {typeCountsFromAPI
                    ? renderTypeCountCards()
                    : Object.entries(metrics.byType).map(([type, count]) => {
                        const typeColor = getTypeColor(type);

                        return (
                            <Card
                                key={type}
                                bordered={false}
                                size="small"
                                style={{
                                    width: "200px",
                                    borderLeft: `2px solid ${getColorFromString(typeColor)}`,
                                }}
                            >
                                <Statistic
                                    title={formatTypeString(type)}
                                    value={count}
                                    valueStyle={{ color: getColorFromString(typeColor) }}
                                />
                            </Card>
                        );
                    })}
            </div>

            {Object.keys(metrics.actions).length > 0 && (
                <>
                    <Divider>Actions Summary</Divider>
                    <div
                        style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "16px",
                            marginTop: "16px",
                        }}
                    >
                        {Object.entries(metrics.actions)
                            .filter(([_, value]) => value > 0) // Only show non-zero actions
                            .map(([action, count]) => (
                                <Tag
                                    key={action}
                                    color={getActionColor(action)}
                                    style={{ padding: "4px 8px" }}
                                >
                                    {action}: {count}
                                </Tag>
                            ))}
                    </div>
                </>
            )}
        </div>
    );
};

const ActivityLogsList = () => {
    const dispatch = useDispatch();
    const { pagination, loading, allActivityLogs, countsByTypes } = useSelector(
        (state) => state.apscheduler
    );
    const [searchTerm, setSearchTerm] = useState("");
    const [number, setNumber] = useState("");
    const [viewMode, setViewMode] = useState("table");
    const [selectedType, setSelectedType] = useState("all");
    const [showSummary, setShowSummary] = useState(true);
    const [selectedEventType, setSelectedEventType] = useState("all");

    useEffect(() => {
        dispatch(fetchAllActivityLogs(DEFAULT_PAGE_SIZE));
    }, [dispatch]);

    const handlePagination = (page, size) => {
        // dispatch(fetchAllActivityLogs({ page: page, size: size }));
        dispatch(fetchAllActivityLogs({
            page: page,
            size: size,
            search: searchTerm,
            type: selectedType === 'all' ? null : selectedType,
            event_type: selectedEventType === 'all' ? null : selectedEventType

        }));
    };

    const handleTimeFilter = () => {
        const floatValue = parseFloat(number);
        if (!isNaN(floatValue)) {
            dispatch(
                fetchAllActivityLogs({
                    expire: true,
                    page: 1,
                    size: 10,
                    limit: floatValue,
                })
            );
            setNumber("");
        } else {
            alert("Please enter a valid number");
        }
    };

    const handleRefresh = () => {
        setSelectedType('all');
        dispatch(fetchAllActivityLogs(DEFAULT_PAGE_SIZE));
    };

    const handleTypeFilter = (type) => {
        setSelectedType(type);
    };

    const handleSearch = debounce((value) => {
        setSearchTerm(value.toLowerCase());
    }, 300);

    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return "N/A";

        try {
            const date = new Date(dateTimeString);
            return date.toLocaleString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
            });
        } catch (error) {
            return "Invalid Date";
        }
    };

    const handleEventTypeFilter = (type) => {
        setSelectedEventType(type);
    };

    // Format time difference dynamically
    const getTimeDifference = (dateTimeString) => {
        if (!dateTimeString) return "N/A";

        try {
            const now = new Date();
            const date = new Date(dateTimeString);
            const diffInMinutes = Math.floor((now - date) / (1000 * 60));

            if (diffInMinutes < 60) {
                return `${diffInMinutes} min${diffInMinutes !== 1 ? "s" : ""} ago`;
            } else if (diffInMinutes < 1440) {
                const hours = Math.floor(diffInMinutes / 60);
                return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
            } else {
                const days = Math.floor(diffInMinutes / 1440);
                return `${days} day${days !== 1 ? "s" : ""} ago`;
            }
        } catch (error) {
            return "Invalid Date";
        }
    };

    // Get unique types from logs dynamically
    const getUniqueTypes = () => {
        if (!countsByTypes) return [];
        return Object.keys(countsByTypes).filter((type) => type !== "unknown");
    };

    const uniqueTypes = getUniqueTypes();

    // Filter logs by selected type
    const filteredLogs = (() => {
        if (!allActivityLogs || !Array.isArray(allActivityLogs)) return [];

        return selectedType === "all"
            ? allActivityLogs
            : allActivityLogs.filter((log) => log.types === selectedType);
    })();

    useEffect(() => {
        dispatch(fetchAllActivityLogs({
            page: 1,
            size: 10,
            search: searchTerm,
            type: selectedType === 'all' ? null : selectedType,
            event_type: selectedEventType === 'all' ? null : selectedEventType
        }));

    }, [searchTerm, selectedEventType, selectedType])

    const tableColumns = [
        {
            title: "Created At",
            dataIndex: "created_at",
            render: (text) => (
                <Tooltip title={formatDateTime(text)}>
                    <div>
                        <div>{formatDateTime(text)}</div>
                        <div>
                            <Text type="secondary">{getTimeDifference(text)}</Text>
                        </div>
                    </div>
                </Tooltip>
            ),
            sorter: (a, b) => {
                if (!a.created_at || !b.created_at) return 0;
                return new Date(a.created_at) - new Date(b.created_at);
            },
            width: "25%",
        },
        {
            title: "Status",
            dataIndex: "batch_status",
            render: (status) => (
                <Space>
                    {status ? (
                        <CheckCircleFilled style={{ color: "#52c41a" }} />
                    ) : (
                        <CloseCircleFilled style={{ color: "#f5222d" }} />
                    )}
                    <Text
                        style={{
                            color: status ? "#52c41a" : "#f5222d",
                        }}
                    >
                        {status ? "Success" : "Failed"}
                    </Text>
                </Space>
            ),
            sorter: (a, b) => {
                if (a.batch_status === undefined || b.batch_status === undefined)
                    return 0;
                return a.batch_status - b.batch_status;
            },
            width: "15%",
            align: "center",
        },
        {
            title: "Details",
            dataIndex: "batch_details",
            render: (text, record) => (
                <BatchDetailsDisplay details={text} type={record.types} />
            ),
            width: "60%",
        },
    ];

    const renderTimelineView = () => {
        if (
            !filteredLogs ||
            !Array.isArray(filteredLogs) ||
            filteredLogs.length === 0
        ) {
            return <Alert message="No activity logs found" type="info" />;
        }

        return (
            <Timeline
                mode="left"
                items={filteredLogs.map((log) => ({
                    label: (
                        <div>
                            <div>{formatDateTime(log.created_at)}</div>
                            <div>
                                <Text type="secondary">
                                    {getTimeDifference(log.created_at)}
                                </Text>
                            </div>
                        </div>
                    ),
                    color: log.batch_status ? "green" : "red",
                    children: (
                        <Card size="small" style={{ marginBottom: 8 }}>
                            <BatchDetailsDisplay
                                details={log.batch_details}
                                type={log.types}
                            />
                        </Card>
                    ),
                }))}
            />
        );
    };

    const isDataEmpty =
        !allActivityLogs ||
        !Array.isArray(allActivityLogs) ||
        allActivityLogs.length === 0;

    return (
        <Card>
            <Alert
                message="System Activity Logs"
                description="Below are the system batch process activity logs. These logs track automatic system processes like booking cleanups, event schedule updates, and advertisement schedule management."
                type="info"
                showIcon
                style={{ marginBottom: 24 }}
                action={
                    !isDataEmpty && (
                        <Button
                            size="small"
                            type="primary"
                            onClick={() => setShowSummary(!showSummary)}
                        >
                            {showSummary ? "Hide Summary" : "Show Summary"}
                        </Button>
                    )
                }
            />

            {!isDataEmpty && showSummary && (
                <ActivitySummary
                    data={allActivityLogs}
                    typeCountsFromAPI={countsByTypes}
                />
            )}
            <Flex alignItems="center" className="mb-3" justifyContent="space-between">
                <div>
                    <Space>
                        <Button
                            type={viewMode === "table" ? "primary" : "default"}
                            onClick={() => setViewMode("table")}
                        >
                            Table View
                        </Button>
                        <Button
                            type={viewMode === "timeline" ? "primary" : "default"}
                            onClick={() => setViewMode("timeline")}
                        >
                            Timeline View
                        </Button>
                        <Divider type="vertical" />
                    </Space>
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={handleRefresh}
                        title="Refresh logs"
                        loading={loading}
                    />
                    <Space>
                        <Input.Search
                            placeholder="Search logs..."
                            allowClear
                            onChange={(e) => handleSearch(e.target.value)}
                            style={{ width: 220 }}
                        />
                        <FilterOutlined />
                        {/* <span>Filter by Type:</span> */}
                        <Select
                            value={selectedEventType}
                            onChange={handleEventTypeFilter}
                            style={{ width: 180 }}
                            options={[
                                { value: "all", label: "All" },
                                { value: "ticket", label: "Ticket Type" },
                                { value: "seat", label: "Event Seat Type" },
                                { value: "movie", label: "Movie Type" },
                            ]}
                        />
                    </Space>
                    <Space>
                        {/* <Input
                            placeholder="Enter Hours"
                            onChange={(e) => Utils.handleChange(e, setNumber)}
                            value={number}
                            style={{ width: "120px" }}
                            suffix={
                                <Tooltip title="Filter activity logs by hours">
                                    <InfoCircleOutlined style={{ color: "rgba(0,0,0,.45)" }} />
                                </Tooltip>
                            }
                        /> */}
                        {/* <Button
                            type="primary"
                            icon={<CalendarOutlined />}
                            onClick={handleTimeFilter}
                            loading={loading}
                        >
                            Filter by Hours
                        </Button> */}
                    </Space>
                </div>
            </Flex>

            {loading ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                    <Spin size="large" />
                    <div style={{ marginTop: 16 }}>Loading activity logs...</div>
                </div>
            ) : isDataEmpty ? (
                <Empty
                    description="No activity logs found"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
            ) : viewMode === "table" ? (
                <Table
                    columns={tableColumns}
                    dataSource={filteredLogs}
                    rowKey={(record) => record.created_at || Math.random().toString()}
                    pagination={{
                        current: pagination?.page || 1,
                        pageSize: pagination?.size || 10,
                        total: pagination?.total || filteredLogs?.length || 0,
                        onChange: (page, pageSize) => handlePagination(page, pageSize),
                        showSizeChanger: true,
                        pageSizeOptions: ["10", "20", "50"],
                    }}
                />
            ) : (
                renderTimelineView()
            )}
        </Card>
    );
};

export default ActivityLogsList;
