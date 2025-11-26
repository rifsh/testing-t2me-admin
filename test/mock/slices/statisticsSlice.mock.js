const StaticsSliceMockData = {
    fetchAnnualStatsForEvents: {
        data: [
            {
                statistics: [
                    { month: "January", count: 5 },
                    { month: "February", count: 8 }
                ]
            }
        ]
    },

    fetchAnnualStatsForUsers: {
        data: [
            {
                items: [
                    {
                        statistics: [
                            { month: "January", count: 12 },
                            { month: "February", count: 18 }
                        ]
                    }
                ],
                page: 1,
                size: 10,
                total: 35
            }
        ]
    },

    fetchUserStatsForSchedules: {
        data: [
            {
                statistics: [
                    { month: "January", count: 3 },
                    { month: "February", count: 4 }
                ]
            }
        ]
    }
};

export default StaticsSliceMockData;
