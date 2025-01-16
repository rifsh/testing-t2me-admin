/* eslint-disable no-unused-vars */
import React, { useEffect } from "react";
import {
  Card,
  Table,
  Select,
  Menu,
  Row,Dropdown,
  Form,
} from "antd";
import {
  EyeOutlined,

  EditOutlined,
} from "@ant-design/icons";
import EllipsisDropdown from "components/shared-components/EllipsisDropdown";
import Flex from "components/shared-components/Flex";
import dayjs from "dayjs";
import { DATE_FORMAT_DD_MM_YYYY } from "constants/DateConstant";
import utils from "utils";
import { useNavigate } from "react-router-dom";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { useDispatch, useSelector } from "react-redux";
import {
  editPlace,
  getPlaces,
  getSinglePlace,
} from "store/slices/locationSlice";
import { setDialogVisible, setSelectedItem } from "store/slices/modalSlice";
import UpdateStatusModal from "components/util-components/ModalItems/UpdateStatusModal";
import SearchBarWithStatus from "components/util-components/Search/SearchBarWithStatus";
import UserForm from "views/user/form-user";
import { DEFAULT_PAGE_SIZE } from "constants/PageConstants";

const { Option } = Select;

const EventOrganiseUpdateList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    filteredPlaces,
    detailedCountryList,
    editable_status,
    message,
    loading,
    pagination,
  } = useSelector((state) => state.locations);

  useEffect(() => {
    dispatch(getPlaces(DEFAULT_PAGE_SIZE));

    // dispatch(getCoutryDetails());
  }, [dispatch]);
  const handlePagination = (page, size) => {
    dispatch(getPlaces({ page: page, size: size }));
  };
  const handleViewDetails = async (id) => {
      await dispatch(getSinglePlace(id));
      navigate(`${APP_PREFIX_PATH}/track-team/event-organizer/details`);
  };
  const handleUpdateStatus = (item) => {
      const newStatus = !item.status;
      const data = { status: newStatus, id: item.id };
  
      dispatch(setSelectedItem(data));
    };

  const dropdownMenu = (row) => (
    <Menu>
      <Menu.Item>
        <Flex alignItems="center"   onClick={() => handleViewDetails(row.id)}>
          <EyeOutlined />
          <span className="ml-2">View Details</span>
        </Flex>
      </Menu.Item>
    </Menu>
  );

  const dropdownStatus = () => (
    <Dropdown>
      <Dropdown.Button>Actions</Dropdown.Button>
      <Dropdown.Contents>
        <Dropdown.List>
          <Dropdown.Item>
            Approve
          </Dropdown.Item>
          <Dropdown.Item>
            Reject
          </Dropdown.Item>
         
        </Dropdown.List>
      </Dropdown.Contents>
    </Dropdown>
  );
  

  const tableColumns = [
    {
      title: "Organiser Name",
      dataIndex: "name",
      sorter: (a, b) => utils.antdTableSorter(a, b, "name"),
    },

    {
      title: "Event",
     dataIndex: "name",
      sorter: (a, b) => utils.antdTableSorter(a, b, "name"),
    },
    
    utils.statusColumnUtil(handleUpdateStatus),
    //  {
    //   title: "Status",
    //   dataIndex: "actions",
    //   render: (_, elm) => (
    //     <div className="text-right">
    //       <EllipsisDropdown menu={dropdownStatus(elm)} />
    //     </div>
    //   ),
    // },
     

    {
      title: "",
      dataIndex: "actions",
      render: (_, elm) => (
        <div className="text-right">
          <EllipsisDropdown menu={dropdownMenu(elm)} />
        </div>
      ),
    },
  ];
  const [form] = Form.useForm();

  return (
    <Card>
      <Row gutter={16} justify="space-between" align="" wrap={false}>
        <SearchBarWithStatus
          fetchFunction={getPlaces}
          additionalFilters={[
        
          ]}
        />
       
      </Row>

      <div className="table-responsive">
        <Table
          columns={tableColumns}
          dataSource={filteredPlaces}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.page,
            pageSize: pagination.size,
            total: pagination.total,
            onChange: (page, pageSize) => handlePagination(page, pageSize),
          }}
        />
      </div>
      <UpdateStatusModal
        responseMessage={message}
        editFunction={editPlace}
        getAllFunction={(pageData) => getPlaces(pageData)}
        pageData={{ page: 1, size: 10 }}
        editable_status={editable_status}
      />
    </Card>
  );
};

export default EventOrganiseUpdateList;
