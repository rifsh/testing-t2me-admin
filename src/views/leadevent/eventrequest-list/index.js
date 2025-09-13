import React, { useEffect, useRef, useState } from "react";
import {
  Card,
  Table,
  Menu,
  Button,
  Row,
  Col,
  Tag,
  Tooltip,
  Select,
} from "antd";
import EllipsisDropdown from "components/shared-components/EllipsisDropdown";
import Flex from "components/shared-components/Flex";
import { EyeOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { DATE_FORMAT_DD_MM_YYYY } from "constants/DateConstant";
import utils from "utils";
import { useNavigate } from "react-router-dom";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { useDispatch, useSelector } from "react-redux";
import {
  getLeadEvents,
  setSearchTerm,
  setStatusFilter,
  filterLeadEvents,
  getSingleLeadEvents
} from "store/slices/leadEventSlice";
import SearchBarWithStatus from "components/util-components/Search/SearchBarWithStatus";
import { DEFAULT_PAGE_SIZE } from "constants/PageConstants";
import usePaginationHook from "utils/hooks/usePaginationHandler";
const { Option } = Select;
const LeadEvent = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeStatus, setactiveStatus] = useState();
  const handlePagination = usePaginationHook(getLeadEvents);
  const searchBarRef = useRef();

  const { filteredLeadEvents, loading, pagination, searchTerm, statusFilter } =
    useSelector((state) => state.leadEvents);

  useEffect(() => {
    dispatch(getLeadEvents(DEFAULT_PAGE_SIZE));
  }, [dispatch]);

  useEffect(() => {
    dispatch(filterLeadEvents({ searchTerm, status: statusFilter }));
  }, [searchTerm, statusFilter, dispatch]);

  // const handlePagination = (page, size) => {
  //   dispatch(getLeadEvents({ page: page, size: size }));
  // };


  const handleViewDetails = async (id) => {
    await dispatch(getSingleLeadEvents(id));
    navigate(`${APP_PREFIX_PATH}/leadevent/details/${id}`);
  };
  // /lead-details/index

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
  const handleShowStatus = (status) => {
    setactiveStatus(status);
    dispatch(
      getLeadEvents({
        page: 1,
        size: 10,
        filters: status,
      })
    );
  };
  const tableColumns = [
    {
      title: "Event Name",
      dataIndex: "event_name",
      sorter: (a, b) => utils.antdTableSorter(a, b, "event_name"),
    },
    {
      title: "Customer Name",
      dataIndex: "customer",
      render: (customer) => customer?.username || "N/A",
      sorter: (a, b) => {
        const customerA = a.customer?.username || "";
        const customerB = b.customer?.username || "";
        return customerA.localeCompare(customerB);
      },
    },
    {
      title: "Organizer",
      dataIndex: "organizer_name",
      sorter: (a, b) => utils.antdTableSorter(a, b, "organizer_name"),
    },
    {
      title: "Place",
      dataIndex: "place_name",
      render: (place_name) => place_name || "N/A",
      sorter: (a, b) => {
        const placeA = a.place_name || "";
        const placeB = b.place_name || "";
        return placeA.localeCompare(placeB);
      },
    },
    // {
    //   title: "Country",
    //   dataIndex: "place",
    //   render: (place) => place?.country?.name || "N/A",
    //   sorter: (a, b) => {
    //     const countryA = a.place?.country?.name || "";
    //     const countryB = b.place?.country?.name || "";
    //     return countryA.localeCompare(countryB);
    //   },
    // },
    {
      title: "Start Date",
      dataIndex: "start_date",
      render: (start_date) => (
        <span>{dayjs(start_date).format(DATE_FORMAT_DD_MM_YYYY)}</span>
      ),
      sorter: (a, b) => utils.antdTableSorter(a, b, "start_date"),
    },
    {
      title: "End Date",
      dataIndex: "end_date",
      render: (end_date) => (
        <span>{dayjs(end_date).format(DATE_FORMAT_DD_MM_YYYY)}</span>
      ),
      sorter: (a, b) => utils.antdTableSorter(a, b, "end_date"),
    },
    // {
    //   title: "Venues",
    //   dataIndex: "venues",
    //   render: (venues) => {
    //     if (!venues || venues.length === 0) return <span>No venues</span>;

    //     if (venues.length <= 2) {
    //       return (
    //         <span>
    //           {venues.map((venue, index) => (
    //             <Tag key={venue.id} color="blue">
    //               {venue.name}
    //             </Tag>
    //           ))}
    //         </span>
    //       );
    //     } else {
    //       const displayVenues = venues.slice(0, 2);
    //       const remainingCount = venues.length - 2;

    //       return (
    //         <span>
    //           {displayVenues.map((venue) => (
    //             <Tag key={venue.id} color="blue">
    //               {venue.name}
    //             </Tag>
    //           ))}
    //           <Tooltip
    //             title={venues
    //               .slice(2)
    //               .map((venue) => venue.name)
    //               .join(", ")}
    //           >
    //             <Tag color="purple">+{remainingCount} more</Tag>
    //           </Tooltip>
    //         </span>
    //       );
    //     }
    //   },
    // },
    // {
    //   title: "Status",
    //   dataIndex: "approval_status",
    //   render: (approval_status) => {
    //     let color = "orange";
    //     if (approval_status === "approved") color = "green";
    //     if (approval_status === "rejected") color = "red";

    //     return (
    //       <Tag color={color}>
    //         {approval_status
    //           ? approval_status.charAt(0).toUpperCase() +
    //             approval_status.slice(1)
    //           : "N/A"}
    //       </Tag>
    //     );
    //   },
    //   sorter: (a, b) => {
    //     const statusA = a.approval_status || "";
    //     const statusB = b.approval_status || "";
    //     return statusA.localeCompare(statusB);
    //   },
    // },
    {
      title: "Status",
      dataIndex: "approval_status",
      render: (approval_status) => {
        let color = "orange";
        let displayText = approval_status
          ? approval_status.charAt(0).toUpperCase() + approval_status.slice(1)
          : "N/A";

        if (approval_status === "approved") {
          color = "green";
          displayText = "Converted"; // Change text for approved status
        } else if (approval_status === "rejected") {
          color = "red";
        }

        return <Tag color={color}>{displayText}</Tag>;
      },
      sorter: (a, b) => {
        const statusA = a.approval_status || "";
        const statusB = b.approval_status || "";
        return statusA.localeCompare(statusB);
      },
    },
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

  return (
    <Card>
      <Row gutter={16} justify="start" align="" wrap={false}>
        <SearchBarWithStatus clearBtnVisibility={false} fetchFunction={getLeadEvents} ref={searchBarRef} isStatus={false} />

        <div className="mb-3">
          <Select
            defaultValue="All"
            onChange={handleShowStatus}
            className="mr-2 wide-select"
            style={{ minWidth: "150px" }}
            value={activeStatus}
          >
            <Option value={null}>All</Option>
            <Option value="rejected">Rejected</Option>
            <Option value="pending">Pending</Option>
            <Option value="approved">Approved</Option>
          </Select>
        </div>

        <div className="mb-3">
          <Button onClick={() => {
            searchBarRef.current.clearAllFilters();
            setactiveStatus(null)
          }
          }>
            Clear
          </Button>
        </div>
      </Row>
      <div className="table-responsive">
        <Table
          columns={tableColumns}
          dataSource={filteredLeadEvents}
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

export default LeadEvent;
