import React from 'react';
import {
    Form,
    Input,
    Select,
    Button,
    Table,
    Tag,
    Popconfirm,
    Row,
    Col,
    Card,
    Divider,
    Typography,
    message,
    Switch,
    Avatar
} from 'antd';
import {
    DeleteOutlined,
    PlusOutlined,
    TeamOutlined,
    UserOutlined
} from '@ant-design/icons';
import ResizedImgePicker from 'components/util-components/Image/ResizedImgePicker';
import { ThumbnailImageResolutions } from 'constants/SupportFileConstants';

const { Title } = Typography;
const { Option } = Select;

const familyRelationships = [
    'Father',
    'Mother',
    'Spouse',
    'Sibling',
    'Child',
    'Grandparent',
    'Other'
];

const CastFamilyDetails = ({ familyMembers, setFamilyMembers, form }) => {
    const normFile = (e) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e?.fileList || [];
    };

    const addFamilyMember = () => {
        // Get a reference to the family member form fields
        const familyFields = [
            'familyName',
            'familyRelationship',
            'familyProfileImage',
            'isActor'
        ];

        // Validate only these specific fields
        form.validateFields(familyFields).then(values => {
            // Create a new family member object
            const newMember = {
                id: Date.now(),
                name: values.familyName,
                relationship: values.familyRelationship,
                isActor: values.isActor || false,
                profileImage: values.familyProfileImage?.[0]?.url || ''
            };

            // Update the family members array
            setFamilyMembers([...familyMembers, newMember]);

            // Clear only the family member fields for the next entry
            const resetValues = {};
            familyFields.forEach(field => {
                resetValues[field] = field === 'familyProfileImage' ? [] :
                    field === 'isActor' ? false : undefined;
            });

            form.setFields(familyFields.map(field => ({
                name: field,
                value: resetValues[field]
            })));

            message.success('Family member added successfully');
        }).catch(() => {
            message.error('Please fill required fields');
        });
    };

    const removeFamilyMember = (id) => {
        setFamilyMembers(familyMembers.filter(member => member.id !== id));
        message.success('Family member removed');
    };

    const familyColumns = [
        {
            title: 'Profile',
            dataIndex: 'profileImage',
            key: 'profile',
            width: '15%',
            render: (image) => (
                image ?
                    <img src={image} alt="profile" style={{ width: 50, height: 50, borderRadius: '50%', objectFit: 'cover' }} /> :
                    <Avatar size={50} icon={<UserOutlined />} />
            )
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            width: '20%',
            render: (text, record) => (
                <div>
                    {text}
                    {record.isActor && <Tag color="purple" style={{ marginLeft: 8 }}>Actor</Tag>}
                </div>
            )
        },
        {
            title: 'Relationship',
            dataIndex: 'relationship',
            key: 'relationship',
            width: '20%',
            render: (relationship) => (
                <Tag color="blue">{relationship}</Tag>
            )
        },
        {
            title: 'Action',
            key: 'action',
            width: '15%',
            render: (_, record) => (
                <Popconfirm
                    title="Are you sure to delete this family member?"
                    onConfirm={() => removeFamilyMember(record.id)}
                    okText="Yes"
                    cancelText="No"
                >
                    <Button type="link" danger icon={<DeleteOutlined />} />
                </Popconfirm>
            )
        }
    ];

    return (
        <Card className="family-details-card">
            <Title level={4}>
                <TeamOutlined /> Family Members
            </Title>
            <Divider />

            <Table
                columns={familyColumns}
                dataSource={familyMembers}
                rowKey="id"
                pagination={false}
                size="middle"
                locale={{
                    emptyText: 'No family members added yet'
                }}
                style={{ marginBottom: 24 }}
            />

            <Row gutter={16} align="bottom">
                <Col xs={24} md={6}>
                    <Form.Item
                        name="familyProfileImage"
                        label="Profile Image"
                        valuePropName="fileList"
                        getValueFromEvent={normFile}
                    >
                        <ResizedImgePicker
                            maxCount={1}
                            targetResolution={ThumbnailImageResolutions.AVATAR}
                        />
                    </Form.Item>
                </Col>
                <Col xs={24} md={6}>
                    <Form.Item
                        name="familyName"
                        label="Name"
                        rules={[{ required: true, message: 'Please enter name' }]}
                    >
                        <Input placeholder="Family member's name" />
                    </Form.Item>
                </Col>
                <Col xs={24} md={6}>
                    <Form.Item
                        name="familyRelationship"
                        label="Relationship"
                        rules={[{ required: true, message: 'Please select relationship' }]}
                    >
                        <Select placeholder="Select relationship">
                            {familyRelationships.map(rel => (
                                <Option key={rel} value={rel}>{rel}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
                <Col xs={24} md={4}>
                    <Form.Item
                        name="isActor"
                        label="Is Actor?"
                        valuePropName="checked"
                        initialValue={false}
                    >
                        <Switch
                            checkedChildren="Yes"
                            unCheckedChildren="No"
                        />
                    </Form.Item>
                </Col>
                <Col xs={24} md={2}>
                    <Button
                        type="dashed"
                        onClick={addFamilyMember}
                        icon={<PlusOutlined />}
                        style={{ width: '100%' }}
                    >
                        Add
                    </Button>
                </Col>
            </Row>
        </Card>
    );
};

export default CastFamilyDetails;