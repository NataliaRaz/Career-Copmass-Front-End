import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import ExplorePage from "./pages/ExplorePage";
import ShadowPage from "./pages/ShadowPage";
import PostOpportunityPage from "./pages/PostOpportunityPage";
import AboutPage from "./pages/AboutPage";
import BookmarksPage from "./pages/BookmarksPage";
import MentorProfilePage from "./pages/MentorProfilePage";
import ProfilePage from "./pages/ProfilePage";
import UnifiedSignUpPage from "./pages/UnifiedSignUpPage";
import ShadowSessionDetailPage from "./pages/ShadowSessionDetailPage";
import ProfessionDetailPage from "./pages/ProfessionDetailPage";
import HostDashboardPage from "./pages/HostDashboardPage";


export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="explore" element={<ExplorePage />} />
          <Route path="shadow" element={<ShadowPage />} />
          <Route path="post-opportunity" element={<PostOpportunityPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="bookmarks" element={<BookmarksPage />} />
          <Route path="mentor/:mentorId" element={<MentorProfilePage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="signup" element={<UnifiedSignUpPage />} />
          <Route path="host-dashboard" element={<HostDashboardPage />} />
          <Route path="shadow/:roleId" element={<ShadowSessionDetailPage />} />
          <Route path="explore/profession/:id" element={<ProfessionDetailPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
