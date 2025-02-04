import { Card, Col, Form, Select, Row, Typography, List } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllTax, setSelectedTaxDetails } from "store/slices/taxSlice";
import { useEffect, } from "react";
import { RulesMessageConstants } from "constants/RulesConstant";

const { Text } = Typography;

const TaxField = ({ form }) => {
  const dispatch = useDispatch();
  const { Option } = Select;

  const rules = {
    place: [{ required: true, message: RulesMessageConstants.PLACE }],
    venue: [{ required: true, message: RulesMessageConstants.VENUE }],
  };

  const { allTax, loading, selectedTax } = useSelector((state) => state.tax);

  useEffect(() => {
    dispatch(fetchAllTax({ place_id: form.getFieldValue("place_id") }));
  }, [dispatch, form]);

  const handleTaxChange = (selectedTaxIds) => {
    const selectedTaxes = allTax.filter((tax) =>
      selectedTaxIds.includes(tax.id)
    );
    dispatch(setSelectedTaxDetails(selectedTaxes)); 
  };

  return (
    <Row gutter={16}>
      <Col xs={24} sm={24} md={17}>
        <Card title="Tax (Optional)">
          <Form.Item name="tax_ids" label="Tax">
            <Select
              loading={loading}
              mode="multiple"
              style={{ width: "100%" }}
              placeholder="Please select..."
              notFoundContent={
                loading ? "Loading Taxes..." : "No Taxes Available"
              }
              onChange={handleTaxChange}  
            >
              {allTax.map((tax) => (
                <Option key={tax.id} value={tax.id}>
                  {tax.tax_name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Card>
      </Col>

      {selectedTax && selectedTax.length > 0 && (
        <Col xs={24} sm={24} md={7}>
          <Card title="Selected Taxes" style={{ marginTop: 0 }}>
            <List
              dataSource={selectedTax}
              renderItem={(tax) => (
                <List.Item
                  style={{
                    padding: "16px",
                    borderRadius: "8px",
                    marginBottom: "12px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <Text strong>Tax Name: </Text>
                    <Text>{tax.tax_name}</Text>
                  </div>
                  <div>
                    <Text strong>Code: </Text>
                    <Text>{tax.code}</Text>
                  </div>
                  <div>
                    <Text strong>Percentage: </Text>
                    <Text>{tax.percentage}%</Text>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      )}
    </Row>
  );
};

export default TaxField;
