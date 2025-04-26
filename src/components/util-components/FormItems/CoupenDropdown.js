import { Form, Select } from 'antd'
import { Option } from 'antd/es/mentions'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllCoupons } from 'store/slices/couponSlice';
import { toggleSelectedCoupon } from 'store/slices/eventSlice';

const CoupenDropdown = () => {
    const dispatch = useDispatch();
    const { filteredCoupons, loading: couponLoading } = useSelector(
        (state) => state.coupons
    );
    const { selectedCoupons } = useSelector(
        (state) => state.event
    );

    useEffect(() => {
        dispatch(fetchAllCoupons({}));
    }, [dispatch]);

    const handleCouponSelect = (couponId) => {
        const selectedCoupon = filteredCoupons.find(
            (coupon) => coupon.id === couponId
        );
        if (selectedCoupon) {
            dispatch(toggleSelectedCoupon(selectedCoupon));
        }
    };

    return (
        <div>
            <Form.Item name="coupon" label="Coupon">
                <Select
                    loading={couponLoading}
                    style={{ width: "100%" }}
                    placeholder="Please select"
                    value={selectedCoupons.length ? selectedCoupons[0].id : undefined}
                    onChange={(value) => handleCouponSelect(value)}
                >
                    {filteredCoupons.map((coupon) => (
                        <Option key={coupon.id} value={coupon.id}>
                            {coupon.name}
                        </Option>
                    ))}
                </Select>
            </Form.Item>
        </div>
    )
}

export default CoupenDropdown