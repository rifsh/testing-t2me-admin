import React, { useState, useEffect } from 'react';
import { Button, Card, Form, Input, Select, Tag, List, Avatar, Typography, Space, Divider } from 'antd';
import { TagsOutlined, DollarOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedTicketStructureforEvent } from 'store/slices/ticketSlice';

const { Option } = Select;
const { Title, Text } = Typography;

const TicketConfiguration = ({ form, index, rules }) => {
    const [selectedTicketStructure, setSelectedTicketStructure] = useState(null);
    const [selectedTicketSets, setSelectedTicketSets] = useState([]);
    const dispatch = useDispatch();
    const { filteredTickets, availableTicketSets } = useSelector((state) => state.tickets);
    const [structureId, setStructureId] = useState(null);
    useEffect(() => {
        const currentStructureId = form.getFieldValue(['screens', index, 'ticket_structure_id']);
        if (currentStructureId && filteredTickets.length > 0) {
            const structure = filteredTickets.find(ticket => ticket.id === currentStructureId);
            setSelectedTicketStructure(structure || null);
        }
    }, [filteredTickets, form, index]);

    useEffect(() => {
        const existingTicketStructure = form.getFieldValue(['screens', index, 'ticket_structure']);

        if (existingTicketStructure && Array.isArray(existingTicketStructure) && existingTicketStructure.length > 0) {
            const ticketSetNames = existingTicketStructure.map(item => item.ticket_set);

            const fullTicketSets = ticketSetNames.map(setName => {
                return availableTicketSets.find(set => set.ticket_set === setName) || null;
            }).filter(set => set !== null);

            setSelectedTicketSets(fullTicketSets);
        }
    }, [form, index, availableTicketSets]);

    const handleSelectTicketStructure = (structureId) => {
        setSelectedTicketSets([]);
        setStructureId(structureId);

        form.setFieldsValue({
            ['screens']: {
                ...form.getFieldValue('screens'),
                [index]: {
                    ...form.getFieldValue('screens')[index],
                    ticket_structure: [],
                    ticket_structure_id: structureId
                }
            }
        });

        const structure = filteredTickets.find(ticket => ticket.id === structureId);
        setSelectedTicketStructure(structure || null);

        if (structure) {
            dispatch(setSelectedTicketStructureforEvent(structure));
        }
    };

    const handleSelectTicketSets = (selectedSetNames) => {
        const selectedSets = selectedSetNames.map(setName => {
            return availableTicketSets.find(set => set.ticket_set === setName) || null;
        }).filter(set => set !== null);

        setSelectedTicketSets(selectedSets);

        const formattedTicketStructure = selectedSetNames.map(setName => {
            const ticketSet = availableTicketSets.find(set => set.ticket_set === setName);
            const setId = ticketSet?.id || selectedSetNames.indexOf(setName) + 1;

            return {
                id: structureId,
                ticket_set: setName
            };
        });

        form.setFieldsValue({
            ['screens']: {
                ...form.getFieldValue('screens'),
                [index]: {
                    ...form.getFieldValue('screens')[index],
                    ticket_structure: formattedTicketStructure
                }
            }
        });
    };

    const removeTicketSet = (ticketSetName) => {
        const updatedSets = selectedTicketSets.filter(set => set.ticket_set !== ticketSetName);
        setSelectedTicketSets(updatedSets);

        const updatedSetNames = updatedSets.map(set => set.ticket_set);

        const updatedStructure = updatedSetNames.map(setName => {
            const ticketSet = availableTicketSets.find(set => set.ticket_set === setName);
            const setId = ticketSet?.id || updatedSetNames.indexOf(setName) + 1;

            return {
                id: setId,
                ticket_set: setName
            };
        });

        form.setFieldsValue({
            ['screens']: {
                ...form.getFieldValue('screens'),
                [index]: {
                    ...form.getFieldValue('screens')[index],
                    ticket_structure: updatedStructure
                }
            }
        });
    };

    const getPriceTagColor = (price) => {
        if (!price) return 'default';
        if (price < 500) return 'green';
        if (price < 1000) return 'blue';
        if (price < 2000) return 'orange';
        return 'red';
    };

    const formatPrice = (price) => {
        return `$${price?.toFixed(2)}`;
    };

    return (
        <Card
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TagsOutlined />
                    <span>Ticket Configuration</span>
                </div>
            }
            className="ticket-configuration-card"
            style={{ marginBottom: '20px' }}
        >
            <Form.Item
                name={['screens', index, 'ticket_structure_id']}
                label="Ticket Structure"
                rules={rules.ticket_structure}
                tooltip="Select the primary ticket structure for this screen"
            >
                <Select
                    placeholder="Select ticket structure"
                    onChange={handleSelectTicketStructure}
                    notFoundContent="No ticket structures available"
                >
                    {filteredTickets.map((ticket) => (
                        <Option key={ticket.id} value={ticket.id}>
                            {ticket.name}
                        </Option>
                    ))}
                </Select>
            </Form.Item>

            <Form.Item
                name={['screens', index, 'ticket_structure']}
                hidden
            >
                <Input />
            </Form.Item>

            {selectedTicketStructure && (
                <div className="ticket-structure-details" style={{ marginBottom: '16px' }}>
                    <Title level={5}>
                        <Text type="secondary">Selected Structure:</Text> {selectedTicketStructure.name}
                    </Title>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                        {selectedTicketStructure.ticket_types && selectedTicketStructure.ticket_types.map((type, idx) => (
                            <Tag key={idx} color={getPriceTagColor(type.tickets[0]?.price)}>
                                {type.ticket_set}:
                                {type.tickets.map(t => formatPrice(t.price)).join(", ")}
                            </Tag>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '8px' }}>
                        <Title level={5}>
                            <Text type="secondary">Total tickets: </Text>
                            {selectedTicketStructure.number_of_tickets || "N/A"}
                        </Title>
                    </div>
                </div>
            )}

            {selectedTicketStructure && (
                <Form.Item
                    label="Ticket Sets"
                    rules={rules.ticket_sets}
                    tooltip="Select multiple ticket sets for this screen"
                >
                    <Select
                        mode="multiple"
                        placeholder="Select ticket sets"
                        onChange={handleSelectTicketSets}
                        disabled={!selectedTicketStructure}
                        optionLabelProp="label"
                        style={{ width: '100%' }}
                        value={selectedTicketSets.map(set => set.ticket_set)}
                    >
                        {availableTicketSets.map((ticketSet) => (
                            <Option
                                key={ticketSet.ticket_set}
                                value={ticketSet.ticket_set}
                                label={ticketSet.ticket_set}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>{ticketSet.ticket_set}</span>
                                    <span>
                                        <Tag
                                            color={getPriceTagColor(ticketSet.tickets[0]?.price)}>
                                            {ticketSet.tickets.map(t => formatPrice(t.price)).join(", ")}
                                        </Tag>
                                    </span>
                                </div>
                            </Option>
                        ))}
                    </Select>
                </Form.Item>
            )}

            {selectedTicketSets.length > 0 && (
                <SelectedTicketSets
                    ticketSets={selectedTicketSets}
                    onRemove={removeTicketSet}
                    getPriceTagColor={getPriceTagColor}
                    formatPrice={formatPrice}
                />
            )}
        </Card>
    );
};

