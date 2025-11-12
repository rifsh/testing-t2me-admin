import React, { useEffect, useMemo, useState } from "react";
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
    message,
    Col,
    Row,
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
    IdcardOutlined,
    CreditCardOutlined,
    DollarOutlined,
    ClearOutlined,
    UpOutlined,
    DownOutlined,
    SearchOutlined,
    FieldTimeOutlined,
} from "@ant-design/icons";
import Flex from "components/shared-components/Flex";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllApschedulerLogs } from "store/slices/apschedulerSlice";
import Utils from "utils";
import { DEFAULT_PAGE_SIZE } from "constants/PageConstants";
import { debounce } from "lodash";
import { useNavigate } from "react-router-dom";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { BOOKING_TYPE } from "constants/AppConstants";
import { eventType, paymentFilterTypes, paymentModeFilters, paymentPlatformFilters, statusFilters, triggeredText } from "constants/LoggerConstants";
const { Text, Paragraph, Title } = Typography;

const FilterSection = ({
    searchTerm,
    handleSearchChange,
    handleSearchClear,
    selectedEventType,
    handleEventTypeFilter,
    selectedType,
    handleTypeFilter,
    selectedpaymentMode,
    selectedPaymentPlatform,
    handleFilterChange,
    handleRefresh,
    loading,
    activeFilters,
    showFilters,
    setShowFilters,
    handleClearFilters
}) => {
    return (
        <Card
            size="small"
            style={{ marginBottom: 16, border: '1px solid #d9d9d9' }}
            bodyStyle={{ padding: '16px' }}
        >
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: showFilters ? 16 : 0,
                }}
            >
                <Space>
                    <FilterOutlined style={{ color: '#1890ff' }} />
                    <Text strong>Filters</Text>
                    {activeFilters > 0 && (
                        <Badge
                            count={activeFilters}
                            style={{ backgroundColor: '#1890ff' }}
                            title={`${activeFilters} active filter(s)`}
                        />
                    )}
                </Space>
                <Space>
                    {activeFilters > 0 && (
                        <Button
                            size="small"
                            icon={<ClearOutlined />}
                            onClick={handleClearFilters}
                            type="text"
                        >
                            Clear All
                        </Button>
                    )}
                    <Button
                        size="small"
                        icon={showFilters ? <UpOutlined /> : <DownOutlined />}
                        onClick={() => setShowFilters(!showFilters)}
                        type="text"
                    >
                        {showFilters ? 'Hide' : 'Show'} Filters
                    </Button>
                </Space>
            </div>

            {showFilters && (
                <>
                    <Divider style={{ margin: '12px 0' }} />
                    <Row gutter={[16, 16]} align="middle">
                        {/* Search Input */}
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <div>
                                <Text strong style={{ display: 'block', marginBottom: 4 }}>
                                    Search
                                </Text>
                                <Input
                                    placeholder="Search in logs..."
                                    allowClear
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    prefix={<SearchOutlined />}
                                    style={{ width: '100%' }}
                                />
                            </div>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <div>
                                <Text strong style={{ display: 'block', marginBottom: 4 }}>
                                    Event Type
                                </Text>
                                <Select
                                    value={selectedEventType}
                                    onChange={handleEventTypeFilter}
                                    style={{ width: '100%' }}
                                    options={eventType}
                                    suffixIcon={<IdcardOutlined />}
                                />
                            </div>
                        </Col>

                        {/* Status Filter */}
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <div>
                                <Text strong style={{ display: 'block', marginBottom: 4 }}>
                                    Status
                                </Text>
                                <Select
                                    value={selectedType}
                                    onChange={handleTypeFilter}
                                    style={{ width: '100%' }}
                                    options={statusFilters}
                                    suffixIcon={<ClockCircleOutlined />}
                                />
                            </div>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <div>
                                <Text strong style={{ display: 'block', marginBottom: 4 }}>
                                    Payment Mode
                                </Text>
                                <Select
                                    value={selectedpaymentMode}
                                    onChange={(value) => handleFilterChange(value, paymentFilterTypes.paymentMode)}
                                    style={{ width: '100%' }}
                                    options={paymentModeFilters}
                                    suffixIcon={<ClockCircleOutlined />}
                                />
                            </div>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <div>
                                <Text strong style={{ display: 'block', marginBottom: 4 }}>
                                    Payment Platform
                                </Text>
                                <Select
                                    value={selectedPaymentPlatform}
                                    onChange={(value) => handleFilterChange(value, paymentFilterTypes.paymentPlatform)}
                                    style={{ width: '100%' }}
                                    options={paymentPlatformFilters}
                                    suffixIcon={<ClockCircleOutlined />}
                                />
                            </div>
                        </Col>

                        {/* Action Buttons */}
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
                                <Button
                                    icon={<ReloadOutlined />}
                                    onClick={handleRefresh}
                                    loading={loading}
                                    style={{ flex: 1 }}
                                >
                                    Refresh
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </>
            )}
        </Card>
    );
};

export default FilterSection;