import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Select,
  Input,
  Button,
  Menu,
  message,
  Collapse,
} from "antd";
import { EyeOutlined, FormOutlined, EditOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchAllEvent, fetchLeadEventDetails } from "store/slices/leadEventSlice";
import { setDialogVisible as setStatusDialogVisible } from "store/slices/modalSlice";
import WarningModal from "components/util-components/ModalItems/WarningModal";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import Flex from "components/shared-components/Flex";
import EllipsisDropdown from "components/shared-components/EllipsisDropdown";
import utils from "utils";
import { setSelectedItem } from "store/slices/modalSlice";
import UpdateStatusModal from "components/util-components/ModalItems/UpdateStatusModal";
import { DEFAULT_PAGE_SIZE } from "constants/PageConstants";
import { getCurrentUser } from "configs/UserAccessConfig";

const { Panel } = Collapse;

const { Option } = Select;


const EventsList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const {
    pagination,
    filteredEvents,
    loading,

  } = useSelector((state) => state.leadEvents);

  useEffect(() => {
    dispatch(fetchAllEvent(DEFAULT_PAGE_SIZE));
  }, [dispatch]);

  const handleViewDetails = async (id) => {
    await dispatch(fetchLeadEventDetails(id));
    navigate(`${APP_PREFIX_PATH}/leadevent/convert/details/${id}`);
  };

  const handlePagination = (page, size) => {
    dispatch(fetchAllEvent({ page: page, size: size }));
  };


  const dropdownMenu = (row) => (
    <Menu>
      <Menu.Item>
        <Flex alignItems="center" onClick={() => handleViewDetails(row.id)}>
          <EyeOutlined />
          <span className="ml-2">View Details</span>
        </Flex>
      </Menu.Item>

    </Menu>
  );

  const tableColumns = [
    {
      title: "Event",
      dataIndex: "event_name",
      sorter: (a, b) => utils.antdTableSorter(a, b, "event_name"),
    },
    {
      title: "Category",
      dataIndex: ["category", "name"],
      sorter: (a, b) => utils.antdTableObjectSorter(a, b, ["category", "name"]),
    },
    {
      title: "Sub Category",
      dataIndex: ["sub_category", "name"],
      sorter: (a, b) =>
        utils.antdTableObjectSorter(a, b, ["sub_category", "name"]),
    },
    {
      title: "Venue",
      dataIndex: "lead_venues",
      render: (_, record) => (
        <Collapse defaultActiveKey={[]} accordion>
          {record?.lead_venues && record.lead_venues.length > 0 ? (
            record.lead_venues.map((venue, index) => (
              // extra={<span>{venue.place.name}</span>}
              <Panel header={venue.name} key={index} >
                <ul style={{ paddingLeft: 20 }}>
                  <li style={{ padding: "10px 0" }}>
                    <div>
                      <span style={{ fontWeight: "bold" }}>Place: </span>
                      <span style={{ color: "lightblue", fontWeight: "bold" }}>
                        {venue.place.name}
                      </span>
                    </div>
                  </li>
                </ul>
              </Panel>
            ))
          ) : (
            <Panel collapsible="disabled" header={"No venue available"}></Panel>
          )}
        </Collapse>
      ),
    },
    utils.statusColumnUtil,
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
  const [searchTerm, setSearchTerm] = useState();
  const [activeStatus, setactiveStatus] = useState();
  const handleSearch = (value) => {
    if (value) {
      setSearchTerm(value);
      dispatch(
        fetchAllEvent({
          search: value,
          page: 1,
          size: 10,
          active: activeStatus,
        })
      );
    }
  };
  const handleSearchIsEmpty = (value) => {
    console.log("enterd is empty search");
    if (!value) {
      console.log("is empty search");

      dispatch(
        fetchAllEvent({ search: null, page: 1, size: 10, active: activeStatus })
      );
    }
  };

  const handleShowStatus = (status) => {
    setactiveStatus(status);
    dispatch(
      fetchAllEvent({ search: searchTerm, page: 1, size: 10, active: status })
    );
    // dispatch(filterEvent({ searchTerm: null, status }));
  };
  const { Search } = Input;
  return (
    <Card>
      <Flex
        alignItems="center"
        justifyContent="space-between"
        mobileFlex={false}
      >
        <Flex className="mb-1" mobileFlex={false}>
          <div className="mr-md-3 mb-3">
            <Search
              placeholder="Search Event"
              onChange={(e) => handleSearchIsEmpty(e.target.value)}
              onSearch={(value) => handleSearch(value)}
              style={{ width: 200 }}
            />
          </div>
          <div className="mb-3">
            <Select
              defaultValue="All"
              onChange={handleShowStatus}
              className="mr-2"
            >
              <Option value={null}>All</Option>
              <Option value={true}>Active</Option>
              <Option value={false}>Inactive</Option>
            </Select>
          </div>
        </Flex>
        {/* {currentUser.role_id !== UserRoleConstants.eventOrganizerRoleId && (
          <div>
            <Button
              type="primary"
              icon={<FormOutlined />}
              block
              onClick={() => navigate(`${APP_PREFIX_PATH}/event/add`)}
            >
              Add Event
            </Button>
          </div>
        )} */}
      </Flex>
      <div className="table-responsive">
        <Table
          columns={tableColumns}
          dataSource={filteredEvents}
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
    
    </Card>
  );
};

export default EventsList;
