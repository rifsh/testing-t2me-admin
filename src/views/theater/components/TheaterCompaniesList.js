import React from 'react'
import { Button, Card, Col, Flex, Menu, Row, Table, Tag } from 'antd'
import SearchBarWithStatus from 'components/util-components/Search/SearchBarWithStatus'
import { EditOutlined, EyeOutlined, FormOutlined } from "@ant-design/icons";
import { useNavigate } from 'react-router-dom';
import { APP_PREFIX_PATH } from 'configs/AppConfig';
import { theaterCompanyDataSource } from 'mock/data/thaeterMockData';
import EllipsisDropdown from 'components/shared-components/EllipsisDropdown';

const TheaterCompaniesList = () => {
    const navigate = useNavigate();

    const handleViewDetails = async (id) => {

    };

    const handleViewEdit = async (id) => {
        
    };

    const dropdownMenu = (row) => (
        <Menu>
            <Menu.Item>
                <Flex alignItems="center" onClick={() => handleViewDetails(row.id)}>
                    <EyeOutlined role='button' />
                    <span className="ml-2">View Details</span>
                </Flex>
            </Menu.Item>
            <Menu.Item>
                <Flex alignItems="center" onClick={() => handleViewEdit(row.id)}>
                    <EditOutlined role='button' />
                    <span className="ml-2">Edit</span>
                </Flex>
            </Menu.Item>
        </Menu>
    );

    const columns = [
        {
            title: "Company Name",
            dataIndex: "companyName",
            key: "companyName",
        },
        {
            title: "Phone",
            dataIndex: "phone",
            key: "phone",
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
        },
        {
            title: "Website",
            dataIndex: "website",
            key: "website",
            render: (text) => (
                <a href={text} target="_blank" rel="noopener noreferrer">
                    {text}
                </a>
            ),
        },
        {
            title: "Theaters",
            dataIndex: "theaters",
            key: "theaters",
            render: (theaters) =>
                theaters.map((theater) => (
                    <Tag color="geekblue" key={theater.id}>
                        {theater.name}
                    </Tag>
                )),
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
        <>
            <Card>
                <Row gutter={16} justify={"space-between"} style={{ marginBottom: 16 }}>
                    <SearchBarWithStatus
                        placeholder="Enter theater company"

                    />

                    <Col xs={24} sm={8} style={{ textAlign: "right" }}>
                        <Button
                            type="primary"
                            icon={<FormOutlined />}
                            onClick={() => navigate(`${APP_PREFIX_PATH}/movie-theater/add`)}
                        >
                            Add Company
                        </Button>
                    </Col>
                </Row>
                <Table
                    columns={columns}
                    dataSource={theaterCompanyDataSource}
                    pagination={{ pageSize: 5 }}
                    
                />
            </Card>
        </>
    )
}

export default TheaterCompaniesList