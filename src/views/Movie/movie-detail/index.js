import React, { useEffect, useState } from 'react';
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
    TrophyOutlined,
    UserOutlined,
    TeamOutlined,
    VideoCameraOutlined
} from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMoviesById } from 'store/slices/movieSlice';
import LoadingOverlay from 'components/util-components/Loader';
import CastAndCrewComponent from '../components/CastAndCrewComponent';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const MovieDetails = () => {
    const dispatch = useDispatch();
    const [previewVisible, setPreviewVisible] = useState(false);
    const [currentPreview, setCurrentPreview] = useState(null);
    const [movieData, setMovieData] = useState(null);
    const [cast, setCast] = useState([]);
    const [crew, setCrew] = useState([]);
    const { id } = useParams();
    const movieId = id ? Number(id) : null;
    const { loading, movieSingleResponse } = useSelector((state) => state.movie);

    // Extract YouTube video ID from URL
    const extractYouTubeId = (url) => {
        if (!url) return null;
        const match = url.match(
            /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
        );
        return match ? match[1] : null;
    };

    const handlePreview = (mediaUrl) => {
        if (!mediaUrl) return;

        const videoId = extractYouTubeId(mediaUrl);

        if (videoId) {
            // For YouTube videos
            setCurrentPreview({
                type: 'youtube',
                videoId,
                url: mediaUrl
            });
        } else {
            // For other media types
            setCurrentPreview({
                type: 'other',
                url: mediaUrl,
                isVideo: mediaUrl.match(/\.(mp4|webm|ogg)$/i) !== null
            });
        }

        setPreviewVisible(true);
    };

    useEffect(() => {
        dispatch(fetchMoviesById({ movie_id: movieId }));
    }, [dispatch, movieId]);

    useEffect(() => {
        if (Array.isArray(movieSingleResponse?.movie_details) && movieSingleResponse.movie_details.length > 0) {
            setMovieData(movieSingleResponse.movie_details[0]);
            // console.log('castsss', movieSingleResponse.movie_details[0].casts.map((x) => x.type === 'CAST'))

            setCast(movieSingleResponse.movie_details[0]?.casts.filter((x) => x.type === 'CAST') || []);
            setCrew(movieSingleResponse.movie_details[0]?.casts.filter((x) => x.type === 'CREW') || []);
        }
    }, [movieSingleResponse]);

    // Get YouTube thumbnail from video ID
    const getYouTubeThumbnail = (url) => {
        const videoId = extractYouTubeId(url);
        return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
    };

    // Render appropriate content in preview modal
    const renderPreviewContent = () => {
        if (!currentPreview) return null;

        if (currentPreview.type === 'youtube') {
            return (
                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
                    <iframe
                        src={`https://www.youtube.com/embed/${currentPreview.videoId}?autoplay=1`}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="YouTube video player"
                    />
                </div>
            );
        } else if (currentPreview.isVideo) {
            return (
                <video
                    controls
                    autoPlay
                    style={{ width: '100%', maxHeight: '80vh' }}
                    src={currentPreview.url}
                />
            );
        } else {
            return (
                <img
                    src={currentPreview.url}
                    alt="Media preview"
                    style={{ width: '100%', maxHeight: '80vh', objectFit: 'contain' }}
                />
            );
        }
    };

    // Render trailer section
    const renderTrailerSection = () => {
        const trailerMedia = movieSingleResponse?.movie_details?.[0]?.media_items?.[0]?.url;

        if (!trailerMedia) return null;

        return (
            <div style={{ marginTop: '24px' }}>
                <Title level={4}>Trailer</Title>
                <div
                    style={{
                        position: 'relative',
                        cursor: 'pointer',
                        borderRadius: '8px',
                        overflow: 'hidden'
                    }}
                    onClick={() => handlePreview(trailerMedia)}
                >
                    <img
                        src={getYouTubeThumbnail(trailerMedia) || "https://placehold.co/600x400/222222/FFFFFF?text=Video+Thumbnail"}
                        alt="Trailer Thumbnail"
                        style={{ width: '100%', height: 'auto', maxHeight: '350px', objectFit: 'cover' }}
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
        );
    };

    // Render media items/gallery section
    const renderMediaGallery = () => {
        if (!movieData?.media_items?.length) return <Text type="secondary">No media available</Text>;

        return (
            <Row gutter={[16, 16]}>
                {movieData?.media_items?.map((media, index) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={index}>
                        <Card
                            hoverable
                            cover={
                                <div
                                    style={{
                                        position: 'relative',
                                        height: '180px',
                                        background: media?.url ?
                                            `url(${getYouTubeThumbnail(media?.url)}) center/cover no-repeat` :
                                            `url(${media?.thumbnail}) center/cover no-repeat`,
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => handlePreview(media?.url)}
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
                                    {media.mediaLanguage && (
                                        <Tag color="gold" style={{ position: 'absolute', top: '8px', right: '8px' }}>
                                            {media.mediaLanguage}
                                        </Tag>
                                    )}
                                </div>
                            }
                        >
                            <Card.Meta
                                title={media.title}
                            />
                        </Card>
                    </Col>
                ))}
            </Row>
        );
    };

    return (
        <>
            {!loading && (
                <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
                    <Row gutter={[24, 24]}>
                        <Col xs={24} sm={24} md={8} lg={6} xl={6}>
                            <Card
                                bordered={false}
                                bodyStyle={{ padding: 0 }}
                                cover={
                                    <img
                                        alt={movieData?.event_name}
                                        src={movieSingleResponse?.thumbnail_image || "https://placehold.co/500x750/222222/FFFFFF?text=Movie+Poster"}
                                        style={{ width: '100%', height: 'auto' }}
                                    />
                                }
                            />
                        </Col>

                        <Col xs={24} sm={24} md={16} lg={18} xl={18}>
                            <Card bordered={false}>
                                <Row justify="space-between" align="top">
                                    <Col>
                                        <Title level={2} style={{ marginBottom: '4px' }}>{movieSingleResponse?.event_name}</Title>
                                        <TrophyOutlined style={{ color: '#faad14', fontSize: 16 }} />
                                        <Text type="secondary" italic style={{ marginLeft: 4 }}>
                                            {movieData?.awards || 'No awards information'}
                                        </Text>
                                    </Col>
                                    <Col>
                                        <Space align="center">
                                            {movieSingleResponse?.movie_details?.[0]?.rating ? (
                                                <>
                                                    <Rate
                                                        allowHalf
                                                        disabled
                                                        value={Number(movieSingleResponse.movie_details[0].rating) / 2}
                                                    />
                                                    <Text strong>
                                                        {Number(movieSingleResponse.movie_details[0].rating).toFixed(1)}/10
                                                    </Text>
                                                    {movieSingleResponse.movie_details[0].voteCount && (
                                                        <Text type="secondary">
                                                            ({movieSingleResponse.movie_details[0].voteCount} votes)
                                                        </Text>
                                                    )}
                                                </>
                                            ) : (
                                                <Text type="secondary">No rating available</Text>
                                            )}
                                        </Space>
                                    </Col>
                                </Row>

                                <Divider style={{ margin: '16px 0' }} />

                                <Space size={[0, 8]} wrap>
                                    {Array.isArray(movieSingleResponse?.movie_details?.[0]?.genre) &&
                                        movieSingleResponse.movie_details[0].genre.map((g, i) => (
                                            <Tag color="blue" key={i} style={{ margin: '4px' }}>{g}</Tag>
                                        ))
                                    }
                                </Space>
                                <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
                                    {Array.isArray(movieSingleResponse?.movie_details) && (
                                        <Col xs={24} sm={12} md={8}>
                                            <Statistic
                                                title="Release Year"
                                                value={new Date(movieSingleResponse.movie_details[0]?.released).getFullYear()}
                                                prefix={<CalendarOutlined />}
                                            />
                                        </Col>
                                    )}
                                    {Array.isArray(movieSingleResponse?.movie_details) && (
                                        <Col xs={24} sm={12} md={8}>
                                            <Statistic
                                                title="Duration"
                                                value={`${movieSingleResponse?.movie_details[0]?.runtime} min`}
                                                prefix={<ClockCircleOutlined />}
                                            />
                                        </Col>
                                    )}
                                    {Array.isArray(movieSingleResponse?.movie_details) && (
                                        <Col xs={24} sm={12} md={8}>
                                            <Statistic
                                                title="Language"
                                                value={movieSingleResponse?.movie_details[0]?.language}
                                                prefix={<GlobalOutlined />}
                                            />
                                        </Col>
                                    )}
                                </Row>

                                <Divider style={{ margin: '16px 0' }} />

                                <Paragraph style={{ marginBottom: '20px' }}>
                                    <div
                                        className="screen-description"
                                        dangerouslySetInnerHTML={{ __html: movieSingleResponse?.description || 'No description available' }}
                                    />
                                </Paragraph>

                                <Row gutter={[16, 16]}>
                                    <Col xs={24} sm={24} md={12}>
                                        <Descriptions title="Production Details" layout="vertical" column={1} bordered>
                                            <Descriptions.Item label="Budget">
                                                {movieData?.budget || 'N/A'}
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Box Office">
                                                {movieData?.box_office || 'N/A'}
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Production">
                                                {movieData?.production_company || 'N/A'}
                                            </Descriptions.Item>
                                        </Descriptions>
                                    </Col>
                                </Row>

                                {renderTrailerSection()}
                            </Card>
                        </Col>
                    </Row>

                    <Card style={{ marginTop: '24px' }}>
                        <Tabs defaultActiveKey="all">
                            <TabPane tab="Treilers" key="all">
                                {renderMediaGallery()}
                            </TabPane>

                            <TabPane tab={<span><TeamOutlined /> Cast & Crew</span>} key="castCrew">
                                <CastAndCrewComponent
                                    cast={cast}
                                    crew={crew}
                                />
                            </TabPane>
                        </Tabs>
                    </Card>

                    <Modal
                        title={currentPreview?.title || "Media Preview"}
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
            )}
            <LoadingOverlay loading={loading} />
        </>
    );
};

export default MovieDetails;