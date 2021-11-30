import React, { Suspense, lazy } from "react";
import { Switch, Route } from "react-router-dom";
import HomeRoute from "./HomeRoute";
import PublicRoute from "./PublicRoute";

const LoginView = lazy(() => import("../views/account/login/Login"));
const ForgotPasswordView = lazy(() =>
  import("../views/account/forgot-password/ForgotPassword")
);
const ResetPasswordView = lazy(() =>
  import("../views/account/reset-password/ResetPassword")
);
const SignupWelcomeView = lazy(() =>
  import("../views/account/signup-welcome/SignupWelcome")
);
const PublicProposalsView = lazy(() =>
  import("../views/account/public-proposals/PublicProposals")
);
const PublicProposalDetailView = lazy(() =>
  import("../views/account/public-proposal-detail/PublicProposalDetail")
);
const PublicMilestoneDetailView = lazy(() =>
  import("../views/account/public-milestone-detail/PublicMilestoneDetail")
);
const SignupView = lazy(() => import("../views/account/signup/Signup"));
const SignupAdminView = lazy(() =>
  import("../views/account/signup-admin/SignupAdmin")
);
const ComplianceApprovedView = lazy(() =>
  import("../views/account/compliance-approved/ComplianceApproved")
);
const ComplianceDenyView = lazy(() =>
  import("../views/account/compliance-deny/ComplianceDeny")
);

export default function AppRoutes({ auth }) {
  return (
    <Suspense fallback={null}>
      <Switch>
        <HomeRoute auth={auth} exact path="/" />
        <PublicRoute auth={auth} exact path="/public-proposals">
          <PublicProposalsView />
        </PublicRoute>
        <Route auth={auth} exact path="/public-proposals/:proposalId">
          <PublicProposalDetailView />
        </Route>
        <PublicRoute auth={auth} exact path="/public-milestones/:id">
          <PublicMilestoneDetailView />
        </PublicRoute>
        <PublicRoute auth={auth} exact path="/login">
          <LoginView />
        </PublicRoute>
        <PublicRoute auth={auth} exact path="/register-admin">
          <SignupAdminView />
        </PublicRoute>
        <PublicRoute auth={auth} exact path="/forgot-password">
          <ForgotPasswordView />
        </PublicRoute>
        <PublicRoute auth={auth} exact path="/password/reset/:token">
          <ResetPasswordView />
        </PublicRoute>
        <PublicRoute auth={auth} exact path="/register">
          <SignupWelcomeView />
        </PublicRoute>
        <PublicRoute auth={auth} exact path="/register/form">
          <SignupView />
        </PublicRoute>
        <Route exact path="/compliance-approve-grant/:proposalId">
          <ComplianceApprovedView />
        </Route>
        <Route exact path="/compliance-deny-grant/:proposalId">
          <ComplianceDenyView />
        </Route>
        <PublicRoute auth={auth} exact path="/register/form">
          <SignupView />
        </PublicRoute>
        <Route>
          <h2 className="text-center mt-4 mb-3">Not Found</h2>
        </Route>
      </Switch>
    </Suspense>
  );
}
