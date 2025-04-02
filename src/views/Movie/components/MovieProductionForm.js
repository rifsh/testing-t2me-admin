import React, { useState } from 'react';
import {
    Card,
    Form,
    Input,
    DatePicker,
    InputNumber,
    Select,
    Button,
    Divider,
    Typography,
    Row,
    Col,
    Space,
    message
} from 'antd';
import {
    PlusOutlined,
    SaveOutlined,
    BankOutlined,
    MoneyCollectOutlined,
    CalendarOutlined
} from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;

const MovieProductionForm = () => {
    const [form] = Form.useForm();
    const [companies, setCompanies] = useState([]);

    // Basic dropdown options
    const currenciesList = ['USD', 'EUR', 'GBP'];
    const statusOptions = [
        'Development',
        'Pre-Production',
        'Production',
        'Post-Production',
        'Completed',
        'Released'
    ];

    const handleSubmit = (values) => {
        console.log('Submitted values:', {
            ...values,
            companies
        });
        message.success('Production details saved successfully');
    };

    const addCompany = () => {
        const companyName = form.getFieldValue('companyName');
        if (companyName) {
            setCompanies([...companies, {
                id: Date.now().toString(),
                name: companyName,
                role: form.getFieldValue('companyRole') || 'Production'
            }]);
            form.setFieldsValue({ companyName: '' });
        } else {
            message.error('Company name is required');
        }
    };

    return (
        <Card title={<Title level={4}>Movie Production Details</Title>}>
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                    currency: 'USD',
                    status: 'Production'
                }}
            >
                {/* Budget Section */}
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="budget"
                            label="Budget"
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                min={0}
                                step={1000}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="currency"
                            label="Currency"
                        >
                            <Select>
                                {currenciesList.map(currency => (
                                    <Option key={currency} value={currency}>{currency}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                {/* Timeline Section */}
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="startDate"
                            label="Production Start Date"
                        >
                            <DatePicker style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="endDate"
                            label="Production End Date"
                        >
                            <DatePicker style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item
                    name="status"
                    label="Production Status"
                >
                    <Select>
                        {statusOptions.map(status => (
                            <Option key={status} value={status}>{status}</Option>
                        ))}
                    </Select>
                </Form.Item>

                <Divider />

                {/* Production Companies */}
                <Title level={5}><BankOutlined /> Production Companies</Title>
                <Row gutter={16}>
                    <Col span={16}>
                        <Form.Item name="companyName">
                            <Input placeholder="Company name" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="companyRole">
                            <Select defaultValue="Production">
                                <Option value="Production">Production</Option>
                                <Option value="Co-Production">Co-Production</Option>
                                <Option value="Distribution">Distribution</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
                <Button
                    type="primary"
                    onClick={addCompany}
                    icon={<PlusOutlined />}
                    style={{ marginBottom: 16 }}
                >
                    Add Company
                </Button>

                {companies.length > 0 && (
                    <div style={{ marginBottom: 24 }}>
                        {companies.map(company => (
                            <div key={company.id} style={{
                                padding: '8px 12px',
                                marginBottom: 8,
                                border: '1px solid #f0f0f0',
                                borderRadius: 4,
                                display: 'flex',
                                justifyContent: 'space-between'
                            }}>
                                <div>
                                    <strong>{company.name}</strong> - {company.role}
                                </div>
                                <Button
                                    type="text"
                                    danger
                                    size="small"
                                    onClick={() => setCompanies(companies.filter(c => c.id !== company.id))}
                                >
                                    Remove
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </Form>
        </Card>
    );
};

export default MovieProductionForm;