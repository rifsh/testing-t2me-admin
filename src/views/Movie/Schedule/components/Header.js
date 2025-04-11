import { Typography, Space, Card } from "antd";
import { FiCalendar } from "react-icons/fi";
import { ClockCircleOutlined } from "@ant-design/icons";
const { Title, Text } = Typography;

export default function Header() {
  return (
    <header>
      <Card className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FiCalendar size={24} />
          <h1 className="text-xl font-bold">Movie Schedule </h1>
        </div>
        <div className="text-sm">Interactive Movie Scheduler</div>
        <Space>
          <Text type="secondary">
            <ClockCircleOutlined /> {new Date().toLocaleDateString()}
          </Text>
        </Space>
      </Card>
    </header>
  );
}
