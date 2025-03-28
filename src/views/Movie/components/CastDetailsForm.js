import React, { useEffect, useState } from "react";
import {
    Input,
    Select,
    Button,
    Card,
    Row,
    Col,
    Avatar,
    Upload,
    message,
    Modal,
    Tooltip,
    Tag
} from "antd";
import {
    DeleteOutlined,
    PlusOutlined,
    UserOutlined,
    UploadOutlined,
    EditOutlined,
    EyeOutlined,
    InfoCircleOutlined
} from "@ant-design/icons";

const { TextArea } = Input;
const { Option } = Select;

const CastDetailsForm = () => {
    const [castMembers, setCastMembers] = useState([]);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewMember, setPreviewMember] = useState(null);

    const roles = [
        { value: "Lead Actor", color: "blue" },
        { value: "Lead Actress", color: "purple" },
        { value: "Supporting Actor", color: "green" },
        { value: "Supporting Actress", color: "magenta" },
        { value: "Director", color: "red" },
        { value: "Producer", color: "orange" },
        { value: "Music Director", color: "volcano" },
        { value: "Cinematographer", color: "geekblue" },
        { value: "Screenwriter", color: "cyan" }
    ];

    const addCastMember = () => {
        const newMember = {
            id: Date.now(),
            actorName: '',
            characterName: '',
            role: '',
            image: null,
            imageUrl: '',
            bio: '',
            socialLinks: {
                instagram: '',
                twitter: '',
                imdb: ''
            }
        };
        setCastMembers([...castMembers, newMember]);
    };

    const removeCastMember = (id) => {
        Modal.confirm({
            title: 'Remove Cast Member',
            content: 'Are you sure you want to remove this cast member?',
            okText: 'Yes',
            cancelText: 'No',
            onOk() {
                setCastMembers(castMembers.filter((member) => member.id !== id));
            }
        });
    };

    const handleCastMemberChange = (id, field, value) => {
        const updatedCastMembers = castMembers.map((member) =>
            member.id === id ? { ...member, [field]: value } : member
        );
        setCastMembers(updatedCastMembers);
    };

    const beforeUpload = (file) => {
        const isImage = file.type.startsWith('image/');
        const isLt2M = file.size / 1024 / 1024 < 2;

        if (!isImage) {
            message.error('You can only upload image files!');
            return false;
        }
        if (!isLt2M) {
            message.error('Image must smaller than 2MB!');
            return false;
        }
        return true;
    };

    const handleImageUpload = (id, info) => {
        if (info.file.status === 'done' || info.file.status === 'error') {
            const file = info.file.originFileObj;
            const imageUrl = URL.createObjectURL(file);

            const updatedCastMembers = castMembers.map((member) =>
                member.id === id
                    ? { ...member, image: file, imageUrl: imageUrl }
                    : member
            );

            setCastMembers(updatedCastMembers);
            message.success(`${info.file.name} uploaded successfully`);
        }
    };

    const handlePreview = (member) => {
        setPreviewMember(member);
        setPreviewVisible(true);
    };

    useEffect(() => {
        return () => {
            castMembers.forEach(member => {
                if (member.imageUrl) {
                    URL.revokeObjectURL(member.imageUrl);
                }
            });
        };
    }, [castMembers]);

    const CastMemberPreview = ({ member }) => (
        <Row gutter={16}>
            <Col span={8}>
                <Avatar
                    size={200}
                    src={member.imageUrl}
                    icon={<UserOutlined />}
                    style={{ objectFit: 'cover' }}
                />
            </Col>
            <Col span={16}>
                <h2>{member.actorName}</h2>
                <p><strong>Character:</strong> {member.characterName}</p>
                <Tag color={roles.find(r => r.value === member.role)?.color}>
                    {member.role}
                </Tag>
                <div style={{ marginTop: 16 }}>
                    <h3>Bio</h3>
                    <p>{member.bio || 'No bio available'}</p>
                </div>
            </Col>
        </Row>
    );

    return (
        <Card
            title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
                        Cast Details
                        <Tooltip title="Add details of actors in the movie">
                            <InfoCircleOutlined style={{ marginLeft: 8, color: '#1890ff' }} />
                        </Tooltip>
                    </span>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={addCastMember}
                    >
                        Add Cast Member
                    </Button>
                </div>
            }
            bordered={false}
            style={{
                borderRadius: '12px',
            }}
        >
            {castMembers.length === 0 && (
                <div
                    style={{
                        textAlign: 'center',
                        color: '#bfbfbf',
                        padding: '40px'
                    }}
                >
                    <UserOutlined style={{ fontSize: '48px', marginBottom: 16 }} />
                    <p>No cast members added yet. Click "Add Cast Member" to get started!</p>
                </div>
            )}

            {castMembers.map((member) => (
                <Card
                    key={member.id}
                    style={{
                        marginBottom: '20px',
                        borderRadius: '12px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                    }}
                    actions={[
                        <Tooltip title="View Details">
                            <EyeOutlined key="view" onClick={() => handlePreview(member)} />
                        </Tooltip>,
                        <Tooltip title="Remove Cast Member">
                            <DeleteOutlined key="delete" onClick={() => removeCastMember(member.id)} />
                        </Tooltip>
                    ]}
                >
                    <Row gutter={16} align="middle">
                        <Col xs={24} sm={4}>
                            <Upload
                                name="avatar"
                                listType="picture-card"
                                showUploadList={false}
                                beforeUpload={beforeUpload}
                                onChange={(info) => handleImageUpload(member.id, info)}
                                accept="image/*"
                            >
                                {member.imageUrl ? (
                                    <Avatar
                                        size={100}
                                        src={member.imageUrl}
                                        style={{
                                            borderRadius: '8px',
                                            objectFit: 'cover'
                                        }}
                                    />
                                ) : (
                                    <div>
                                        <PlusOutlined style={{ fontSize: '24px' }} />
                                        <div style={{ marginTop: '8px' }}>Upload Photo</div>
                                    </div>
                                )}
                            </Upload>
                        </Col>

                        <Col xs={24} sm={20}>
                            <Row gutter={16}>
                                <Col xs={24} sm={8}>
                                    <div style={{ marginBottom: '8px' }}>Actor Name</div>
                                    <Input
                                        placeholder="Enter actor's real name"
                                        value={member.actorName}
                                        onChange={(e) => handleCastMemberChange(member.id, 'actorName', e.target.value)}
                                        prefix={<UserOutlined style={{ color: '#1890ff' }} />}
                                    />
                                </Col>

                                <Col xs={24} sm={8}>
                                    <div style={{ marginBottom: '8px' }}>Character Name</div>
                                    <Input
                                        placeholder="Enter character name"
                                        value={member.characterName}
                                        onChange={(e) => handleCastMemberChange(member.id, 'characterName', e.target.value)}
                                        prefix={<EditOutlined style={{ color: '#1890ff' }} />}
                                    />
                                </Col>

                                <Col xs={24} sm={8}>
                                    <div style={{ marginBottom: '8px' }}>Role</div>
                                    <Select
                                        placeholder="Select role"
                                        value={member.role}
                                        onChange={(value) => handleCastMemberChange(member.id, 'role', value)}
                                        style={{ width: '100%' }}
                                    >
                                        {roles.map((role) => (
                                            <Option key={role.value} value={role.value}>
                                                <Tag color={role.color}>{role.value}</Tag>
                                            </Option>
                                        ))}
                                    </Select>
                                </Col>

                                <Col xs={24} style={{ marginTop: '16px' }}>
                                    <div style={{ marginBottom: '8px' }}>Bio (Optional)</div>
                                    <TextArea
                                        rows={2}
                                        placeholder="Brief description about the actor/character"
                                        value={member.bio}
                                        onChange={(e) => handleCastMemberChange(member.id, 'bio', e.target.value)}
                                    />
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Card>
            ))}

            {previewMember && (
                <Modal
                    visible={previewVisible}
                    title="Cast Member Details"
                    onCancel={() => setPreviewVisible(false)}
                    footer={null}
                    width={800}
                >
                    <CastMemberPreview member={previewMember} />
                </Modal>
            )}
        </Card>
    );
}

export default CastDetailsForm;