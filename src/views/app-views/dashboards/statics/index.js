import React, { useEffect, useState } from "react";
import { Row, Col, Button, Avatar, Dropdown, Table, Tag, Spin } from 'antd';
import AnnualStatistic from 'components/shared-components/StatisticWidget';
import AvatarStatus from 'components/shared-components/AvatarStatus';
import Card from 'components/shared-components/Card';
import Flex from 'components/shared-components/Flex';
import { 
  RecentScheduleData 
} from './StaticsDashboardData';
import ApexChart from 'react-apexcharts';
import { apexLineChartDefaultOption, COLOR_2 } from 'constants/ChartConstant';
import { SPACER } from 'constants/ThemeConstant';
import { 
  UserAddOutlined, 
  FileExcelOutlined, 
  PrinterOutlined, 
  PlusOutlined, 
  EllipsisOutlined, 
  StopOutlined, 
  ReloadOutlined 
} from '@ant-design/icons';
import utils from 'utils';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAnnualStatsforEvents,
  fetchUserStatsForUsers,
  fetchUserStatsForSchedules
} from 'store/slices/staticsSlice';


const latestTransactionOption = [
  {
    key: 'Refresh',
    label: (
      <Flex alignItems="center" gap={SPACER[2]}>
        <ReloadOutlined />
        <span className="ml-2">Refresh</span>
      </Flex>
    ),
  },
  {
    key: 'Print',
    label: (
      <Flex alignItems="center" gap={SPACER[2]}>
        <PrinterOutlined />
        <span className="ml-2">Print</span>
      </Flex>
    ),
  },
  {
    key: 'Export',
    label: (
      <Flex alignItems="center" gap={SPACER[2]}>
        <FileExcelOutlined />
        <span className="ml-2">Export</span>
      </Flex>
    ),
  },
];

const newJoinMemberOptions = [
  {
    key: 'Add all',
    label: (
      <Flex alignItems="center" gap={SPACER[2]}>
        <PlusOutlined />
        <span className="ml-2">Add all</span>
      </Flex>
    ),
  },
  {
    key: 'Disable all',
    label: (
      <Flex alignItems="center" gap={SPACER[2]}>
        <StopOutlined />
        <span className="ml-2">Disable all</span>
      </Flex>
    ),
  },
];

const CardDropdown = ({ items }) => {
  return (
    <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
      <a href="/#" className="text-gray font-size-lg" onClick={e => e.preventDefault()}>
        <EllipsisOutlined />
      </a>
    </Dropdown>
  );
};

const tableColumns = [
  {
    title: 'Schedule Name',
    dataIndex: 'schedule_name',
    key: 'schedule_name',
    render: (text, record) => {
      const name = text || 'Unknown'; // Fallback for invalid names
      return (
        <div className="d-flex align-items-center">
          <Avatar size={30} className="font-size-sm" style={{ backgroundColor: record.avatarColor }}>
            {utils.getNameInitial(name)}
          </Avatar>
          <span className="ml-2">{name}</span>
        </div>
      );
    },
  },
  {
    title: 'Event Name',
    dataIndex: 'event_name',
    key: 'eventname',
  },
  {
    title: 'Start Date',
    dataIndex: 'start_date',
    key: 'startdate',
  },
  {
    title: 'End Date',
    dataIndex: 'end_date',
    key: 'enddate',
  },
  {
    title: () => <div className="text-right">Status</div>,
    key: 'status',
    render: (_, record) => (
      <div className="text-right">
        <Tag className="mr-0" color={record.status === 'Approved' ? 'cyan' : record.status === 'Pending' ? 'blue' : 'volcano'}>{record.status}</Tag>
      </div>
    ),
  },
];

export const StaticsDashboard = () => {
  const dispatch = useDispatch();
  const [recentScheduleData] = useState(RecentScheduleData);
  const { annualStatsForEvents, annualStatsForUsers, annualStatsForSchedules, loading, loadingMembers, loadingSchedules} = useSelector(state => state.statics);
  
  
  
  // Fetch the annual statistic data on component mount
  useEffect(() => {
    dispatch(fetchAnnualStatsforEvents());
    dispatch(fetchUserStatsForUsers());
    dispatch(fetchUserStatsForSchedules());    
  }, [dispatch]);

  return (
    <>  
      <Row gutter={16}>
        <Col xs={24} sm={24} md={24} lg={18}>
          <Row gutter={16}>
            {
              loading ? (
                // Show 3 spinner items when loading
                [1, 2, 3].map(i => (
                  <Col xs={24} sm={24} md={24} lg={24} xl={8} key={i}>
                    <AnnualStatistic                       
                      value2={<Spin size="small" />}
                    />
                  </Col>
                ))
              ) : (
                Array.isArray(annualStatsForEvents) && annualStatsForEvents.length > 0 ? (
                  Object.keys(annualStatsForEvents).map((key, i) => (
                    <Col xs={24} sm={24} md={24} lg={24} xl={8} key={i}>
                      <AnnualStatistic 
                        title1={annualStatsForEvents[key].title1} 
                        value1={annualStatsForEvents[key].value1}
                        title2={annualStatsForEvents[key].title2}
                        value2={annualStatsForEvents[key].value2}
                      />
                    </Col>
                  ))
                ) : (
                  <Col xs={24}>
                    <p>No data available</p>
                  </Col>
                )
              )
            }
          </Row>
        </Col>
      </Row>


      <Row gutter={16}>
        {/* Members Data Section */}
        {loadingMembers ? (
          <Col xs={24} sm={24} md={24} lg={7}>
            <Card 
              title="Member's Data" 
              extra={<CardDropdown items={newJoinMemberOptions} />}
            >
              <Spin size="large" />
            </Card>
          </Col>
        ) : (
          <Col xs={24} sm={24} md={24} lg={7}>
            <Card 
              title="Member's Data" 
              extra={<CardDropdown items={newJoinMemberOptions} />}
            >
              <div className="mt-3">
                {Array.isArray(annualStatsForUsers) && annualStatsForUsers.length > 0 ? (
                  annualStatsForUsers.map((elm, i) => (
                    <div 
                      key={i} 
                      className="d-flex align-items-center justify-content-between mb-4"
                    >
                      <AvatarStatus 
                        id={i} 
                        src={elm.img} 
                        name={elm.name} 
                        subTitle1={elm.title} 
                        subTitle2={elm.role} 
                      />
                      <div>
                        <Button 
                          icon={<UserAddOutlined />} 
                          type="default" 
                          size="small"
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No data available</p>
                )}
              </div>
            </Card>
          </Col>
        )}

        {/* Latest Transactions Section */}
        {loadingSchedules ? (
          <Col xs={24} sm={24} md={24} lg={17}>
            <Card 
              title="Latest Schedules" 
              extra={<CardDropdown items={latestTransactionOption} />}
            >
              <Spin size="large" />
            </Card>
          </Col>
        ) : (
          <Col xs={24} sm={24} md={24} lg={17}>
            <Card 
              title="Latest Schedules" 
              extra={<CardDropdown items={latestTransactionOption} />}
            >
              {Array.isArray(annualStatsForSchedules) && annualStatsForSchedules.length > 0 ? (
                <Table
                  className="no-border-last"
                  columns={tableColumns}
                  dataSource={annualStatsForSchedules}
                  rowKey="id"
                  pagination={false}
                />
              ) : (
                <p>No Schedules available</p>
              )}
            </Card>
          </Col>
        )}
      </Row>
     
    </>
  );
};

export default StaticsDashboard;