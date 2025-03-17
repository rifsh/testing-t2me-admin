import React, { useEffect } from "react";
import { Card, Table, Button, Typography } from "antd";
import { FormOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { TermsCondition } from "store/slices/authSlice";
import Flex from "components/shared-components/Flex";

const { Text, Paragraph } = Typography;

const AppInfoList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Fetch terms & conditions data from Redux store
  const { termsConditionData, termsLoading: tableLoader } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(TermsCondition());
  }, [dispatch]);

  const dataSource = Array.isArray(termsConditionData?.sections) ? termsConditionData.sections : [];

  const buttonLabel = termsConditionData ? "Update Terms and Conditions" : "Add Terms and Conditions";

  const categoryColumns = [
    {
      title: "Section Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Content",
      dataIndex: "content",
      key: "content",
    },
  ];

  return (
    <Card>
      <Flex alignItems="center" justifyContent="space-between">
        {/* "Last Updated" displayed in the top right */}
        <Text strong>Last Updated: {termsConditionData?.last_updated || "N/A"}</Text>

        <Button
          type="primary"
          icon={<FormOutlined />}
          onClick={() => navigate(`${APP_PREFIX_PATH}/app/management/layout/terms/add-terms`)}
        >
          {buttonLabel}
        </Button>
      </Flex>

      {/* Introduction Section */}
      {termsConditionData?.introduction && (
        <Card style={{ marginTop: 16, background: "#f9f9f9" }}>
          <Text strong>Introduction:</Text>
          <Paragraph style={{ marginTop: 8 }}>{termsConditionData.introduction}</Paragraph>
        </Card>
      )}

      {/* Table for Sections */}
      <Table
        columns={categoryColumns}
        dataSource={dataSource}
        rowKey="title"
        loading={tableLoader}
        style={{ marginTop: 16 }}
      />
    </Card>
  );
};

export default AppInfoList;
