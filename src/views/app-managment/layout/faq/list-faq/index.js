import React, { useState } from 'react';
import { FormOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Card, Col, Row, Button, Table, Menu, Select, Input } from 'antd';
import { useNavigate } from 'react-router-dom';
import { APP_PREFIX_PATH } from 'configs/AppConfig';
import { faqData } from 'mock/data/faqData';
import EllipsisDropdown from "components/shared-components/EllipsisDropdown";
import Flex from "components/shared-components/Flex";

const { Option } = Select;

const FaqList = () => {
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const categories = ['All', ...new Set(faqData.map(item => item.category))];

    const filteredData = faqData.filter(item => {
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
        const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              item.answer.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const groupedData = filteredData.reduce((acc, item) => {
        if (!acc[item.category]) {
            acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
    }, {});

    const dataSource = Object.keys(groupedData).map((category) => ({
        key: category,
        category,
        questions: groupedData[category],
    }));

    const dropdownMenu = (row) => (
        <Menu>
            <Menu.Item>
                <Flex alignItems="center" onClick={() => navigate(`${APP_PREFIX_PATH}/app/management/layout/faq/add-faq`)}>
                    <EditOutlined />
                    <span className="ml-2">Edit Faq</span>
                </Flex>
            </Menu.Item>
            <Menu.Item>
                <Flex alignItems="center" >
                    <DeleteOutlined />
                    <span className="ml-2">Delete Faq</span>
                </Flex>
            </Menu.Item>
        </Menu>
    );

    const categoryColumns = [
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
        },
    ];

    const questionColumns = [
        {
            title: 'Question',
            dataIndex: 'question',
            key: 'question',
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
            <Row gutter={16} justify={'space-between'} style={{ marginBottom: 16 }}>
                <Col xs={24} sm={12}>
                    <Input
                        placeholder="Search FAQ by question or answer"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ marginBottom: 16 }}
                    />
                    <Select
                        defaultValue="All"
                        style={{ width: 200 }}
                        onChange={(value) => setSelectedCategory(value)}
                    >
                        {categories.map(category => (
                            <Option key={category} value={category}>{category}</Option>
                        ))}
                    </Select>
                </Col>
                <Col xs={24} sm={8} style={{ textAlign: 'right' }}>
                    <Button
                        type="primary"
                        icon={<FormOutlined />}
                        onClick={() => navigate(`${APP_PREFIX_PATH}/app/management/layout/faq/add-faq`)}
                    >
                        Add Faq
                    </Button>
                </Col>
            </Row>
            <div className="table-responsive">
                <Table
                    columns={categoryColumns}
                    dataSource={dataSource}
                    expandable={{
                        expandedRowRender: (record) => (
                            <Table
                                columns={questionColumns}
                                dataSource={record.questions}
                                pagination={false}
                                expandable={{
                                    expandedRowRender: (questionRecord) => (
                                        <p style={{ margin: 0 }}>{questionRecord.answer}</p>
                                    ),
                                    rowExpandable: (questionRecord) => questionRecord.answer !== 'No Replies',
                                }}
                            />
                        ),
                        rowExpandable: (record) => record.questions.length > 0,
                    }}
                />
            </div>
        </Card>
    );
};

export default FaqList;