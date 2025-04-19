import React, { useEffect, useState } from "react";
import {
    Input,
    Select,
    Button,
    Card,
    Row,
    Col,
    Avatar,
    Modal,
    Tooltip,
    Tag,
    Empty,
    Typography,
    Form,
    Table,
    Space
} from "antd";
import {
    DeleteOutlined,
    UserOutlined,
    InfoCircleOutlined,
    TeamOutlined,
    UserAddOutlined,
    EditOutlined
} from "@ant-design/icons";
import CelebritiesListDropDown from "components/util-components/FormItems/CelebritiesListDropDown";
import { MOVIE_CONSTANTS } from "constants/MovieConstants";
import { MODE } from "constants/TextConstant";

const { Option } = Select;
const { Title } = Typography;

const CastDetailsForm = ({ form: parentForm, initialValues, mode }) => {
    const [teamMembers, setTeamMembers] = useState(initialValues?.cast || []);
    const [editingMember, setEditingMember] = useState(null);
    const [memberForm] = Form.useForm();

    useEffect(() => {
        if (parentForm) {
            parentForm.setFieldsValue({
                cast: teamMembers
            });

            parentForm.validateFields(['cast']).catch(() => { });
        }
    }, [teamMembers, parentForm]);

    useEffect(() => {
        if (initialValues) {
            if (initialValues.cast && mode === MODE.EDIT) {
                const formattedCast = initialValues.cast.map(member => ({
                    id: member.id || null,
                    personality_id: member.personality?.id,
                    actorName: member.personality?.name,
                    actorImage: member.personality?.thumbnail_image,
                    character_name: member.character_name,
                    role: member.role,
                    type: member.type || 'CAST'
                }));

                setTeamMembers(formattedCast);
                console.log('formvalues', formattedCast)
                if (parentForm) {
                    parentForm.setFieldsValue({
                        cast: formattedCast
                    });
                }
            } else {
                setTeamMembers(initialValues.cast || []);
            }
        }
    }, [parentForm]);

    useEffect(() => {
        if (editingMember) {
            memberForm.setFieldsValue({
                personality_id: editingMember.personality_id,
                actorDisplayName: editingMember.actorName,
                actorImage: editingMember.actorImage,
                character_name: editingMember.character_name,
                role: editingMember.role,
                type: editingMember.type
            });
            console.log("editingMember", editingMember)
        }
    }, [editingMember, memberForm]);

    const addMember = () => {
        const newMember = {
            personality_id: '',
            actorName: '',
            actorImage: '',
            character_name: '',
            role: '',
            type: 'CAST'
        };

        setTeamMembers([...teamMembers, newMember]);
        setEditingMember(newMember);

        setTimeout(() => {
            const dropdownInput = document.querySelector('.ant-select-selection-search-input');
            if (dropdownInput) {
                dropdownInput.focus();
            }
        }, 100);
    };

    const removeMember = (id) => {
        Modal.confirm({
            title: `Remove Team Member`,
            content: `Are you sure you want to remove this team member?`,
            okText: 'Yes',
            cancelText: 'No',
            onOk() {
                const updated = teamMembers.filter((member) => member.personality_id !== id);
                setTeamMembers(updated);
                if (editingMember && editingMember.id === id) {
                    setEditingMember(null);
                }
            }
        });
    };

    const handleFormSubmit = (values) => {
        if (!editingMember) return;

        const updatedMember = {
            ...editingMember,
            personality_id: values.personality_id,
            actorName: values.actorDisplayName,
            actorImage: values.actorImage,
            character_name: values.character_name,
            role: values.role,
            type: values.type
        };

        // Update or add the member
        if (editingMember.personality_id) {
            // Existing member - update
            const updatedTeamMembers = teamMembers.map(member =>
                member.personality_id === editingMember.personality_id ? updatedMember : member
            );
            setTeamMembers(updatedTeamMembers);
            console.log("Edit member", updatedTeamMembers)

        } else {
            // New member - add
            setTeamMembers([...teamMembers, updatedMember]);
        }

        setEditingMember(null);
    };

    const handleEditMember = (member) => {
        setEditingMember({ ...member });
    };

    // Handle the selection from the CelebritiesListDropDown
    const handleCelebritySelect = (value, option) => {
        if (!editingMember) return;

        memberForm.setFieldsValue({
            personality_id: value,
            actorDisplayName: option.label,
            actorImage: option.image
        });
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'actorName',
            key: 'actorName',
            render: (text, record) => (
                <Space>
                    <Avatar
                        size="large"
                        src={record.actorImage}
                        style={{
                            background: 'linear-gradient(135deg, #1890ff, #722ed1)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            fontSize: '18px'
                        }}
                    >
                        {text ? text.charAt(0).toUpperCase() : 'A'}
                    </Avatar>
                    <span>{text || 'Unnamed'}</span>
                </Space>
            )
        },
        {
            title: 'Character',
            dataIndex: 'character_name',
            key: 'character_name',
            render: (text, record) => (
                record.type === "CAST" ? (text || '-') : '-'
            )
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            render: (role) => role || '-'
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            render: (type) => (
                <Tag color={type === "CAST" ? "blue" : "green"}>
                    {type}
                </Tag>
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title="Edit">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => handleEditMember(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Delete">
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => removeMember(record.personality_id)}
                        />
                    </Tooltip>
                </Space>
            )
        }
    ];

    const renderEmptyState = () => (
        <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
                <span>
                    No team members added yet.
                    Click "Add Team Member" to get started!
                </span>
            }
            style={{
                padding: '60px 0',
                background: '#f9f9f9',
                borderRadius: '12px'
            }}
        />
    );

    const renderMemberForm = () => {
        if (!editingMember) return null;

        return (
            <Card
                title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Edit Team Member</span>
                        <Button type="text" onClick={() => {
                            // Remove unsaved members when closing form
                            if (!editingMember.personality_id) {
                                setTeamMembers(teamMembers.filter(m => m.id !== editingMember.id));
                            }
                            setEditingMember(null);
                        }}>✕</Button>
                    </div>
                }
                style={{ marginBottom: '20px' }}
            >
                <Form
                    form={memberForm}
                    layout="vertical"
                    onFinish={handleFormSubmit}
                    initialValues={{
                        personality_id: editingMember.personality_id,
                        actorDisplayName: editingMember.actorName,
                        actorImage: editingMember.actorImage,
                        character_name: editingMember.character_name,
                        role: editingMember.role,
                        type: editingMember.type
                    }}
                >
                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="personality_id"
                                label="Person"
                                rules={[{ required: true, message: 'Please select a person' }]}
                            >
                                <CelebritiesListDropDown
                                    value={editingMember.personality_id}
                                    onChange={handleCelebritySelect}
                                />
                            </Form.Item>
                            {/* Hidden fields to store display name and image */}
                            <Form.Item name="actorDisplayName" hidden>
                                <Input />
                            </Form.Item>
                            <Form.Item name="actorImage" hidden>
                                <Input />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="type"
                                label="Type"
                                rules={[{ required: true, message: 'Please select a type' }]}
                            >
                                <Select>
                                    <Option value="CAST">CAST</Option>
                                    <Option value="CREW">CREW</Option>
                                </Select>
                            </Form.Item>
                        </Col>

                        <Form.Item
                            noStyle
                            shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}
                        >
                            {({ getFieldValue }) => {
                                const type = getFieldValue('type');
                                return type === "CAST" ? (
                                    <Col xs={24} sm={12}>
                                        <Form.Item
                                            name="character_name"
                                            label="Character Name"
                                            rules={[{ required: true, message: 'Please enter character name' }]}
                                        >
                                            <Input placeholder="Enter character name" />
                                        </Form.Item>
                                    </Col>
                                ) : null;
                            }}
                        </Form.Item>

                        <Form.Item
                            noStyle
                            shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}
                        >
                            {({ getFieldValue }) => {
                                const type = getFieldValue('type');
                                return type === "CAST" ? (
                                    <Col xs={24}>
                                        <Form.Item
                                            name="role"
                                            label="Role"
                                            rules={[{ required: true, message: 'Please select a role' }]}
                                        >
                                            <Select
                                                mode="tags"
                                                placeholder="Select or enter role"
                                                tokenSeparators={[',']}
                                            >
                                                {MOVIE_CONSTANTS.castRoles.map(occ => (
                                                    <Option key={occ.value} value={occ.value}>
                                                        {occ.label}
                                                    </Option>
                                                ))}
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                ) : (
                                    <Col xs={24}>
                                        <Form.Item
                                            name="role"
                                            label="Role"
                                            rules={[{ required: true, message: 'Please select a role' }]}
                                        >
                                            <Select placeholder="Select role"
                                                mode="tags"
                                                tokenSeparators={[',']}
                                                allowClear={false}
                                            >
                                                {MOVIE_CONSTANTS.crewRoles.map((role) => (
                                                    <Option key={role.value} value={role.value}>
                                                        <Tag color={role.color}>{role.value}</Tag>
                                                    </Option>
                                                ))}
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                );
                            }}
                        </Form.Item>

                        <Col xs={24} style={{ textAlign: 'right' }}>
                            <Button
                                type="primary"
                                htmlType="submit"
                                onClick={(e) => {
                                    e.preventDefault();
                                    memberForm.submit();
                                    console.log("members", memberForm.getFieldValue())
                                }}
                            >
                                Save
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </Card>
        );
    };

    // Create hidden field in the parent form to store cast data
    const renderHiddenParentFormField = () => (
        <Form.Item name="cast" hidden>
            <Input />
        </Form.Item>
    );

    const filteredMembers = teamMembers.filter(m =>
        m.personality_id && m.role && (m.type !== "CAST" || m.character_name)
    );

    return (
        <Card
            bordered={false}
            style={{
                borderRadius: '12px',
                background: '#fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
            bodyStyle={{ padding: '24px' }}
        >
            {renderHiddenParentFormField()}

            <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <Title level={4} style={{ margin: 0 }}>
                        Film Team Management
                        <Tooltip title="Manage cast and crew details for your production">
                            <InfoCircleOutlined style={{ marginLeft: 8, fontSize: '16px', color: '#1890ff' }} />
                        </Tooltip>
                    </Title>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <Button
                        type="primary"
                        icon={<UserAddOutlined />}
                        onClick={() => addMember()}
                    >
                        Add Team Member
                    </Button>
                </div>

                {renderMemberForm()}
            </div>

            <div style={{ minHeight: '200px' }}>
                {mode === MODE.ADD ? (
                    filteredMembers.length === 0 ? (
                        renderEmptyState()
                    ) : (
                        <Table
                            columns={columns}
                            dataSource={filteredMembers}
                            rowKey="id"
                            pagination={false}
                            bordered
                            style={{ borderRadius: '8px', overflow: 'hidden' }}
                        />
                    )
                ) : (
                    <Table
                        columns={columns}
                        dataSource={filteredMembers}
                        rowKey="id"
                        pagination={false}
                        bordered
                        style={{ borderRadius: '8px', overflow: 'hidden' }}
                    />
                )}
            </div>

        </Card>
    );
};

export default CastDetailsForm;