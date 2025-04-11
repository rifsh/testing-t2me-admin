import { Card, Tabs } from 'antd'
import React from 'react'
import TheaterList from '../components/TheaterList';
import TheaterCompaniesList from '../components/TheaterCompaniesList';

const Index = () => {

    return (
        <>
            <Card>
                <Tabs defaultActiveKey="1">
                    <Tabs.TabPane tab="Companies" key="1">
                        <>
                            <TheaterCompaniesList />
                        </>
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="Theaters" key="2">
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