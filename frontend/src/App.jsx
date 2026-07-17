import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import { AuthProvider } from "./store/AuthContext";
import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Feed from "./pages/Feed";
import Profile from "./pages/Profile";
import ConnectionProfile from "./pages/ConnectionProfile";
import Requests from "./pages/Requests";
import Connections from "./pages/Connections";
import Chat from "./pages/Chat";
import ChatErrorBoundary from "./components/ChatErrorBoundary";
import Projects from "./pages/Projects";
import ProjectDetails from "./pages/ProjectDetails";
import SavedDevelopers from "./pages/SavedDevelopers";
import CreateProject from "./pages/CreateProject";
import MyProjects from "./pages/MyProjects";
import ProjectApplications from "./pages/ProjectApplications";
import TeamDashboard from "./pages/TeamDashboard";
import EditProject from "./pages/EditProject";
import BlockedUsers from "./pages/BlockedUsers";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Navigate to="/feed" replace />} />

        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/feed" element={<Feed />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:userId" element={<ConnectionProfile />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/connections" element={<Connections />} />
          <Route path="/saved-developers" element={<SavedDevelopers />} />
          <Route path="/blocked-users" element={<BlockedUsers />} />
          <Route
            path="/chat"
            element={
              <ChatErrorBoundary>
                <Chat />
              </ChatErrorBoundary>
            }
          />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/create" element={<CreateProject />} />
          <Route path="/projects/mine" element={<MyProjects />} />
          <Route path="/projects/:projectId" element={<ProjectDetails />} />
          <Route path="/projects/:projectId/applications" element={<ProjectApplications />} />
          <Route path="/projects/:projectId/team" element={<TeamDashboard />} />
          <Route path="/projects/:projectId/edit" element={<EditProject />} />
        </Route>

        <Route path="*" element={<Navigate to="/feed" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
