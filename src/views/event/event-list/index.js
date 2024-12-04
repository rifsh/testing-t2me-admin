import React, { useEffect } from 'react';
import { Card, Table, Select, Input, Button, Tag, Menu } from 'antd';
import { EyeOutlined, PlusCircleOutlined, SearchOutlined, FormOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchAllEvent, handleShowStatus } from 'store/slices/eventSlice';
import { APP_PREFIX_PATH } from 'configs/AppConfig';
import Flex from 'components/shared-components/Flex';
import EllipsisDropdown from 'components/shared-components/EllipsisDropdown';
import utils from 'utils';

const { Option } = Select;

const scheduleStatusList = ['All', 'Scheduled', 'Ongoing', 'Expired'];

const EventsList = () => {
  const dispatch = useDispatch();
  const { allEvents, loading, error, filteredEvents } = useSelector(state => state.event);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchAllEvent());
  }, [dispatch]);

  const dropdownMenu = row => (
    <Menu>
      <Menu.Item>
        <Flex alignItems="center">
          <EyeOutlined />
          <span className="ml-2">View Details</span>
        </Flex>
      </Menu.Item>
      <Menu.Item>
        <Flex alignItems="center">
          <PlusCircleOutlined />
          <span className="ml-2">Add to remark</span>
        </Flex>
      </Menu.Item>
    </Menu>
  );

  const tableColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
    },
    {
      title: 'Event',
      dataIndex: 'event_name',
      sorter: (a, b) => utils.antdTableSorter(a, b, 'event_name'),
    },
    {
      title: 'Category',
      dataIndex: 'category_id',
      render: categoryId => <span>{`Category ${categoryId}`}</span>, // Can replace this with an actual category name mapping
      sorter: (a, b) => utils.antdTableSorter(a, b, 'category_id'),
    },
    {
      title: 'Sub Category',
      dataIndex: 'sub_category_id',
      render: subCategoryId => <span>{`Sub Category ${subCategoryId}`}</span>, // Can replace this with an actual sub-category name mapping
      sorter: (a, b) => utils.antdTableSorter(a, b, 'sub_category_id'),
    },
    {
      title: 'Max Tickets',
      dataIndex: 'max_tickets',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (_, record) => (
        <Tag color={getEventStatus(record.status)}>{record.status ? 'Active' : 'Inactive'}</Tag>
      ),
      sorter: (a, b) => utils.antdTableSorter(a, b, 'status'),
    },
    {
      title: '',
      dataIndex: 'actions',
      render: (_, elm) => (
        <div className="text-right">
          <EllipsisDropdown menu={dropdownMenu(elm)} />
        </div>
      ),
    },
  ];

  const getEventStatus = status => {
    return status ? 'green' : 'red'; 
  };

  const onSearch = e => {
    const value = e.currentTarget.value;
    const searchArray = value ? allEvents : allEvents;
    const data = utils.wildCardSearch(searchArray, value);
  };

  const handleStatusChange = value => {
    dispatch(handleShowStatus(value));
  };

  return (
    <Card>
      <Flex alignItems="center" justifyContent="space-between" mobileFlex={false}>
        <Flex className="mb-1" mobileFlex={false}>
          <div className="mr-md-3 mb-3">
            <Input placeholder="Search" prefix={<SearchOutlined />} onChange={onSearch} />
          </div>
          <div className="mb-3">
            <Select
              defaultValue="All"
              className="w-100"
              style={{ minWidth: 180 }}
              onChange={handleStatusChange}
              placeholder="Status"
            >
              {scheduleStatusList.map(elm => (
                <Option key={elm} value={elm}>
                  {elm}
                </Option>
              ))}
            </Select>
          </div>
        </Flex>
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
      </Flex>
      <div className="table-responsive">
        <Table
          columns={tableColumns}
          dataSource={filteredEvents || allEvents} 
          rowKey="id"
          onRow={record => ({
            onClick: () => {
              navigate(`${APP_PREFIX_PATH}/event/details`);
            },
          })}
        />
      </div>
    </Card>
  );
};

export default EventsList;
