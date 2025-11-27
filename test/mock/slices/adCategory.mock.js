export const adCategoryMock = {
    fetchResponse: {
        data: [
            {
                items: [{ id: 1, name: 'Category 1' }],
                pagination: { page: 1, total: 1 }
            },
            {
                items: [{ id: 2, name: 'Category 1' }],
                pagination: { page: 1, total: 1 }
            },
        ]
    },
    addResponse: {
        data: {
            id: 2,
            name: "New Category"
        },
        status: {
            message: "Added successfully"
        }
    },
    validateResponse: {
        data: [
            {
                validation_status: true
            }
        ]
    }
};