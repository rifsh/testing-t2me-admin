import React from 'react';
import { Modal, Button } from 'antd';
import { WarningOutlined, ReloadOutlined } from '@ant-design/icons';
import './../scanner.scss';

const QrWarningModal = ({ isVisible, onClose, onRetry, errorMessage }) => {
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
                    <Button onClick={onClose}>
                        Cancel
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default QrWarningModal;