import React, { useState } from 'react';

const LeftContentSection = ({
    processing,
    progress,
    extractedData,
    uploadedFile,
    handleFileUpload,
    handleDataChange
}) => {
    const [serviceType, setServiceType] = useState('entry'); // 'entry' or 'addon'

    return (
        <div className="flex-1 p-10 flex flex-col justify-center">
            <div className="flex items-center justify-start mb-4">
                <img
                    src="/img/logos/C_cropped_V Logo-8.png"
                    className="w-20 h-10 mr-3"
                    alt="Logo"
                />
                <h1 className="text-4xl text-gray-800 font-bold">Tickets<span className='text-[#f20c32]'>2</span>Me QR Scanner</h1>
            </div>

            {/* Modern Service Type Toggle */}
            <div className="mb-8">
                <label className="block text-gray-700 text-sm font-bold mb-4 text-center">
                    Select Service Type
                </label>
                <div className="flex justify-center">
                    <div className="relative flex bg-gray-100 rounded-xl p-1 shadow-inner">
                        <button
                            className={`relative px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 focus:outline-none ${serviceType === 'entry'
                                ? 'text-white shadow-md bg-[#f20c32]'
                                : 'text-gray-600 hover:text-gray-800'
                                }`}
                            style={{
                                backgroundColor: serviceType === 'entry' ? '#f20c32' : 'transparent',
                                width: '120px'
                            }}
                            onClick={() => setServiceType('entry')}
                        >
                            Entry
                            {serviceType === 'entry' && (
                                <svg className="w-5 h-5 absolute -top-2 -right-2" fill={`${serviceType === 'entry' ? '#efbf04' : 'currentColor'}`} viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            )}
                        </button>
                        <button
                            className={`relative px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 focus:outline-none ${serviceType === 'addon'
                                ? 'text-white shadow-md bg-[#f20c32]'
                                : 'text-gray-600 hover:text-gray-800'
                                }`}
                            style={{
                                backgroundColor: serviceType === 'addon' ? '#f20c32' : 'transparent',
                                width: '120px'
                            }}
                            onClick={() => setServiceType('addon')}
                        >
                            Add-On
                            {serviceType === 'addon' && (
                                <svg className="w-5 h-5 absolute -top-2 -right-2" fill={`${serviceType === 'addon' ? '#efbf04' : 'currentColor'}`} viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
                <p className="text-gray-600 text-sm mt-3 text-center">
                    {serviceType === 'entry'
                        ? 'Scanning for event entry validation'
                        : 'Scanning to unlock add-on services and experiences'}
                </p>
            </div>

            <p className="text-gray-600 text-lg leading-relaxed mb-6">
                Upload QR code images to extract attendee data and unlock <b>add-on services</b> during events.
            </p>

            {/* File Upload Section */}
            <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                    Upload QR Code Image
                </label>
                <div className="relative">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#feebee] file:text-[#f20c32] hover:file:bg-[#fcc6cf] file:cursor-pointer"
                        disabled={processing}
                    />
                </div>
                {uploadedFile && (
                    <p className="text-sm text-gray-600 mt-1">
                        Uploaded: {uploadedFile.name}
                    </p>
                )}
            </div>

            {/* Processing Progress */}
            {processing && (
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Processing QR Code...</span>
                        <span className="text-sm font-medium text-gray-700">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeftContentSection;