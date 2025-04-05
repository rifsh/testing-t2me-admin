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
    Segmented,
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

const { Option } = Select;
const { Title } = Typography;

const CastDetailsForm = ({ form: parentForm, initialValues }) => {
    const [activeTab, setActiveTab] = useState("cast");
    const [castMembers, setCastMembers] = useState(initialValues?.cast || []);
    const [crewMembers, setCrewMembers] = useState(initialValues?.crew || []);
    const [editingMember, setEditingMember] = useState(null);
    const [memberForm] = Form.useForm(); // Create a separate form instance for the edit modal

    // Roles categorized for Cast and Crew
    const castRoles = [
        { value: "Lead Actor", color: "blue" },
        { value: "Lead Actress", color: "purple" },
        { value: "Supporting Actor", color: "green" },
        { value: "Supporting Actress", color: "magenta" },
        { value: "Child Artist", color: "gold" },
        { value: "Guest Appearance", color: "lime" }
    ];

    const crewRoles = [
        { value: "Director", color: "red" },
        { value: "Producer", color: "orange" },
        { value: "Music Director", color: "volcano" },
        { value: "Cinematographer", color: "geekblue" },
        { value: "Screenwriter", color: "cyan" },
        { value: "Art Director", color: "pink" },
        { value: "Costume Designer", color: "teal" },
        { value: "Editor", color: "brown" },
        { value: "Choreographer", color: "purple" }
    ];

    // Sync with parent form
    useEffect(() => {
        if (parentForm) {
            // Set values and notify parent form of changes
            parentForm.setFieldsValue({
                cast: castMembers,
                crew: crewMembers
            });

            // Force form to register these changes
            parentForm.validateFields(['cast', 'crew']).catch(() => {
                // Ignore validation errors
            });
        }
    }, [castMembers, crewMembers, parentForm]);

    // Initialize with parent form values
    useEffect(() => {
        if (initialValues) {
            setCastMembers(initialValues.cast || []);
            setCrewMembers(initialValues.crew || []);
        }
    }, [initialValues]);

    // Update form values when editing member changes
    useEffect(() => {
        if (editingMember) {
            memberForm.setFieldsValue({
                actorName: editingMember.actorId, // This needs to match the dropdown's expected value
                actorDisplayName: editingMember.actorName,
                actorImage: editingMember.actorImage,
                characterName: editingMember.characterName,
                role: editingMember.role
            });
        }
    }, [editingMember, memberForm]);

    const addMember = (type) => {
        const newMember = {
            id: Date.now(),
            actorName: '',
            actorId: '',
            actorImage: '',
            characterName: type === "cast" ? '' : undefined,
            role: ''
        };

        if (type === "cast") {
            const updatedCastMembers = [...castMembers];
            updatedCastMembers.push(newMember);
            setCastMembers(updatedCastMembers);
        } else {
            const updatedCrewMembers = [...crewMembers];
            updatedCrewMembers.push(newMember);
            setCrewMembers(updatedCrewMembers);
        }

        // Set editing state
        setEditingMember({ ...newMember, type });
    };

    const removeMember = (type, id) => {
        Modal.confirm({
            title: `Remove ${type === "cast" ? "Cast" : "Crew"} Member`,
            content: `Are you sure you want to remove this ${type === "cast" ? "cast" : "crew"} member?`,
            okText: 'Yes',
            cancelText: 'No',
            onOk() {
                if (type === "cast") {
                    const updated = castMembers.filter((member) => member.id !== id);
                    setCastMembers(updated);
                    if (editingMember && editingMember.id === id) {
                        setEditingMember(null);
                    }
                } else {
                    const updated = crewMembers.filter((member) => member.id !== id);
                    setCrewMembers(updated);
                    if (editingMember && editingMember.id === id) {
                        setEditingMember(null);
                    }
                }
            }
        });
    };

    const handleFormSubmit = (values) => {
        if (!editingMember) return;

        const type = editingMember.type;
        const updatedMember = {
            ...editingMember,
            actorId: values.actorName, // This is the ID from the dropdown
            actorName: values.actorDisplayName, // Store the display name separately
            actorImage: values.actorImage, // Store the image URL
            characterName: values.characterName,
            role: values.role
        };

        if (type === "cast") {
            // Update the cast members list
            const updatedCastMembers = castMembers.map(member =>
                member.id === editingMember.id ? updatedMember : member
            );
            setCastMembers(updatedCastMembers);
        } else {
            // Update the crew members list
            const updatedCrewMembers = crewMembers.map(member =>
                member.id === editingMember.id ? updatedMember : member
            );
            setCrewMembers(updatedCrewMembers);
        }

        // Close the edit form
        setEditingMember(null);
    };

    const handleEditMember = (type, member) => {
        setEditingMember({ ...member, type });
    };

    // Handle the selection from the CelebritiesListDropDown
    const handleCelebritySelect = (value, option) => {
        if (!editingMember) return;

        memberForm.setFieldsValue({
            actorName: value,  // This is the ID
            actorDisplayName: option.label,  // This is the display name
            actorImage: option.image  // This is the image URL
        });
    };

    const castColumns = [
        {
            title: 'Actor',
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
            dataIndex: 'characterName',
            key: 'characterName',
            render: (text) => text || '-'
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            render: (role) => (
                role ? (
                    <Tag color={castRoles.find(r => r.value === role)?.color}>
                        {role}
                    </Tag>
                ) : '-'
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
                            onClick={() => handleEditMember("cast", record)}
                        />
                    </Tooltip>
                    <Tooltip title="Delete">
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => removeMember("cast", record.id)}
                        />
                    </Tooltip>
                </Space>
            )
        }
    ];

    const crewColumns = [
        {
            title: 'Member',
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
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            render: (role) => (
                role ? (
                    <Tag color={crewRoles.find(r => r.value === role)?.color}>
                        {role}
                    </Tag>
                ) : '-'
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
                            onClick={() => handleEditMember("crew", record)}
                        />
                    </Tooltip>
                    <Tooltip title="Delete">
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => removeMember("crew", record.id)}
                        />
                    </Tooltip>
                </Space>
            )
        }
    ];

    const renderEmptyState = (type) => (
        <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
                <span>
                    No {type === "cast" ? "cast" : "crew"} members added yet.
                    Click "Add {type === "cast" ? "Cast" : "Crew"} Member" to get started!
                </span>
            }
            style={{
                padding: '60px 0',
                background: '#f9f9f9',
                borderRadius: '12px'
            }}
        >
            <Button
                type="primary"
                icon={<UserAddOutlined />}
                onClick={() => addMember(type)}
            >
                Add {type === "cast" ? "Cast" : "Crew"} Member
            </Button>
        </Empty>
    );

    const renderMemberForm = () => {
        if (!editingMember) return null;

        const type = editingMember.type;
        return (
            <Card
                title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Edit {type === "cast" ? "Cast" : "Crew"} Member</span>
                        <Button type="text" onClick={() => {
                            // Remove unsaved members when closing form
                            if (!editingMember.actorName) {
                                if (type === "cast") {
                                    setCastMembers(castMembers.filter(m => m.id !== editingMember.id));
                                } else {
                                    setCrewMembers(crewMembers.filter(m => m.id !== editingMember.id));
                                }
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
                        actorName: editingMember.actorId,
                        actorDisplayName: editingMember.actorName,
                        actorImage: editingMember.actorImage,
                        characterName: editingMember.characterName,
                        role: editingMember.role
                    }}
                >
                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="actorName"
                                label="Actor"
                                rules={[{ required: true, message: 'Please select an actor' }]}
                            >
                                <CelebritiesListDropDown
                                    value={editingMember.actorId}
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

                        {type === "cast" && (
                            <Col xs={24} sm={12}>
                                <Form.Item
                                    name="characterName"
                                    label="Character Name"
                                    rules={[{ required: true, message: 'Please enter character name' }]}
                                >
                                    <Input placeholder="Enter character name" />
                                </Form.Item>
                            </Col>
                        )}

                        <Col xs={24}>
                            <Form.Item
                                name="role"
                                label="Role"
                                rules={[{ required: true, message: 'Please select a role' }]}
                            >
                                <Select placeholder="Select role"
                                    mode="tags"
                                    tokenSeparators={[',']}
                                >
                                    {(type === "cast" ? castRoles : crewRoles).map((role) => (
                                        <Option key={role.value} value={role.value}>
                                            <Tag color={role.color}>{role.value}</Tag>
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col xs={24} style={{ textAlign: 'right' }}>
                            <Button
                                type="primary"
                                htmlType="submit"
                                onClick={(e) => {
                                    e.preventDefault();
                                    memberForm.submit();
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

    // Create hidden fields in the parent form to store cast and crew data
    const renderHiddenParentFormFields = () => (
        <>
            <Form.Item name="cast" hidden>
                <Input />
            </Form.Item>
            <Form.Item name="crew" hidden>
                <Input />
            </Form.Item>
        </>
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
            {renderHiddenParentFormFields()}

            <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <Title level={4} style={{ margin: 0 }}>
                        Film Team Management
                        <Tooltip title="Manage cast and crew details for your production">
                            <InfoCircleOutlined style={{ marginLeft: 8, fontSize: '16px', color: '#1890ff' }} />
                        </Tooltip>
                    </Title>
                </div>

                <Segmented
                    options={[
                        {
                            label: (
                                <div style={{ padding: '4px 0' }}>
                                    <UserOutlined />
                                    <div>Cast ({castMembers.filter(m => m.actorName && m.characterName && m.role).length})</div>
                                </div>
                            ),
                            value: 'cast',
                        },
                        {
                            label: (
                                <div style={{ padding: '4px 0' }}>
                                    <TeamOutlined />
                                    <div>Crew ({crewMembers.filter(m => m.actorName && m.role).length})</div>
                                </div>
                            ),
                            value: 'crew',
                        },
                    ]}
                    block
                    value={activeTab}
                    onChange={(value) => {
                        setActiveTab(value);
                        setEditingMember(null);
                    }}
                    style={{ marginBottom: '24px' }}
                />

                <div style={{ marginBottom: '20px' }}>
                    <Button
                        type="primary"
                        icon={<UserAddOutlined />}
                        onClick={() => addMember(activeTab)}
                    >
                        Add {activeTab === "cast" ? "Cast" : "Crew"} Member
                    </Button>
                </div>

                {renderMemberForm()}
            </div>

            <div style={{ minHeight: '200px' }}>
                {activeTab === "cast" && (
                    <>
                        {castMembers.filter(m => m.actorName && m.characterName && m.role).length === 0 ?
                            renderEmptyState("cast") : (
                                <Table
                                    columns={castColumns}
                                    dataSource={castMembers.filter(m => m.actorName && m.characterName && m.role)}
                                    rowKey="id"
                                    pagination={false}
                                    bordered
                                    style={{ borderRadius: '8px', overflow: 'hidden' }}
                                />
                            )}
                    </>
                )}

                {activeTab === "crew" && (
                    <>
                        {crewMembers.filter(m => m.actorName && m.role).length === 0 ?
                            renderEmptyState("crew") : (
                                <Table
                                    columns={crewColumns}
                                    dataSource={crewMembers.filter(m => m.actorName && m.role)}
                                    rowKey="id"
                                    pagination={false}
                                    bordered
                                    style={{ borderRadius: '8px', overflow: 'hidden' }}
                                />
                            )}
                    </>
                )}
            </div>
        </Card>
    );
}

export default CastDetailsForm;