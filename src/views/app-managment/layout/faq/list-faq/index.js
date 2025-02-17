import React, { useState, useEffect } from "react";
import { FormOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  Card,
  Col,
  Row,
  Button,
  Table,
  Menu,
  Select,
  Input,
  message,
  Spin,
} from "antd";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import EllipsisDropdown from "components/shared-components/EllipsisDropdown";
import Flex from "components/shared-components/Flex";
import { fetchAllFaqs, deleteFaq } from "store/slices/faqSlice";

const { Option } = Select;

const FaqList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedSection, setSelectedSection] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const { faqs, faqSections, loading, submitting } = useSelector(
    (state) => state.faqs
  );

  useEffect(() => {
    dispatch(fetchAllFaqs());
  }, [dispatch]);

  const sections = ["All", ...(faqSections || [])];

  const filteredData = faqs?.filter((item) => {
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
            navigate(`${APP_PREFIX_PATH}/app/management/layout/faq/edit-faq`, {
              state: {
                sectionId: row.sectionId,
                questionId: row.question,
                question: row.question,
                answer: row.answer,
              },
            })
          }
        >
          <EditOutlined />
          <span className="ml-2">Edit FAQ</span>
        </Flex>
      </Menu.Item>
      <Menu.Item>
        <Flex
          alignItems="center"
          onClick={() => {
            dispatch(
              deleteFaq({ sectionId: row.sectionId, questionId: row.question })
            )
              .unwrap()
              .then(() => {
                message.success("FAQ deleted successfully!");
                dispatch(fetchAllFaqs());
              })
              .catch(() => {
                message.error("Failed to delete FAQ.");
              });
          }}
        >
          {submitting ? <Spin size="small" /> : <DeleteOutlined />}
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
          <EllipsisDropdown
            menu={dropdownMenu({ ...elm, sectionId: elm.key.split("-")[0] })}
          />
        </div>
      ),
    },
  ];

  const dataSource = filteredData?.map((section) => ({
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
        className="faq-table"
        expandable={{
          expandedRowRender: (record) => (
            <div
              style={{
                margin: "0 24px",
                padding: "12px 24px",
                backgroundColor: "#fafafa",
                borderRadius: "4px",
              }}
            >
              <Table
                columns={questionColumns}
                dataSource={record.faq}
                pagination={false}
                showHeader={false}
                className="nested-faq-table"
                expandable={{
                  expandedRowRender: (questionRecord) => (
                    <div
                      style={{
                        padding: "16px 24px",
                        backgroundColor: "#fff",
                        borderRadius: "4px",
                        marginLeft: "24px",
                        borderLeft: "3px solid #1890ff",
                      }}
                    >
                      {questionRecord.answer}
                    </div>
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