const SelectedTicketSets = ({ ticketSets, onRemove, getPriceTagColor, formatPrice }) => {
    const { Text, Title } = Typography;

    return (
        <Card
            title="Selected Ticket Sets"
            className="selected-ticket-sets-card"
            size="small"
            style={{ marginBottom: '16px', background: '#f9f9f9' }}
        >
            <List
                itemLayout="horizontal"
                dataSource={ticketSets}
                renderItem={item => (
                    <List.Item
                        actions={[
                            <Button
                                type="text"
                                danger
                                icon={<CloseCircleOutlined />}
                                onClick={() => onRemove(item.ticket_set)}
                            />
                        ]}
                    >
                        <List.Item.Meta
                            avatar={
                                <Avatar
                                    style={{
                                        backgroundColor: getPriceTagColor(item.max_price),
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                    icon={<DollarOutlined />}
                                />
                            }
                            title={item.ticket_set}
                            description={
                                <Space direction="vertical" size={0}>
                                    <Title level={5}>
                                        <Text type="secondary">Price: </Text>
                                        <Tag
                                            color={getPriceTagColor(item.tickets[0]?.price)}>
                                            {item.tickets.map(t => formatPrice(t.price)).join(", ")}
                                        </Tag>
                                    </Title>
                                    <Title level={5}>
                                        <Text type="secondary">Total tickets: </Text>
                                        {item.tickets.map(t => t.number_of_tickets).join(", ")}
                                    </Title>
                                </Space>
                            }
                        />
                    </List.Item>
                )}
            />
            <Divider style={{ margin: '12px 0' }} />
        </Card>
    );
};

export default TicketConfiguration;