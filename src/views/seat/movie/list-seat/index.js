import React, { useEffect, useState } from "react";
import { Card, Table, Button, Modal, Descriptions, Dropdown } from "antd";
import {
  EyeOutlined,
  FormOutlined,
  MoreOutlined,
  EditOutlined,
  DownOutlined,
} from "@ant-design/icons";
import Flex from "components/shared-components/Flex";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { APP_PREFIX_PATH } from "configs/AppConfig";
import { setDialogVisible, setSelectedItem } from "store/slices/modalSlice";
import Utils from "utils";
import UpdateStatusModal from "components/util-components/ModalItems/UpdateStatusModal";
import SearchBarWithStatus from "components/util-components/Search/SearchBarWithStatus";
import { DEFAULT_PAGE_SIZE } from "constants/PageConstants";
import WarningModal from "components/util-components/ModalItems/WarningModal";
import { TextConstants } from "constants/TextConstant";
import StatusSubmitAndConfirmModal from "components/util-components/ModalItems/StatusSubmitModal";
import {
  getAllSeatStructures,
  editSeatStructureStatus,
  setEditSeatItemId,
  setSeatDialogVisible,
  setSeatModalLoading,
} from "store/slices/movieSeatSlice";
import usePaginationHook from "utils/hooks/usePaginationHandler";

const MovieSeatList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    allSeats,
    pagination,
    loading,
    editable_status,
    message,
    editSeatItemId,
    seatDialogVisible,
    warningPagination,
    seatModalLoading,
    responseImpactData,
  } = useSelector((state) => state.movieSeatSlice);
  const { responseData } = useSelector((state) => state.modalSlice);
  const handlePagination = usePaginationHook(getAllSeatStructures);

  useEffect(() => {
    dispatch(getAllSeatStructures(DEFAULT_PAGE_SIZE));
  }, [dispatch]);

  const handleUpdateStatus = (item) => {
    const newStatus = !item.status;
    const data = { status: newStatus, id: item.id };

    dispatch(setSelectedItem(data));
    dispatch(setDialogVisible(true));
  };

  const handleEditSeat = (id) => {
    dispatch(setEditSeatItemId(id));
    dispatch(setSeatDialogVisible(true));
  };

  const handleEditModalSubmit = async () => {
    dispatch(setSeatModalLoading(true));
    navigate(`${APP_PREFIX_PATH}/seat/movie/edit/${editSeatItemId}`);
    dispatch(setSeatDialogVisible(false));
    dispatch(setSeatModalLoading(false));
  };

  const handleEditModalCancel = () => {
    dispatch(setSeatDialogVisible(false));
  };

  const getDropdownMenu = (row) => [
    {
      key: "view",
      label: (
        <Flex alignItems="center">
          <EyeOutlined />
          <span className="ml-2">View Details</span>
        </Flex>
      ),
      onClick: () => navigate(`${APP_PREFIX_PATH}/seat/movie/${row.id}`),
    },
    {
      key: "edit",
      label: (
        <Flex alignItems="center">
          <EditOutlined />
          <span className="ml-2">Edit Seat Structure</span>
        </Flex>
      ),
      onClick: () => handleEditSeat(row.id),
    },
  ];

  const tableColumns = [
    {
      title: "Name",
      dataIndex: "name",
      sorter: (a, b) => Utils.antdTableSorter(a, b, "name"),
    },
    {
      title: "Screen",
      dataIndex: ["screen", "screen_name"],
      sorter: (a, b) => Utils.antdTableSorter(a, b, "screen.screen_name"),
    },
    {
      title: "Venue",
      dataIndex: ["venue", "name"],
      sorter: (a, b) => Utils.antdTableSorter(a, b, "venue.name"),
    },
    {
      title: "Total Rows",
      dataIndex: "total_row",
      sorter: (a, b) => a.total_row - b.total_row,
    },
    {
      title: "Total Columns",
      dataIndex: "total_column",
      sorter: (a, b) => a.total_column - b.total_column,
    },
    {
      title: "Total Seats",
      dataIndex: "total_seats",
      sorter: (a, b) => a.total_seats - b.total_seats,
    },
    {
      title: "Type",
      dataIndex: "type",
      sorter: (a, b) => Utils.antdTableSorter(a, b, "type"),
    },
    {
      title: "Seat Types",
      dataIndex: ["seat_data", "seatTypes"],
      render: (seatTypes) => {
        if (!seatTypes || !seatTypes.length) return "No seat types";

        return (
          <Dropdown
            menu={{
              items: seatTypes.map((type) => ({
                key: type.id,
                label: (
                  <div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <div
                        style={{
                          width: "12px",
                          height: "12px",
                          backgroundColor: type.color,
                          marginRight: "8px",
                          borderRadius: "2px",
                        }}
                      />
                      {type.label}
                    </div>
                    <div>Base Price: ${type.basePrice}</div>
                  </div>
                ),
              })),
            }}
            trigger={["click"]}
          >
            <Button>
              {seatTypes.length} Seat Types <DownOutlined />
            </Button>
          </Dropdown>
        );
      },
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

  // const handlePagination = (page, size) => {
  //   dispatch(getAllSeatStructures({ page: page, size: size }));
  // };

  return (
    <Card>
      <Flex alignItems="center" className="mb-3" justifyContent="space-between">
        <SearchBarWithStatus fetchFunction={getAllSeatStructures} />
        <Button
          type="primary"
          icon={<FormOutlined />}
          onClick={() => navigate(`${APP_PREFIX_PATH}/seat/movie/add`)}
        >
          Add Seat Structure
        </Button>
      </Flex>
      <Table
        columns={tableColumns}
        dataSource={allSeats}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.page,
          pageSize: pagination.size,
          total: pagination.total,
          onChange: (page, pageSize) => handlePagination(page, pageSize),
        }}
      />

      <WarningModal
        mode={"itemmodal"}
        visible={seatDialogVisible}
        title="Edit Seat Structure"
        details={TextConstants.DefaultEditContent1}
        warningMessage="Do you want to proceed to the edit page?"
        onSubmit={handleEditModalSubmit}
        onCancel={handleEditModalCancel}
        confirmText="Proceed to Edit"
        cancelText="Cancel"
        loading={seatModalLoading}
      />

      <UpdateStatusModal
        responseMessage={message}
        editFunction={editSeatStructureStatus}
        getAllFunction={(pageData) => getAllSeatStructures(pageData)}
        pageData={{ page: 1, size: 10 }}
        tableConfig={{
          title: "Active Schedules",
          dataKey: "items",
        }}
        editable_status={editable_status}
        responseData={responseImpactData}
        pagination={warningPagination}
        loading={loading}
      />

      <StatusSubmitAndConfirmModal
        editFunction={editSeatStructureStatus}
        getAllFunction={getAllSeatStructures}
        responseData={responseData}
        responseMessage={message}
        pageData={DEFAULT_PAGE_SIZE}
        onSubmitMessage={TextConstants.StatusUpdatedSuccess}
        onCloseMessage={TextConstants.StatusUpdateCanceled}
      />
    </Card>
  );
};

export default MovieSeatList;
