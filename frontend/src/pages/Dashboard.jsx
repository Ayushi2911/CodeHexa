import DashboardOverview from "../components/dashboard/DashboardOverview";

function Dashboard({
  workflows = [],
  executionHistory = [],
}) {
  return (
    <main className="dashboard-page">
      <DashboardOverview
        workflows={workflows}
        executionHistory={executionHistory}
      />
    </main>
  );
}

export default Dashboard;
