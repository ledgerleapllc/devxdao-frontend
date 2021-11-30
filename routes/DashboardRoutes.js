import React, { Suspense, lazy } from "react";
import { Switch, Route } from "react-router-dom";

const DashboardView = lazy(() => import("../views/dashboard/main/Dashboard"));
const DashboardErrorView = lazy(() => import("../views/dashboard/Error"));

export default function DashboardRoutes() {
  return (
    <Suspense fallback={null}>
      <Switch>
        <Route path="/dashboard" exact component={DashboardView} />
        <Route component={DashboardErrorView}></Route>
      </Switch>
    </Suspense>
  );
}
