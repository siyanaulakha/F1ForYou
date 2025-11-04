import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";

import HomePage from "./pages/HomePage";
import Seasons from "./pages/Seasons";
import DriversPage from "./pages/DriversPage";
import TeamsPage from "./pages/TeamsPage"
import Circuits from "./pages/Circuits.jsx"
import CircuitDetails from "./pages/CircuitsDetails.jsx"
import SeasonDetailPage from "./pages/seasons/SeasonDetailPage.jsx";
import ContactUs from "./pages/ContactUs.jsx";

export default function App() {
  return (
    <div className="app d-flex flex-column min-vh-100">
      <Navbar />
      <main className="flex-grow-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/seasons" element={<Seasons />} />
          <Route path="/seasons/:year" element={<SeasonDetailPage />} />
          <Route path="/drivers" element={<DriversPage />} />
          <Route path="/teams" element={<TeamsPage />} />
          <Route path="/circuits" element={<Circuits />} />
          <Route path="/circuits/:slug" element={<CircuitDetails />} />
          <Route path="/contact" element={<ContactUs />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}


