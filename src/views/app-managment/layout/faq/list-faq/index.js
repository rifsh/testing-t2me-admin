import React, { useState, useEffect } from "react";
import { FormOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Card, Col, Row, Button, Table, Menu, Select, Input } from "antd";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import EllipsisDropdown from "components/shared-components/EllipsisDropdown";
import Flex from "components/shared-components/Flex";
import { fetchAllFaqs } from "store/slices/faqSlice";

const { Option } = Select;

const FaqList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedSection, setSelectedSection] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const { faqs, faqSections, loading } = useSelector((state) => state.faqs);

  useEffect(() => {
    dispatch(fetchAllFaqs());
  }, [dispatch]);

  const sections = ["All", ...(faqSections || [])];

  const filteredData = faqs.filter((item) => {
    const matchesSection =
      selectedSection === "All" || item.id === selectedSection;
    const matchesSearch = item.faq.some(
      (faq) =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return matchesSection && (searchQuery === "" || matchesSearch);
  });

  const dropdownMenu = (row) => (
    <Menu>
      <Menu.Item>
        <Flex
          alignItems="center"
          onClick={() =>
            navigate(`${APP_PREFIX_PATH}/app/management/layout/faq/add-faq`)
          }
        >
          <EditOutlined />
          <span className="ml-2">Edit FAQ</span>
        </Flex>
      </Menu.Item>
      <Menu.Item>
        <Flex alignItems="center">
          <DeleteOutlined />
          <span className="ml-2">Delete FAQ</span>
        </Flex>
      </Menu.Item>
    </Menu>
  );

  const sectionColumns = [
    {
      title: "Section",
      dataIndex: "section",
      key: "section",
    },
  ];

  const questionColumns = [
    {
      title: "Question",
      dataIndex: "question",
      key: "question",
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

  const dataSource = filteredData.map((section) => ({
    key: section.id,
    section: section.section,
    faq: section.faq.map((item, index) => ({
      key: `${section.id}-${index}`,
      ...item,
    })),
  }));

  return (
    <Card>
      <Row gutter={16} justify="space-between" style={{ marginBottom: 16 }}>
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
            onChange={(value) => setSelectedSection(value)}
          >
            {sections.map((section) => (
              <Option key={section} value={section}>
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={8} style={{ textAlign: "right" }}>
          <Button
            type="primary"
            icon={<FormOutlined />}
            onClick={() =>
              navigate(`${APP_PREFIX_PATH}/app/management/layout/faq/add-faq`)
            }
          >
            Add FAQ
          </Button>
        </Col>
      </Row>
      <Table
        loading={loading}
        columns={sectionColumns}
        dataSource={dataSource}
        // pagination={false}
        expandable={{
          expandedRowRender: (record) => (
            <div style={{ margin: '0 -16px' }}>
              <Table
                columns={questionColumns}
                dataSource={record.faq}
                pagination={false}
                expandable={{
                  expandedRowRender: (questionRecord) => (
                    <p style={{ margin: '16px 0' }}>{questionRecord.answer}</p>
                  ),
                  rowExpandable: (questionRecord) => questionRecord.answer,
                }}
              />
            </div>
          ),
          rowExpandable: (record) => record.faq && record.faq.length > 0,
        }}
      />
    </Card>
  );
};

export default FaqList;