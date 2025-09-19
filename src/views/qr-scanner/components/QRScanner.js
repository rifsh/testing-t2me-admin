import QrScanner from 'qr-scanner';
import { useEffect, useRef, useState } from 'react';
import './../scanner.scss';
import { message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { ENTRY_TYPES } from 'constants/QrConstants';
import { fetchTcketUsers } from 'store/slices/qrVerificationSlice';

const QRScanner = (props) => {
    const dispatch = useDispatch();
    const videoElementRef = useRef(null);
    const [scanned, setScannedText] = useState('');
    const [isScanning, setIsScanning] = useState(true);
    const [hasPermission, setHasPermission] = useState(null);
    const [cameraError, setCameraError] = useState(null);
    const qrScannerRef = useRef(null);
    const { serviceType } = useSelector((state) => state.qr);

    useEffect(() => {
        const video = videoElementRef.current;
        if (!video) return;

        // Check camera permissions first
        const checkPermissions = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                setHasPermission(true);
                stream.getTracks().forEach(track => track.stop());
            } catch (err) {
                setHasPermission(false);
                setCameraError('Camera access denied. Please enable camera permissions.');
                return;
            }
        };

        checkPermissions();

        if (hasPermission === false) return;

        qrScannerRef.current = new QrScanner(
            video,
            (result) => {
                try {
                    let parsed = result.data;
                    if (typeof result.data === "string") {
                        try {
                            parsed = JSON.parse(result.data);
                        } catch {
                            // not JSON, keep as string
                        }
                    }

                    setScannedText(parsed);
                    message.success('Data retrieved');

                    console.log('decoded qr code raw:', result.data);
                    console.log('decoded qr code parsed:', parsed);

                    // Example: if QR contains {"booking_ticket_id": "123"}
                    if (parsed?.booking_ticket_id) {
                        console.log("Booking Ticket ID:", parsed.booking_ticket_id);

                        if (serviceType === ENTRY_TYPES.user) {
                            dispatch(fetchTcketUsers({ booking_ticket_id: parsed.booking_ticket_id }))
                        }
                    }

                    if (navigator.vibrate) {
                        navigator.vibrate(200);
                    }

                    if (props.onScan) {
                        props.onScan(parsed);
                    }
                } catch (err) {
                    console.error("Failed to process scanned QR:", err);
                }
            }
            ,
            {
                returnDetailedScanResult: true,
                highlightScanRegion: false,
                highlightCodeOutline: false,
                maxScansPerSecond: 5,
            }
        );

        const startScanner = async () => {
            try {
                await qrScannerRef.current.start();
                setIsScanning(true);
                console.log('Scanner started');
            } catch (err) {
                console.error('Error starting scanner:', err);
                setCameraError('Failed to start camera. Please check your camera connection.');
                setHasPermission(false);
            }
        };

        startScanner();

        return () => {
            if (qrScannerRef.current) {
                qrScannerRef.current.stop();
                qrScannerRef.current.destroy();
            }
        };
    }, [hasPermission, props]);


    return (
        <div className="qr-scanner-container">
            <div className="scanner-header">
                <h2>QR Code Scanner</h2>
                <p>Position a QR code in the frame to scan</p>
            </div>

            <div className="video-wrapper">
                <video
                    className={`qr-video ${isScanning ? 'scanning' : 'paused'}`}
                    ref={videoElementRef}
                />

                {hasPermission === false && (
                    <div className="camera-permission-denied">
                        <div className="permission-message">
                            <button onClick={() => window.location.reload()}>Retry</button>
                        </div>
                    </div>
                )}

                {isScanning && (
                    <div className="scanning-overlay">
                        <div className="scan-frame">
                            <div className="corner top-left"></div>
                            <div className="corner top-right"></div>
                            <div className="corner bottom-left"></div>
                            <div className="corner bottom-right"></div>
                            <div className="scan-line"></div>
                        </div>
                    </div>
                )}
            </div>

            {cameraError && (
                <div className="error-message">
                    <p>{cameraError}</p>
                </div>
            )}

            {/* <div className="scanner-controls">
                <button
                    className={`control-button ${isScanning ? 'stop' : 'start'}`}
                    onClick={toggleScanning}
                >
                    <i className={`icon-${isScanning ? 'stop' : 'play'}`}></i>
                    {isScanning ? 'Stop Scanning' : 'Start Scanning'}
                </button>

                <button
                    className="control-button switch-camera"
                    onClick={switchCamera}
                >
                    <i className="icon-camera-switch"></i>
                    Switch Camera
                </button>
            </div> */}
        </div>
    );
};

export default QRScanner;