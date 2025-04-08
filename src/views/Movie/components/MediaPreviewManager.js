import React, { useEffect, useState } from 'react';
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
    message,
    Tabs,
    Empty
} from 'antd';
import {
    DeleteOutlined,
    FileImageOutlined,
    YoutubeOutlined,
    PlusOutlined,
    CloseOutlined,
    PlayCircleOutlined
} from '@ant-design/icons';
import TextEditor from 'components/util-components/FormItems/TextEditor';

const { Title, Text } = Typography;
const { Option } = Select;
const { Dragger } = Upload;
const { TabPane } = Tabs;

const MovieMediaUploader = ({ form }) => {
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewIndex, setPreviewIndex] = useState(0);
    const [previewType, setPreviewType] = useState('youtube');
    const [fileList, setFileList] = useState([]);
    const [thumbnailUrls, setThumbnailUrls] = useState({});
    const [youtubeLinks, setYoutubeLinks] = useState([]);
    const [currentYoutubeLink, setCurrentYoutubeLink] = useState('');
    const [youtubeLinkError, setYoutubeLinkError] = useState('');
    const [activeTab, setActiveTab] = useState('youtube');
    const [mediaItems, setMediaItems] = useState([]);

    const mediaTypes = [
        { label: 'Trailer', value: 'trailer' },
        { label: 'Teaser', value: 'teaser' },
        { label: 'Behind the Scenes', value: 'bts' },
        { label: 'Poster', value: 'poster' },
        { label: 'Screenshot', value: 'screenshot' },
        { label: 'Cover Art', value: 'cover' }
    ];



    const validateYoutubeUrl = (url) => {
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})$/;
        return youtubeRegex.test(url);
    };

    const getYoutubeVideoId = (url) => {
        const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        return match ? match[1] : null;
    };

    const getYoutubeThumbnail = (videoId) => {
        return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    };

    useEffect(() => {
        form.setFieldsValue({
            mediaItems: mediaItems.map(item => ({
                type: item.type,
                url: item.url,
                title: item.title,
                mediaType: item.mediaType,
                ...(item.type === 'youtube' && { videoId: item.videoId }),
                ...(item.type === 'file' && { file: item.file })
            }))
        });
        console.log(mediaItems);
        
    }, [mediaItems, form]);

    const addYoutubeLink = () => {
        if (!currentYoutubeLink) {
            setYoutubeLinkError('Please enter a YouTube URL');
            return;
        }

        if (!validateYoutubeUrl(currentYoutubeLink)) {
            setYoutubeLinkError('Please enter a valid YouTube URL');
            return;
        }

        const videoId = getYoutubeVideoId(currentYoutubeLink);
        const newLinkId = Date.now().toString();
        const newLink = {
            id: newLinkId,
            url: currentYoutubeLink,
            videoId,
            thumbnail: getYoutubeThumbnail(videoId),
            title: `YouTube Video ${youtubeLinks.length + 1}`,
            mediaType: 'trailer'
        };

        setYoutubeLinks([...youtubeLinks, newLink]);

        const newMediaItem = {
            id: newLinkId,
            type: 'youtube',
            videoId,
            title: `YouTube Video ${youtubeLinks.length + 1}`,
            mediaType: 'trailer',
            url: currentYoutubeLink,
            thumbnail: getYoutubeThumbnail(videoId)
        };
        setMediaItems(prev => [...prev, newMediaItem]);

        setCurrentYoutubeLink('');
        setYoutubeLinkError('');
        message.success('YouTube video added successfully');
    };

    const removeYoutubeLink = (id) => {
        setYoutubeLinks(youtubeLinks.filter(link => link.id !== id));
        setMediaItems(prev => prev.filter(item => !(item.id === id && item.type === 'youtube')));
    };

    const removeFile = (file) => {
        const newFileList = fileList.filter(f => f.uid !== file.uid);
        setFileList(newFileList);
        setMediaItems(prev => prev.filter(item => !(item.id === file.uid && item.type === 'file')));
        return true;
    };

    const showPreview = (index, type) => {
        setPreviewIndex(index);
        setPreviewType(type);
        setPreviewVisible(true);
    };

    const handleSubmit = (values) => {
        const mediaData = mediaItems.map(item => {
            const formData = {
                mediaTitle: item.title,
                mediaType: item.mediaType,
                mediaUrl: item.url
            };

            if (item.type === 'file' && item.thumbnailUrl) {
                formData.thumbnail = item.thumbnailUrl;
            }

            return formData;
        });

        console.log('Submitted values:', values);
        console.log('Media items to submit:', mediaData);
        message.success('Media added to movie successfully');

        form.resetFields();
        setFileList([]);
        setThumbnailUrls({});
        setYoutubeLinks([]);
        setMediaItems([]);
    };

    const getMediaType = (file) => {
        return file.type?.startsWith('video/') ? 'video' : 'image';
    };

    const getPreviewUrl = (file) => {
        return file.originFileObj ? URL.createObjectURL(file.originFileObj) : file.url;
    };

    const updateMediaItemTitle = (id, type, newTitle) => {
        setMediaItems(prev => prev.map(item => {
            if (item.id === id && item.type === type) {
                return { ...item, title: newTitle };
            }
            return item;
        }));

        if (type === 'youtube') {
            setYoutubeLinks(prev => prev.map(link => {
                if (link.id === id) {
                    return { ...link, title: newTitle };
                }
                return link;
            }));
        }
    };

    const updateMediaItemType = (id, type, newMediaType) => {
        setMediaItems(prev => prev.map(item => {
            if (item.id === id && item.type === type) {
                return { ...item, mediaType: newMediaType };
            }
            return item;
        }));
    };

    const renderPreviewContent = () => {
        if (previewType === 'file') {
            const file = fileList.find(f => f.uid === mediaItems[previewIndex]?.id);
            if (!file) return null;

            if (getMediaType(file) === 'video') {
                return (
                    <video
                        controls
                        autoPlay
                        style={{ width: '100%', maxHeight: '70vh' }}
                        src={getPreviewUrl(file)}
                        poster={thumbnailUrls[file.uid] || 'https://placehold.co/600x400/000000/FFFFFF?text=Video+Preview'}
                    />
                );
            } else {
                return (
                    <img
                        alt="Preview"
                        style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }}
                        src={getPreviewUrl(file)}
                    />
                );
            }
        } else if (previewType === 'youtube') {
            const mediaItem = mediaItems[previewIndex];
            if (!mediaItem || mediaItem.type !== 'youtube') return null;

            return (
                <iframe
                    width="100%"
                    height="450"
                    src={`https://www.youtube.com/embed/${mediaItem.videoId}?autoplay=1`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>
            );
        }
        return null;
    };

    return (
        <Card title={<Title level={4}>Add Movie Media</Title>}>
            <Tabs defaultActiveKey="youtube" onChange={setActiveTab}>
                <div className="youtube-link-input" style={{ marginBottom: 24 }}>
                    <Row gutter={[16, 16]} align="middle">
                        <Col xs={24} md={16}>
                            <Input
                                placeholder="Enter YouTube video URL (e.g., https://www.youtube.com/watch?v=abcdef123456)"
                                value={currentYoutubeLink}
                                onChange={e => {
                                    setCurrentYoutubeLink(e.target.value);
                                    setYoutubeLinkError('');
                                }}
                                prefix={<YoutubeOutlined style={{ color: '#ff0000' }} />}
                                status={youtubeLinkError ? 'error' : ''}
                            />
                            {youtubeLinkError && <Text type="danger">{youtubeLinkError}</Text>}
                        </Col>
                        <Col xs={24} md={8}>
                            <Button
                                type="primary"
                                onClick={addYoutubeLink}
                                icon={<PlusOutlined />}
                                block
                            >
                                Add YouTube Video
                            </Button>
                        </Col>
                    </Row>
                </div>
            </Tabs>

            <Divider />

            <div style={{ marginBottom: 24 }}>
                <Title level={5}>All Media Items ({mediaItems.length})</Title>
                {mediaItems.length > 0 ? (
                    <Card>
                        <Row gutter={[16, 16]}>
                            {mediaItems.map((item, index) => {
                                const isYoutube = item.type === 'youtube';
                                const thumbnail = isYoutube
                                    ? item.thumbnail
                                    : (thumbnailUrls[item.id] || (item.file?.originFileObj && URL.createObjectURL(item.file.originFileObj)));

                                return (
                                    <Col key={`${item.type}-${item.id}`} xs={24} sm={12} md={8} lg={6}>
                                        <Card
                                            size="small"
                                            cover={
                                                <div style={{ position: 'relative', height: 120, overflow: 'hidden' }}>
                                                    {thumbnail ? (
                                                        <img
                                                            src={thumbnail}
                                                            alt={item.title}
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                        />
                                                    ) : (
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#e6e6e6' }}>
                                                            {isYoutube ? <YoutubeOutlined style={{ fontSize: 32, color: '#ff0000' }} /> : <FileImageOutlined style={{ fontSize: 32, color: '#999' }} />}
                                                        </div>
                                                    )}
                                                    <div
                                                        style={{
                                                            position: 'absolute',
                                                            top: 8,
                                                            right: 8,
                                                            background: 'rgba(0,0,0,0.6)',
                                                            color: 'white',
                                                            padding: '2px 8px',
                                                            borderRadius: 4,
                                                            fontSize: 12
                                                        }}
                                                    >
                                                        {mediaTypes.find(type => type.value === item.mediaType)?.label || item.mediaType}
                                                    </div>
                                                </div>
                                            }
                                        >
                                            <Card.Meta
                                                title={item.title}
                                                description={
                                                    <Row gutter={8} align="middle">
                                                        <Col>{isYoutube ? 'YouTube' : 'File Upload'}</Col>
                                                        <Col flex="auto"></Col>
                                                        <Col>
                                                            <Button
                                                                type="text"
                                                                size="small"
                                                                icon={<PlayCircleOutlined />}
                                                                onClick={() => showPreview(index, item.type)}
                                                            />
                                                        </Col>
                                                        <Col>
                                                            <Button
                                                                type="text"
                                                                size="small"
                                                                icon={<DeleteOutlined style={{ color: 'red' }} />}
                                                                onClick={() => removeYoutubeLink(item.id)}
                                                            />
                                                        </Col>
                                                    </Row>
                                                }
                                            />
                                        </Card>
                                    </Col>
                                );
                            })}
                        </Row>
                    </Card>
                ) : (
                    <Empty description="No media items added yet" />
                )}
            </div>

            <Modal
                title={
                    previewType === 'youtube'
                        ? 'YouTube Video Preview'
                        : `Media Preview (${previewIndex + 1} of ${mediaItems.length})`
                }
                visible={previewVisible}
                onCancel={() => setPreviewVisible(false)}
                footer={
                    <Space>
                        <Button
                            disabled={previewIndex === 0}
                            onClick={() => setPreviewIndex(prev => prev - 1)}
                        >
                            Previous
                        </Button>
                        <Button
                            disabled={previewIndex === mediaItems.length - 1}
                            onClick={() => setPreviewIndex(prev => prev + 1)}
                        >
                            Next
                        </Button>
                        <Button type="primary" onClick={() => setPreviewVisible(false)}>
                            Close
                        </Button>
                    </Space>
                }
                width="90%"
                style={{ maxWidth: 900 }}
                closeIcon={<CloseOutlined />}
            >
                <div style={{ textAlign: 'center', padding: 16 }}>
                    {renderPreviewContent()}

                    <div style={{ marginTop: 16 }}>
                        <Text strong>
                            {mediaItems[previewIndex]?.title || 'Media Preview'}
                        </Text>
                    </div>
                </div>
            </Modal>
        </Card>
    );
};

export default MovieMediaUploader;