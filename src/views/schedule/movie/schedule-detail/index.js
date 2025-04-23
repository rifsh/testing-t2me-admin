import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import Loading from "components/shared-components/Loading";
import { getMovieScheduleDetails } from "store/slices/movieScheduleSlice";
import {
  FaCalendarAlt,
  FaClock,
  FaFilm,
  FaTicketAlt,
  FaCouch,
} from "react-icons/fa";

const ScheduleDetails = () => {
  const { scheduleId } = useParams();
  const dispatch = useDispatch();
  const { singleSchedule, loading } = useSelector(
    (state) => state.movieScheduleSlice
  );
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    if (scheduleId) {
      dispatch(getMovieScheduleDetails({ schedule_id: scheduleId }));
    }
  }, [dispatch, scheduleId]);

  if (loading) {
    return <Loading />;
  }

  if (!singleSchedule) {
    return <div>No schedule data found</div>;
  }

  const uniqueDates = singleSchedule.movie_show
    ? [...new Set(singleSchedule.movie_show.map((show) => show.movie_date))]
    : [];

  const formatTime = (timeString) => {
    if (!timeString) return "-";
    return dayjs(`2000-01-01T${timeString}`).format("h:mm A");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return dayjs(dateString).format("MMMM D, YYYY");
  };

  const formatDateShort = (dateString) => {
    if (!dateString) return "-";
    return dayjs(dateString).format("MMM D");
  };

  const handleDateClick = (date) => {
    setSelectedDate(date === selectedDate ? null : date);
  };

  const filteredShows =
    selectedDate && singleSchedule.movie_show
      ? singleSchedule.movie_show.filter(
          (show) => show.movie_date === selectedDate
        )
      : singleSchedule.movie_show || [];
  const isOvernight = (show) => {
    if (!show) return false;
    const startHour = parseInt(show.start_time.split(":")[0]);
    const endHour = parseInt(show.end_time.split(":")[0]);
    return startHour > endHour || (startHour < 6 && endHour < 6);
  };

  const getMovieName = (movieId) => {
    const movieNames = {
      24: "Avengers: Secret Wars",
      25: "The Marvels 2",
    };
    return movieNames[movieId] || `Movie #${movieId}`;
  };

  return (
    <div className="max-w-8xl mx-auto">
      <div className="bg-white text-white p-6 rounded-t-xl shadow-md">
        <div className="flex items-center gap-2">
          <FaCalendarAlt />
          <h1 className="text-3xl font-bold">{singleSchedule.name}</h1>
        </div>
        <p className="mt-2 flex items-center gap-2">
          <FaClock />
          {formatDate(singleSchedule.start_date)} -{" "}
          {formatDate(singleSchedule.end_date)}
        </p>
        <span className="inline-block mt-2 bg-yellow-500 text-blue-900 px-3 py-1 rounded-full text-sm font-semibold">
          {singleSchedule.schedule_status}
        </span>
      </div>
      {uniqueDates.length > 0 && (
        <div className="bg-white p-4 flex overflow-x-auto gap-2 shadow-md">
          <button
            className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap ${
              !selectedDate ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
            onClick={() => setSelectedDate(null)}
          >
            All Shows
          </button>
          {uniqueDates.map((date) => (
            <button
              key={date}
              className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap ${
                selectedDate === date ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
              onClick={() => handleDateClick(date)}
            >
              {formatDateShort(date)}
            </button>
          ))}
        </div>
      )}

      <div className="bg-white p-6 rounded-b-lg shadow-md">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FaFilm /> Movie Shows
        </h2>

        {filteredShows.length === 0 ? (
          <p className="text-gray-500">
            No shows available for the selected date.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredShows.map((show) => (
              <div
                key={show.id}
                className="border rounded-xl p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">
                      {getMovieName(show.movie_id)}
                    </h3>
                    <p className="text-gray-600 mt-1">
                      {formatDate(show.movie_date)}
                    </p>
                    <div className="mt-2 flex items-center text-gray-700 gap-1">
                      <FaClock className="text-blue-600" />
                      <span className="mr-4">
                        {formatTime(show.start_time)} -{" "}
                        {formatTime(show.end_time)}
                      </span>
                      <span>
                        ⌛ {Math.floor(show.duration / 60)}h{" "}
                        {show.duration % 60}m
                      </span>
                      {isOvernight(show) && (
                        <span className="ml-2 bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                          Overnight
                        </span>
                      )}
                    </div>
                    <div className="mt-2">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <FaCouch className="text-blue-600" />
                        <span>Screen #{show.screen_id}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                        <FaTicketAlt className="text-blue-600" />
                        <span>
                          Booking: {formatDateShort(show.booking_start_date)} at{" "}
                          {formatTime(show.booking_start_time)} -{" "}
                          {formatDateShort(show.movie_date)} at{" "}
                          {formatTime(show.start_time)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      show.is_online_ticket
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {show.is_online_ticket
                      ? "Online Booking"
                      : "Box Office Only"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleDetails;
