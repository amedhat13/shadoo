import * as XLSX from 'xlsx';

export function exportAdminReportsToExcel(data: any, activeTab: string, t: (key: string) => string) {
  const wb = XLSX.utils.book_new();

  // Summary sheet
  const summaryRows = [
    ['Metric', 'Value'],
    ['Total Clients', data.overview.totalClients],
    ['Total Agents', data.overview.totalAgents],
    ['Total Missions', data.overview.totalMissions],
    ['Active Missions', data.overview.activeMissions],
    ['Total Visits', data.overview.totalVisits],
    ['Completed Visits', data.overview.completedVisits],
    ['Total Revenue', data.overview.totalRevenue],
    ['Budget Allocated', data.overview.totalBudgetAllocated],
    ['Budget Used', data.overview.totalBudgetUsed],
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
  wsSummary['!cols'] = [{ wch: 20 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

  // Clients sheet
  if (data.clientAnalytics?.length > 0) {
    const clientHeaders = ['Client', 'Missions', 'Branches', 'Visits', 'Approved', 'Pending', 'Budget Allocated', 'Budget Used', 'Wallet'];
    const clientRows = data.clientAnalytics.map((c: any) => [
      c.name, c.missions, c.branches, c.totalVisits, c.completedVisits, c.pendingVisits, c.budgetAllocated, c.budgetUsed, c.walletBalance
    ]);
    const wsClients = XLSX.utils.aoa_to_sheet([clientHeaders, ...clientRows]);
    XLSX.utils.book_append_sheet(wb, wsClients, 'Clients');
  }

  // Agents sheet
  if (data.agentPerformance?.length > 0) {
    const agentHeaders = ['Agent', 'Tier', 'Status', 'Completed Visits', 'Approved', 'Rejected', 'Rating', 'Earnings'];
    const agentRows = data.agentPerformance.map((a: any) => [
      a.name, a.tier, a.status, a.completedVisits, a.approvedVisits, a.rejectedVisits, a.rating, a.totalEarnings
    ]);
    const wsAgents = XLSX.utils.aoa_to_sheet([agentHeaders, ...agentRows]);
    XLSX.utils.book_append_sheet(wb, wsAgents, 'Agents');
  }

  // Geographic sheet
  if (data.geographicData?.length > 0) {
    const geoHeaders = ['City', 'Branches', 'Missions', 'Visits'];
    const geoRows = data.geographicData.map((g: any) => [g.city, g.branches, g.missions, g.visits]);
    const wsGeo = XLSX.utils.aoa_to_sheet([geoHeaders, ...geoRows]);
    XLSX.utils.book_append_sheet(wb, wsGeo, 'Geographic');
  }

  // Revenue Trends sheet
  if (data.revenueTrends?.length > 0) {
    const revHeaders = ['Month', 'Topups', 'Spend'];
    const revRows = data.revenueTrends.map((r: any) => [r.month, r.topups, r.spend]);
    const wsRev = XLSX.utils.aoa_to_sheet([revHeaders, ...revRows]);
    XLSX.utils.book_append_sheet(wb, wsRev, 'Revenue');
  }

  const fileName = `admin-report-${activeTab}-${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, fileName);
}
