import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ENTRY_TYPES, SCANNER_TYPES } from 'constants/QrConstants';
import { useDispatch, useSelector } from 'react-redux';
import { setServiceType } from 'store/slices/qrVerificationSlice';

const LeftContentSection = ({
    scannerType,
    processing,
    progress,
    extractedData,
    uploadedFile,
    handleFileUpload,
    handleDataChange
}) => {
    const dispatch = useDispatch();
    const { serviceType } = useSelector((state) => state.qr);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                delayChildren: 0.3,
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        }
    };

    const toggleVariants = {
        hidden: { scale: 0.95, opacity: 0 },
        visible: {
            scale: 1,
            opacity: 1,
            transition: {
                duration: 0.3,
                ease: "easeOut"
            }
        }
    };

    const progressBarVariants = {
        hidden: { width: 0 },
        visible: {
            width: `${progress}%`,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        }
    };

    return (
        <motion.div
            className="flex-1 p-10 flex flex-col justify-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div className="flex items-center justify-start mb-4" variants={itemVariants}>
                <motion.img
                    src="/img/logos/C_cropped_V Logo-8.png"
                    className="w-20 h-10 mr-3"
                    alt="Logo"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                />
                <h1 className="text-4xl text-gray-800 font-bold">Tickets<span className='text-[#f20c32]'>2</span>Me QR Scanner</h1>
            </motion.div>

            {/* Modern Service Type Toggle */}
            {scannerType === SCANNER_TYPES.addon && < motion.div className="mb-8" variants={itemVariants}>
                <label className="block text-gray-700 text-sm font-bold mb-4 text-center">
                    Select Service Type
                </label>
                <div className="flex justify-center">
                    <motion.div
                        className="relative flex bg-gray-100 rounded-xl p-1 shadow-inner gap-3"
                        variants={toggleVariants}
                    >
                        <motion.button
                            className={`relative px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 focus:outline-red-700 ${serviceType === ENTRY_TYPES.user
                                ? 'text-white shadow-md bg-[#f20c32]'
                                : 'text-gray-600 hover:text-gray-800'
                                }`}
                            style={{
                                backgroundColor: serviceType === ENTRY_TYPES.user ? '#f20c32' : 'transparent',
                                width: '120px'
                            }}
                            onClick={() => dispatch(setServiceType(ENTRY_TYPES.user))}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Entry
                            {serviceType === ENTRY_TYPES.user && (
                                <motion.svg
                                    className="w-5 h-5 absolute -top-2 -right-2"
                                    fill={`${serviceType === ENTRY_TYPES.user ? '#efbf04' : 'currentColor'}`}
                                    viewBox="0 0 20 20"
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                                >
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </motion.svg>
                            )}
                        </motion.button>
                        <motion.button
                            className={`relative px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 focus:outline-red-700 ${serviceType === ENTRY_TYPES.addon
                                ? 'text-white shadow-md bg-[#f20c32]'
                                : 'text-gray-600 hover:text-gray-800'
                                }`}
                            style={{
                                backgroundColor: serviceType === ENTRY_TYPES.addon ? '#f20c32' : 'transparent',
                                width: '120px'
                            }}
                            onClick={() => dispatch(setServiceType(ENTRY_TYPES.addon))}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Add-On
                            {serviceType === ENTRY_TYPES.addon && (
                                <motion.svg
                                    className="w-5 h-5 absolute -top-2 -right-2"
                                    fill={`${serviceType === ENTRY_TYPES.addon ? '#efbf04' : 'currentColor'}`}
                                    viewBox="0 0 20 20"
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                                >
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </motion.svg>
                            )}
                        </motion.button>
                    </motion.div>
                </div>
                <AnimatePresence mode="wait">
                    <p className="text-gray-600 text-sm mt-3 text-center">
                        {serviceType === ENTRY_TYPES.user
                            ? 'Scanning for event entry validation'
                            : 'Scanning to unlock add-on services and experiences'}
                    </p>

                </AnimatePresence>
            </motion.div>}

            <motion.p
                className="text-gray-600 text-lg leading-relaxed mb-6"
                variants={itemVariants}
            >
                Scan QR code to extract attendee data and unlock <b>add-on services</b> during events.
            </motion.p>

            {/* File Upload Section */}
            {/* <motion.div className="mb-6" variants={itemVariants}>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                    Upload QR Code Image
                </label>
                <div className="relative">
                    <motion.input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#feebee] file:text-[#f20c32] hover:file:bg-[#fcc6cf] file:cursor-pointer"
                        disabled={processing}
                        whileHover={{ scale: 1.01 }}
                        whileFocus={{ scale: 1.01 }}
                    />
                </div>
                <AnimatePresence>
                    {uploadedFile && (
                        <motion.p
                            className="text-sm text-gray-600 mt-1"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            Uploaded: {uploadedFile.name}
                        </motion.p>
                    )}
                </AnimatePresence>
            </motion.div> */}

            {/* Processing Progress */}
            <AnimatePresence>
                {processing && (
                    <motion.div
                        className="mb-6"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">Processing QR Code...</span>
                            <span className="text-sm font-medium text-gray-700">{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <motion.div
                                className="bg-blue-500 h-2 rounded-full"
                                variants={progressBarVariants}
                                initial="hidden"
                                animate="visible"
                            ></motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div >
    );
};

export default LeftContentSection;