import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { PrivateRoute, AdminProtectedRoute } from "./routes/AuthRoute";
import ScrollToTop from "./components/layout/ScrollToTop";
import SeoHead from "./components/seo/SeoHead";
import Loading from "./components/ui/Loading";

// Core Website Layout & Landing Page (Eager for immediate first-paint LCP)
import Layout from "./layouts/Layout";
import Home from "./pages/public/Home";

// Lazy Website Subpages
const Contact = lazy(() => import("./pages/public/Contact"));
const AboutPage = lazy(() => import("./pages/public/About"));
const FoundersMessage = lazy(() => import("./pages/public/FoundersMessage"));
const WhyUs = lazy(() => import("./pages/public/WhyUs"));
const FAQ = lazy(() => import("./pages/public/FAQ"));
const Career = lazy(() => import("./pages/public/Career"));
const PhotoGallery = lazy(() => import("./pages/public/media/PhotoGallery"));
const VideoGallery = lazy(() => import("./pages/public/media/VideoGallery"));
const Architecture = lazy(() => import("./pages/public/services/Architecture"));
const InteriorDesign = lazy(() => import("./pages/public/services/InteriorDesign"));
const Construction = lazy(() => import("./pages/public/services/Construction"));
const OfficeRenovation = lazy(() => import("./pages/public/services/OfficeRenovation"));
const ServiceDetail = lazy(() => import("./pages/public/services/ServiceDetail"));
const ProjectsPage = lazy(() => import("./pages/public/projects/Project"));
const ProjectDetailsPage = lazy(() => import("./pages/public/projects/ProjectDetails"));
const QuotePage = lazy(() => import("./pages/public/Quote"));
const BlogDetails = lazy(() => import("./pages/public/blog/BlogDetails"));
const BlogsPage = lazy(() => import("./pages/public/blog/BlogPage"));
const PrivacyPolicy = lazy(() => import("./pages/public/PrivacyPolicy"));
const NotFound = lazy(() => import("./pages/public/NotFound"));

// Lazy Auth & Experience Pages
const Login = lazy(() => import("./pages/auth/Login"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const YashmeenNibExperience = lazy(() => import("./components/experiments/YashmeenNibExperience"));

// Lazy Admin Layout & Pages (Isolates CKEditor & Admin dashboard from visitor bundle)
const AdminLayout = lazy(() => import("./layouts/AdminLayout"));
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
      <SeoHead />
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/normal-is-boring" element={<YashmeenNibExperience />} />
          <Route path="/experience" element={<YashmeenNibExperience />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
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
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/gallery" element={<Navigate to="/photo-gallery" replace />} />
            <Route path="/services" element={<Navigate to="/services/interior-design" replace />} />
            <Route path="/services/architecture" element={<Architecture />} />
            <Route path="/services/interior-design" element={<InteriorDesign />} />
            <Route path="/services/construction" element={<Construction />} />
            <Route path="/services/office-renovation" element={<OfficeRenovation />} />
            <Route path="/services/:slug" element={<ServiceDetail />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          {/* ===== Admin Layout ====== */}
          <Route element={<AdminLayout />}>
            <Route element={<PrivateRoute />}>
              <Route element={<AdminProtectedRoute />}>
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
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}
