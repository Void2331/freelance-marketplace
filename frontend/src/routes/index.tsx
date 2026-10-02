import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./protected-route";
import RoleRoute from "./role-route";

import PublicLayout from "@/components/layout/public-layout";
import AppLayout from "@/components/layout/app-layout";

import Home from "@/pages/public/home";
import BrowseJobs from "@/pages/public/browse-jobs";
import JobDetail from "@/pages/jobs/detail";
import FreelancerDirectory from "@/pages/freelancers";
import FreelancerProfile from "@/pages/freelancers/detail";
import DashboardRedirect from "@/pages/dashboard-redirect";

import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import VerifyEmail from "@/pages/auth/verify-email";
import ForgotPassword from "@/pages/auth/forgot-password";
import ResetPassword from "@/pages/auth/reset-password";
import PaymentCallback from "@/pages/payment/callback";

import ClientDashboard from "@/pages/client/dashboard";
import ClientJobs from "@/pages/client/jobs";
import CreateJob from "@/pages/client/jobs/new";
import ClientJobProposals from "@/pages/client/jobs/proposals";


import FreelancerDashboard from "@/pages/freelancer/dashboard";
import FindWork from "@/pages/freelancer/jobs";
import FreelancerProposals from "@/pages/freelancer/proposals";
import FreelancerProjects from "@/pages/freelancer/projects";
import FreelancerWallet from "@/pages/freelancer/wallet";

import AdminDashboard from "@/pages/admin/dashboard";
import AdminUsers from "@/pages/admin/users";
import AdminJobs from "@/pages/admin/jobs";
import AdminProjects from "@/pages/admin/projects";
import AdminDisputes from "@/pages/admin/disputes";

import ProjectWorkroom from "@/pages/projects/workroom";
import ProfileSettings from "@/pages/settings/profile";
import ClientProjectsPage from "@/pages/client/projects";
import ClientProposalsPage from "@/pages/client/proposal/proposals";
import Messages from "@/pages/messages";
import Notifications from "@/pages/notifications";


export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/jobs" element={<BrowseJobs />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route path="/freelancers" element={<FreelancerDirectory />} />
        <Route path="/freelancers/:id" element={<FreelancerProfile />} />
      </Route>

      {/* Authentication */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      {/* The emailed link is /verify-email?token=... */}
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardRedirect />} />

        {/* Paystack redirects here after checkout */}
        <Route path="/payment/callback" element={<PaymentCallback />} />

        <Route element={<AppLayout />}>
          {/* Shared by every role that can be part of a project */}
          <Route
            path="/projects/:id"
            element={<ProjectWorkroom />}
          />
              <Route
  path="/messages"
  element={<Messages />}
/>

<Route
  path="/notifications"
  element={<Notifications />}
/>

          <Route
            path="/settings/profile"
            element={<ProfileSettings />}
          />
      

  <Route element={<RoleRoute allowedRoles={["CLIENT"]} />}>
  <Route
    path="/client/dashboard"
    element={<ClientDashboard />}
  />

  <Route
    path="/client/jobs"
    element={<ClientJobs />}
  />

  <Route
    path="/client/jobs/new"
    element={<CreateJob />}
  />

  <Route
    path="/client/jobs/:id/edit"
    element={<CreateJob />}
  />

  <Route
    path="/client/jobs/:id"
    element={<JobDetail />}
  />

  <Route
    path="/client/jobs/:jobId/proposals"
    element={<ClientJobProposals />}
  />

  <Route
    path="/client/proposals"
    element={<ClientProposalsPage />}
  />

  <Route
    path="/client/projects"
    element={<ClientProjectsPage />}
  />

</Route>
          <Route
            element={<RoleRoute allowedRoles={["FREELANCER"]} />}
          >
            <Route
              path="/freelancer/dashboard"
              element={<FreelancerDashboard />}
            />

            <Route path="/freelancer/jobs" element={<FindWork />} />

            <Route
              path="/freelancer/jobs/:id"
              element={<JobDetail />}
            />

            <Route
              path="/freelancer/proposals"
              element={<FreelancerProposals />}
            />

            <Route
              path="/freelancer/projects"
              element={<FreelancerProjects />}
            />

            <Route
              path="/freelancer/wallet"
              element={<FreelancerWallet />}
            />
          </Route>

          <Route
            element={<RoleRoute allowedRoles={["ADMIN"]} />}
          >
            <Route
              path="/admin/dashboard"
              element={<AdminDashboard />}
            />

            <Route path="/admin/users" element={<AdminUsers />} />

            <Route path="/admin/jobs" element={<AdminJobs />} />

            <Route
              path="/admin/projects"
              element={<AdminProjects />}
            />

            <Route
              path="/admin/disputes"
              element={<AdminDisputes />}
            />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
