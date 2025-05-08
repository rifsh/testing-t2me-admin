import React, { useState, useEffect } from "react";
import "../sceen.css";
import { Card, Table, Button, Dropdown, Tag, Badge, Space } from "antd";
import Flex from "components/shared-components/Flex";
import {
  EditOutlined,
  EyeOutlined,
  MoreOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import Utils from "utils";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { useNavigate } from "react-router-dom";
import { screensMockData } from "./MockData";
import { useDispatch, useSelector } from "react-redux";
import {
  editScreenStatus,
  fetchScreenData,
  setScreenEditItemId,
} from "store/slices/screenSlice";
import {
  getVenues,
  setLocationDialogVisible,
  setLocationModalLoading,
} from "store/slices/locationSlice";
import WarningModal from "components/util-components/ModalItems/WarningModal";
import UpdateStatusModal from "components/util-components/ModalItems/UpdateStatusModal";
import { DEFAULT_PAGE_SIZE } from "constants/PageConstants";
import SearchBarWithStatus from "components/util-components/Search/SearchBarWithStatus";
import { TextConstants } from "constants/TextConstant";
import { setDialogVisible, setSelectedItem } from "store/slices/modalSlice";
import StatusSubmitAndConfirmModal from "components/util-components/ModalItems/StatusSubmitModal";
import usePaginationHook from "utils/hooks/usePaginationHandler";

const ScreenList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(screensMockData);
  const [filteredData, setFilteredData] = useState([]);
  const {
    response,
    loading: screenLoader,
    pagination,
    editItemId,
    responseData,
    message,
    editable_status,
  } = useSelector((state) => state.screen);
  const { dialogVisible, modalLoading } = useSelector(
    (state) => state.locations
  );
  const handlePagination = usePaginationHook(fetchScreenData);

  useEffect(() => {
    dispatch(fetchScreenData(DEFAULT_PAGE_SIZE));
  }, [dispatch]);

  useEffect(() => {
    if (response && response.items) {
      const newFormattedData = response.items.map((value) => ({
        venue_id: value.id,
        venue_name: value.name,
        movie_screens: value.movie_screen,
      }));

      const processedData = newFormattedData.flatMap((venue) =>
        venue.movie_screens.map((screen, index) => ({
          key: `${venue.venue_id}-${screen.id}`,
          venue_name: venue.venue_name,
          venue_id: venue.venue_id,
          rowSpan: index === 0 ? venue.movie_screens.length : 0,
          isFirstRow: index === 0,
          name_of_venue: screen.theatre.venue.name,
          ...screen,
        }))
      );
      setData(processedData);
      setFilteredData(processedData);
    }
  }, [response]);

  const handleViewDetails = (row) => {
    console.log("Viewing details for:", row);
    navigate(`${APP_PREFIX_PATH}/screen/detail/${row.id}`);
  };

  const handleEditScreen = (row) => {
    console.log("Editing screen:", row);
    dispatch(setScreenEditItemId(row.id));
    dispatch(setLocationDialogVisible(true));
  };

  const handleModalSubmit = async () => {
    dispatch(setLocationModalLoading(true));
    navigate(`${APP_PREFIX_PATH}/screen/edit/${editItemId}`);
    dispatch(setLocationDialogVisible(false));
    dispatch(setLocationModalLoading(false));
  };

  const handleModalCancel = () => {
    dispatch(setLocationDialogVisible(false));
  };

  // const handlePagination = (page, pageSize) => {
  //   dispatch(fetchScreenData({ page: page, size: pageSize }));
  // };

  const getDropdownMenu = (row) => [
    {
      key: "edit",
      label: (
        <Flex alignItems="center">
          <EditOutlined />
          <span className="ml-2">Edit</span>
        </Flex>
      ),
      onClick: () => handleEditScreen(row),
    },
    {
      key: "view",
      label: (
        <Flex alignItems="center">
          <EyeOutlined />
          <span className="ml-2">View Details</span>
        </Flex>
      ),
      onClick: () => handleViewDetails(row),
    },
  ];

  const getScreenTypeTag = (type) => {
    const typeColors = {
      standard: "blue",
      imax: "purple",
      vip: "gold",
      "4dx": "green",
      "3d": "cyan",
      "4k": "magenta",
      dolby: "orange",
    };

    return (
      <Tag color={typeColors[type?.toLowerCase()] || "default"}>
        {type.toUpperCase()}
      </Tag>
    );
  };

  const handleUpdateStatus = (item) => {
    const newStatus = !item.status;
    const data = { status: newStatus, id: item.id };
    dispatch(setSelectedItem(data));
    dispatch(setDialogVisible(true));
  };

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <Badge status="success" text="Active" />
    ) : (
      <Badge status="error" text="Inactive" />
    );
  };

  const tableColumns = [
    {
      title: "Theater Name",
      dataIndex: "venue_name",
      key: "venue_name",
      render: (value, row) => ({
        children: value,
        props: { rowSpan: row.rowSpan },
      }),
    },
    {
      title: "Venue Name",
      dataIndex: "name_of_venue",
      key: "name_of_venue",

    },
    {
      title: "Screen Name",
      dataIndex: "screen_name",
      key: "screen_name",

    },
    {
      title: "Capacity",
      dataIndex: "capacity",
      key: "capacity",
    },
    {
      title: "Screen Type",
      dataIndex: "screen_type",
      key: "screen_type",
      render: (type) => getScreenTypeTag(type ? type : 'N/A')
    },
    {
      title: "Reserved Seating",
      dataIndex: "reserved_seating",
      key: "reserved_seating",
      render: (reserved) => reserved ?
        <Badge status="success" text="Reserved" /> :
        <Badge status="error" text="Open" />
    },
    {
      title: "Technology",
      dataIndex: "screen_technology",
      key: "screen_technology",
      render: (type) => getScreenTypeTag(type.name ? type.name : 'N/A')

    },
    {
      title: "Audio",
      dataIndex: "audio",
      key: "audio",
      render: (type) => getScreenTypeTag(type.name ? type.name : 'N/A')

    },
    Utils.statusColumnUtil(handleUpdateStatus),
    {
      title: "",
      dataIndex: "actions",
      render: (_, row) => (
        <Dropdown menu={{ items: getDropdownMenu(row) }} trigger={["click"]}>
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <>
      <Card>
        <Flex
          alignItems="center"
          justifyContent="space-between"
          mobileFlex={false}
          className="mb-1"
        >
          <SearchBarWithStatus
            placeholder="Search with Venue or Screen name"
            fetchFunction={fetchScreenData}
          />
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate(`${APP_PREFIX_PATH}/screen/add`)}
            >
              Add Screen
            </Button>
          </Space>
        </Flex>
        <div className="table-responsive">
          <Table
            columns={tableColumns}
            dataSource={filteredData}
            rowKey="id"
            loading={screenLoader || loading}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              onChange: (page, pageSize) => handlePagination(page, pageSize),
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} screens`,
            }}
            rowClassName={(record) =>
              record.isFirstRow ? "venue-header-row" : ""
            }
          />
        </div>

        <WarningModal
          mode={"itemmodal"}
          visible={dialogVisible}
          title="Edit Screen"
          details={TextConstants.DefaultEditContent3}
          warningMessage="Do you want to proceed to the edit page?"
          onSubmit={handleModalSubmit}
          onCancel={handleModalCancel}
          confirmText="Proceed to Edit"
          cancelText="Cancel"
          loading={modalLoading}
        />
        <UpdateStatusModal
          responseMessage={message}
          editFunction={editScreenStatus}
          getAllFunction={(pageData) => getVenues(pageData)}
          pageData={{ page: 1, size: 10 }}
          tableConfig={{
            title: "Active Schedules",
            dataKey: "items",
          }}
          editable_status={editable_status}
          responseData={responseData}
          // pagination={warningPagination}
          loading={loading}
        />

        <StatusSubmitAndConfirmModal
          editFunction={editScreenStatus}
          getAllFunction={fetchScreenData}
          responseData={response}
          responseMessage={message}
          pageData={DEFAULT_PAGE_SIZE}
          onSubmitMessage={TextConstants.StatusUpdatedSuccess}
          onCloseMessage={TextConstants.StatusUpdateCanceled}
        />
      </Card>
    </>
  );
};

export default ScreenList;
