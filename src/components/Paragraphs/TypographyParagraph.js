import React, { useState } from 'react';
import { Flex, Typography, Button, Space, Tooltip } from 'antd';
import { DownOutlined, UpOutlined, CopyOutlined } from '@ant-design/icons';

const TypographyParagraph = ({ content, initialRows = 2 }) => {
    const [rows, setRows] = useState(initialRows);
    const [expanded, setExpanded] = useState(false);

    // Safely handle empty or undefined content
    const displayContent = content || 'No biography available';

    // Custom expand/collapse handler with toggle functionality
    const toggleExpand = () => {
        setExpanded(!expanded);
    };

    // Custom copy handler for HTML content
    const handleCopy = () => {
        // Strip HTML tags for copying plain text
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = displayContent;
        const plainText = tempDiv.textContent || tempDiv.innerText || "";

        navigator.clipboard.writeText(plainText).then(() => {
            // Optional: Show success message
        });
    };

    return (
        <Flex vertical gap={8}>
            <div className="content-container" style={{ position: 'relative' }}>
                {/* Main content with ellipsis */}
                <div
                    className={`paragraph-content ${expanded ? 'expanded' : 'collapsed'}`}
                    style={{
                        overflow: 'hidden',
                        position: 'relative',
                        maxHeight: expanded ? 'none' : `${rows * 1.5}em`,
                        transition: 'max-height 0.3s ease'
                    }}
                >
                    <div dangerouslySetInnerHTML={{ __html: displayContent }} />

                    {/* Fade out effect when collapsed */}
                    {!expanded && (
                        <div
                            style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                width: '100%',
                                height: '1.5em',
                                background: 'linear-gradient(transparent, white)',
                                pointerEvents: 'none'
                            }}
                        />
                    )}
                </div>
            </div>

            {displayContent.lenght > initialRows && < Space size="small">
            <Button
                type="link"
                size="small"
                onClick={toggleExpand}
                icon={expanded ? <UpOutlined /> : <DownOutlined />}
            >
                {expanded ? 'Show less' : 'Show more'}
            </Button>
            <Tooltip title="Copy text">
                <Button
                    type="text"
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={handleCopy}
                />
            </Tooltip>
        </Space>}
        </Flex >
    );
};

export default TypographyParagraph;