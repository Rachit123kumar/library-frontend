import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import Home from "./pages/Home";

import About from "./pages/About";

import Contact from "./pages/Contact";

import AdmissionForm from "./pages/Admission";

import LibraryDashboard from "./pages/Dashboard"

import ExpirationsPage from "./pages/Expire";

import RenewalForm from "./pages/Renewal";

import SettingsPage from "./pages/Setting";

const App: React.FC = () => {

  return (

    <Router>

      <nav>

        <Link to="/">Home</Link> |{" "}

        <Link to="/about">About</Link> |{" "}

        <Link to="/contact">Contact</Link> | {" "}

        <Link to="/admission">Admission</Link> | {" "}

        <Link to="/dashboard">Dashboard</Link> | {" "}

        <Link to="/expire">Expire</Link> | {" "}

        <Link to="/setting">Setting</Link> | {" "}

        <Link to="/renew">Renew</Link>

      </nav>



      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/about" element={<About />} />

        <Route path="/contact" element={<Contact />} />

        <Route path="/admission" element={<AdmissionForm />} />

        <Route path="/dashboard" element={<LibraryDashboard/>} />

        <Route path="/expire" element={<ExpirationsPage/>} />

        <Route path="/renew" element={<RenewalForm />} />

        <Route path="/setting" element={<SettingsPage />} />

      </Routes>

    </Router>

  );

};



export default App;