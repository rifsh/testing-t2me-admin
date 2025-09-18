import { useState, useRef } from "react";
import jsQR from "jsqr";
import LeftContentSection from "./components/LeftContentSection";
import RightScannerSection from "./components/RightScannerSection";

const ScannerApp = () => {
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [extractedData, setExtractedData] = useState({
        ticketId: '',
        attendeeName: '',
        eventName: '',
        ticketType: '',
        validUntil: ''
    });
    const [uploadedFile, setUploadedFile] = useState(null);
    const [error, setError] = useState('');
    const canvasRef = useRef(null);

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setUploadedFile(file);
            setError('');
            processQRCode(file);
        }
    };

    const processQRCode = (file) => {
        setProcessing(true);
        setProgress(0);

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                // Create canvas to process image
                const canvas = canvasRef.current || document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // Set canvas dimensions to match image
                canvas.width = img.width;
                canvas.height = img.height;

                // Draw image on canvas
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                // Get image data for QR code scanning
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

                // Simulate progress for UX
                const interval = setInterval(() => {
                    setProgress(prev => {
                        if (prev >= 90) { // Stop at 90% to complete after scanning
                            clearInterval(interval);

                            // Try to decode QR code
                            try {
                                const qrCode = jsQR(imageData.data, imageData.width, imageData.height);

                                if (qrCode) {
                                    // QR code found and decoded
                                    setProgress(100);

                                    // Parse QR code data (assuming it's JSON)
                                    try {
                                        const qrData = JSON.parse(qrCode.data);
                                        setExtractedData({
                                            ticketId: qrData.ticketId || 'TKT-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
                                            attendeeName: qrData.attendeeName || 'John Doe',
                                            eventName: qrData.eventName || 'Tech Conference 2024',
                                            ticketType: qrData.ticketType || 'VIP Access',
                                            validUntil: qrData.validUntil || '2024-12-31'
                                        });
                                        setError('');
                                    } catch (e) {
                                        // If not JSON, treat as raw text
                                        setExtractedData({
                                            ticketId: qrCode.data,
                                            attendeeName: 'John Doe',
                                            eventName: 'Tech Conference 2024',
                                            ticketType: 'VIP Access',
                                            validUntil: '2024-12-31'
                                        });
                                        setError('QR code decoded but data format is not standard');
                                    }
                                } else {
                                    // No QR code found
                                    setError('No QR code found in the image');
                                    setExtractedData({
                                        ticketId: '',
                                        attendeeName: '',
                                        eventName: '',
                                        ticketType: '',
                                        validUntil: ''
                                    });
                                }
                            } catch (error) {
                                setError('Error processing QR code: ' + error.message);
                                setExtractedData({
                                    ticketId: '',
                                    attendeeName: '',
                                    eventName: '',
                                    ticketType: '',
                                    validUntil: ''
                                });
                            }

                            setTimeout(() => {
                                setProcessing(false);
                            }, 500);
                            return 90;
                        }
                        return prev + 3;
                    });
                }, 80);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    };

    const handleDataChange = (field, value) => {
        setExtractedData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const backgroundGradientStyle = {
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    };

    return (
        <div className="min-h-screen p-5 flex justify-center items-center" style={backgroundGradientStyle}>
            {/* Hidden canvas for QR code processing */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            <div className="w-full max-w-6xl h-[80vh] bg-white rounded-3xl shadow-2xl flex overflow-hidden">
                <LeftContentSection
                    processing={processing}
                    progress={progress}
                    extractedData={extractedData}
                    uploadedFile={uploadedFile}
                    handleFileUpload={handleFileUpload}
                    handleDataChange={handleDataChange}
                    error={error}

                />

                <RightScannerSection
                    processing={processing}
                    uploadedFile={uploadedFile}
                    error={error}
                    decodedValue={extractedData.ticketId}
                />
            </div>
        </div>
    );
};

export default ScannerApp;