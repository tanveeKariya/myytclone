const pointsReducer = (state = { points: 0 }, action) => {
    switch (action.type) {
      case 'GET_POINTS':
        console.log("Reducer GET_POINTS Payload:", action.payload); // Add this line to log the action payload
        return { ...state, points: action.payload.points }; // Access the 'points' field explicitly
      case 'UPDATE_POINTS':
        console.log("Reducer UPDATE_POINTS Payload:", action.payload); // Add this line to log the action payload
        return { ...state, points: action.payload.points }; // Access the 'points' field explicitly
      default:
        return state;
    }
  };
  
  export default pointsReducer;