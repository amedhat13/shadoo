import * as XLSX from 'xlsx';

interface VisitRow {
  month: string;
  branch: string;
  planned: number;
  completed: number;
  rating: number;
}

interface BudgetRow {
  month: string;
  branch: string;
  allocated: number;
  used: number;
}

interface BranchPerformance {
  name: string;
  planned: number;
  completed: number;
  rating: string | number;
}

interface MissionStatus {
  name: string;
  value: number;
}

interface KeyMetrics {
  visitCompletion: number;
  totalVisitsPlanned: number;
  totalVisitsCompleted: number;
  budgetUtilization: number;
  totalBudgetAllocated: number;
  totalBudgetUsed: number;
  activeMissions: number;
  completedMissions: number;
  packageUsed: number;
  packageTotal: number;
}

interface ExportData {
  visitData: VisitRow[];
  budgetData: BudgetRow[];
  visitsByBranch: BranchPerformance[];
  missionStatusData: MissionStatus[];
  keyMetrics: KeyMetrics;
  labels: {
    // Sheet names
    sheetSummary: string;
    sheetVisits: string;
    sheetBudget: string;
    sheetPerformance: string;
    sheetMissionStatus: string;
    // Summary labels
    metric: string;
    value: string;
    visitCompletion: string;
    budgetUtilization: string;
    activeMissions: string;
    completedMissions: string;
    packageUsage: string;
    totalPlanned: string;
    totalCompleted: string;
    totalAllocated: string;
    totalUsed: string;
    // Column headers
    month: string;
    branch: string;
    planned: string;
    completed: string;
    rating: string;
    allocated: string;
    used: string;
    completionRate: string;
    status: string;
    count: string;
    currency: string;
  };
}

export function exportReportsToExcel(data: ExportData, fileName: string) {
  const wb = XLSX.utils.book_new();
  const { labels } = data;

  // 1. Summary Sheet
  const summaryRows = [
    [labels.metric, labels.value],
    [labels.visitCompletion, `${data.keyMetrics.visitCompletion}%`],
    [labels.totalPlanned, data.keyMetrics.totalVisitsPlanned],
    [labels.totalCompleted, data.keyMetrics.totalVisitsCompleted],
    ['', ''],
    [labels.budgetUtilization, `${data.keyMetrics.budgetUtilization}%`],
    [labels.totalAllocated, `${data.keyMetrics.totalBudgetAllocated} ${labels.currency}`],
    [labels.totalUsed, `${data.keyMetrics.totalBudgetUsed} ${labels.currency}`],
    ['', ''],
    [labels.activeMissions, data.keyMetrics.activeMissions],
    [labels.completedMissions, data.keyMetrics.completedMissions],
    [labels.packageUsage, `${data.keyMetrics.packageUsed} / ${data.keyMetrics.packageTotal}`],
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
  wsSummary['!cols'] = [{ wch: 25 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, labels.sheetSummary);

  // 2. Visits Detail Sheet
  const visitHeaders = [labels.month, labels.branch, labels.planned, labels.completed, labels.completionRate, labels.rating];
  const visitRows = data.visitData.map(v => [
    v.month,
    v.branch,
    v.planned,
    v.completed,
    v.planned > 0 ? `${Math.round((v.completed / v.planned) * 100)}%` : '0%',
    v.rating,
  ]);
  const wsVisits = XLSX.utils.aoa_to_sheet([visitHeaders, ...visitRows]);
  wsVisits['!cols'] = [{ wch: 10 }, { wch: 20 }, { wch: 10 }, { wch: 12 }, { wch: 15 }, { wch: 8 }];
  XLSX.utils.book_append_sheet(wb, wsVisits, labels.sheetVisits);

  // 3. Budget Detail Sheet
  const budgetHeaders = [labels.month, labels.branch, `${labels.allocated} (${labels.currency})`, `${labels.used} (${labels.currency})`, labels.completionRate];
  const budgetRows = data.budgetData.map(b => [
    b.month,
    b.branch,
    b.allocated,
    b.used,
    b.allocated > 0 ? `${Math.round((b.used / b.allocated) * 100)}%` : '0%',
  ]);
  const wsBudget = XLSX.utils.aoa_to_sheet([budgetHeaders, ...budgetRows]);
  wsBudget['!cols'] = [{ wch: 10 }, { wch: 20 }, { wch: 18 }, { wch: 15 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, wsBudget, labels.sheetBudget);

  // 4. Branch Performance Sheet
  const perfHeaders = [labels.branch, labels.planned, labels.completed, labels.completionRate, labels.rating];
  const perfRows = data.visitsByBranch.map(b => {
    const completion = Number(b.planned) > 0 ? Math.round((Number(b.completed) / Number(b.planned)) * 100) : 0;
    return [b.name, b.planned, b.completed, `${completion}%`, b.rating];
  });
  const wsPerf = XLSX.utils.aoa_to_sheet([perfHeaders, ...perfRows]);
  wsPerf['!cols'] = [{ wch: 20 }, { wch: 10 }, { wch: 12 }, { wch: 15 }, { wch: 8 }];
  XLSX.utils.book_append_sheet(wb, wsPerf, labels.sheetPerformance);

  // 5. Mission Status Sheet
  const statusHeaders = [labels.status, labels.count];
  const statusRows = data.missionStatusData.map(s => [s.name, s.value]);
  const wsStatus = XLSX.utils.aoa_to_sheet([statusHeaders, ...statusRows]);
  wsStatus['!cols'] = [{ wch: 15 }, { wch: 10 }];
  XLSX.utils.book_append_sheet(wb, wsStatus, labels.sheetMissionStatus);

  // Write file
  XLSX.writeFile(wb, fileName);
}
