const StaticsMockData = {};
StaticsMockData.fetchAnnualStats = {
  data: [
	{
		title: 'Active Events',
		value:'20', 
		status: "100",
		subtitle: `Total Events`
	},
	{
		title: 'Active Schedules',
		value:'20', 
		status: "100",
		subtitle: `Total Schedules`
	},
	{
		title: 'Users',
		value:'800', 
		status: 0.7,
		subtitle: `Active Users`
	}
  ]
};

export default StaticsMockData;
