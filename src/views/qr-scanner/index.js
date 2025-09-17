import React, { useState, useRef, useEffect } from 'react';
import { Camera, Users, Utensils, CheckCircle, XCircle, RotateCcw, Settings } from 'lucide-react';

const QRScannerUI = () => {
    const [scanMode, setScanMode] = useState(null); // 'food' or 'user'
    const [isScanning, setIsScanning] = useState(false);
    const [lastScanResult, setLastScanResult] = useState(null);
    const [scanHistory, setScanHistory] = useState([]);
    const [stats, setStats] = useState({
        totalScans: 0,
        foodScans: 0,
        userScans: 0,
        todayScans: 0
    });
    const videoRef = useRef(null);

    // Simulate camera access
    const startScanning = (mode) => {
        setScanMode(mode);
        setIsScanning(true);

        // Simulate camera stream
        if (videoRef.current && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            })
                .then(stream => {
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        videoRef.current.play();
                    }
                })
                .catch(err => {
                    console.log('Camera access denied or not available');
                    // Fallback for demo purposes
                });
        }
    };

    const stopScanning = () => {
        setIsScanning(false);
        setScanMode(null);

        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    };

    // Simulate QR code scan
    const simulateScan = () => {
        const mockData = {
            food: {
                id: `FOOD-${Math.random().toString(36).substr(2, 9)}`,
                type: 'Food Voucher',
                details: 'Main Course + Dessert',
                timestamp: new Date().toLocaleString(),
                status: 'valid'
            },
            user: {
                id: `USER-${Math.random().toString(36).substr(2, 9)}`,
                type: 'Event Ticket',
                details: 'VIP Access - John Doe',
                timestamp: new Date().toLocaleString(),
                status: Math.random() > 0.2 ? 'valid' : 'invalid'
            }
        };

        const result = mockData[scanMode];
        setLastScanResult(result);

        // Add to history
        setScanHistory(prev => [result, ...prev.slice(0, 9)]);

        // Update stats
        setStats(prev => ({
            totalScans: prev.totalScans + 1,
            foodScans: prev.foodScans + (scanMode === 'food' ? 1 : 0),
            userScans: prev.userScans + (scanMode === 'user' ? 1 : 0),
            todayScans: prev.todayScans + 1
        }));

        // Auto clear result after 3 seconds
        setTimeout(() => {
            setLastScanResult(null);
        }, 3000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                                <Camera className="text-blue-600" size={32} />
                                Event QR Scanner
                            </h1>
                            <p className="text-slate-600 mt-1">Admin Panel - Ticket & Food Voucher Validation</p>
                        </div>
                        <button className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                            <Settings size={24} className="text-slate-600" />
                        </button>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Scanner Section */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                            {/* Scanner Controls */}
                            <div className="p-6 border-b border-slate-200">
                                <h2 className="text-xl font-semibold text-slate-800 mb-4">Select Scanner Mode</h2>

                                {!isScanning ? (
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => startScanning('food')}
                                            className="group relative overflow-hidden bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white p-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                                        >
                                            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                                            <Utensils size={32} className="mx-auto mb-3" />
                                            <div className="font-semibold text-lg">Food Scanner</div>
                                            <div className="text-sm opacity-90 mt-1">Scan food vouchers</div>
                                        </button>

                                        <button
                                            onClick={() => startScanning('user')}
                                            className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white p-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                                        >
                                            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                                            <Users size={32} className="mx-auto mb-3" />
                                            <div className="font-semibold text-lg">User Scanner</div>
                                            <div className="text-sm opacity-90 mt-1">Scan event tickets</div>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${scanMode === 'food'
                                                ? 'bg-orange-100 text-orange-700'
                                                : 'bg-blue-100 text-blue-700'
                                            }`}>
                                            {scanMode === 'food' ? <Utensils size={16} /> : <Users size={16} />}
                                            {scanMode === 'food' ? 'Food Scanner Active' : 'User Scanner Active'}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Camera View */}
                            <div className="relative bg-black">
                                {isScanning ? (
                                    <div className="relative">
                                        <video
                                            ref={videoRef}
                                            className="w-full h-80 object-cover"
                                            autoPlay
                                            playsInline
                                            muted
                                        />

                                        {/* Scanner Overlay */}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="relative">
                                                <div className="w-64 h-64 border-4 border-white rounded-2xl relative">
                                                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-400 rounded-tl-lg"></div>
                                                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-400 rounded-tr-lg"></div>
                                                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-400 rounded-bl-lg"></div>
                                                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-400 rounded-br-lg"></div>

                                                    {/* Scanning line animation */}
                                                    <div className="absolute inset-0 overflow-hidden rounded-2xl">
                                                        <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-pulse"></div>
                                                    </div>
                                                </div>

                                                <p className="text-white text-center mt-4 font-medium">
                                                    Position QR code within the frame
                                                </p>
                                            </div>
                                        </div>

                                        {/* Controls Overlay */}
                                        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-4">
                                            <button
                                                onClick={simulateScan}
                                                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg"
                                            >
                                                Simulate Scan
                                            </button>
                                            <button
                                                onClick={stopScanning}
                                                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg"
                                            >
                                                Stop Scanner
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-80 flex items-center justify-center bg-slate-800">
                                        <div className="text-center text-slate-400">
                                            <Camera size={48} className="mx-auto mb-4 opacity-50" />
                                            <p className="text-lg">Select a scanner mode to begin</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Scan Result */}
                            {lastScanResult && (
                                <div className={`p-6 border-t-4 ${lastScanResult.status === 'valid'
                                        ? 'border-green-400 bg-green-50'
                                        : 'border-red-400 bg-red-50'
                                    }`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {lastScanResult.status === 'valid' ? (
                                                <CheckCircle className="text-green-600" size={24} />
                                            ) : (
                                                <XCircle className="text-red-600" size={24} />
                                            )}
                                            <div>
                                                <div className="font-semibold text-slate-800">
                                                    {lastScanResult.type}
                                                </div>
                                                <div className="text-sm text-slate-600">
                                                    {lastScanResult.details}
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${lastScanResult.status === 'valid'
                                                ? 'bg-green-200 text-green-800'
                                                : 'bg-red-200 text-red-800'
                                            }`}>
                                            {lastScanResult.status.toUpperCase()}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Statistics & History */}
                    <div className="space-y-6">
                        {/* Stats */}
                        <div className="bg-white rounded-2xl shadow-xl p-6">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">Today's Statistics</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-600">Total Scans</span>
                                    <span className="font-bold text-2xl text-slate-800">{stats.totalScans}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-600 flex items-center gap-2">
                                        <Utensils size={16} />
                                        Food Vouchers
                                    </span>
                                    <span className="font-semibold text-orange-600">{stats.foodScans}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-600 flex items-center gap-2">
                                        <Users size={16} />
                                        Event Tickets
                                    </span>
                                    <span className="font-semibold text-blue-600">{stats.userScans}</span>
                                </div>
                            </div>
                        </div>

                        {/* Recent Scans */}
                        <div className="bg-white rounded-2xl shadow-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-slate-800">Recent Scans</h3>
                                <button
                                    onClick={() => setScanHistory([])}
                                    className="text-slate-500 hover:text-slate-700 transition-colors"
                                >
                                    <RotateCcw size={18} />
                                </button>
                            </div>

                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {scanHistory.length === 0 ? (
                                    <p className="text-slate-500 text-center py-8">No scans yet</p>
                                ) : (
                                    scanHistory.map((scan, index) => (
                                        <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                            <div className={`w-2 h-2 rounded-full ${scan.status === 'valid' ? 'bg-green-500' : 'bg-red-500'
                                                }`}></div>
                                            <div className="flex-1">
                                                <div className="text-sm font-medium text-slate-800">
                                                    {scan.type}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    {scan.timestamp}
                                                </div>
                                            </div>
                                            <div className={`text-xs px-2 py-1 rounded ${scan.status === 'valid'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                                }`}>
                                                {scan.status}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QRScannerUI;