import { Form, Select } from 'antd'
import { Option } from 'antd/es/mentions';
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toggleSelectedOffer } from 'store/slices/eventSlice';
import { fetchAllOffers } from 'store/slices/offerSlice';

const OffersDropdown = () => {
    const dispatch = useDispatch();
    const {
        filteredOffers: filteredOffer,
        loading: offerLoading,
    } = useSelector((state) => state.offers);
    const { selectedOffers } = useSelector(
        (state) => state.event
    );

    useEffect(() => {
        dispatch(fetchAllOffers({ active: true }));
    }, [dispatch]);

    const handleOfferSelect = (offerId) => {
        const selectedOffer = filteredOffer.find((offer) => offer.id === offerId);
        if (selectedOffer) {
            dispatch(toggleSelectedOffer(selectedOffer));
        }
    };

    return (
        <div>
            <Form.Item name="offer" label="Offer">
                <Select
                    loading={offerLoading}
                    style={{ width: "100%" }}
                    placeholder="Please select"
                    value={selectedOffers.length ? selectedOffers[0].id : undefined}
                    onChange={(value) => handleOfferSelect(value)}
                >
                    {filteredOffer.map((offer) => (
                        <Option key={offer.id} value={offer.id}>
                            {offer.name}
                        </Option>
                    ))}
                </Select>
            </Form.Item>
        </div>
    )
}

export default OffersDropdown