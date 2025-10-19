import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'antd';
import { WarningOutlined, ReloadOutlined } from '@ant-design/icons';
import './../scanner.scss';

const QrWarningModal = ({ isVisible, onClose, onRetry, errorMessage }) => {
    const [countdown, setCountdown] = useState(3); // Reduced to 3 seconds for faster counter sales

    useEffect(() => {
        let timer;
        if (isVisible && countdown > 0) {
            timer = setTimeout(() => {
                setCountdown(countdown - 1);
            }, 1000);
        } else if (isVisible && countdown === 0) {
            onClose();
        }

        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [isVisible, countdown, onClose]);

    useEffect(() => {
        if (isVisible) {
            setCountdown(3); // Reset countdown when modal opens
        }
    }, [isVisible]);

    return (
        <Modal
            title={null}
            visible={isVisible}
            onCancel={onClose}
            footer={null}
            centered
            closable={false}
            width={400}
            className="qr-warning-modal"
        >
            <div className="modal-content">
                <div className="warning-icon">
                    <WarningOutlined />
                </div>
                <h3>Invalid QR Code</h3>
                <p>{errorMessage || "The scanned QR code is not valid. Please try again with a different code."}</p>
                <div className="modal-actions">
                    <Button type="primary" icon={<ReloadOutlined />} onClick={onRetry}>
                        Scan Again
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default QrWarningModal;