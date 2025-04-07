import React, { useState } from 'react';
import {
    Row,
    Col,
    Card,
    Typography,
    Tag,
    Divider,
    Tabs,
    Button,
    Rate,
    Descriptions,
    Space,
    Carousel,
    Modal,
    Statistic,
    Avatar,
    List
} from 'antd';
import {
    PlayCircleOutlined,
    ClockCircleOutlined,
    CalendarOutlined,
    GlobalOutlined,
    TeamOutlined,
    TrophyOutlined,
    HeartOutlined,
    ShareAltOutlined,
    EditOutlined,
    ExpandOutlined,
    DownloadOutlined,
    StarOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const MovieDetails = () => {
    const [previewVisible, setPreviewVisible] = useState(false);
    const [currentPreview, setCurrentPreview] = useState(null);

    const movie = {
        id: "1",
        title: "The Spectrum Chronicles",
        tagline: "Beyond the limits of imagination",
        releaseYear: 2023,
        duration: 142, // minutes
        rating: 8.4,
        voteCount: 1243,
        categories: ["Science Fiction", "Adventure", "Drama"],
        languages: ["English", "Spanish"],
        director: "Sarah Johnson",
        writers: ["Michael Chen", "Laura Patterson"],
        stars: ["David Harper", "Emma Williams", "James Rodriguez"],
        synopsis: "In a world where reality is defined by the spectrum of human perception, a scientist discovers a way to expand consciousness beyond known limits. As the boundaries between dimensions blur, she must navigate the consequences of her discovery while facing forces that seek to control this new frontier of the mind.",
        boxOffice: "$450M",
        budget: "$120M",
        productionCompanies: ["Visionary Studios", "Global Entertainment"],
        awards: ["Best Visual Effects", "Best Original Score"],
        media: [
            {
                id: "m1",
                type: "trailer",
                title: "Official Trailer",
                thumbnail: "https://placehold.co/600x340/000000/FFFFFF?text=Trailer+Thumbnail",
                url: "https://example.com/trailer.mp4",
                isPrimary: true,
                isVideo: true
            },
            {
                id: "m2",
                type: "teaser",
                title: "Teaser",
                thumbnail: "https://placehold.co/600x340/111111/FFFFFF?text=Teaser+Thumbnail",
                url: "https://example.com/teaser.mp4",
                isPrimary: false,
                isVideo: true
            },
            {
                id: "m3",
                type: "poster",
                title: "Main Poster",
                thumbnail: "https://placehold.co/500x750/222222/FFFFFF?text=Movie+Poster",
                url: "https://placehold.co/500x750/222222/FFFFFF?text=Movie+Poster",
                isPrimary: true,
                isVideo: false
            },
            {
                id: "m4",
                type: "screenshot",
                title: "Scene 1",
                thumbnail: "https://placehold.co/600x340/333333/FFFFFF?text=Screenshot+1",
                url: "https://placehold.co/1200x680/333333/FFFFFF?text=Screenshot+1",
                isPrimary: false,
                isVideo: false
            },
            {
                id: "m5",
                type: "screenshot",
                title: "Scene 2",
                thumbnail: "https://placehold.co/600x340/444444/FFFFFF?text=Screenshot+2",
                url: "https://placehold.co/1200x680/444444/FFFFFF?text=Screenshot+2",
                isPrimary: false,
                isVideo: false
            },
            {
                id: "m6",
                type: "behindTheScenes",
                title: "Making Of",
                thumbnail: "https://placehold.co/600x340/555555/FFFFFF?text=Behind+The+Scenes",
                url: "https://example.com/bts.mp4",
                isPrimary: false,
                isVideo: true
            }
        ]
    };

    const primaryTrailer = movie.media.find(m => m.type === 'trailer' && m.isPrimary);
    const primaryPoster = movie.media.find(m => m.type === 'poster' && m.isPrimary);

    const getMediaByType = (type) => {
        return movie.media.filter(m => m.type === type);
    };

    const handlePreview = (media) => {
        setCurrentPreview(media);
        setPreviewVisible(true);
    };

    const renderPreviewContent = () => {
        if (!currentPreview) return null;

        return currentPreview.isVideo ? (
            <video
                controls
                autoPlay
                style={{ width: '100%', maxHeight: '80vh' }}
                src={currentPreview.url}
                poster={currentPreview.thumbnail}
            />
        ) : (
            <img
                src={currentPreview.url}
                alt={currentPreview.title}
                style={{ width: '100%', maxHeight: '80vh', objectFit: 'contain' }}
            />
        );
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>

            <Row gutter={[24, 24]}>
                <Col xs={24} sm={24} md={8} lg={6} xl={6}>
                    <Card
                        bordered={false}
                        bodyStyle={{ padding: 0 }}
                        cover={
                            <img
                                alt={movie.title}
                                src={primaryPoster ? primaryPoster.url : "https://placehold.co/500x750/222222/FFFFFF?text=Movie+Poster"}
                                style={{ width: '100%', height: 'auto' }}
                            />
                        }
                    />
                </Col>

                <Col xs={24} sm={24} md={16} lg={18} xl={18}>
                    <Card bordered={false}>
                        <Row justify="space-between" align="top">
                            <Col>
                                <Title level={2} style={{ marginBottom: '4px' }}>{movie.title}</Title>
                                <Text type="secondary" italic>{movie.tagline}</Text>
                            </Col>
                            <Col>
                                <Space align="center">
                                    <Rate allowHalf disabled value={movie.rating / 2} />
                                    <Text strong>{movie.rating}/10</Text>
                                    <Text type="secondary">({movie.voteCount} votes)</Text>
                                </Space>
                            </Col>
                        </Row>

                        <Divider style={{ margin: '16px 0' }} />

                        <Space size={[0, 8]} wrap>
                            {movie.categories.map((category, index) => (
                                <Tag color="blue" key={index} style={{ margin: '4px' }}>{category}</Tag>
                            ))}
                        </Space>

                        <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
                            <Col xs={24} sm={12} md={8}>
                                <Statistic
                                    title="Release Year"
                                    value={movie.releaseYear}
                                    prefix={<CalendarOutlined />}
                                />
                            </Col>
                            <Col xs={24} sm={12} md={8}>
                                <Statistic
                                    title="Duration"
                                    value={`${movie.duration} min`}
                                    prefix={<ClockCircleOutlined />}
                                />
                            </Col>
                            <Col xs={24} sm={12} md={8}>
                                <Statistic
                                    title="Languages"
                                    value={movie.languages.join(', ')}
                                    prefix={<GlobalOutlined />}
                                />
                            </Col>
                        </Row>

                        <Divider style={{ margin: '16px 0' }} />

                        <Paragraph style={{ marginBottom: '20px' }}>
                            {movie.synopsis}
                        </Paragraph>

                        <Row gutter={[16, 16]}>
                            <Col xs={24} sm={24} md={12}>
                                <Descriptions title="Cast & Crew" layout="vertical" column={1} bordered>
                                    <Descriptions.Item label="Director">{movie.director}</Descriptions.Item>
                                    <Descriptions.Item label="Writers">{movie.writers.join(', ')}</Descriptions.Item>
                                    <Descriptions.Item label="Stars">{movie.stars.join(', ')}</Descriptions.Item>
                                </Descriptions>
                            </Col>
                            <Col xs={24} sm={24} md={12}>
                                <Descriptions title="Production Details" layout="vertical" column={1} bordered>
                                    <Descriptions.Item label="Budget">{movie.budget}</Descriptions.Item>
                                    <Descriptions.Item label="Box Office">{movie.boxOffice}</Descriptions.Item>
                                    <Descriptions.Item label="Production">{movie.productionCompanies.join(', ')}</Descriptions.Item>
                                </Descriptions>
                            </Col>
                        </Row>

                        {primaryTrailer && (
                            <div style={{ marginTop: '24px' }}>
                                <Title level={4}>Trailer</Title>
                                <div
                                    style={{
                                        position: 'relative',
                                        cursor: 'pointer',
                                        borderRadius: '8px',
                                        overflow: 'hidden'
                                    }}
                                    onClick={() => handlePreview(primaryTrailer)}
                                >
                                    <img
                                        src={primaryTrailer.thumbnail}
                                        alt="Trailer Thumbnail"
                                        style={{ width: '100%', height: 'auto' }}
                                    />
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: '50%',
                                            left: '50%',
                                            transform: 'translate(-50%, -50%)',
                                            background: 'rgba(0,0,0,0.6)',
                                            borderRadius: '50%',
                                            width: '80px',
                                            height: '80px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <PlayCircleOutlined style={{ fontSize: '48px', color: 'white' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>

            <Card style={{ marginTop: '24px' }}>
                <Tabs defaultActiveKey="all">
                    <TabPane tab="All Media" key="all">
                        <Row gutter={[16, 16]}>
                            {movie.media.map(media => (
                                <Col xs={24} sm={12} md={8} lg={6} key={media.id}>
                                    <Card
                                        hoverable
                                        cover={
                                            <div
                                                style={{
                                                    position: 'relative',
                                                    height: '180px',
                                                    background: `url(${media.thumbnail}) center/cover no-repeat`,
                                                    cursor: 'pointer'
                                                }}
                                                onClick={() => handlePreview(media)}
                                            >
                                                {media.isVideo && (
                                                    <div
                                                        style={{
                                                            position: 'absolute',
                                                            top: '50%',
                                                            left: '50%',
                                                            transform: 'translate(-50%, -50%)',
                                                            background: 'rgba(0,0,0,0.6)',
                                                            borderRadius: '50%',
                                                            width: '50px',
                                                            height: '50px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}
                                                    >
                                                        <PlayCircleOutlined style={{ fontSize: '24px', color: 'white' }} />
                                                    </div>
                                                )}
                                                {media.isPrimary && (
                                                    <Tag color="gold" style={{ position: 'absolute', top: '8px', right: '8px' }}>
                                                        Primary
                                                    </Tag>
                                                )}
                                            </div>
                                        }
                                    >
                                        <Card.Meta
                                            title={media.title}
                                            description={
                                                <Tag color="blue">
                                                    {media.type === 'behindTheScenes' ? 'Behind The Scenes' :
                                                        media.type.charAt(0).toUpperCase() + media.type.slice(1)}
                                                </Tag>
                                            }
                                        />
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </TabPane>

                    <TabPane tab="Trailers & Videos" key="videos">
                        <Row gutter={[16, 16]}>
                            {movie.media.filter(m => m.isVideo).map(media => (
                                <Col xs={24} sm={12} md={8} lg={6} key={media.id}>
                                    <Card
                                        hoverable
                                        cover={
                                            <div
                                                style={{
                                                    position: 'relative',
                                                    height: '180px',
                                                    background: `url(${media.thumbnail}) center/cover no-repeat`,
                                                    cursor: 'pointer'
                                                }}
                                                onClick={() => handlePreview(media)}
                                            >
                                                <div
                                                    style={{
                                                        position: 'absolute',
                                                        top: '50%',
                                                        left: '50%',
                                                        transform: 'translate(-50%, -50%)',
                                                        background: 'rgba(0,0,0,0.6)',
                                                        borderRadius: '50%',
                                                        width: '50px',
                                                        height: '50px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                >
                                                    <PlayCircleOutlined style={{ fontSize: '24px', color: 'white' }} />
                                                </div>
                                                {media.isPrimary && (
                                                    <Tag color="gold" style={{ position: 'absolute', top: '8px', right: '8px' }}>
                                                        Primary
                                                    </Tag>
                                                )}
                                            </div>
                                        }
                                    >
                                        <Card.Meta
                                            title={media.title}
                                            description={
                                                <Tag color="blue">
                                                    {media.type === 'behindTheScenes' ? 'Behind The Scenes' :
                                                        media.type.charAt(0).toUpperCase() + media.type.slice(1)}
                                                </Tag>
                                            }
                                        />
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </TabPane>

                    <TabPane tab="Images" key="images">
                        <Row gutter={[16, 16]}>
                            {movie.media.filter(m => !m.isVideo).map(media => (
                                <Col xs={24} sm={12} md={8} lg={6} key={media.id}>
                                    <Card
                                        hoverable
                                        cover={
                                            <div
                                                style={{
                                                    position: 'relative',
                                                    height: media.type === 'poster' ? '280px' : '180px',
                                                    background: `url(${media.thumbnail}) center/cover no-repeat`,
                                                    cursor: 'pointer'
                                                }}
                                                onClick={() => handlePreview(media)}
                                            >
                                                {media.isPrimary && (
                                                    <Tag color="gold" style={{ position: 'absolute', top: '8px', right: '8px' }}>
                                                        Primary
                                                    </Tag>
                                                )}
                                            </div>
                                        }
                                    >
                                        <Card.Meta
                                            title={media.title}
                                            description={
                                                <Tag color="blue">
                                                    {media.type.charAt(0).toUpperCase() + media.type.slice(1)}
                                                </Tag>
                                            }
                                        />
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </TabPane>
                </Tabs>
            </Card>

            <Modal
                title={currentPreview?.title}
                visible={previewVisible}
                onCancel={() => setPreviewVisible(false)}
                footer={null}
                width="80%"
                style={{ top: 20 }}
                bodyStyle={{ padding: '16px', textAlign: 'center' }}
            >
                {renderPreviewContent()}
            </Modal>
        </div>
    );
};

export default MovieDetails;