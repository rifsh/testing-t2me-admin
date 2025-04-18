import React, { useState } from "react";
import { CalendarOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { extractMovies, formatMinutes } from "./utils";
import { Input } from "antd";

export default function MovieList({ movies, handleDragStart }) {
  return (
    <div
      className="w-64 bg-white p-3 rounded-xl shadow"
      style={{ overflow: "auto", maxHeight: "80vh" }}
    >
      <h2 className="font-bold mb-4 flex items-center gap-1">
        <CalendarOutlined size={16} />
        Available Movies
      </h2>

      <div className="space-y-2">
        {movies.length > 0 ? (
          movies.map((movie) => (
            <div
              key={movie.id}
              className="p-3 rounded-xl border cursor-move flex items-center justify-between"
              draggable
              onDragStart={(e) => handleDragStart(e, movie)}
            >
              <div className="flex items-center gap-2">
                {movie.image && (
                  <img
                    src={movie.image}
                    alt={movie.title}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                )}
                <div>
                  <div className="font-medium">{movie.title}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <ClockCircleOutlined size={12} />
                    {formatMinutes(movie.duration)}
                  </div>
                </div>
              </div>
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: movie.color }}
              ></div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 p-4">
            No movies available
          </div>
        )}
      </div>
    </div>
  );
}
