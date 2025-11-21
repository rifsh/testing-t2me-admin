import React, { useState } from 'react';
import { Input, Button, Table, Tag, Space, message, Form } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

const CouponGenerator = ({ onCouponsChange }) => {
    const [prefix, setPrefix] = useState('');
    const [count, setCount] = useState(1);
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(false);

    const generateCouponCode = () => {
        const randomString = Math.random().toString(36).substring(2, 10).toUpperCase();
        return `${prefix}-${randomString}`;
    };

    const handleGenerate = () => {
        if (!prefix || prefix.length < 3 || prefix.length > 8) {
            message.error('Prefix must be between 3 and 8 characters');
            return;
        }

        if (count < 1 || count > 100) {
            message.error('Count must be between 1 and 100');
            return;
        }

        setLoading(true);

        // Simulate API call delay
        setTimeout(() => {
            const newCoupons = [];
            for (let i = 0; i < count; i++) {
                const code = generateCouponCode();
                newCoupons.push({
                    key: `${code}-${Date.now()}-${i}`,
                    code: code,
                    createdAt: new Date().toLocaleString(),
                });
            }

            const updatedCoupons = [...coupons, ...newCoupons];
            setCoupons(updatedCoupons);

            // Pass coupons to parent component if callback provided
            if (onCouponsChange) {
                onCouponsChange(updatedCoupons);
            }

            setLoading(false);
            message.success(`Generated ${count} coupon codes successfully!`);
        }, 500);
    };

    const handleRemove = (key) => {
        const updatedCoupons = coupons.filter(coupon => coupon.key !== key);
        setCoupons(updatedCoupons);

        if (onCouponsChange) {
            onCouponsChange(updatedCoupons);
        }

        message.success('Coupon code removed successfully!');
    };

    const handleRemoveAll = () => {
        setCoupons([]);
        if (onCouponsChange) {
            onCouponsChange([]);
        }
        message.success('All coupon codes removed!');
    };

    const columns = [
        {
            title: 'Coupon Code',
            dataIndex: 'code',
            key: 'code',
            render: (code) => (
                <Tag color="blue" className="text-sm font-mono">
                    {code}
                </Tag>
            ),
        },
        {
            title: 'Generated At',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 200,
        },
        {
            title: 'Action',
            key: 'action',
            width: 100,
            render: (_, record) => (
                <Button
                    type="link"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemove(record.key)}
                    className="p-0"
                >
                    Remove
                </Button>
            ),
        },
    ];

    return (
        <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Coupon Code Generator</h2>
                <p className="text-gray-600 text-sm mt-1">
                    Generate unique coupon codes with custom prefix
                </p>
            </div>

            {/* Input Form */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 items-center">
                <div className="flex flex-col">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prefix <span className="text-red-500">*</span>
                    </label>
                    <Input
                        placeholder="Enter prefix (3-8 chars)"
                        value={prefix}
                        onChange={(e) => setPrefix(e.target.value.toUpperCase())}
                        maxLength={8}
                        className="w-full"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                        {prefix.length}/8 characters
                    </div>
                </div>

                <div className="flex flex-col">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Count <span className="text-red-500">*</span>
                    </label>
                    <Input
                        type="number"
                        placeholder="Number of codes"
                        value={count}
                        onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                        min={1}
                        max={100}
                        className="w-full"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                        Max 100 codes at once
                    </div>
                </div>

                <div className="flex justify-center md:justify-start items-center mt-2">
                    <Button
                        type="primary"
                        onClick={handleGenerate}
                        loading={loading}
                        disabled={!prefix || prefix.length < 3}
                        className="w-full md:w-auto"
                        size="middle"
                    >
                        Generate Codes
                    </Button>
                </div>
            </div>

            {/* Generated Coupons Table */}
            {coupons.length > 0 && (
                <div className="mt-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-800">
                            Generated Coupon Codes ({coupons.length})
                        </h3>
                        <Button
                            danger
                            onClick={handleRemoveAll}
                            icon={<DeleteOutlined />}
                            size="small"
                        >
                            Remove All
                        </Button>
                    </div>

                    <Table
                        columns={columns}
                        dataSource={coupons}
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) =>
                                `${range[0]}-${range[1]} of ${total} items`,
                        }}
                        scroll={{ x: 600 }}
                        size="middle"
                    />

                    {/* Copy All Button */}
                    <div className="mt-4 flex justify-end">
                        <Button
                            onClick={() => {
                                const allCodes = coupons.map(c => c.code).join('\n');
                                navigator.clipboard.writeText(allCodes);
                                message.success('All coupon codes copied to clipboard!');
                            }}
                            className="border-gray-300 text-gray-700"
                        >
                            Copy All Codes
                        </Button>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {coupons.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="text-gray-400 mb-2">
                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No coupon codes generated</h3>
                    <p className="text-gray-500 text-sm">
                        Enter a prefix and count above to generate coupon codes
                    </p>
                </div>
            )}
        </div>
    );
};

export default CouponGenerator;