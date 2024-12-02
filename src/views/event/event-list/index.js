/* eslint-disable no-unused-vars */
import React, { useState } from 'react'
import { Card, Table, Select, Input, Button, Badge, Menu, Tag } from 'antd';
import EventListData from "assets/data/event-list.json"
import { EyeOutlined, FormOutlined, SearchOutlined, PlusCircleOutlined } from '@ant-design/icons';
import AvatarStatus from 'components/shared-components/AvatarStatus';
import EllipsisDropdown from 'components/shared-components/EllipsisDropdown';
import Flex from 'components/shared-components/Flex'
import NumberFormat from 'react-number-format';
import dayjs from 'dayjs';
import { DATE_FORMAT_DD_MM_YYYY } from 'constants/DateConstant'
import utils from 'utils'
import { useNavigate } from 'react-router-dom';
import { APP_PREFIX_PATH } from "configs/AppConfig";
const { Option } = Select

const getShippingStatus = status => {
	if (status === 'Scheduled') {
		return 'green'
	}
	if (status === 'Ongoing') {
		return 'blue'
	}
	return ''
}

const scheduleStatusList = ['Scheduled', 'Ongoing', 'Expired']

const EventsList = () => {

	const [list, setList] = useState(EventListData)
	const [selectedRows, setSelectedRows] = useState([])
	const [selectedRowKeys, setSelectedRowKeys] = useState([])

	const handleShowStatus = value => {
		if (value !== 'All') {
			const key = 'status'
			const data = utils.filterArray(EventListData, key, value)
			setList(data)
		} else {
			setList(EventListData)
		}
	}

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
			dataIndex: 'id'
		},
		{
			title: 'Event',
			dataIndex: 'name',

			sorter: (a, b) => utils.antdTableSorter(a, b, 'name')
		},
		{
			title: 'Category',
			dataIndex: 'category',

			sorter: (a, b) => utils.antdTableSorter(a, b, 'category')
		},
		{
			title: 'Sub Cat',
			dataIndex: 'subCategory',
			sorter: (a, b) => utils.antdTableSorter(a, b, 'subCategory')
		},
		{
			title: 'Country',
			dataIndex: 'country',

			sorter: (a, b) => utils.antdTableSorter(a, b, 'country')
		},
		{
			title: 'Place',
			dataIndex: 'place',

			sorter: (a, b) => utils.antdTableSorter(a, b, 'place')
		},
		{
			title: 'Venue',
			dataIndex: 'venue',

			sorter: (a, b) => utils.antdTableSorter(a, b, 'venue')
		},
		{
			title: 'Status',
			dataIndex: 'status',
			render: (_, record) => (
				<><Tag color={getShippingStatus(record.status)}>{record.status}</Tag></>
			),
			sorter: (a, b) => utils.antdTableSorter(a, b, 'status')
		},
		{
			title: '',
			dataIndex: 'actions',
			render: (_, elm) => (
				<div className="text-right">
					<EllipsisDropdown menu={dropdownMenu(elm)} />
				</div>
			)
		}
	];

	const rowSelection = {
		onChange: (key, rows) => {
			setSelectedRows(rows)
			setSelectedRowKeys(key)
		}
	};

	const onSearch = e => {
		const value = e.currentTarget.value
		const searchArray = e.currentTarget.value ? list : EventListData
		const data = utils.wildCardSearch(searchArray, value)
		setList(data)
		setSelectedRowKeys([])
	}
	const navigate = useNavigate();

	return (
		<Card>
			<Flex alignItems="center" justifyContent="space-between" mobileFlex={false}>
				<Flex className="mb-1" mobileFlex={false}>
					<div className="mr-md-3 mb-3">
						<Input placeholder="Search" prefix={<SearchOutlined />} onChange={e => onSearch(e)} />
					</div>
					<div className="mb-3">
						<Select
							defaultValue="All"
							className="w-100"
							style={{ minWidth: 180 }}
							onChange={handleShowStatus}
							placeholder="Status"
						>
							<Option value="All">All Events </Option>
							{scheduleStatusList.map(elm => <Option key={elm} value={elm}>{elm}</Option>)}
						</Select>
					</div>
				</Flex>
				<div>
					<Button type="primary" icon={<FormOutlined />} block onClick={() => navigate(`${APP_PREFIX_PATH}/event/add`)}>Add Event</Button>
				</div>
			</Flex>
			<div className="table-responsive">
				<Table
					columns={tableColumns}
					dataSource={list}
					rowKey='id'
					rowSelection={{
						selectedRowKeys: selectedRowKeys,
						type: 'checkbox',
						preserveSelectedRowKeys: false,
						...rowSelection,
					}}
					onRow={(record) => ({
						onClick: () => {navigate(`${APP_PREFIX_PATH}/event/details`)},  
					})}
				/>
			</div>
		</Card>
	)
}

export default EventsList
