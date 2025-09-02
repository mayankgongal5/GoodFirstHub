import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

function TestApp() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
        BeginnerContribute Test
      </h1>
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-600">
          If you can see this, the basic React app is working!
        </p>
        <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Test Button
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="*" element={<TestApp />} />
      </Routes>
    </Router>
  );
}

export default App;
