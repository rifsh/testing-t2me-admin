import { Response } from 'miragejs';

export default function authFakeApi(server, apiPrefix) {
    server.get(`${apiPrefix}/category/list`, (schema) => {
        const categories = schema.db.categoryData; 
        if (categories && categories.length > 0) {
            return {
                data: categories,
                status: {
                    message: "success",
                    status_code: 200,
                },
            };
        }
        return new Response(401, {}, { message: "Invalid request. No categories found." });
    });
}
