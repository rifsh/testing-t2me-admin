import { Card, Tabs } from 'antd'
import React from 'react'
import TheaterList from '../components/TheaterList';
import TheaterCompaniesList from '../components/TheaterCompaniesList';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveTab } from 'store/slices/theaterSlice';

const Index = () => {
    const dispatch = useDispatch();
    const { activeTab } = useSelector((state) => state.theater);

    const handleTabChange = (key) => {
        dispatch(setActiveTab(key));
    }
    return (
        <>
            <Card>
                <Tabs activeKey={activeTab} onChange={handleTabChange}>
                    <Tabs.TabPane tab="Companies" key="Companies">
                        <>
                            <TheaterCompaniesList />
                        </>
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="Theaters" key="theater">
                        <>
                            <TheaterList />
                        </>
                    </Tabs.TabPane>
                </Tabs>
            </Card>
        </>
    )
}

export default Index