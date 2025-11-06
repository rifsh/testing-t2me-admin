import React, { useEffect } from "react";
import { Card, Table, Button, Tag } from "antd";
import { FormOutlined } from "@ant-design/icons";
import Flex from "components/shared-components/Flex";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import Utils from "utils";
import { fetchAppInfo } from "store/slices/AppInfoSlice";
import CDNImage from "components/layout-components/Image/CDNImage";

const AppInfoList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { appInfoData, loading: tableLoader } = useSelector(
    (state) => state.appinfo
  );

  useEffect(() => {
    dispatch(fetchAppInfo());
  }, [dispatch]);

  // Transform the data to array format for the table
  const tableData = appInfoData?.details?.under_maintenance 
    ? [{ id: 1, ...appInfoData }] 
    : [];

  const categoryColumns = [
    {
      title: "Maintenance Logo",
      dataIndex: ["details", "under_maintenance", "maintenance_image"],
      render: (mediaPath) => {
        return (
          <CDNImage
            src={mediaPath}
            alt="Maintenance Logo"
            height={50}
            width={80}
          />
        );
      },
    },
    {
      title: "Coming Soon Image",
      dataIndex: ["details", "under_maintenance", "isComingSoonImage"],
      render: (mediaPath) => {
        return (
          <CDNImage
            src={mediaPath}
            alt="Coming Soon Image"
            height={100}
            width={100}
          />
        );
      },
    },
    {
      title: "Maintenance Status",
      dataIndex: ["details", "under_maintenance", "enabled"],
      render: (enabled) => (
        <Tag color={enabled ? "green" : "red"} style={{ cursor: "pointer" }}>
          {enabled ? "Active" : "Inactive"}
        </Tag>
      ),
      sorter: (a, b) => {
        const aEnabled = a.details.under_maintenance.enabled;
        const bEnabled = b.details.under_maintenance.enabled;
        return aEnabled === bEnabled ? 0 : aEnabled ? -1 : 1;
      },
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Coming Soon Status",
      dataIndex: ["details", "under_maintenance", "isComingSoonFlag"],
      render: (isComingSoonFlag) => (
        <Tag
          color={isComingSoonFlag ? "green" : "red"}
          style={{ cursor: "pointer" }}
        >
          {isComingSoonFlag ? "Active" : "Inactive"}
        </Tag>
      ),
      sorter: (a, b) => {
        const aFlag = a.details.under_maintenance.isComingSoonFlag;
        const bFlag = b.details.under_maintenance.isComingSoonFlag;
        return aFlag === bFlag ? 0 : aFlag ? -1 : 1;
      },
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Coming Soon Message",
      dataIndex: ["details", "under_maintenance", "isComingSoonMessage"],
      render: (message) => <span>{message || "-"}</span>,
      sorter: (a, b) => {
        const aMsg = a.details.under_maintenance.isComingSoonMessage || "";
        const bMsg = b.details.under_maintenance.isComingSoonMessage || "";
        return aMsg.localeCompare(bMsg);
      },
    },
    {
      title: "Footer Message",
      dataIndex: ["details", "under_maintenance", "footer_message"],
      render: (message) => <span>{message || "-"}</span>,
      sorter: (a, b) => {
        const aMsg = a.details.under_maintenance.footer_message || "";
        const bMsg = b.details.under_maintenance.footer_message || "";
        return aMsg.localeCompare(bMsg);
      },
    },
    {
      title: "Reason",
      dataIndex: ["details", "under_maintenance", "reason_for_maintenance"],
      render: (reason) => <span>{reason || "-"}</span>,
      sorter: (a, b) => {
        const aReason = a.details.under_maintenance.reason_for_maintenance || "";
        const bReason = b.details.under_maintenance.reason_for_maintenance || "";
        return aReason.localeCompare(bReason);
      },
    },
    {
      title: "PlayStore URL",
      dataIndex: ["details", "under_maintenance", "playstore_url"],
      render: (url) => (
        <a href={url} target="_blank" rel="noopener noreferrer">
          {Utils.truncateText(url, 25)}
        </a>
      ),
      sorter: (a, b) => {
        const aUrl = a.details.under_maintenance.playstore_url || "";
        const bUrl = b.details.under_maintenance.playstore_url || "";
        return aUrl.localeCompare(bUrl);
      },
    },
    {
      title: "AppStore URL",
      dataIndex: ["details", "under_maintenance", "appstore_url"],
      render: (url) => (
        <a href={url} target="_blank" rel="noopener noreferrer">
          {Utils.truncateText(url, 25)}
        </a>
      ),
      sorter: (a, b) => {
        const aUrl = a.details.under_maintenance.appstore_url || "";
        const bUrl = b.details.under_maintenance.appstore_url || "";
        return aUrl.localeCompare(bUrl);
      },
    },
    {
      title: "Home Title",
      dataIndex: ["details", "under_maintenance", "home_title"],
      render: (title) => <span>{title || "-"}</span>,
      sorter: (a, b) => {
        const aTitle = a.details.under_maintenance.home_title || "";
        const bTitle = b.details.under_maintenance.home_title || "";
        return aTitle.localeCompare(bTitle);
      },
    },
    {
      title: "Home Subtitle",
      dataIndex: ["details", "under_maintenance", "home_subtitle"],
      render: (subtitle) => <span>{subtitle || "-"}</span>,
      sorter: (a, b) => {
        const aSubtitle = a.details.under_maintenance.home_subtitle || "";
        const bSubtitle = b.details.under_maintenance.home_subtitle || "";
        return aSubtitle.localeCompare(bSubtitle);
      },
    },
  ];

  return (
    <Card>
      <Flex alignItems="center" justifyContent="right">
        <div>
          <Button
            type="primary"
            icon={<FormOutlined />}
            onClick={() => {
              navigate(
                `${APP_PREFIX_PATH}/app/management/layout/app-info/add-info`
              );
            }}
          >
            Update Maintenance Info
          </Button>
        </div>
      </Flex>
      <Table
        columns={categoryColumns}
        dataSource={tableData}
        rowKey="id"
        loading={tableLoader}
        pagination={false}
      />
    </Card>
  );
};

export default AppInfoList;