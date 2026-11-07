import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { PrivateRoute, AdminProtectedRoute } from "./pages/routes/AuthRoute";
import ScrollToTop from "./components/ScrollToTop";
import Loading from "./components/Loading";

// Website Pages (Immediate / Core)
import Layout from "./pages/layout/Layout";
import Home from "./pages/website/Home";
import SVG from "./pages/website/SVG";
import Contact from "./pages/website/Contact";
import AboutPage from "./pages/website/About";
import FoundersMessage from "./pages/website/foundersMessage";
import WhyUs from "./pages/website/WhyUs";
import FAQ from "./pages/website/FAQ";
import Career from "./pages/website/Career";
import PhotoGallery from "./pages/website/PhotoGallery";
import VideoGallery from "./pages/website/VideoGallery";
import Architecture from "./pages/website/Architecture";
import InteriorDesign from "./pages/website/InteriorDesign";
import Construction from "./pages/website/Construction";
import OfficeRenovation from "./pages/website/OfficeRenovation";
import ProjectsPage from "./pages/website/Project";
import ProjectDetailsPage from "./pages/website/ProjectDetails";
import QuotePage from "./pages/website/Quote";
import BlogDetails from "./pages/website/BlogDetails";
import BlogsPage from "./pages/website/BlogPage";

// Lazy Auth Pages
const Login = lazy(() => import("./pages/auth/Login"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const ParallaxDemo = lazy(() => import("./demos/default"));
const YashmeenNibExperience = lazy(() => import("./components/yashmeen-nib/YashmeenNibExperience"));

// Lazy Admin Layout & Pages (Isolates CKEditor & Admin dashboard from visitor bundle)
const AdminLayout = lazy(() => import("./pages/layout/AdminLayout"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const CategoryManager = lazy(() => import("./pages/admin/CategoryManager"));
const EnquiryManager = lazy(() => import("./pages/admin/EnquiryManager"));
const QuoteManager = lazy(() => import("./pages/admin/QuoteManager"));
const PopupManager = lazy(() => import("./pages/admin/PopupManager"));
const VideoManager = lazy(() => import("./pages/admin/VideoManager"));
const GalleryManager = lazy(() => import("./pages/admin/GalleryManager"));
const BannerManager = lazy(() => import("./pages/admin/BannerManager"));
const VacancyManager = lazy(() => import("./pages/admin/VacancyManager"));
const ProjectManager = lazy(() => import("./pages/admin/ProjectManager"));
const PostList = lazy(() => import("./pages/admin/PostList"));
const PostCreate = lazy(() => import("./pages/admin/PostCreate"));
const PostUpdate = lazy(() => import("./pages/admin/PostUpdate"));

export default function App() {
  return (
    <Router>
      <Toaster richColors position="top-right" />
      <ScrollToTop />
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/parallax-demo" element={<ParallaxDemo />} />
          <Route path="/normal-is-boring" element={<YashmeenNibExperience />} />
          <Route path="/experience" element={<YashmeenNibExperience />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/svg" element={<SVG />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/quote" element={<QuotePage />} />
            <Route path="/blogs" element={<BlogsPage />} />
            <Route path="/blog/details/:blogId" element={<BlogDetails />} />
            <Route path="/founders-message" element={<FoundersMessage />} />
            <Route path="/why-us" element={<WhyUs />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/project/details/:projectId" element={<ProjectDetailsPage />} />
            <Route path="/careers" element={<Career />} />
            <Route path="/photo-gallery" element={<PhotoGallery />} />
            <Route path="/video-gallery" element={<VideoGallery />} />
            <Route path="/gallery" element={<Navigate to="/photo-gallery" replace />} />
            <Route path="/services" element={<Navigate to="/services/interior-design" replace />} />
            <Route path="/services/architecture" element={<Architecture />} />
            <Route path="/services/interior-design" element={<InteriorDesign />} />
            <Route path="/services/construction" element={<Construction />} />
            <Route path="/services/office-renovation" element={<OfficeRenovation />} />
          </Route>
          {/* ===== Admin Layout ====== */}
          <Route element={<AdminLayout />}>
            <Route element={<PrivateRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/categories" element={<CategoryManager />} />
              <Route path="/dashboard/enquiry" element={<EnquiryManager />} />
              <Route path="/dashboard/quotes" element={<QuoteManager />} />
              <Route path="/dashboard/popup-manager" element={<PopupManager />} />
              <Route path="/dashboard/video-manager" element={<VideoManager />} />
              <Route path="/dashboard/gallery-manager" element={<GalleryManager />} />
              <Route path="/dashboard/banner-manager" element={<BannerManager />} />
              <Route path="/dashboard/vacancy-manager" element={<VacancyManager />} />
              <Route path="/dashboard/project-manager" element={<ProjectManager />} />
              <Route path="/dashboard/blog-manager" element={<PostList />} />
              <Route path="/dashboard/create-blog" element={<PostCreate />} />
              <Route path="/dashboard/update-blog/:postId" element={<PostUpdate />} />
            </Route>
            <Route element={<AdminProtectedRoute />} />
          </Route>
          {/* 404 Catch-All */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
