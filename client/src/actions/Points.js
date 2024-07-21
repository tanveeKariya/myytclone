import * as api from "../api";

export const getPoints = (id) => async (dispatch) => {
  try {
    const { data } = await api.getPoints(id);
    console.log("Fetched Points Data:", data); // Add this line to log the fetched data
    dispatch({ type: 'GET_POINTS', payload: data });
  } catch (error) {
    console.log(error);
  }
};

export const updatePoints = (id, updateData) => async (dispatch) => {
  try {
    const { data } = await api.updatePoints(id, updateData);
    console.log("Updated Points Data:", data); // Add this line to log the updated data
    dispatch({ type: 'UPDATE_POINTS', payload: data });
  } catch (error) {
    console.log(error);
  }
};