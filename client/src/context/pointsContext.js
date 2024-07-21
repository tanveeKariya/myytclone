import React, { createContext, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getPoints } from "../actions/Points";

export const PointsContext = createContext();

export const PointsProvider = ({ children }) => {
  const dispatch = useDispatch();
  const CurrentUser = useSelector((state) => state.currentUserReducer);
  const [points, setPoints] = useState(0);

  useEffect(() => {
    if (CurrentUser?.result?._id) {
      const fetchPoints = async () => {
        const response = await dispatch(getPoints(CurrentUser.result._id));
        setPoints(response.points);
      };
      fetchPoints();
    }
  }, [dispatch, CurrentUser]);

  return (
    <PointsContext.Provider value={{ points, setPoints }}>
      {children}
    </PointsContext.Provider>
  );
};