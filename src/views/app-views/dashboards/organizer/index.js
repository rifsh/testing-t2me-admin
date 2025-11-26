import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserdata } from "store/slices/authSlice";
import {
  fetchMovieUserDetails,
  fetchUserDetails,
  fetchUserTheaters,
} from "store/slices/reportSlice";
import { DEFAULT_PAGE_SIZE } from "constants/PageConstants";
import LoadingOverlay from "components/util-components/Loader";
import usePaginationHook from "utils/hooks/usePaginationHandler";
import { message } from "antd";
import ReportHeader from "views/app-views/components/dashboard/ReportHeader";
import StatisticsCards from "views/app-views/components/dashboard/StatisticsCards";
import RevenueChart from "views/app-views/components/dashboard/RevenueChart";
import TopPerformers from "views/app-views/components/dashboard/TopPerformers";

const OrganizerReport = () => {
  const [activeSegment, setActiveSegment] = useState("events");
  const [timeFilter, setTimeFilter] = useState("option");
  const [customDateRange, setCustomDateRange] = useState([]);
  const reportRef = useRef(null);

  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getUserdata());
  }, [dispatch]);

  const organizerId = userData?.id;

  const { data: userTheaters } = useSelector(
    (state) => state.report.userTheaters
  );
  const selectedCountry = useSelector((state) => state.report.selectedCountry);
  const { data: userDetailsData, loading: userDetailsLoading } = useSelector(
    (state) => state.report.userDetails
  );
  const { data: movieUserDetailsData, loading: movieUserDetailsLoading } =
    useSelector((state) => state.report.movieUserDetails);

  usePaginationHook(fetchMovieUserDetails);

  useEffect(() => {
    if (!organizerId) return;

    if (activeSegment === "events") {
      dispatch(
        fetchUserDetails({ userId: organizerId, countryId: selectedCountry })
      );
    } else {
      dispatch(
        fetchMovieUserDetails({
          userId: organizerId,
          countryId: selectedCountry,
        })
      );
    }
  }, [dispatch, organizerId, activeSegment, selectedCountry]);

  useEffect(() => {
    const fetchData = async () => {
      if (organizerId && selectedCountry) {
        try {
          await dispatch(
            fetchUserTheaters({
              pageData: DEFAULT_PAGE_SIZE,
              userId: organizerId,
              countryId: selectedCountry,
            })
          );
        } catch (error) {
          console.error("Failed to fetch user details:", error);
          message.error(
            error.payload?.message || "Failed to load user details"
          );
        }
      }
    };
    fetchData();
  }, [dispatch, organizerId, selectedCountry]);

  const userTheaterList = userTheaters?.items;
  const organizerInfo = userDetailsData?.[0] || movieUserDetailsData?.[0];

  return (
    <div className="min-h-screen mr-2" ref={reportRef}>
      <LoadingOverlay loading={userDetailsLoading || movieUserDetailsLoading} />
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-8">
            <ReportHeader
              activeSegment={activeSegment}
              setActiveSegment={setActiveSegment}
              timeFilter={timeFilter}
              setTimeFilter={setTimeFilter}
              customDateRange={customDateRange}
              setCustomDateRange={setCustomDateRange}
              reportRef={reportRef}
            />

            <StatisticsCards
              activeSegment={activeSegment}
              organizerInfo={organizerInfo}
              movieUserDetailsData={movieUserDetailsData}
            />

            <RevenueChart
              activeSegment={activeSegment}
              organizerInfo={organizerInfo}
              userTheaterList={userTheaterList}
            />
          </div>

          <aside className="space-y-8">
            <TopPerformers
              activeSegment={activeSegment}
              organizerInfo={organizerInfo}
              userTheaterList={userTheaterList}
            />
          </aside>
        </div>
      </div>
    </div>
  );
};

export default OrganizerReport;
