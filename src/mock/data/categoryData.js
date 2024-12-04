const CategoryMockData = {};
CategoryMockData.fetchAllCategory = {
  data: [
    {
      status: true,
      created_at: "2024-12-02T17:52:07.160145",
      updated_at: "2024-12-02T17:52:07.162218",
      name: "Sports",
      description: "dsafaskd",
      id: 1,
    },
    {
      status: false,
      created_at: "2024-12-02T18:00:00.000000",
      updated_at: "2024-12-02T18:10:00.000000",
      name: "Technology",
      description: "Latest trends and news in technology",
      id: 2,
    },
    {
      status: true,
      created_at: "2024-12-02T18:20:00.000000",
      updated_at: "2024-12-02T18:25:00.000000",
      name: "Health",
      description: "Health tips and wellness guides",
      id: 3,
    },
    {
      status: false,
      created_at: "2024-12-02T18:30:00.000000",
      updated_at: "2024-12-02T18:40:00.000000",
      name: "Entertainment",
      description: "Movies, music, and celebrity news",
      id: 4,
    },
    {
      status: true,
      created_at: "2024-12-02T19:00:00.000000",
      updated_at: "2024-12-02T19:10:00.000000",
      name: "Education",
      description: "Educational resources and news",
      id: 5,
    },
  ],
  status: {
    message: "success",
    status_code: 200,
  },
};
CategoryMockData.fetchSubCategory={
  "data": [
      {
          "status": true,
          "created_at": "2024-12-02T17:52:07.160145",
          "updated_at": "2024-12-02T17:52:07.162218",
          "name": "xzfgdsa",
          "description": "dfsfsdsafas",
          "id": 1,
          "category_id": 1
      },
      {
          "status": true,
          "created_at": "2024-12-02T18:30:00.000000",
          "updated_at": "2024-12-02T18:40:00.000000",
          "name": "Football",
          "description": "All about football news and events",
          "id": 2,
          "category_id": 1
      },
      {
          "status": true,
          "created_at": "2024-12-02T18:45:00.000000",
          "updated_at": "2024-12-02T18:50:00.000000",
          "name": "Cricket",
          "description": "Cricket updates and match highlights",
          "id": 3,
          "category_id": 1
      },
      {
          "status": false,
          "created_at": "2024-12-02T19:00:00.000000",
          "updated_at": "2024-12-02T19:10:00.000000",
          "name": "Artificial Intelligence",
          "description": "Updates on AI advancements and research",
          "id": 4,
          "category_id": 2
      },
      {
          "status": true,
          "created_at": "2024-12-02T19:15:00.000000",
          "updated_at": "2024-12-02T19:20:00.000000",
          "name": "Fitness",
          "description": "Fitness tips and workout routines",
          "id": 5,
          "category_id": 3
      },
      {
          "status": false,
          "created_at": "2024-12-02T19:25:00.000000",
          "updated_at": "2024-12-02T19:30:00.000000",
          "name": "Hollywood",
          "description": "Hollywood movies and celebrity gossip",
          "id": 6,
          "category_id": 4
      },
      {
          "status": true,
          "created_at": "2024-12-02T19:35:00.000000",
          "updated_at": "2024-12-02T19:40:00.000000",
          "name": "E-learning",
          "description": "Online learning resources and platforms",
          "id": 7,
          "category_id": 5
      }
  ],
  "status": {
      "message": "success",
      "status_code": 200
  }
}

export default CategoryMockData;
