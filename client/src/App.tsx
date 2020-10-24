import React from "react";
import { useSelector } from "react-redux";
import { AppState } from "./redux/reducers/rootReducer";
import HomePage from "./pages/homePage";
import CampPage from "./pages/campPage";
function App() {
  const selectedCampId = useSelector<AppState>(
    (state) => state.camp.selectedCampId
  );
  return <div>{selectedCampId ? <CampPage /> : <HomePage />}</div>;
}
export default App;
