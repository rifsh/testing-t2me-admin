import React, { useState, useEffect, useRef } from "react";
import { Card, Input, Button, List, Avatar, Typography, Space, message, Spin } from "antd";
import { SendOutlined, UserOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { fetchEventMessages, sendEventMessage } from "store/slices/leadEventSlice";
import moment from "moment";
import { getCurrentUser } from "configs/UserAccessConfig";

const { Text } = Typography;

const ChatSection = ({ eventId }) => {
  const dispatch = useDispatch();
  const { messages, messagesLoading, messagesError } = useSelector((state) => state.leadEvents);
  
  // Get current user from JWT token instead of Redux store
  const currentUser = getCurrentUser();
  
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (eventId) {
      dispatch(fetchEventMessages(eventId));
    }
  }, [dispatch, eventId]);

  // Function to scroll to the bottom of the chat container
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Show error if messages API call fails
  useEffect(() => {
    if (messagesError) {
      message.error(messagesError);
    }
  }, [messagesError]);

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      try {
        await dispatch(sendEventMessage({ 
          data: { event_lead_id: eventId, content: newMessage } 
        })).unwrap();
        
        setNewMessage("");
        
        // Refresh messages after sending
        dispatch(fetchEventMessages(eventId));
        
        // Scroll to bottom after a short delay to ensure messages are updated
        setTimeout(scrollToBottom, 100);
      } catch (err) {
        message.error("Failed to send message");
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return moment(timestamp).format('h:mm A');
  };

  const isCurrentUserMessage = (msg) => {
    return msg.user && currentUser && msg.user.id === currentUser.id;
  };

  const isValidMessage = (msg) => {
    return msg && msg.user && msg.content;
  };

  return (
    <Card 
      title={<span style={{ color: "#1890ff" }}>Event Chat</span>}
      bordered={false}
      style={{ height: "500px", display: "flex", flexDirection: "column" }}
      bodyStyle={{ 
        height: "100%", 
        display: "flex", 
        flexDirection: "column",
        overflow: "hidden"
      }}
      extra={messagesLoading && <Spin size="small" />}
    >
      <div 
        ref={chatContainerRef}
        style={{ 
          flex: 1, 
          overflowY: "auto", 
          padding: "0 5px", 
          marginBottom: "10px",
          backgroundColor: "#f9f9f9",
          borderRadius: "5px"
        }}
      >
        {messagesLoading && messages?.length === 0 ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "20px" }}>
            <Spin tip="Loading messages..." />
          </div>
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={(messages || []).filter(isValidMessage)}
            locale={{ emptyText: "No messages yet" }}
            renderItem={(item) => {
              const userIsCurrentUser = isCurrentUserMessage(item);
              return (
                <List.Item
                  style={{
                    textAlign: userIsCurrentUser ? "right" : "left",
                    padding: "8px 0"
                  }}
                >
                  <Space 
                    align="start" 
                    style={{ 
                      flexDirection: userIsCurrentUser ? "row-reverse" : "row",
                      width: "100%"
                    }}
                  >
                    <Avatar 
                      icon={<UserOutlined />}
                      style={{ 
                        backgroundColor: userIsCurrentUser ? "#1890ff" : "#f56a00" 
                      }}
                    />
                    <div>
                      <div
                        style={{
                          backgroundColor: userIsCurrentUser ? "#e6f7ff" : "#f0f0f0",
                          padding: "8px 12px",
                          borderRadius: "12px",
                          maxWidth: "70%",
                          display: "inline-block",
                          textAlign: "left",
                          wordBreak: "break-word"
                        }}
                      >
                        <Text>{item.content}</Text>
                      </div>
                      <div>
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          {item.user.username} • {formatTime(item.created_at)}
                        </Text>
                      </div>
                    </div>
                  </Space>
                </List.Item>
              );
            }}
          />
        )}
      </div>
      
      <div style={{ 
        display: "flex", 
        marginTop: "auto",
        position: "relative",
        bottom: 0,
        width: "100%",
        backgroundColor: "#fff",
        padding: "10px 0 0 0",
        borderTop: "1px solid #f0f0f0"
      }}>
        <Input 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message here..."
          style={{ 
            flexGrow: 1,
            height: "36px"
          }}
          maxLength={500}
          disabled={messagesLoading}
        />
        <Button 
          type="primary" 
          icon={<SendOutlined />} 
          onClick={handleSendMessage}
          style={{ marginLeft: "8px", height: "36px" }}
          loading={messagesLoading}
          disabled={!newMessage.trim()}
        >
          Send
        </Button>
      </div>
    </Card>
  );
};

export default ChatSection;