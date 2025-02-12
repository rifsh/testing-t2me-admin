import React, { useEffect, useState } from "react";
import { Card, Table, Input, Tabs, Button, Select, Menu } from "antd";
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
import SearchBarWithStatus from "components/util-components/Search/SearchBarWithStatus";
import WarningModal from "components/util-components/ModalItems/WarningModal";
import { TextConstants } from "constants/TextConstant";
import { DEFAULT_PAGE_SIZE } from "constants/PageConstants";
import StatusSubmitAndConfirmModal from "components/util-components/ModalItems/StatusSubmitModal";

const { TabPane } = Tabs;
const { Option } = Select;

const CategoryList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [modalType, setModalType] = useState("category");

  const {
    filteredAdCategories,
    pagination,
    subPagination,
    loading,
    editable_status,
    editItemId,
    modalLoading,
    dialogVisible,
    responseImpactData,
    warningPagination,
    message,
  } = useSelector((state) => state.adCategory);
  const { responseData } = useSelector((state) => state.modalSlice);

  useEffect(() => {
    dispatch(fetchAdCategories({ page: 1, size: 10 }));
  }, [dispatch]);

  const handlePagination = (page, size, type) => {
    if (type === "category") {
      dispatch(fetchAdCategories({ page: page, size: size }));
    }
  };

  const handleUpdateStatus = (item) => {
    const newStatus = !item.status;
    const data = { status: newStatus, id: item.id };
    dispatch(setSelectedItem(data));
    dispatch(setDialogVisible(true));
  };

  const handleEditAdCategory = (id) => {
    dispatch(setEditItemId(id));
    dispatch(setAdCategoryDialogVisible(true));
  };
  const handleModalSubmit = async () => {
    dispatch(setAdCategoryModalLoading(true));
    navigate(`${APP_PREFIX_PATH}/advertisement/category/edit/${editItemId}`);
    console.log(editItemId, "9234239423490823498234098234908");
    dispatch(setAdCategoryDialogVisible(false));
    dispatch(setAdCategoryModalLoading(false));
  };

  const handleModalCancel = () => {
    dispatch(setAdCategoryDialogVisible(false));
  };
  const dropdownMenu = (row) => (
    <Menu>
      <Menu.Item>
        <Flex alignItems="center" onClick={() => handleEditAdCategory(row.id)}>
          <EditOutlined />
          <span className="ml-2">Edit Category</span>
        </Flex>
      </Menu.Item>
    </Menu>
  );

  const categoryColumns = [
    {
      title: "Category Name",
      dataIndex: "name",
      render: (_, record) => <span>{record.name}</span>,
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Description",
      dataIndex: "description",
      render: (_, record) => (
        <span>{Utils.truncateText(record.description)}</span>
      ),
      sorter: (a, b) =>
        (a.description || "").localeCompare(b.description || ""),
    },
    {
      title: "Resolution",
      dataIndex: "resolution",
      render: (_, record) => <span>{record.resolution}</span>,
      sorter: (a, b) => (a.resolution || "").localeCompare(b.resolution || ""),
    },
    {
      title: "Category Code",
      dataIndex: "category_code",
      render: (_, record) => <span>{record.category_code}</span>,
      sorter: (a, b) =>
        (a.category_code || "").localeCompare(b.category_code || ""),
    },
    {
      title: "Min Size",
      dataIndex: "min_size",
      render: (_, record) => <span>{record.min_size}</span>,
      sorter: (a, b) => (a.min_size || "").localeCompare(b.min_size || ""),
    },
    {
      title: "Max Size",
      dataIndex: "max_size",
      render: (_, record) => <span>{record.max_size}</span>,
      sorter: (a, b) => (a.max_size || "").localeCompare(b.max_size || ""),
    },
    {
      title: "File Types",
      dataIndex: "file_types",
      render: (_, record) => (
        <span>{record.file_types?.join(", ") || "-"}</span>
      ),
      sorter: (a, b) =>
        (a.file_types?.[0] || "").localeCompare(b.file_types?.[0] || ""),
    },
    Utils.statusColumnUtil(handleUpdateStatus),
    {
      title: "",
      dataIndex: "actions",
      render: (_, record) => (
        <div className="text-right">
          <EllipsisDropdown menu={dropdownMenu(record)} />
        </div>
      ),
    },
  ];

  const getModalProps = () => {
    if (modalType === "category") {
      return {
        responseMessage: message,
        editable_status: editable_status,
        editFunction: updateAdCategoryStatus,
        getAllFunction: (pageData) => fetchAdCategories(pageData),
        pageData: { page: 1, size: 10 },
        tableConfig: {
          title: "Active Schedules",
          dataKey: "active_schedules",
        },
        responseData: responseImpactData,
        pagination: warningPagination,
      };
    }
  };

  return (
    <Card>
      <Flex alignItems="center" justifyContent="space-between">
        <SearchBarWithStatus fetchFunction={fetchAdCategories} />
        <div>
          <Button
            type="primary"
            icon={<FormOutlined />}
            onClick={() => {
              return navigate(`${APP_PREFIX_PATH}/advertisement/category/add`);
            }}
          >
            Add Category
          </Button>
        </div>
      </Flex>
      <Table
        columns={categoryColumns}
        dataSource={filteredAdCategories}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.page,
          pageSize: pagination.size,
          total: pagination.total,
          onChange: (page, pageSize) =>
            handlePagination(page, pageSize, "category"),
        }}
      />
      <WarningModal
        mode={"itemmodal"}
        visible={dialogVisible}
        title="Edit Place"
        details={TextConstants.DefaultEditContent1}
        warningMessage="Do you want to proceed to the edit page?"
        onSubmit={handleModalSubmit}
        onCancel={handleModalCancel}
        confirmText="Proceed to Edit"
        cancelText="Cancel"
        loading={modalLoading}
      />
      <UpdateStatusModal {...getModalProps()} />
      <StatusSubmitAndConfirmModal
        editFunction={updateAdCategoryStatus}
        getAllFunction={fetchAdCategories}
        responseData={responseData}
        responseMessage={message}
        pageData={DEFAULT_PAGE_SIZE}
        onSubmitMessage={TextConstants.StatusUpdatedSuccess}
        onCloseMessage={TextConstants.StatusUpdateCanceled}
      />
    </Card>
  );
};

export default CategoryList;
