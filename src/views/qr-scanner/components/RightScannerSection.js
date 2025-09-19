import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QRScanner from './QRScanner';

const RightScannerSection = ({ processing, uploadedFile, decodedValue }) => {
    const scannerSectionStyle = {
        background: 'linear-gradient(135deg, #f20c32 0%, #8c0a1f 100%)',
        clipPath: 'polygon(15% 0%, 100% 0%, 100% 100%, 0% 100%)'
    };

    const [showDecoded, setShowDecoded] = useState(false);
    const [isFlipped, setIsFlipped] = useState(false);

    useEffect(() => {
        if (decodedValue) {
            setShowDecoded(true);
            // Auto-flip after a short delay when decoded value is available
            const timer = setTimeout(() => {
                setIsFlipped(true);
            }, 800);
            return () => clearTimeout(timer);
        } else {
            setShowDecoded(false);
            setIsFlipped(false);
        }
    }, [decodedValue]);

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    return (
        <div className="flex-1 relative overflow-hidden flex flex-col justify-center items-center p-10" style={scannerSectionStyle}>
            {/* Scanner Box with Flip Animation */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="ms-10 w-full h-full max-w-sm bg-opacity-10 rounded-2xl p-1 backdrop-blur-sm"
            >
                <div className="relative w-full h-full perspective-1000">
                    {/* Front side - QR Code Display */}
                    <motion.div
                        className="absolute w-full h-full rounded-xl flex justify-center items-center flex-col overflow-hidden backface-hidden"
                        initial={false}
                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                        transition={{ duration: 0.6 }}
                        style={{ transformStyle: 'preserve-3d' }}
                    >
                        {processing && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute top-0 left-0 w-full h-full bg-blue-500 bg-opacity-10 flex items-center justify-center z-10"
                            >
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="rounded-full h-16 w-16 border-b-2 border-blue-500"
                                ></motion.div>
                            </motion.div>
                        )}

                        {uploadedFile ? (
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.3 }}
                                className="w-full h-full flex items-center justify-center p-4"
                            >
                                <img
                                    src={URL.createObjectURL(uploadedFile)}
                                    alt="Uploaded QR Code"
                                    className="max-w-full max-h-full object-contain rounded-lg"
                                />
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-center text-gray-600"
                            >
                                {/* <motion.div
                                    animate={{
                                        scale: [1, 1.1, 1],
                                        rotate: [0, 5, -5, 0]
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        repeatDelay: 1
                                    }}
                                    className="text-5xl mb-4 text-[#f20c32]"
                                >
                                    <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2v1h1V5h-1z" clipRule="evenodd" />
                                        <path d="M11 4a1 1 0 10-2 0v1a1 1 0 002 0V4zM10 7a1 1 0 011 1v1h2a1 1 0 110 2h-3a1 1 0 01-1-1V8a1 1 0 01-1-1zM16 10a1 1 0 100-2H4a1 1 0 100 2h12zM9 13a1 1 0 011-1h1a1 1 0 110 2v2a1 1 0 11-2 0v-3zM7 16a1 1 0 01-1-1v-2a1 1 0 112 0v2a1 1 0 01-1 1zM15 16a1 1 0 01-1-1v-2a1 1 0 112 0v2a1 1 0 01-1 1z" />
                                    </svg>
                                </motion.div> */}
                                <div>
                                    <QRScanner />
                                </div>
                            </motion.div>
                        )}
                    </motion.div>

                </div>
            </motion.div>
        </div>
    );
};

export default RightScannerSection;