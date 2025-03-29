import React, { useState, useEffect } from 'react';
import {
    Row,
    Col,
    Card,
    Avatar,
    Typography,
    Descriptions,
    Divider,
    Button,
    Breadcrumb,
    Spin,
    Alert,
    List,
    Tag,
    Space
} from 'antd';
import {
    UserOutlined,
    CalendarOutlined,
    EnvironmentOutlined,
    TeamOutlined,
    GlobalOutlined,
    LeftOutlined,
    EditOutlined,
    InfoCircleOutlined,
    StarOutlined
} from '@ant-design/icons';
import { Link, useParams } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

const ActorProfile = () => {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [actor, setActor] = useState(null);

    useEffect(() => {
        fetchActorData();
    }, [id]);

    const fetchActorData = () => {
        setLoading(true);
        setTimeout(() => {
            const actorData = {
                id: 1,
                name: 'Robert Downey Jr.',
                alsoKnownAs: 'RDJ',
                gender: 'male',
                birthDate: '1965-04-04',
                birthPlace: 'Manhattan, New York, USA',
                height: '5\' 8" (1.73 m)',
                occupation: ['Actor', 'Producer', 'Singer'],
                spouseName: 'Susan Downey',
                children: ['Indio Falconer Downey', 'Avri Roel Downey', 'Exton Elias Downey'],
                nationality: 'American',
                languages: ['English', 'Spanish'],
                profileImage: 'https://via.placeholder.com/500',
                biography: `Robert John Downey Jr. (born April 4, 1965) is an American actor and producer. His career has been characterized by critical and popular success in his youth, followed by a period of substance abuse and legal troubles, before a resurgence of commercial success later in his career.

In 2008, Downey was named by Time magazine among the 100 most influential people in the world, and from 2013 to 2015, he was listed by Forbes as Hollywood's highest-paid actor. His films have grossed over $14.4 billion worldwide, making him the second highest-grossing box-office star of all time.

At the age of five, he made his acting debut in Robert Downey Sr.'s film Pound in 1970. He subsequently worked with the Brat Pack in the teen films Weird Science (1985) and Less Than Zero (1987). In 1992, Downey portrayed the title character in the biopic Chaplin, for which he was nominated for the Academy Award for Best Actor and won a BAFTA Award.`,
                funFacts: [
                    'He was a cast member on Saturday Night Live for the 1985-1986 season.',
                    'Practiced Wing Chun Kung Fu to prepare for Sherlock Holmes.',
                    'Became a certified diver for Iron Man 3.',
                    'His pets include rescue cats and an Alpaca.'
                ],
                timeline: [
                    { year: 1965, event: 'Born in Manhattan, New York' },
                    { year: 1970, event: 'First acting role in his father\'s film "Pound"' },
                    { year: 1985, event: 'Joined Saturday Night Live' },
                    { year: 1992, event: 'Played Charlie Chaplin in "Chaplin"' },
                    { year: 2003, event: 'Became sober after years of substance abuse' },
                    { year: 2008, event: 'Cast as Tony Stark/Iron Man in "Iron Man"' },
                    { year: 2019, event: 'Final appearance as Iron Man in "Avengers: Endgame"' }
                ],
                debutYear: 1970
            };

            setActor(actorData);
            setLoading(false);
        }, 1500);
    };

    const calculateAge = (birthDate) => {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }

        return age;
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '100px' }}>
                <Spin size="large" />
                <div style={{ marginTop: '20px' }}>Loading actor profile...</div>
            </div>
        );
    }

    if (!actor) {
        return (
            <Alert
                message="Actor Not Found"
                description="The actor you're looking for doesn't exist or has been removed."
                type="error"
                showIcon
                action={
                    <Link to="/actors">
                        <Button size="small" type="primary">
                            Return to Actor List
                        </Button>
                    </Link>
                }
            />
        );
    }

    return (
        <div style={{ padding: '24px' }}>
            <Card bodyStyle={{ padding: 0 }}>
                <Row>
                    <Col xs={24} sm={24} md={8} style={{ padding: '24px', textAlign: 'center' }}>
                        <Avatar
                            src={actor.profileImage}
                            size={200}
                            icon={<UserOutlined />}
                            style={{ border: '4px solid #1890ff' }}
                        />
                        <Title level={2} style={{ marginTop: '16px', marginBottom: '0' }}>
                            {actor.name}
                        </Title>
                        {actor.alsoKnownAs && (
                            <Text type="secondary" style={{ display: 'block', fontSize: '16px' }}>
                                AKA: {actor.alsoKnownAs}
                            </Text>
                        )}
                        <div style={{ margin: '12px 0' }}>
                            {actor.occupation.map(occ => (
                                <Tag color="blue" key={occ} style={{ margin: '4px' }}>
                                    {occ}
                                </Tag>
                            ))}
                        </div>
                    </Col>

                    <Col xs={24} sm={24} md={16} style={{ padding: '24px' }}>
                        <div>
                            <Title level={4}><UserOutlined /> Personal Details</Title>
                            <Divider style={{ marginTop: '12px' }} />
                            <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
                                <Descriptions.Item label="Full Name">{actor.name}</Descriptions.Item>
                                <Descriptions.Item label="Also Known As">{actor.alsoKnownAs || 'N/A'}</Descriptions.Item>
                                <Descriptions.Item label="Gender">
                                    {actor.gender.charAt(0).toUpperCase() + actor.gender.slice(1)}
                                </Descriptions.Item>
                                <Descriptions.Item label="Age">{calculateAge(actor.birthDate)}</Descriptions.Item>
                                <Descriptions.Item label="Birth Date">
                                    <CalendarOutlined /> {actor.birthDate}
                                </Descriptions.Item>
                                <Descriptions.Item label="Birth Place">
                                    <EnvironmentOutlined /> {actor.birthPlace}
                                </Descriptions.Item>
                                <Descriptions.Item label="Nationality">
                                    <GlobalOutlined /> {actor.nationality}
                                </Descriptions.Item>
                                <Descriptions.Item label="Height">{actor.height}</Descriptions.Item>
                                <Descriptions.Item label="Spouse" span={2}>
                                    <TeamOutlined /> {actor.spouseName || 'Not specified'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Children" span={2}>
                                    {actor.children.length > 0 ? (
                                        actor.children.map(child => <Tag key={child}>{child}</Tag>)
                                    ) : (
                                        'None'
                                    )}
                                </Descriptions.Item>
                                <Descriptions.Item label="Languages" span={2}>
                                    {actor.languages.map(lang => <Tag key={lang}>{lang}</Tag>)}
                                </Descriptions.Item>
                            </Descriptions>
                        </div>
                        <div style={{ marginBottom: '32px' }}>
                            <Title level={4}><InfoCircleOutlined /> Biography</Title>
                            <Divider style={{ marginTop: '12px' }} />
                            <Paragraph style={{ fontSize: '16px', lineHeight: '1.8', whiteSpace: 'pre-line' }}>
                                {actor.biography}
                            </Paragraph>

                            <Divider orientation="left">Fun Facts</Divider>
                            <List
                                itemLayout="horizontal"
                                dataSource={actor.funFacts}
                                renderItem={item => (
                                    <List.Item>
                                        <List.Item.Meta
                                            avatar={<StarOutlined style={{ color: '#faad14', fontSize: '20px' }} />}
                                            title={item}
                                        />
                                    </List.Item>
                                )}
                            />
                        </div>
                    </Col>
                </Row>
            </Card>
        </div>
    );
};

export default ActorProfile;