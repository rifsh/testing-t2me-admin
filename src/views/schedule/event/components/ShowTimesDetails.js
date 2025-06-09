import React from "react";
import {
    Card,
    Collapse,
    Empty,
    Tag,
    Tooltip,
    Badge,
    List,
    Typography
} from "antd";
import { FaChair } from "react-icons/fa";
import Utils from "utils";
const { Panel } = Collapse;
const { Text } = Typography;

const ShowTimesDetails = ({ groupedShows }) => {
    return (
        <div>
            <Card className="mt-4">
                {Object.keys(groupedShows || {}).length > 0 ? (
                    <Collapse accordion className="schedule-collapse">
                        {Object.entries(groupedShows).map(([date, shows]) => (
                            <Panel
                                key={date}
                                header={
                                    <div className="flex items-center">
                                        <Badge color="blue" />
                                        <Text strong className="ml-2">{Utils.formatDate(date)}</Text>
                                        <Tag className="ml-4">{shows.length} show(s)</Tag>
                                    </div>
                                }
                            >
                                <List
                                    grid={{ gutter: 16, xs: 1, sm: 2, md: 3 }}
                                    dataSource={shows}
                                    renderItem={(show) => (
                                        <List.Item>
                                            <Card
                                                title={
                                                    <div className="flex items-center justify-between">
                                                        <span>
                                                            {show.start_time} - {show.end_time}
                                                        </span>
                                                        {show.is_midnight && (
                                                            <Tooltip title="Runs past midnight">
                                                                <Tag color="blue">Overnight</Tag>
                                                            </Tooltip>
                                                        )}
                                                    </div>
                                                }
                                            >
                                                <div className="flex items-center mb-2">
                                                    <FaChair className="mr-2 text-gray-500" />
                                                    <Text strong>{show.event_seats?.event_seatstructures?.name}</Text>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <Text type="secondary">Total Seats</Text>
                                                        <Text strong block>{show.event_seats?.event_seatstructures?.total_seats}</Text>
                                                    </div>
                                                </div>
                                            </Card>
                                        </List.Item>
                                    )}
                                />
                            </Panel>
                        ))}
                    </Collapse>
                ) : (
                    <Empty description="No show times scheduled yet" />
                )}
            </Card>
        </div>
    )
}

export default ShowTimesDetails