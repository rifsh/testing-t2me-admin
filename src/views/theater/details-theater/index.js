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
    Col,
    Empty,
    Form
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
    LayoutOutlined,
    MailOutlined,
    UserAddOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTheaterByid, setCleraAllData, setEntrollUserModalState } from 'store/slices/theaterSlice';
import { useParams } from 'react-router-dom';
import LoadingOverlay from 'components/util-components/Loader';
import Technology from 'components/shared-components/Theater/Technology';
import TheaterScreens from '../components/TheaterScreens';
import TheaterOffers from '../components/TheaterOffers';
import { getCurrentUser } from 'configs/UserAccessConfig';
import { UserRoleConstants } from 'constants/UserRoleConstant';
import EntrollUserModal from '../components/EntrollUserModal';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Panel } = Collapse;

const Index = () => {
    const { theaterId } = useParams();
    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const [photoIndex, setPhotoIndex] = useState(0);
    const [showGallery, setShowGallery] = useState(false);
    const { singleResponse, loading } = useSelector((state) => state.theater)
    const currentUser = getCurrentUser();


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

    const handleEnrollUser = () => {
        dispatch(setEntrollUserModalState(true));
    };

    const handleEnrollSubmit = async () => {
        try {
            const values = await form.validateFields();
            const data = {
                theatre_id: singleResponse?.id,
                email: values.email,
            };
            console.log(data)
            // const response = await dispatch(EnrollUser(data)).unwrap();
            // message.success(
            //     response.status?.message || "User enrolled successfully!"
            // );
            // setEnrollModalVisible(false);
            form.resetFields();
        } catch (error) {
            console.error("Enrollment failed:", error);
        }
    };

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

                            {singleResponse?.movie_screen && singleResponse.movie_screen.length > 0 && (
                                <TheaterScreens screens={singleResponse.movie_screen} />
                            )}

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

                        <TabPane tab="Offers & Coupons" key="2" >
                            <TheaterOffers theaterData={singleResponse} />
                        </TabPane>

                        <TabPane tab="Entroll user" key="3" >
                            <div style={{ padding: "24px 24px 0" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                                    <Typography.Title level={4} style={{ margin: 0 }}>
                                        Theater Users
                                    </Typography.Title>
                                    {currentUser.role_id !== UserRoleConstants.eventOrganizerRoleId && (
                                        <Button
                                            type="primary"
                                            icon={<UserAddOutlined />}
                                            onClick={handleEnrollUser}
                                        >
                                            Add User
                                        </Button>
                                    )}
                                </div>

                                {/* {eventDetails.users?.length > 0 ? (
                                    <Row gutter={[24, 24]} justify="start">
                                        {eventDetails?.users.map((user, index) => (
                                            <EventUsersTab key={index} user={user} />
                                        ))}
                                    </Row>
                                ) : (
                                    <Empty
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                        description="No Event Users associated with this event yet"
                                        style={{ margin: "40px 0" }}
                                    />
                                )} */}
                            </div>
                        </TabPane>
                    </Tabs>
                </div>

                {/* Right Column: Contact & Map */}
                <div className="space-y-6">
                    <Card title="Contact Information" className="shadow-md">
                        <div className="space-y-5">
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
                    <Card title="Theater Company Information" className="shadow-md">
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

                            {/* Phone */}
                            <div className="flex items-center">
                                <PhoneOutlined className="mr-3 text-blue-500" />
                                <div>
                                    <Text strong className="block">Phone</Text>
                                    <Text className="text-gray-600">
                                        {singleResponse?.company?.phone_number || "Not available"}
                                    </Text>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <MailOutlined className="mr-3 text-blue-500" />
                                <div>
                                    <Text strong className="block">Email</Text>
                                    <Text className="text-gray-600">
                                        {singleResponse?.company?.email ? (
                                            <a href={`mailto:${singleResponse.company.email}`} className="text-blue-500">
                                                {singleResponse.company.email}
                                            </a>
                                        ) : (
                                            "Not available"
                                        )}
                                    </Text>
                                </div>
                            </div>

                            {/* Website */}
                            <div className="flex items-start">
                                <GlobalOutlined className="mr-3 text-blue-500 mt-1" />
                                <div className="min-w-0">
                                    <Text strong className="block">Website</Text>
                                    {singleResponse?.company?.website_url ? (
                                        <a
                                            href={singleResponse?.company.website_url?.startsWith('http') ? singleResponse?.company.website_url : `https://${singleResponse?.company.website_url}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-500 block break-words whitespace-normal"
                                        >
                                            {singleResponse.company.website_url}
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

            {/* Entroll user modal */}
            <EntrollUserModal form={form} handleEnrollSubmit={handleEnrollSubmit} />
            <LoadingOverlay loading={loading} />
        </div>
    );
};

export default Index;