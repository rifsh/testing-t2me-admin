import React, { useEffect, useState } from 'react';
import { Input, Button, Table, Tag, message, Spin } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { generateCouponCodes } from 'store/slices/couponSlice';

const CouponGenerator = ({ form }) => {
    const dispatch = useDispatch();
    const [prefix, setPrefix] = useState('');
    const [count, setCount] = useState(null);
    const [localCoupons, setLocalCoupons] = useState([]);

    const { couponCodeLoading, loading, generatedCouponCodes } = useSelector(
        (state) => state.coupons
    );

    /** Generate coupon request */
    const handleGenerate = () => {
        const payload = { prefix, count };
        dispatch(generateCouponCodes({ data: payload }));
    };

    /** When coupon codes come from backend */
    useEffect(() => {
        if (generatedCouponCodes && Array.isArray(generatedCouponCodes)) {
            form.setFieldsValue({ key_words: generatedCouponCodes });
            setLocalCoupons(generatedCouponCodes);
        }
    }, [generatedCouponCodes]);


    const handleRemove = (code) => {
        const updated = localCoupons.filter(item => item !== code);

        form.setFieldsValue({ key_words: updated });
        setLocalCoupons(updated);

        message.success("Coupon removed");
    };

    const handleRemoveAll = () => {
        form.setFieldsValue({ key_words: [] });
        setLocalCoupons([]);

        message.success("All coupons removed");
    };

    const coupons = localCoupons;

    /** Simple table */
    const columns = [
        {
            title: 'Coupon Code',
            dataIndex: 'code',
            key: 'code',
            width: 200,
            align: 'left',
            render: (code) => (
                <Tag color="blue" className="text-sm font-mono">
                    {code}
                </Tag>
            ),
        },
        {
            title: 'Action',
            key: 'action',
            width: 120,
            align: 'center',
            render: (_, record) => (
                <Button
                    type="link"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemove(record.code)}
                >
                    Remove
                </Button>
            ),
        },
    ];

    // Table data conversion
    const tableData = coupons.map((code, index) => ({
        key: index,
        code,
    }));


    return (
        <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm border border-gray-200">

            {/* Prefix + generate */}
            <div className="flex items-center space-x-5">

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prefix <span className="text-red-500">*</span>
                    </label>
                    <Input
                        placeholder="Enter prefix"
                        value={prefix}
                        maxLength={3}
                        onChange={(e) => setPrefix(e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Prefix must be up to 3 characters.
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Count <span className="text-red-500">*</span>
                    </label>
                    <Input
                        type="number"
                        placeholder='enter coupon count'
                        max={100}
                        value={count}
                        onChange={(e) => {
                            let val = parseInt(e.target.value);
                            if (isNaN(val)) val = null;
                            if (val < 1) val = null;
                            if (val > 100) val = 100;
                            setCount(val);
                        }}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Enter how many coupon codes to generate (1–100).
                    </p>
                </div>

                <div className="flex items-end mt-2">
                    <Button
                        type="primary"
                        className="w-full"
                        onClick={handleGenerate}
                        loading={couponCodeLoading || loading}
                        disabled={!prefix || !count}
                    >
                        Generate Codes
                    </Button>
                </div>
            </div>

            {/* Coupon List */}
            {coupons.length > 0 ? (
                <>
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-medium text-gray-800">
                            Generated Coupons ({coupons.length})
                        </h3>

                        <Button
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={handleRemoveAll}
                        >
                            Remove All
                        </Button>
                    </div>
                    {loading && couponCodeLoading ? (
                        < div className='h-20 w-full flex items-center justify-center'>
                            <Spin size='large' />
                        </div>
                    ) : (
                        <Table
                            columns={columns}
                            dataSource={tableData}
                            pagination={{
                                pageSize: 10,
                                showTotal: (total, range) =>
                                    `${range[0]}-${range[1]} of ${total} coupons`,
                            }}
                            rowKey="code"
                            tableLayout="fixed"
                        />
                    )
                    }
                </>
            ) : (
                <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-gray-500">No coupon codes generated yet.</p>
                </div>
            )
            }
        </div >
    );
};

export default CouponGenerator;
