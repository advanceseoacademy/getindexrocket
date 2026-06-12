export type DashboardPath =
  | "/dashboard"
  | "/tasks"
  | "/billing"
  | "/settings";

export function navigateDashboard(href: DashboardPath) {
  if (window.location.pathname !== href) {
    window.history.pushState(null, "", href);
  }
  window.dispatchEvent(new CustomEvent("gir:dashboard-nav", { detail: href }));
}
