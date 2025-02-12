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
import WarningModal from "components/util-components/ModalItems/WarningModal";
import { TextConstants } from "constants/TextConstant";
import {
  fetchSubcategories,
  setActiveTab,
  updateCategory,
  fetchCategories,
  editSubCategory,
  filterCategory,
  setFormTabKey,
  getSingleCateory,
  getSingleSubCateory,
  setEditItemId,
  setCatDialogVisible,
  setCatModalLoading,
  editCategoryStatus,
  editSubCategoryStatus,
} from "store/slices/categorySlice";
import SearchBarWithStatus from "components/util-components/Search/SearchBarWithStatus";
import StatusSubmitAndConfirmModal from "components/util-components/ModalItems/StatusSubmitModal";
import { DEFAULT_PAGE_SIZE } from "constants/PageConstants";

const { TabPane } = Tabs;
const { Option } = Select;

const CategoryList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [modalType, setModalType] = useState("category");

  const {
    filteredCategories,
    filteredSubCategories,
    pagination,
    subPagination,
    loading,
    editable_status,
    message: responseMessage,
    editItemId,
    dialogVisible,
    modalLoading,
    warningPagination,
    activeTab,
    responseImpactData,
  } = useSelector((state) => state.category);

  const { responseData } = useSelector((state) => state.modalSlice);

  useEffect(() => {
    dispatch(fetchCategories({ page: 1, size: 10 }));
    dispatch(
      fetchSubcategories({ categoryId: null, data: { page: 1, size: 10 } })
    );
  }, [dispatch]);
  const handleViewDetails = async (id) => {
    await dispatch(getSingleCateory(id));
    navigate(`${APP_PREFIX_PATH}/category/details/${id}`);
  };
  const handleViewDetailsub = async (id) => {
    await dispatch(getSingleSubCateory(id));
    console.log("Subcategory details fetched:", id);
    navigate(`${APP_PREFIX_PATH}/subcategory/details/${id}`);
  };

  const handlePagination = (page, size, type) => {
    if (type === "category") {
      dispatch(fetchCategories({ page: page, size: size }));
    }
    if (type === "subCategory") {
      dispatch(
        fetchSubcategories({
          categoryId: null,
          data: { page: page, size: size },
        })
      );
    }
  };

  const handleUpdateStatus = (item) => {
    const newStatus = !item.status;
    setModalType("category");
    const data = { status: newStatus, id: item.id };
    dispatch(setSelectedItem(data));
    dispatch(setDialogVisible(true));
  };

  const handleUpdateSubStatus = (item) => {
    const newStatus = !item.status;
    setModalType("subcategory");
    const data = { status: newStatus, id: item.id };
    dispatch(setSelectedItem(data));
    dispatch(setDialogVisible(true));
  };

  const handleTabChange = (key) => {
    dispatch(setActiveTab(key));
  };
  const handleEditCategory = (id) => {
    dispatch(setEditItemId(id));
    dispatch(setCatDialogVisible(true));
  };
  const handleModalSubmit = async () => {
    dispatch(setCatModalLoading(true));
    if (activeTab === "categories") {
      navigate(`${APP_PREFIX_PATH}/category/edit/category/${editItemId}`);
    } else {
      navigate(`${APP_PREFIX_PATH}/category/edit/subcategory/${editItemId}`);
    }

    dispatch(setCatDialogVisible(false));
    dispatch(setCatModalLoading(false));
  };

  const handleModalCancel = () => {
    dispatch(setCatDialogVisible(false));
  };

  const dropdownMenu = (row) => (
    <Menu>
      {activeTab === "categories" ? (
        <Menu.Item>
          <Flex alignItems="center" onClick={() => handleViewDetails(row.id)}>
            <EyeOutlined />
            <span className="ml-2">View Details</span>
          </Flex>
        </Menu.Item>
      ) : (
        <Menu.Item>
          <Flex alignItems="center" onClick={() => handleViewDetailsub(row.id)}>
            <EyeOutlined />
            <span className="ml-2">View subDetails</span>
          </Flex>
        </Menu.Item>
      )}
      <Menu.Item>
        <Flex alignItems="center" onClick={() => handleEditCategory(row.id)}>
          <EditOutlined />
          <span className="ml-2">
            {activeTab === "categories" ? "Edit Category" : "Edit Subcategory"}
          </span>
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

  const subCategoryColumns = [
    {
      title: "Subcategory Name",
      dataIndex: "name",
      render: (_, record) => <span>{record.name}</span>,
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Category Name",
      dataIndex: ["category", "name"],
      sorter: (a, b) => Utils.antdTableSorter(a, b, ["category", "name"]),
    },
    Utils.statusColumnUtil(handleUpdateSubStatus),
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
        responseMessage: responseMessage,
        editable_status: editable_status,
        editFunction: editCategoryStatus,
        getAllFunction: (pageData) => fetchCategories(pageData),
        pageData: { page: 1, size: 10 },
        tableConfig: {
          title: "Active Schedules",
          dataKey: "items",
        },
        responseData: responseImpactData,
        pagination: warningPagination,
      };
    }
    return {
      responseMessage: responseMessage,
      editable_status: editable_status,
      editFunction: editSubCategoryStatus,
      getAllFunction: (pageData) => fetchSubcategories(pageData),
      pageData: { categoryId: null, data: { page: 1, size: 10 } },
      tableConfig: {
        title: "Active Schedules",
        dataKey: "items",
      },
      responseData: responseImpactData,
      pagination: warningPagination,
    };
  };

  return (
    <Card>
      <Tabs activeKey={activeTab} onChange={handleTabChange}>
        <TabPane tab="Categories" key="categories">
          <Flex alignItems="center" justifyContent="space-between">
            <SearchBarWithStatus fetchFunction={fetchCategories} />
            <div>
              <Button
                type="primary"
                icon={<FormOutlined />}
                onClick={() => {
                  return navigate(`${APP_PREFIX_PATH}/category/add`);
                }}
              >
                Add Category
              </Button>
            </div>
          </Flex>
          <Table
            columns={categoryColumns}
            dataSource={filteredCategories}
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
        </TabPane>
        <TabPane tab="Subcategories" key="subcategories">
          <Flex alignItems="center" justifyContent="space-between">
            <SearchBarWithStatus
              fetchFunction={fetchSubcategories}
              additionalFilters={[
                {
                  options: filteredCategories,
                  placeholder: "Please choose a Category",
                  formName: "category_id",
                  isAutoComplete: true,
                  onClick: () => {
                    fetchCategories({});
                  },
                },
              ]}
            />
            <div>
              <Button
                type="primary"
                icon={<FormOutlined />}
                onClick={() => {
                  return navigate(`${APP_PREFIX_PATH}/category/add`);
                }}
              >
                Add Sub Category
              </Button>
            </div>
          </Flex>
          <Table
            columns={subCategoryColumns}
            dataSource={filteredSubCategories}
            rowKey="subId"
            loading={loading}
            pagination={{
              current: subPagination.page,
              pageSize: subPagination.size,
              total: subPagination.total,
              onChange: (page, pageSize) =>
                handlePagination(page, pageSize, "subCategory"),
            }}
          />
        </TabPane>
      </Tabs>
      <WarningModal
        mode={"itemmodal"}
        visible={dialogVisible}
        title={
          activeTab === "categories" ? "Edit Category" : "Edit Subcategory"
        }
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
        editFunction={
          activeTab === "categories"
            ? editCategoryStatus
            : editSubCategoryStatus
        }
        getAllFunction={
          activeTab === "categories" ? fetchCategories : fetchSubcategories
        }
        responseData={responseData}
        responseMessage={responseMessage}
        pageData={DEFAULT_PAGE_SIZE}
        onSubmitMessage={TextConstants.StatusUpdatedSuccess}
        onCloseMessage={TextConstants.StatusUpdateCanceled}
      />
    </Card>
  );
};

export default CategoryList;
