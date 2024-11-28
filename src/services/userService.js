import fetch from 'auth/FetchInterceptor';

const userService = {};

userService.getAllUsers = function () {
    return fetch({
        url: '/v1/auth/secured/users/',
        method: 'get',
    })
        .then((response) => {
            console.log("fetchedUsers:", response.data);
            return response.data;
        })
        .catch((error) => {
            console.error("Error fetching users:", error);
            throw error;
        });
};

userService.createUser = function (userData) {
    return fetch({
        url: '/v1/auth/secured/register/',
        method: 'post',
        data: userData,
    })
        .then((response) => {
            console.log("User created:", response.data);
            return response.data;
        })
        .catch((error) => {
            console.log("Error creating user:", error);
            throw error;
        });
};



export default userService;