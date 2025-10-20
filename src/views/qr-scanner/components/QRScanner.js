import QrScanner from 'qr-scanner';
import { useEffect, useRef, useState } from 'react';
import './../scanner.scss';
import { message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { ENTRY_TYPES, SCANNER_TYPES } from 'constants/QrConstants';
import { fetchTcketAddon, fetchTcketUsers, verifyEventBooking } from 'store/slices/qrVerificationSlice';
import { useNavigate, useParams } from 'react-router-dom';
import { APP_PREFIX_PATH } from 'configs/AppConfig';
import QrWarningModal from './QrWarningModal';

const QRScanner = (props) => {
    const dispatch = useDispatch();
    const { type, eventId } = useParams();
    const navigate = useNavigate();
    const videoElementRef = useRef(null);
    const [scanned, setScannedText] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [hasPermission, setHasPermission] = useState(null);
    const [cameraError, setCameraError] = useState(null);
    const [scanStatus, setScanStatus] = useState('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const qrScannerRef = useRef(null);
    const isProcessingRef = useRef(false);
    const { serviceType, message: qrMessage } = useSelector((state) => state.qr);
    const serviceTypeRef = useRef(serviceType);

    useEffect(() => {
        const video = videoElementRef.current;
        if (!video) return;

        let isComponentMounted = true;

        // Check camera permissions and initialize scanner
        const initializeScanner = async () => {
            try {
                // Check permissions
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                stream.getTracks().forEach(track => track.stop());

                if (!isComponentMounted) return;
                setHasPermission(true);

                // Initialize QR Scanner
                qrScannerRef.current = new QrScanner(
                    video,
                    (result) => {
                        handleQRScan(result);
                    },
                    {
                        returnDetailedScanResult: true,
                        highlightScanRegion: false,
                        highlightCodeOutline: false,
                        maxScansPerSecond: 5,
                    }
                );

                // Start scanner
                await qrScannerRef.current.start();
                if (isComponentMounted) {
                    setIsScanning(true);
                    console.log('Scanner started');
                }
            } catch (err) {
                console.error('Error initializing scanner:', err);
                if (isComponentMounted) {
                    setHasPermission(false);
                    setCameraError('Camera access denied. Please enable camera permissions.');
                }
            }
        };

        initializeScanner();

        // Cleanup function
        return () => {
            isComponentMounted = false;
            if (qrScannerRef.current) {
                qrScannerRef.current.stop();
                qrScannerRef.current.destroy();
                qrScannerRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        serviceTypeRef.current = serviceType;
    }, [serviceType]);

    // Handle QR scan result
    const handleQRScan = (result) => {
        try {
            // Prevent multiple scans while processing
            if (isProcessingRef.current) return;
            isProcessingRef.current = true;

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

            // Process the scan
            processScannedData(parsed);
        } catch (err) {
            console.error("Failed to process scanned QR:", err);
            setScanStatus('error');
            setErrorMessage('Invalid QR code format');
            setTimeout(() => {
                setScanStatus('idle');
                isProcessingRef.current = false;
            }, 2000);
        }
    };

    // Process scanned data based on scanner type
    const processScannedData = async (scannedData) => {
        try {
            if (type === SCANNER_TYPES.addon) {
                if (serviceTypeRef.current === ENTRY_TYPES.user) {
                    await userListValidation(scannedData);
                } else {
                    await addonListValidation(scannedData);
                }
            } else {
                await normalEventValidation(scannedData);
            }
            console.log('AddonChecking', scannedData);

        } catch (error) {
            console.log('AddonChecking', scannedData);
            setScanStatus('error');
            setErrorMessage(error?.data?.status?.message || "Processing failed");
            setShowWarningModal(true);
            setTimeout(() => {
                setScanStatus('idle');
                isProcessingRef.current = false;
            }, 2000);
        }
    };

    const userListValidation = async (scannedData) => {
        try {
            const result = await dispatch(
                fetchTcketUsers({
                    booking_ticket_id: scannedData?.booking_ticket_id,
                    event_id: eventId
                })
            ).unwrap();

            setScanStatus('success');
            message.success("Ticket verified successfully!");

            setTimeout(() => {
                navigate(`${APP_PREFIX_PATH}/user/consumes/${scannedData?.booking_ticket_id}/${eventId}`);
            }, 1000);
        } catch (err) {
            throw err;
        }
    };

    const addonListValidation = async (scannedData) => {
        try {
            const result = await dispatch(
                fetchTcketAddon({
                    booking_ticket_id: scannedData?.booking_ticket_id,
                    event_id: eventId
                })
            ).unwrap();

            setScanStatus('success');
            message.success("Ticket verified successfully!");

            setTimeout(() => {
                navigate(`${APP_PREFIX_PATH}/food/consumes/${scannedData?.booking_ticket_id}/${eventId}`);
            }, 1000);
        } catch (err) {
            throw err;
        }
    };

    const normalEventValidation = async (scannedData) => {
        try {
            if (scannedData?.booking_qr_uuid && scannedData?.booking_ticket_id) {
                const bookingTicketId = scannedData?.booking_ticket_id;
                const showSeatId = scannedData?.show_seats_id;
                const userId = scannedData?.user_id;
                const bookingType = scannedData?.booking_qr_uuid.split('-')[0];
                const response = await dispatch(
                    verifyEventBooking({ bookingType, bookingTicketId, eventId, showSeatId, userId })
                ).unwrap();
                console.log("eventValidationTest", response);

                setScanStatus('success');
                message.success("Ticket verified successfully!");

                setTimeout(() => {
                    setScanStatus('idle');
                    isProcessingRef.current = false;
                }, 1000);
            } else {
                throw new Error("Invalid QR code format");
            }
        } catch (error) {
            console.log("responserror", error);

            throw error;
        }
    };

    const handleRetryScan = () => {
        setScanStatus('idle');
        setScannedText('');
        setShowWarningModal(false);
        isProcessingRef.current = false;

        // Restart scanner if it's not running
        if (qrScannerRef.current && !isScanning) {
            qrScannerRef.current.start().then(() => {
                setIsScanning(true);
            }).catch(err => {
                console.error('Error restarting scanner:', err);
                setCameraError('Failed to restart scanner');
            });
        }
    };

    const handleRetryPermission = async () => {
        setCameraError(null);
        setHasPermission(null);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach(track => track.stop());
            setHasPermission(true);
            window.location.reload();
        } catch (err) {
            setHasPermission(false);
            setCameraError('Camera access denied. Please enable camera permissions in your browser settings.');
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
                            <p>{cameraError}</p>
                            <button onClick={handleRetryPermission}>Retry</button>
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

            {cameraError && hasPermission !== false && (
                <div className="error-message">
                    <p>{cameraError}</p>
                </div>
            )}

            <QrWarningModal
                isVisible={showWarningModal}
                onClose={() => setShowWarningModal(false)}
                onRetry={handleRetryScan}
                errorMessage={errorMessage}
            />
        </div>
    );
};

export default QRScanner;