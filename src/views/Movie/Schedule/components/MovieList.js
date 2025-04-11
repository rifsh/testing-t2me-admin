import React from "react";
import { List, Card, Typography } from "antd";

const { Text } = Typography;

const MovieList = ({ movies, onMovieSelect }) => {
  return (
    <List
      dataSource={movies}
      renderItem={(movie) => (
        <List.Item style={{ padding: "8px 16px" }}>
          <Card
            hoverable
            bodyStyle={{ padding: 12 }}
            style={{ width: "100%", cursor: "pointer" }}
            onClick={() => onMovieSelect(movie)}
          >
            <div className="flex">
              <div style={{ width: 60, height: 80, overflow: "hidden" }}>
                {movie.image ? (
                  <img
                    src={movie.image}
                    alt={movie.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      backgroundColor: "#f0f0f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    No Image
                  </div>
                )}
              </div>
              <div className="ml-3 flex-1">
                <div className="font-semibold text-sm truncate">
                  {movie.title}
                </div>
                <Text type="secondary" className="text-xs">
                  {movie.duration} min | {movie.genre}
                </Text>
                <div className="text-xs text-gray-500 mt-1">
                  Dir: {movie.director}
                </div>
              </div>
            </div>
          </Card>
        </List.Item>
      )}
    />
  );
};

export default MovieList;
