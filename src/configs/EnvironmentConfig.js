const dev = {
   API_ENDPOINT_URL: 'https://uat-tickets2me.mitetechnology.in'
//   API_ENDPOINT_URL: 'http://192.168.1.100:8000'
//    API_ENDPOINT_URL: 'http://192.168.1.21:8000'

};
const prod = {
	API_ENDPOINT_URL: 'https://uat-tickets2me.mitetechnology.in'
};

const test = {
	API_ENDPOINT_URL: '/api'
};

const getEnv = () => {	
	switch (process.env.NODE_ENV) {
		case 'development':
			return dev
		case 'production':
			return prod
		case 'test':
			return test
		default:
			break;
	}
}

export const env = getEnv()
