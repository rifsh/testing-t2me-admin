import React, { useEffect, useState } from 'react';
import {
    Card,
    Typography,
    Tag,
    Divider,
    Button,
    Tabs,
    Collapse,
    Modal,
    Col
} from 'antd';
import {
    EnvironmentOutlined,
    PhoneOutlined,
    GlobalOutlined,
    CarOutlined,
    WifiOutlined,
    CoffeeOutlined,
    StarOutlined,
    InfoCircleOutlined,
    PictureOutlined,
    LayoutOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTheaterByid, setCleraAllData } from 'store/slices/theaterSlice';
import { useParams } from 'react-router-dom';
import LoadingOverlay from 'components/util-components/Loader';
import Technology from 'components/shared-components/Theater/Technology';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Panel } = Collapse;

// Mock data for the component
const mockTheater = {
    id: '1',
    name: 'Cinemark Lincoln Square',
    type: 'Multiplex',
    rating: 4.5,
    reviewCount: 235,
    description: 'A premier movie theater featuring the latest blockbusters in a comfortable setting with state-of-the-art sound and projection technology. Enjoy an immersive cinema experience with reclining seats and in-theater dining options.',
    address: {
        line1: '700 Bellevue Way NE',
        line2: 'Suite 310',
        city: 'Bellevue',
        state: 'WA',
        zipCode: '98004',
        country: 'USA',
    },
    contact: {
        phone: '(425) 555-1234',
        email: 'contact@cinemarklincolnsquare.com',
        website: 'www.cinemarklincolnsquare.com',
    },
    hours: 'Mon-Thu: 11:00 AM - 11:00 PM\nFri-Sat: 10:00 AM - 1:00 AM\nSun: 10:00 AM - 11:00 PM',
    capacity: {
        screens: 12,
        totalSeats: 1500,
        premiumScreens: 3,
    },
    amenities: [
        { name: 'Parking', icon: <CarOutlined /> },
        { name: 'Free Wi-Fi', icon: <WifiOutlined /> },
        { name: 'Concession Stand', icon: <CoffeeOutlined /> },
        { name: 'Reclining Seats', icon: <StarOutlined /> },
        { name: 'Wheelchair Accessible', icon: <InfoCircleOutlined /> },
    ],
    images: [
        'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1498330177096-689e3fb901ca?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1595769816263-9b910be24d5f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    ],
    nowPlaying: [
        { id: 1, title: 'Dune: Part Two', duration: '166 min', rating: 'PG-13', showTimes: ['10:30 AM', '1:45 PM', '5:00 PM', '8:15 PM'] },
        { id: 2, title: 'Kung Fu Panda 4', duration: '94 min', rating: 'PG', showTimes: ['11:00 AM', '1:15 PM', '3:30 PM', '5:45 PM', '8:00 PM'] },
        { id: 3, title: 'Godzilla x Kong', duration: '115 min', rating: 'PG-13', showTimes: ['10:45 AM', '1:30 PM', '4:15 PM', '7:00 PM', '9:45 PM'] },
    ],
    screenTypes: ['IMAX', 'Dolby Digital', '3D', 'RPX'],
};

const Index = () => {
    const theater = mockTheater;
    const { theaterId } = useParams();
    const dispatch = useDispatch();
    const [favorite, setFavorite] = useState(false);
    const [photoIndex, setPhotoIndex] = useState(0);
    const [showGallery, setShowGallery] = useState(false);
    const { singleResponse, loading } = useSelector((state) => state.theater)
    const toggleFavorite = () => {
        setFavorite(!favorite);
    };

    const openGallery = (index) => {
        setPhotoIndex(index);
        setShowGallery(true);
    };

    useEffect(() => {
        dispatch(fetchTheaterByid({ theatre_id: theaterId }));
        return () => {
            dispatch(setCleraAllData());
        };

    }, [dispatch, theaterId]);

    return (
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            {/* Top Section with Cover Image and Basic Info */}
            <div className="relative mb-8 rounded-xl overflow-hidden">
                <div className="h-72 md:h-96 bg-gray-300 overflow-hidden">
                    <img
                        src={singleResponse?.thumbnail_image}
                        alt={singleResponse?.name}
                        className="w-full h-full object-cover"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
                        <div className="absolute bottom-0 left-0 p-6 text-white">
                            <Title level={2} className="text-white m-0">
                                {singleResponse?.name}
                            </Title>
                            {singleResponse?.screen_tech?.length > 0 &&
                                <div className="flex items-center mt-2">
                                    {singleResponse?.screen_tech.map((data, index) => (
                                        <Tag key={index} color="blue">{data.name}</Tag>
                                    ))}
                                </div>
                            }
                            <div className="flex items-center mt-3">
                                <EnvironmentOutlined className="mr-2" />
                                <Text className="text-white">
                                    {singleResponse?.place?.country?.name}, {singleResponse?.place?.name} - {singleResponse?.venue?.name}
                                </Text>
                            </div>
                        </div>

                        <div className="absolute top-4 right-4 flex space-x-3">
                            <Button
                                type="primary"
                                shape="circle"
                                icon={<PictureOutlined />}
                                onClick={() => openGallery(0)}
                                className="flex items-center justify-center"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Theater Details */}
                <div className="lg:col-span-2">
                    <Tabs defaultActiveKey="1" className="bg-white rounded-lg shadow-md p-4">
                        <TabPane tab="About" key="1">
                            <Title level={4}>Description</Title>
                            <Paragraph className="text-gray-700">
                                <div dangerouslySetInnerHTML={{ __html: singleResponse?.description || 'No description available' }} />
                            </Paragraph>

                            <Divider />

                            <Title level={4}>Theater Information</Title>
                            <div className="">
                                <div>
                                    <div className="mb-4">
                                        <Title level={5} className="mb-2 flex items-center">
                                            <LayoutOutlined className="mr-2 text-blue-500" /> Capacity
                                        </Title>
                                        <ul className="list-disc pl-10 text-gray-700">
                                            <li>{singleResponse?.number_of_screens} Screens</li>
                                            <li>{singleResponse?.capacity} Total Capacity</li>
                                        </ul>
                                    </div>

                                    <div className="w-full rounded-md p-2">
                                        <Card
                                            title={
                                                <span style={{ color: "#1890ff" }}>
                                                    Theater Technology & Features
                                                </span>
                                            }
                                            bordered={false}
                                        >
                                            <Technology teachData={singleResponse} />
                                        </Card>
                                    </div>
                                </div>
                            </div>

                        </TabPane>
                    </Tabs>
                </div>

                {/* Right Column: Contact & Map */}
                <div className="space-y-6">
                    <Card title="Contact Information" className="shadow-md">
                        <div className="space-y-5">
                            {/* Theater Company Name */}
                            <div className="flex items-start">
                                <StarOutlined className="mr-3 mt-1 text-blue-500" />
                                <div>
                                    <Text strong className="block">Theater Company</Text>
                                    <Text className="text-gray-600">
                                        {singleResponse?.company?.name || 'N/A'}
                                    </Text>
                                </div>
                            </div>

                            {/* Address */}
                            <div className="flex items-start">
                                <EnvironmentOutlined className="mr-3 mt-1 text-blue-500" />
                                <div>
                                    <Text strong className="block">Address</Text>
                                    <Text className="text-gray-600">
                                        {singleResponse?.place?.name}<br />
                                        {singleResponse?.venue.name}<br />
                                        {singleResponse?.place?.country?.name}<br />
                                    </Text>
                                </div>
                            </div>

                            {/* Phone */}
                            <div className="flex items-center">
                                <PhoneOutlined className="mr-3 text-blue-500" />
                                <div>
                                    <Text strong className="block">Phone</Text>
                                    <Text className="text-gray-600">
                                        {singleResponse?.phone_number || "Not available"}
                                    </Text>
                                </div>
                            </div>

                            {/* Website */}
                            <div className="flex items-start">
                                <GlobalOutlined className="mr-3 text-blue-500 mt-1" />
                                <div className="min-w-0">
                                    <Text strong className="block">Website</Text>
                                    {singleResponse?.website ? (
                                        <a
                                            href={singleResponse.website.startsWith('http') ? singleResponse.website : `https://${singleResponse.website}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-500 block break-words whitespace-normal"
                                        >
                                            {singleResponse.website}
                                        </a>
                                    ) : (
                                        <Text className="text-gray-600">Not available</Text>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Photo Gallery Modal */}
            <Modal
                open={showGallery}
                footer={null}
                onCancel={() => setShowGallery(false)}
                width="80%"
                className="theater-gallery-modal"
            >
                <div className="h-96 md:h-[32rem]">
                    <img
                        src={singleResponse?.thumbnail_image}
                        alt={singleResponse?.name}
                        className="w-full h-full object-contain"
                    />
                </div>
            </Modal>

            <LoadingOverlay loading={loading} />
        </div>
    );
};

export default Index;