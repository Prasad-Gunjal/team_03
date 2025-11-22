import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import LoginForm from "./pages/LoginForm";
import Dashboard from "./pages/Dashboard";
import Profile from "./components/Dashboard/Profile"; 
import ReportIssue from "./components/Dashboard/ReportIssue";
import AdminDashboard from "./pages/AdminDashboard";
import ViewDetails from "./components/Dashboard/ViewDetails";
import WorkProgressDashboard from "./pages/WorkProgressDashboard";
import MyReports from "./components/Dashboard/MyReports";
import Analytics from "./components/Dashboard/Analytics";
import AreaMap from "./components/Dashboard/AreaMap";
import CommunityReports from "./components/Dashboard/Community";

import AreaMapPage from "./pages/AreaMapPage";
import AdminMapPage from "./pages/AdminMapPage";
import AdminUserManagement from "./components/AdminDashboard/AdminUserManagement";
import AdminComplaints from "./pages/AdminComplaints";
// import AdminDepartments from "./pages/AdminDepartments";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminReportDetails from "./pages/AdminReportDetails";
import Community from "./pages/Community";
import BackToTopButton from "./components/common/BackToTopButton";
import ScrollProgressIndicator from "./components/common/ScrollProgressIndicator";
import "./utils/debugAuth"; // Import debug utility

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        {/* Scroll Progress Indicator - Shows on all pages */}
        <ScrollProgressIndicator height="4px" />
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login/*" element={<LoginForm />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard/>}/>
          <Route path="/admin/users" element={<AdminUserManagement/>}/>
          <Route path="/admin/complaints" element={<AdminComplaints/>} />
          {/* <Route path="/admin/departments" element={<AdminDepartments/>} /> */}
          <Route path="/admin/analytics" element={<AdminAnalytics/>} />
          <Route path="/admin/report-details" element={<AdminReportDetails/>} />
          <Route path="/community" element={<Community/>} />
          <Route path="/profile" element={<Profile />} /> {/* ✅ add route */}
          <Route path="/view-details" element={<ViewDetails />} /> {/* ✅ add view details route */}
          <Route path="/my-reports" element={<MyReports />} /> {/* ✅ add reports route */}
          <Route path="/analytics" element={<Analytics />} /> {/* ✅ add analytics route */}
          <Route path="/map" element={<AreaMapPage />} />
          <Route path="/communitys" element={<CommunityReports />} /> {/* ✅ add community route */}
          <Route path="/reportissue" element={<ReportIssue />} /> {/* ✅ add report issue route */}
          <Route path="/work-progress" element={<WorkProgressDashboard />} />
          
          <Route path="/admin/map" element={<AdminMapPage />} />
        </Routes>
        
        {/* Back to Top Button - Shows on all pages */}
        <BackToTopButton />
      </div>
    </BrowserRouter>
  );
}

export default App;
