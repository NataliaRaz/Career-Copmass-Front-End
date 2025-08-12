import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout"; // or "./components/Layout" if that’s your path
import HomePage from "./pages/HomePage";
import ExplorePage from "./pages/ExplorePage";
import SessionsPage from "./pages/SessionsPage";
import PostOpportunityPage from "./pages/PostOpportunityPage";
import AboutPage from "./pages/AboutPage";
import BookmarksPage from "./pages/BookmarksPage";
import MentorProfilePage from "./pages/MentorProfilePage";
import ProfilePage from "./pages/ProfilePage";
import UnifiedSignUpPage from "./pages/UnifiedSignUpPage";
import ShadowSessionDetailPage from "./pages/ShadowSessionDetailPage";
import ProfessionDetailPage from "./pages/ProfessionDetailPage";
import LoginPage from "./pages/LoginPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="explore" element={<ExplorePage />} />
        <Route path="shadow" element={<SessionsPage />} />
        <Route path="sessions" element={<SessionsPage />} />

        {/* Opportunities */}
        <Route path="opportunity/new" element={<PostOpportunityPage />} />
        <Route path="opportunity/:id" element={<PostOpportunityPage />} />
        <Route path="edit-opportunity/:id" element={<PostOpportunityPage />} />
        <Route path="opportunities/new" element={<PostOpportunityPage />} />
        <Route path="opportunities/:id" element={<PostOpportunityPage />} />

        {/* Other */}
        <Route path="about" element={<AboutPage />} />
        <Route path="bookmarks" element={<BookmarksPage />} />
        <Route path="mentor/:mentorId" element={<MentorProfilePage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="signup" element={<UnifiedSignUpPage />} />
        <Route path="shadow/:roleId" element={<ShadowSessionDetailPage />} />
        <Route path="explore/profession/:id" element={<ProfessionDetailPage />} />
      </Route>
    </Routes>
  );
}