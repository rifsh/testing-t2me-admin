import React, { useState } from 'react';
import {
    Upload,
    Button,
    Form,
    Input,
    Select,
    Space,
    Card,
    Typography,
    Modal,
    Row,
    Col,
    Divider,
    message
} from 'antd';
import {
    UploadOutlined,
    VideoCameraOutlined,
    FileImageOutlined,
    CheckCircleOutlined,
    PlusOutlined,
    CloseOutlined
} from '@ant-design/icons';
import TextEditor from 'components/util-components/FormItems/TextEditor';

const { Title, Text } = Typography;
const { Option } = Select;
const { Dragger } = Upload;

const MovieMediaUploader = ({ form }) => {
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewIndex, setPreviewIndex] = useState(0);
    const [fileList, setFileList] = useState([]);
    const [thumbnailUrl, setThumbnailUrl] = useState('');

    const mediaTypes = [
        { label: 'Trailer', value: 'trailer' },
        { label: 'Teaser', value: 'teaser' },
        { label: 'Behind the Scenes', value: 'bts' },
        { label: 'Poster', value: 'poster' },
        { label: 'Screenshot', value: 'screenshot' },
        { label: 'Cover Art', value: 'cover' }
    ];

    const handleUpload = ({ file, fileList }) => {
        setFileList(fileList);

        if (file.status === 'done') {
            message.success(`${file.name} uploaded successfully`);
            form.setFieldsValue({
                mediaUrl: 'https://example.com/media/1234',
                mediaType: file.type.startsWith('video/') ? 'trailer' : 'poster'
            });
        }
    };

    const handleThumbnailUpload = (info) => {
        if (info.file.status === 'done') {
            message.success(`Thumbnail uploaded successfully`);
            setThumbnailUrl(URL.createObjectURL(info.file.originFileObj));
        }
    };

    const showPreview = (index = 0) => {
        if (fileList.length > 0) {
            setPreviewIndex(index);
            setPreviewVisible(true);
        } else {
            message.info('Please upload media first');
        }
    };

    const handleSubmit = (values) => {
        console.log('Submitted values:', values);
        message.success('Media added to movie successfully');

        form.resetFields();
        setFileList([]);
        setThumbnailUrl('');
    };

    const handleRemove = (file) => {
        const newFileList = fileList.filter(f => f.uid !== file.uid);
        setFileList(newFileList);
        return true;
    };

    const getMediaType = (file) => {
        return file.type?.startsWith('video/') ? 'video' : 'image';
    };

    const getPreviewUrl = (file) => {
        return file.originFileObj ? URL.createObjectURL(file.originFileObj) : file.url;
    };

    return (
        <Card title={<Title level={4}>Add Movie Media</Title>}>
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
            >
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={24}>
                        <Dragger
                            name="media"
                            multiple={true}
                            onChange={handleUpload}
                            fileList={fileList}
                            onRemove={handleRemove}
                            accept="video/*,image/*"
                            showUploadList={{
                                showPreviewIcon: true,
                                showRemoveIcon: true,
                                previewIcon: (file) => (
                                    <Button
                                        type="text"
                                        icon={<FileImageOutlined />}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const index = fileList.findIndex(f => f.uid === file.uid);
                                            showPreview(index);
                                        }}
                                    />
                                )
                            }}
                            customRequest={({ onSuccess }) => setTimeout(() => onSuccess("ok"), 0)}
                        >
                            <p className="ant-upload-drag-icon">
                                <UploadOutlined />
                            </p>
                            <p className="ant-upload-text">Click or drag files to upload</p>
                            <p className="ant-upload-hint">
                                Support for multiple video files (trailers, teasers) or images (posters, screenshots)
                            </p>
                        </Dragger>
                    </Col>
                </Row>

                <Divider />

                <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                        <Form.Item
                            name="mediaTitle"
                            label="Media Title"
                            rules={[{ required: true, message: 'Please enter a title' }]}
                        >
                            <Input placeholder="e.g. Official Trailer, Main Poster" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                        <Form.Item
                            name="mediaType"
                            label="Media Type"
                            rules={[{ required: true, message: 'Please select media type' }]}
                        >
                            <Select placeholder="Select media type">
                                {mediaTypes.map(type => (
                                    <Option key={type.value} value={type.value}>{type.label}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={[16, 16]}>
                    <Col span={24}>
                        <Form.Item
                            name="mediaDescription"
                            label="Description"
                        >
                            <TextEditor />
                        </Form.Item>
                    </Col>
                </Row>

                {fileList.some(file => getMediaType(file) === 'video') && (
                    <Row gutter={[16, 16]}>
                        <Col span={24}>
                            <Title level={5}>Custom Thumbnail (Optional)</Title>
                            <Text type="secondary">
                                For videos, you can upload a custom thumbnail. If not provided, a default one will be generated.
                            </Text>
                            <Form.Item
                                name="thumbnail"
                                style={{ marginTop: 16 }}
                            >
                                <Upload
                                    listType="picture-card"
                                    showUploadList={false}
                                    onChange={handleThumbnailUpload}
                                    customRequest={({ onSuccess }) => setTimeout(() => onSuccess("ok"), 0)}
                                    accept="image/*"
                                >
                                    {thumbnailUrl ? (
                                        <img
                                            src={thumbnailUrl}
                                            alt="thumbnail"
                                            style={{ width: '100%' }}
                                        />
                                    ) : (
                                        <div>
                                            <PlusOutlined />
                                            <div style={{ marginTop: 8 }}>Upload</div>
                                        </div>
                                    )}
                                </Upload>
                            </Form.Item>
                        </Col>
                    </Row>
                )}

                <Form.Item
                    name="mediaUrl"
                    hidden
                >
                    <Input />
                </Form.Item>
                <Divider />

                {fileList.length > 0 && (
                    <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                        <Col span={24}>
                            <Card
                                size="small"
                                title="Uploaded Media"
                                extra={
                                    <Button
                                        type="link"
                                        onClick={() => showPreview(0)}
                                    >
                                        View All
                                    </Button>
                                }
                                style={{ backgroundColor: '#f9f9f9' }}
                            >
                                <Row gutter={[16, 16]}>
                                    {fileList.map((file, index) => {
                                        const type = getMediaType(file);
                                        const url = getPreviewUrl(file);

                                        return (
                                            <Col key={file.uid} xs={12} sm={8} md={6} lg={4}>
                                                <div
                                                    style={{
                                                        cursor: 'pointer',
                                                        position: 'relative',
                                                        paddingBottom: type === 'video' ? '56.25%' : '100%',
                                                        height: 0,
                                                        overflow: 'hidden',
                                                        backgroundColor: '#f0f0f0'
                                                    }}
                                                    onClick={() => showPreview(index)}
                                                >
                                                    {type === 'video' ? (
                                                        <>
                                                            <img
                                                                src={thumbnailUrl || 'https://placehold.co/600x400/000000/FFFFFF?text=Video'}
                                                                alt="Video thumbnail"
                                                                style={{
                                                                    position: 'absolute',
                                                                    top: 0,
                                                                    left: 0,
                                                                    width: '100%',
                                                                    height: '100%',
                                                                    objectFit: 'cover'
                                                                }}
                                                            />
                                                            <div
                                                                style={{
                                                                    position: 'absolute',
                                                                    top: '50%',
                                                                    left: '50%',
                                                                    transform: 'translate(-50%, -50%)',
                                                                    backgroundColor: 'rgba(0,0,0,0.6)',
                                                                    borderRadius: '50%',
                                                                    width: 30,
                                                                    height: 30,
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center'
                                                                }}
                                                            >
                                                                <VideoCameraOutlined style={{ fontSize: 14, color: 'white' }} />
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <img
                                                            src={url}
                                                            alt="Preview"
                                                            style={{
                                                                position: 'absolute',
                                                                top: 0,
                                                                left: 0,
                                                                width: '100%',
                                                                height: '100%',
                                                                objectFit: 'cover'
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                                <Text ellipsis style={{ display: 'block', marginTop: 8 }}>
                                                    {file.name}
                                                </Text>
                                            </Col>
                                        );
                                    })}
                                </Row>
                            </Card>
                        </Col>
                    </Row>
                )}
            </Form>

            <Modal
                title={`Media Preview (${previewIndex + 1} of ${fileList.length})`}
                visible={previewVisible}
                onCancel={() => setPreviewVisible(false)}
                footer={null}
                width="90%"
                style={{ maxWidth: 800 }}
                closeIcon={<CloseOutlined />}
                bodyStyle={{ padding: 0 }}
            >
                <div style={{ textAlign: 'center', padding: 16 }}>
                    {fileList.length > 0 && (
                        <>
                            <div style={{ marginBottom: 16 }}>
                                {getMediaType(fileList[previewIndex]) === 'video' ? (
                                    <video
                                        controls
                                        autoPlay
                                        style={{ width: '100%', maxHeight: '70vh' }}
                                        src={getPreviewUrl(fileList[previewIndex])}
                                        poster={thumbnailUrl || 'https://placehold.co/600x400/000000/FFFFFF?text=Video+Preview'}
                                    />
                                ) : (
                                    <img
                                        alt="Preview"
                                        style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }}
                                        src={getPreviewUrl(fileList[previewIndex])}
                                    />
                                )}
                            </div>

                            <div style={{ marginBottom: 8 }}>
                                <Text strong>{fileList[previewIndex].name}</Text>
                            </div>

                            <Space>
                                <Button
                                    disabled={previewIndex === 0}
                                    onClick={() => setPreviewIndex(prev => prev - 1)}
                                >
                                    Previous
                                </Button>
                                <Button
                                    disabled={previewIndex === fileList.length - 1}
                                    onClick={() => setPreviewIndex(prev => prev + 1)}
                                >
                                    Next
                                </Button>
                            </Space>
                        </>
                    )}
                </div>
            </Modal>
        </Card>
    );
};

export default MovieMediaUploader;