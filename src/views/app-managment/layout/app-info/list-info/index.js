import React, { useEffect, useState } from "react";
import { Card, Table, Input, Tabs, Button, Select, Menu, Tag } from "antd";
import {
  FormOutlined,
  SearchOutlined,
  EditOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import Flex from "components/shared-components/Flex";
import EllipsisDropdown from "components/shared-components/EllipsisDropdown";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import Utils from "utils";
import { setDialogVisible, setSelectedItem } from "store/slices/modalSlice";
import UpdateStatusModal from "components/util-components/ModalItems/UpdateStatusModal";
import {
  fetchAdCategories,
  updateAdCategory,
  setEditItemId,
  setAdCategoryDialogVisible,
  setAdCategoryModalLoading,
  updateAdCategoryStatus,
} from "store/slices/adCategorySlice";
import { fetchAppInfo } from "store/slices/AppInfoSlice";
import SearchBarWithStatus from "components/util-components/Search/SearchBarWithStatus";
import WarningModal from "components/util-components/ModalItems/WarningModal";
import { TextConstants } from "constants/TextConstant";
import { DEFAULT_PAGE_SIZE } from "constants/PageConstants";
import StatusSubmitAndConfirmModal from "components/util-components/ModalItems/StatusSubmitModal";
import CDNImage from "components/layout-components/Image/CDNImage";

const { TabPane } = Tabs;
const { Option } = Select;

const AppInfoList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { appInfoData, loading: tableLoader } = useSelector(
    (state) => state.appinfo
  );

  useEffect(() => {
    dispatch(fetchAppInfo());
  }, [dispatch]);

  const handleEditAdCategory = (id) => {
    dispatch(setEditItemId(id));
    dispatch(setAdCategoryDialogVisible(true));
  };

  const categoryColumns = [
    {
      title: "Maintainance Logo",
      dataIndex: ["details", "under_maintenance", "maintenance_image"],
      render: (mediaPath) => {
        return (
          // <img
          //   src={mediaPath}
          //   alt="Image Thumbnail"
          //   style={{ width: 80, height: 50 }}
          // />
          <CDNImage
            src={mediaPath}
            alt={`Image Thumbnail`}
            height={50}
            width={80}
          />
        );
      },
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Coming Soon Image",
      dataIndex: ["details", "under_maintenance", "isComingSoonImage"],
      render: (mediaPath) => {
        return (
          <CDNImage
            src={mediaPath}
            alt={`Image Thumbnail`}
            height={100}
            width={100}
          />
        );
      },
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Maintainance Status",
      dataIndex: ["details", "under_maintenance", "enabled"],
      render: (_, record) => (
        <Tag
          color={record.details.under_maintenance.enabled ? "green" : "red"}
          style={{ cursor: "pointer" }}
        >
          {record.details.under_maintenance.enabled ? "Active" : "Inactive"}
        </Tag>
      ),
      sorter: (a, b) =>
        a.record.details.under_maintenance.enabled ===
          b.record.details.under_maintenance.enabled
          ? 0
          : a.record.details.under_maintenance.enabled
            ? -1
            : 1,
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Coming Soon Status",
      dataIndex: ["details", "under_maintenance", "isComingSoonFlag"],
      render: (_, record) => (
        <Tag
          color={
            record.details.under_maintenance.isComingSoonFlag ? "green" : "red"
          }
          style={{ cursor: "pointer" }}
        >
          {record.details.under_maintenance.isComingSoonFlag
            ? "Active"
            : "Inactive"}
        </Tag>
      ),
      sorter: (a, b) =>
        a.record.details.under_maintenance.isComingSoonFlag ===
          b.record.details.under_maintenance.isComingSoonFlag
          ? 0
          : a.record.details.under_maintenance.isComingSoonFlag
            ? -1
            : 1,
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Coming Soon Message",
      dataIndex: ["details", "under_maintenance", "isComingSoonMessage"],
      render: (_, record) => (
        <span>{record.details.under_maintenance.isComingSoonMessage}</span>
      ),
      sorter: (a, b) =>
        (
          a.record.details.under_maintenance.isComingSoonMessage || ""
        ).localeCompare(
          b.record.details.under_maintenance.isComingSoonMessage || ""
        ),
    },
    {
      title: "Footer Message",
      dataIndex: ["details", "under_maintenance", "footer_message"],
      render: (_, record) => (
        <span>{record.details.under_maintenance.footer_message}</span>
      ),
      sorter: (a, b) =>
        (a.record.details.under_maintenance.footer_message || "").localeCompare(
          b.record.details.under_maintenance.footer_message || ""
        ),
    },
    {
      title: "Reason",
      dataIndex: ["details", "under_maintenance", "reason_for_maintenance"],
      render: (_, record) => (
        <span>{record.details.under_maintenance.reason_for_maintenance}</span>
      ),
      sorter: (a, b) =>
        (
          a.details.under_maintenance.reason_for_maintenance || ""
        ).localeCompare(
          b.details.under_maintenance.reason_for_maintenance || ""
        ),
    },
    {
      title: "PlayStore url",
      dataIndex: ["details", "under_maintenance", "playstore_url"],
      render: (_, record) => (
        <a
          href={record.details.under_maintenance.playstore_url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {Utils.truncateText(
            record.details.under_maintenance.playstore_url,
            25
          )}
        </a>
      ),
      sorter: (a, b) =>
        (a.record.details.under_maintenance.playstore_url || "").localeCompare(
          b.record.details.under_maintenance.playstore_url || ""
        ),
    },
    {
      title: "AppStore url",
      dataIndex: ["details", "under_maintenance", "appstore_url"],
      render: (_, record) => (
        <a
          href={record.details.under_maintenance.appstore_url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {Utils.truncateText(
            record.details.under_maintenance.appstore_url,
            25
          )}
        </a>
      ),
      sorter: (a, b) =>
        (a.details.under_maintenance.appstore_url || "").localeCompare(
          b.details.under_maintenance.appstore_url || ""
        ),
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
              return navigate(
                `${APP_PREFIX_PATH}/app/management/layout/app-info/add-info`
              );
            }}
          >
            Update Maintainance Info
          </Button>
        </div>
      </Flex>
      <Table
        columns={categoryColumns}
        dataSource={appInfoData}
        rowKey="id"
        loading={tableLoader}
      />
    </Card>
  );
};

export default AppInfoList;
