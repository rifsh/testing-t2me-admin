import React, { useState } from 'react';
import { PlayCircleOutlined, DownloadOutlined, ScanOutlined, GiftOutlined, CoffeeOutlined, CrownOutlined } from '@ant-design/icons';
import { Button, Card, Progress } from 'antd';
import './scanner.css';

const ScannerApp = () => {
    const [scanning, setScanning] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleScan = () => {
        if (scanning) return;

        setScanning(true);
        setProgress(0);

        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => setScanning(false), 1000);
                    return 100;
                }
                return prev + 2;
            });
        }, 100);
    };

    return (
        <div className="scanner-app">
            <div className="scanner-container">
                {/* Left content section */}
                <div className="content-section">
                    <h1 className="app-title">🎟️ Tickets2Me QR Scanner</h1>
                    <p>Scan attendee QR codes to unlock exclusive <b>add-on services</b> during events.</p>

                    <div className="features">
                        <div className="feature">
                            <div className="icon">
                                <GiftOutlined />
                            </div>
                            <div className="feature-text">
                                <h3>Exclusive Perks</h3>
                                <p>Access special add-ons available only for ticket holders</p>
                            </div>
                        </div>

                        <div className="feature">
                            <div className="icon">
                                <CoffeeOutlined />
                            </div>
                            <div className="feature-text">
                                <h3>Quick Access</h3>
                                <p>Instantly verify tickets and redeem offers</p>
                            </div>
                        </div>

                        <div className="feature">
                            <div className="icon">
                                <CrownOutlined />
                            </div>
                            <div className="feature-text">
                                <h3>VIP Services</h3>
                                <p>Seamlessly provide premium upgrades at events</p>
                            </div>
                        </div>
                    </div>

                    <div className="action-buttons">
                        <Button
                            type="primary"
                            icon={<ScanOutlined />}
                            size="large"
                            onClick={handleScan}
                            disabled={scanning}
                        >
                            {scanning ? 'Scanning...' : 'Start Scan'}
                        </Button>

                        <Button
                            icon={<DownloadOutlined />}
                            size="large"
                        >
                            Export Logs
                        </Button>
                    </div>
                </div>

                {/* Right scanner section with curved design */}
                <div className="scanner-section">
                    <div className="scanner-display">
                        <div className="scanner-frame">
                            {scanning && (
                                <>
                                    <div className="scanning-line"></div>
                                    <div className="scanning-overlay"></div>
                                </>
                            )}
                            <div className="document-preview">
                                <i className="fas fa-qrcode"></i>
                                <p>QR Code Preview</p>
                            </div>
                        </div>

                        {scanning && (
                            <div className="progress-container">
                                <Progress percent={progress} status="active" />
                                <p>Verifying attendee... {progress}%</p>
                            </div>
                        )}
                    </div>

                    <div className="scan-info">
                        <h3>Scanning Tips</h3>
                        <ul>
                            <li>Ensure QR code is clearly visible</li>
                            <li>Hold phone steady while scanning</li>
                            <li>Keep QR within the scanner frame</li>
                            <li>Avoid glare or low light conditions</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScannerApp;
