import QrScanner from 'qr-scanner';
import { useEffect, useRef, useState } from 'react';
import './../scanner.scss';
import { message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { ENTRY_TYPES, SCANNER_TYPES } from 'constants/QrConstants';
import { fetchTcketAddon, fetchTcketUsers } from 'store/slices/qrVerificationSlice';
import { useNavigate, useParams } from 'react-router-dom';
import { APP_PREFIX_PATH } from 'configs/AppConfig';
import QrWarningModal from './QrWarningModal';

const QRScanner = (props) => {
    const dispatch = useDispatch();
    const { eventId } = useParams();
    const navigate = useNavigate()
    const videoElementRef = useRef(null);
    const [scanned, setScannedText] = useState('');
    const [isScanning, setIsScanning] = useState(true);
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [hasPermission, setHasPermission] = useState(null);
    const [cameraError, setCameraError] = useState(null);
    const [scanStatus, setScanStatus] = useState('idle'); // 'idle', 'scanning', 'success', 'error'
    const [errorMessage, setErrorMessage] = useState('');
    const qrScannerRef = useRef(null);
    const { serviceType, scannerType } = useSelector((state) => state.qr);

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
                    // Prevent multiple scans while processing
                    if (scanStatus === 'scanning') return;

                    let parsed = result.data;
                    if (typeof result.data === "string") {
                        try {
                            parsed = JSON.parse(result.data);
                        } catch {
                            // not JSON, keep as string
                        }
                    }
                    setScannedText(parsed);
                    setScanStatus('scanning');

                    if (navigator.vibrate) {
                        navigator.vibrate(200);
                    }

                    if (props.onScan) {
                        props.onScan(parsed);
                    }
                } catch (err) {
                    console.error("Failed to process scanned QR:", err);
                    setScanStatus('error');
                    setErrorMessage('Invalid QR code format');
                    setTimeout(() => setScanStatus('idle'), 2000);
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
    }, [hasPermission, props, scanStatus]);

    const userListValidation = async () => {
        try {
            const result = await dispatch(
                fetchTcketUsers({ booking_ticket_id: scanned?.booking_ticket_id, event_id: eventId })
            ).unwrap();
            setScanStatus('success');
            setTimeout(() => {
                navigate(`${APP_PREFIX_PATH}/user/consumes/${scanned?.booking_ticket_id}/${eventId}`)
                console.log("API success:", result);
                message.success("Ticket verified successfully!");
                setScanStatus('idle');
            }, 1000);
        } catch (err) {
            setScanStatus('error');
            setErrorMessage(err.message || "Ticket verification failed");
            setShowWarningModal(true);
            setTimeout(() => setScanStatus('idle'), 2000);
        }
    };

    const addonListValidation = async () => {
        try {
            const result = await dispatch(
                fetchTcketAddon({ booking_ticket_id: scanned?.booking_ticket_id })
            ).unwrap();
            setScanStatus('success');
            setTimeout(() => {
                navigate(`${APP_PREFIX_PATH}/food/consumes/${scanned?.booking_ticket_id}`)
                console.log("API success:", result);
                message.success("Ticket verified successfully!");
                setScanStatus('idle');
            }, 1000);
        } catch (err) {
            setScanStatus('error');
            setErrorMessage(err.message || "Ticket verification failed");
            setShowWarningModal(true);
            setTimeout(() => setScanStatus('idle'), 2000);
        }
    };

    useEffect(() => {
        if (!scanned || scanStatus !== 'scanning') return;

        if (scannerType === SCANNER_TYPES.addon) {
            if (serviceType === ENTRY_TYPES.user) {
                userListValidation();
            } else {
                addonListValidation();
            }
        } else {
            message.warning('Event validation')
            setScanStatus('idle');
        }
    }, [serviceType, scannerType, scanned, dispatch, scanStatus]);

    const handleRetryScan = () => {
        setScanStatus('idle');
        setScannedText('');
        setShowWarningModal(false);
        if (qrScannerRef.current) {
            qrScannerRef.current.start();
        }
    };

    return (
        <div className="qr-scanner-container">
            <div className="scanner-header">
                <h2>QR Code Scanner</h2>
                <p>Position a QR code in the frame to scan</p>
            </div>

            <div className="video-wrapper">
                <video
                    className={`qr-video ${isScanning ? 'scanning' : 'paused'} ${scanStatus}`}
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

                        {/* Status indicator */}
                        {scanStatus !== 'idle' && (
                            <div className={`scan-status ${scanStatus}`}>
                                {scanStatus === 'scanning' && (
                                    <div className="loading-spinner"></div>
                                )}
                                {scanStatus === 'success' && (
                                    <div className="success-checkmark">✓</div>
                                )}
                                {scanStatus === 'error' && (
                                    <div className="error-cross">✗</div>
                                )}
                                <p className="status-text">
                                    {scanStatus === 'scanning' && 'Processing...'}
                                    {scanStatus === 'success' && 'Success!'}
                                    {scanStatus === 'error' && 'Invalid'}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {cameraError && (
                <div className="error-message">
                    <p>{cameraError}</p>
                </div>
            )}
            {/* 
            <QrWarningModal
                isVisible={showWarningModal}
                onClose={() => setShowWarningModal(false)}
                onRetry={handleRetryScan}
                errorMessage={errorMessage}
            /> */}
        </div>
    );
};

export default QRScanner;