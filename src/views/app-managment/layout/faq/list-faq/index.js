import React from 'react';
import { FormOutlined } from '@ant-design/icons';
import {Card, Col, Button, Table} from "antd";
import { useNavigate } from 'react-router-dom';
import { APP_PREFIX_PATH } from 'configs/AppConfig';
import { faqData } from 'mock/data/faqData'
import SearchBarWithStatus from "components/util-components/Search/SearchBarWithStatus"; 

const { Row } = require("antd")



const FaqList = () => {
    const navigate =useNavigate();
    const tableCloumns = [
        {
            title: "Category",
            dataIndex: "category",
            key: "question",
            width: '30%'
        },
        {
            title: "Questions",
            dataIndex: "question",
            key: "question",
            width: '70%'
        }
    ];

    return (
        <Card>
            <Row gutter={16} justify = {"space-between"} style={{marginBottom: 16}}>
            <SearchBarWithStatus />
                <Col xs={24} sm={8} style={{textAlign: "right"}}>
                <Button
                type="primary"
                icon={<FormOutlined/>}
                onClick={() => navigate(`${APP_PREFIX_PATH}/app/management/layout/faq/add-faq`)}
                >
                    Add Faq
                </Button>
                </Col>
            </Row>
            <div className="table-responsive">
                <Table
                columns={tableCloumns}
                dataSource={faqData}
                expandable={{
                    expandedRowRender: (record) => (
                        <p style={{ margin: 0 }}>{record.answer}</p>
                    ),
                    rowExpandable: (record) => record.answer != 'No Replies',
                
                }}
                />
            </div>
        </Card>
    )
};

export default FaqList;