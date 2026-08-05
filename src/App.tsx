import './index.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";

import About from "./pages/About";

import Contact from "./pages/Contact";

// import AdmissionForm from "./pages/Admission";

// import LibraryDashboard from "./pages/Dashboard"

import ExpirationsPage from "./pages/Expire";

// import RenewalForm from "./pages/Renewal";

// import SettingsPage from "./pages/Setting";
import PolicyPage from './pages/Privacy';
import SignupPage from './pages/Signup';
import LoginPage from './pages/Login';
import VerifyEmailPage from './pages/VerifyEmailPage';
import MePage from './pages/mePage';
import LibraryPage from './pages/LibraryPage';
import SettingLibraryPage from './pages/SettingLibraryPage';
import AdmissionPage from './pages/Admission';
import RenewalPage from './pages/Renewal';
import PaymentDashboardPage from './pages/PaymentDashboardPage';
import LatestActivityPage from './pages/LatestActivityPage';
import SeatManagementPage from './pages/seatmanagementPage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import NotFound from './pages/NotFound';

const App: React.FC = () => {

  return (

    <Router>

      {/* <nav>

        <Link to="/">Home</Link> |{" "}

        <Link to="/about">About</Link> |{" "}

        <Link to="/contact">Contact</Link> | {" "}

        <Link to="/admission">Admission</Link> | {" "}

        <Link to="/dashboard">Dashboard</Link> | {" "}

        <Link to="/expire">Expire</Link> | {" "}

        <Link to="/setting">Setting</Link> | {" "}

        <Link to="/renew">Renew</Link>

      </nav> */}



      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/about" element={<About />} />

        <Route path="/contact" element={<Contact />} />

        {/* <Route path="/admission" element={<AdmissionForm />} /> */}

        {/* <Route path="/dashboard" element={<LibraryDashboard />} />   */}



        {/* <Route path="/renew" element={<RenewalForm />} /> */}

        {/* <Route path="/setting" element={<SettingsPage />} /> */}
        <Route path="/privacy" element={<PolicyPage />} />
        <Route path="/contact" element={<Contact />} />

        <Route path="/signup" element={<SignupPage />} />
        <Route path="/signin" element={<LoginPage />} />
        <Route path="/me" element={<MePage />} />
        <Route path="/library/:id" element={<LibraryPage />} />
        <Route path="/library/:id/settings" element={<SettingLibraryPage />} />
        <Route path="/library/:id/admission" element={<AdmissionPage />} />

        <Route path="/library/:id/payment" element={<PaymentDashboardPage />} />
        <Route path="/library/:id/seatmanagement" element={<SeatManagementPage />} />
        <Route path="/library/:id/expiring" element={<ExpirationsPage />} />
        <Route path="/library/:id/renewals" element={<RenewalPage />} />

        <Route path="/library/:id/activity" element={<LatestActivityPage />} />

        <Route
          path="/verify-email/:EmailVerificationToken"
          element={<VerifyEmailPage />}
        />


        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="*" element={<NotFound />} />
      </Routes>





    </Router>

  );

};



export default App;