import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Dropdown, Tag, Badge, Space, Avatar, Typography } from "antd";
import { EditOutlined, EyeOutlined, MoreOutlined, PlusOutlined, UserAddOutlined } from "@ant-design/icons";
import { useNavigate } from 'react-router-dom';
import SearchBarWithStatus from 'components/util-components/Search/SearchBarWithStatus';
import { APP_PREFIX_PATH } from 'configs/AppConfig';

const { Text } = Typography;

const Index = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [actors, setActors] = useState([]);
    const [filteredData, setFilteredData] = useState([]);

    useEffect(() => {
        // Simulate API call
        setLoading(true);
        setTimeout(() => {
            const mockData = [
                {
                    id: 1,
                    name: 'Robert Downey Jr.',
                    alsoKnownAs: 'RDJ',
                    gender: 'male',
                    birthDate: '1965-04-04',
                    occupation: ['actor', 'producer'],
                    nationality: 'American',
                    notableWorks: ['Iron Man', 'Avengers', 'Sherlock Holmes'],
                    awards: ['Golden Globe', 'BAFTA'],
                    profileImage: 'https://via.placeholder.com/150',
                    status: true
                },
                {
                    id: 2,
                    name: 'Scarlett Johansson',
                    alsoKnownAs: 'ScarJo',
                    gender: 'female',
                    birthDate: '1984-11-22',
                    occupation: ['actress', 'singer'],
                    nationality: 'American',
                    notableWorks: ['Black Widow', 'Lost in Translation'],
                    awards: ['BAFTA', 'Tony Award'],
                    profileImage: 'https://via.placeholder.com/150',
                    status: true
                },
                {
                    id: 3,
                    name: 'Tom Hanks',
                    gender: 'male',
                    birthDate: '1956-07-09',
                    occupation: ['actor', 'director', 'producer'],
                    nationality: 'American',
                    notableWorks: ['Forrest Gump', 'Saving Private Ryan'],
                    awards: ['Academy Award', 'Golden Globe'],
                    profileImage: 'https://via.placeholder.com/150',
                    status: false
                }
            ];
            setActors(mockData);
            setFilteredData(mockData);
            setLoading(false);
        }, 1000);
    }, []);

    const calculateAge = (birthDate) => {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    const handleViewDetails = (actor) => {
        navigate(`${APP_PREFIX_PATH}/cast/details`);
    };

    const handleEditActor = (actor) => {
        // navigate(`/actors/edit/${actor.id}`);
    };

    const getDropdownMenu = (actor) => [
        {
            key: "edit",
            label: (
                <Space>
                    <EditOutlined />
                    <span>Edit</span>
                </Space>
            ),
            onClick: () => handleEditActor(actor),
        },
        {
            key: "view",
            label: (
                <Space>
                    <EyeOutlined />
                    <span>View Details</span>
                </Space>
            ),
            onClick: () => handleViewDetails(actor),
        }
    ];

    const getStatusBadge = (status) => (
        status ? <Badge status="success" text="Active" /> : <Badge status="error" text="Inactive" />
    );

    const tableColumns = [
        {
            title: "Profile",
            dataIndex: "profileImage",
            key: "profileImage",
            width: 80,
            render: (_, record) => (
                <Avatar
                    src={record.profileImage}
                    size={40}
                    alt={record.name}
                />
            ),
        },
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
            render: (text, record) => (
                <Space direction="vertical" size={0}>
                    <Text strong>{text}</Text>
                    {record.alsoKnownAs && (
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            AKA: {record.alsoKnownAs}
                        </Text>
                    )}
                </Space>
            ),
        },
        {
            title: "Gender",
            dataIndex: "gender",
            key: "gender",
            render: (gender) => (
                <Tag color={gender === 'male' ? 'blue' : gender === 'female' ? 'magenta' : 'purple'}>
                    {gender.charAt(0).toUpperCase() + gender.slice(1)}
                </Tag>
            ),
        },
        {
            title: "Age",
            dataIndex: "birthDate",
            key: "age",
            render: (birthDate) => calculateAge(birthDate),
        },
        {
            title: "Occupation",
            dataIndex: "occupation",
            key: "occupation",
            render: (occupations) => (
                <Space size={[0, 4]} wrap>
                    {occupations.slice(0, 2).map(occ => (
                        <Tag key={occ}>{occ}</Tag>
                    ))}
                    {occupations.length > 2 && <Tag>+{occupations.length - 2}</Tag>}
                </Space>
            ),
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status) => getStatusBadge(status),
        },
        {
            title: "Actions",
            dataIndex: "actions",
            render: (_, actor) => (
                <Dropdown menu={{ items: getDropdownMenu(actor) }} trigger={["click"]}>
                    <Button type="text" icon={<MoreOutlined />} />
                </Dropdown>
            ),
        },
    ];

    return (
        <Card>
            <Space style={{ width: "100%", justifyContent: "space-between", marginBottom: "10px" }}>
                <SearchBarWithStatus
                    placeholder="Search by name or nationality"
                // onSearch={(value) => {
                //     setFilteredData(
                //         actors.filter(actor =>
                //             actor.name.toLowerCase().includes(value.toLowerCase()) ||
                //             (actor.nationality && actor.nationality.toLowerCase().includes(value.toLowerCase()))
                //         )
                //     }}
                // }
                />
                <Button
                    type="primary"
                    icon={<UserAddOutlined />}
                    onClick={() => navigate(`${APP_PREFIX_PATH}/cast/add`)}
                >
                    Add
                </Button>
            </Space>

            <Table
                columns={tableColumns}
                dataSource={filteredData}
                rowKey="id"
                loading={loading}
                pagination={{
                    pageSize: 10,
                    showTotal: (total) => `${total} actors`,
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '50']
                }}
            />
        </Card>
    );
}

export default Index;