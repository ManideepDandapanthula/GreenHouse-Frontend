import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import GreenhouseDashboard from "./GreenhouseDashboard";
import SensorHistory from "./SensorHistory";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GreenhouseDashboard />} />
        <Route path="/history" element={<SensorHistory />} />
      </Routes>
    </Router>
  );
}

export default App;
