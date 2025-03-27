import React, { useState, useEffect, useRef, useMemo } from "react";
import { 
  Card, 
  Input, 
  Button, 
  List, 
  Avatar, 
  Typography, 
  Space, 
  message, 
  Spin,
  Empty,
  Tooltip
} from "antd";
import { 
  SendOutlined, 
  UserOutlined, 
  MessageOutlined, 
  PaperClipOutlined,
  CloseOutlined,
  LeftOutlined,
  RightOutlined
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { fetchEventMessages, sendEventMessage } from "store/slices/leadEventSlice";
import moment from "moment";

const { Text } = Typography;

const ChatSection = ({ eventId, getCurrentUser, isCollapsed, onToggleCollapse }) => {
  const dispatch = useDispatch();
  
  // Robust selector with type checking and fallback
  const { messages, messagesLoading, messagesError } = useSelector((state) => {
    const rawMessages = state.leadEvents.messages;
    
    // Ensure messages is always an array
    const processedMessages = Array.isArray(rawMessages) 
      ? rawMessages 
      : (rawMessages && typeof rawMessages === 'object' 
        ? Object.values(rawMessages) 
        : []);
    
    return {
      messages: processedMessages,
      messagesLoading: state.leadEvents.messagesLoading,
      messagesError: state.leadEvents.messagesError
    };
  });
  
  // Get current user from JWT token
  const currentUser = getCurrentUser();
  
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  const chatContainerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch messages when component mounts or eventId changes
  useEffect(() => {
    if (eventId) {
      dispatch(fetchEventMessages(eventId));
    }
  }, [dispatch, eventId]);

  // Debugging effect to log messages
  useEffect(() => {
    console.log('Messages:', {
      type: typeof messages,
      length: messages.length,
      value: messages
    });
  }, [messages]);

  // Error handling for messages fetch
  useEffect(() => {
    if (messagesError) {
      message.error(messagesError?.toString() || "Failed to load messages");
    }
  }, [messagesError]);

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // File size validation
  const validateFileSize = (file) => {
    const maxSize = 10 * 1024 * 1024; // 10MB max size
    if (file.size > maxSize) {
      message.error(`File size should not exceed 10MB`);
      return false;
    }
    return true;
  };

  // File selection handler
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFileSize(file)) {
        setSelectedFile(file);
      } else {
        e.target.value = null; 
      }
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  // Send message handler for text and files through content field
  const handleSendMessage = async () => {
    if (!newMessage.trim() && !selectedFile) return;
  
    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('event_lead_id', eventId);
  
      if (newMessage.trim()) {
        formData.append('content', newMessage.trim());
      }
  
      if (selectedFile) {
        formData.append('content', selectedFile);
      }

      await dispatch(sendEventMessage({
        data: formData,
        isFormData: true
      })).unwrap();
  
      setNewMessage("");
      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
  
      // Refresh messages
      dispatch(fetchEventMessages(eventId));
      
      // Ensure scrolling after message send
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      message.error("Failed to send message");
      console.error("Message send error:", err);
    } finally {
      setUploading(false);
    }
  };

  // Handle enter key for sending message
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Time formatting utility
  const formatTime = (timestamp) => {
    return moment(timestamp).format('h:mm A');
  };

  // Check if message is from current user
  const isCurrentUserMessage = (msg) => {
    return msg?.user && currentUser && msg.user.id === currentUser.id;
  };

  // Validate message before rendering
  const isValidMessage = (msg) => {
    return msg 
      && typeof msg === 'object'
      && msg.user 
      && msg.content 
      && typeof msg.content === 'string';
  };

  // Detect if content is a file URL (image, PDF, etc.)
  const isFileUrl = (content) => {
    // Check if content is a URL pointing to common file extensions
    const urlPattern = /^https?:\/\/.*\.(jpg|jpeg|png|gif|pdf|doc|docx|xls|xlsx|txt)$/i;
    // Also check for media paths in your backend
    const mediaPathPattern = /\/media\/.*\.(jpg|jpeg|png|gif|pdf|doc|docx|xls|xlsx|txt)$/i;
    
    return urlPattern.test(content) || mediaPathPattern.test(content);
  };

  // Get file extension from URL or path
  const getFileExtension = (url) => {
    const match = url.match(/\.([a-zA-Z0-9]+)(?:[?#]|$)/);
    return match ? match[1].toLowerCase() : null;
  };

  // Get file name from URL or path
  const getFileName = (url) => {
    const parts = url.split('/');
    return parts[parts.length - 1];
  };

  // Handle collapse toggle
  const handleToggleCollapse = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    }
  };

  // Render message content based on whether it's a file URL or text
  const renderMessageContent = (content) => {
    if (isFileUrl(content)) {
      const fileExtension = getFileExtension(content);
      const fileName = getFileName(content);
      
      // Handle different file types
      if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
        // Image files
        return (
          <div style={{ marginTop: "5px" }}>
            <img 
              src={content} 
              alt={fileName}
              style={{ maxWidth: "200px", maxHeight: "200px", borderRadius: "5px" }}
            />
            <div>
              <Text type="secondary" style={{ fontSize: "12px" }}>{fileName}</Text>
            </div>
          </div>
        );
      } else if (fileExtension === 'pdf') {
        // PDF files
        return (
          <div style={{ marginTop: "5px" }}>
            <div style={{ 
              border: "1px solid #d9d9d9", 
              borderRadius: "5px",
              padding: "10px",
              backgroundColor: "#fff"
            }}>
              <div style={{ marginTop: "8px", display: "flex", justifyContent: "space-between" }}>
                <Button
                  type="primary"
                  size="small"
                  onClick={() => window.open(content, '_blank')}
                >
                  View
                </Button>
                <Button
                  type="default"
                  size="small"
                  href={content}
                  download={fileName}
                >
                  Download
                </Button>
              </div>
            </div>
          </div>
        );
      } else {
        // Other file types
        return (
          <div style={{ marginTop: "5px" }}>
            <Button
              type="link"
              icon={<PaperClipOutlined />}
              href={content}
              target="_blank"
            >
              {fileName}
            </Button>
          </div>
        );
      }
    } else {
      // Regular text content
      return <Text>{content}</Text>;
    }
  };

  // Render selected file preview
  const renderSelectedFilePreview = () => {
    if (!selectedFile) return null;
    
    return (
      <div style={{ 
        padding: "5px", 
        backgroundColor: "#f0f0f0", 
        borderRadius: "5px",
        marginBottom: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <Text ellipsis style={{ maxWidth: "80%" }}>{selectedFile.name}</Text>
        <Button 
          type="text" 
          danger 
          icon={<CloseOutlined />} 
          size="small" 
          onClick={() => {
            setSelectedFile(null);
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          }}
        />
      </div>
    );
  };

  // Memoized filtered messages to prevent unnecessary re-renders
  const filteredMessages = useMemo(() => 
    (messages || []).filter(isValidMessage), 
    [messages]
  );

  // Render loading state
  if (messagesLoading && filteredMessages.length === 0) {
    return (
      <Card 
        title={
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#1890ff" }}>Event Chat</span>
            <Tooltip title={isCollapsed ? "Show Chat" : "Hide Chat"}>
              <Button
                type="text"
                icon={isCollapsed ? <MessageOutlined /> : <RightOutlined />}
                onClick={handleToggleCollapse}
              />
            </Tooltip>
          </div>
        }
        extra={<Spin size="small" />}
      >
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '400px' 
        }}>
          <Spin size="large" tip="Loading messages..." />
        </div>
      </Card>
    );
  }

  return (
    <Card 
      title={
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "#1890ff" }}>Event Chat</span>
          <Tooltip title={isCollapsed ? "Show Chat" : "Hide Chat"}>
            <Button
              type="text"
              icon={windowWidth < 992 ? <LeftOutlined /> : <RightOutlined />}
              onClick={handleToggleCollapse}
            />
          </Tooltip>
        </div>
      }
      bordered={false}
      style={{ 
        height: "500px", 
        display: "flex", 
        flexDirection: "column",
        boxShadow: windowWidth < 992 ? "-2px 0 10px rgba(0,0,0,0.1)" : "none",
        transition: "all 0.3s ease"
      }}
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
        {filteredMessages.length === 0 ? (
          <Empty 
            image={<MessageOutlined style={{ fontSize: '48px', color: '#1890ff' }} />}
            description="No messages yet"
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '100%' 
            }}
          />
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={filteredMessages}
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
                        {renderMessageContent(item.content)}
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
        marginTop: "auto",
        position: "relative",
        bottom: 0,
        width: "100%",
        backgroundColor: "#fff",
        padding: "10px 0 0 0",
        borderTop: "1px solid #f0f0f0"
      }}>
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xlsx,.txt"
          style={{ display: 'none' }}
        />
        
        {/* Selected file preview */}
        {selectedFile && renderSelectedFilePreview()}
        
        <div style={{ display: "flex" }}>
          {/* File attachment button */}
          <Button
            icon={<PaperClipOutlined />}
            onClick={triggerFileSelect}
            style={{ marginRight: "8px", height: "36px" }}
            disabled={messagesLoading || uploading}
          />
          
          {/* Message input */}
          <Input 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={selectedFile ? `${selectedFile.name} selected. Add a message...` : "Type your message here..."}
            style={{ 
              flexGrow: 1,
              height: "36px"
            }}
            maxLength={500}
            disabled={messagesLoading || uploading}
          />
          
          {/* Send button */}
          <Button 
            type="primary" 
            icon={<SendOutlined />} 
            onClick={handleSendMessage}
            style={{ marginLeft: "8px", height: "36px" }}
            loading={messagesLoading || uploading}
            disabled={(!newMessage.trim() && !selectedFile) || uploading}
          >
            Send
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ChatSection;