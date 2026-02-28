import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useAdminReportsData() {
  return useQuery({
    queryKey: ['admin-reports-data'],
    queryFn: async () => {
      const [
        profilesRes,
        missionsRes,
        agentsRes,
        branchesRes,
        visitsRes,
        walletsRes,
        transactionsRes,
        subscriptionsRes,
        plansRes,
      ] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('missions').select('*'),
        supabase.from('agents').select('*'),
        supabase.from('branches').select('*'),
        supabase.from('visits').select('*'),
        supabase.from('wallets').select('*'),
        supabase.from('wallet_transactions').select('*'),
        supabase.from('user_subscriptions').select('*, subscription_plans(*)'),
        supabase.from('subscription_plans').select('*'),
      ]);

      const profiles = profilesRes.data || [];
      const missions = missionsRes.data || [];
      const agents = agentsRes.data || [];
      const branches = branchesRes.data || [];
      const visits = visitsRes.data || [];
      const wallets = walletsRes.data || [];
      const transactions = transactionsRes.data || [];
      const subscriptions = subscriptionsRes.data || [];
      const plans = plansRes.data || [];

      // === OVERVIEW STATS ===
      const overview = {
        totalClients: profiles.length,
        totalMissions: missions.length,
        totalAgents: agents.length,
        totalBranches: branches.length,
        totalVisits: visits.length,
        activeMissions: missions.filter(m => m.status === 'published').length,
        completedVisits: visits.filter(v => v.status === 'approved').length,
        pendingVisits: visits.filter(v => v.status === 'submitted').length,
        totalRevenue: transactions
          .filter(t => t.type === 'topup' && t.status === 'completed')
          .reduce((sum, t) => sum + Number(t.amount), 0),
        totalBudgetAllocated: missions.reduce((sum, m) => sum + Number(m.total_purchase_budget), 0),
        totalBudgetUsed: missions.reduce((sum, m) => sum + Number(m.budget_used), 0),
        activeAgents: agents.filter(a => a.status === 'active').length,
        pendingAgents: agents.filter(a => a.status === 'pending').length,
      };

      // === MISSION STATUS DISTRIBUTION ===
      const missionStatusDist = [
        { name: 'Draft', value: missions.filter(m => m.status === 'draft').length, color: '#94A3B8' },
        { name: 'Published', value: missions.filter(m => m.status === 'published').length, color: '#F97316' },
        { name: 'Completed', value: missions.filter(m => m.status === 'completed').length, color: '#22C55E' },
        { name: 'Paused', value: missions.filter(m => m.status === 'paused').length, color: '#F59E0B' },
      ].filter(d => d.value > 0);

      // === VISIT STATUS DISTRIBUTION ===
      const visitStatusDist = [
        { name: 'Pending', value: visits.filter(v => v.status === 'pending').length, color: '#94A3B8' },
        { name: 'In Progress', value: visits.filter(v => v.status === 'in_progress').length, color: '#0EA5E9' },
        { name: 'Submitted', value: visits.filter(v => v.status === 'submitted').length, color: '#F97316' },
        { name: 'Approved', value: visits.filter(v => v.status === 'approved').length, color: '#22C55E' },
        { name: 'Rejected', value: visits.filter(v => v.status === 'rejected').length, color: '#EF4444' },
      ].filter(d => d.value > 0);

      // === AGENT TIER DISTRIBUTION ===
      const agentTierDist = [
        { name: 'Tier A', value: agents.filter(a => a.tier === 'A').length, color: '#F97316' },
        { name: 'Tier B', value: agents.filter(a => a.tier === 'B').length, color: '#0EA5E9' },
        { name: 'Tier C', value: agents.filter(a => a.tier === 'C').length, color: '#94A3B8' },
      ].filter(d => d.value > 0);

      // === AGENT STATUS DISTRIBUTION ===
      const agentStatusDist = [
        { name: 'Active', value: agents.filter(a => a.status === 'active').length, color: '#22C55E' },
        { name: 'Pending', value: agents.filter(a => a.status === 'pending').length, color: '#F59E0B' },
        { name: 'Suspended', value: agents.filter(a => a.status === 'suspended').length, color: '#EF4444' },
      ].filter(d => d.value > 0);

      // === BRANCH STATUS DISTRIBUTION ===
      const branchStatusDist = [
        { name: 'Verified', value: branches.filter(b => b.status === 'verified').length, color: '#22C55E' },
        { name: 'Pending', value: branches.filter(b => b.status === 'pending_verification').length, color: '#F59E0B' },
        { name: 'Rejected', value: branches.filter(b => b.status === 'rejected').length, color: '#EF4444' },
      ].filter(d => d.value > 0);

      // === CLIENT ANALYTICS ===
      const clientAnalytics = profiles.map(profile => {
        const clientMissions = missions.filter(m => m.user_id === profile.user_id);
        const clientBranches = branches.filter(b => b.user_id === profile.user_id);
        const clientMissionIds = clientMissions.map(m => m.id);
        const clientVisits = visits.filter(v => v.mission_id && clientMissionIds.includes(v.mission_id));
        const clientWallet = wallets.find(w => w.user_id === profile.user_id);

        return {
          id: profile.user_id,
          name: profile.company_name || profile.full_name || 'Unknown',
          missions: clientMissions.length,
          activeMissions: clientMissions.filter(m => m.status === 'published').length,
          branches: clientBranches.length,
          totalVisits: clientVisits.length,
          completedVisits: clientVisits.filter(v => v.status === 'approved').length,
          pendingVisits: clientVisits.filter(v => v.status === 'submitted').length,
          budgetAllocated: clientMissions.reduce((s, m) => s + Number(m.total_purchase_budget), 0),
          budgetUsed: clientMissions.reduce((s, m) => s + Number(m.budget_used), 0),
          walletBalance: clientWallet ? Number(clientWallet.balance) : 0,
        };
      }).sort((a, b) => b.missions - a.missions);

      // === AGENT PERFORMANCE ===
      const agentPerformance = agents.map(agent => {
        const agentVisits = visits.filter(v => v.agent_id === agent.id);
        return {
          id: agent.id,
          name: agent.full_name,
          tier: agent.tier || 'C',
          status: agent.status || 'pending',
          completedVisits: agent.completed_visits || 0,
          totalEarnings: Number(agent.total_earnings) || 0,
          rating: Number(agent.rating_avg) || 0,
          totalVisits: agentVisits.length,
          approvedVisits: agentVisits.filter(v => v.status === 'approved').length,
          rejectedVisits: agentVisits.filter(v => v.status === 'rejected').length,
          completionRate: agentVisits.length > 0
            ? Math.round((agentVisits.filter(v => v.status === 'approved').length / agentVisits.length) * 100)
            : 0,
        };
      }).sort((a, b) => b.completedVisits - a.completedVisits);

      // === GEOGRAPHIC DATA ===
      const cityMap: Record<string, { branches: number; visits: number; missions: number }> = {};
      branches.forEach(b => {
        const city = b.city || 'Unknown';
        if (!cityMap[city]) cityMap[city] = { branches: 0, visits: 0, missions: 0 };
        cityMap[city].branches++;
        const branchMissions = missions.filter(m => m.branch_id === b.id);
        cityMap[city].missions += branchMissions.length;
        const branchVisits = visits.filter(v => branchMissions.some(m => m.id === v.mission_id));
        cityMap[city].visits += branchVisits.length;
      });
      const geographicData = Object.entries(cityMap)
        .map(([city, data]) => ({ city, ...data }))
        .sort((a, b) => b.branches - a.branches);

      // === MONTHLY TRENDS (visits by month) ===
      const monthlyVisits: Record<string, { month: string; total: number; approved: number; rejected: number; submitted: number }> = {};
      visits.forEach(v => {
        const date = v.created_at ? new Date(v.created_at) : null;
        if (!date) return;
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const label = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        if (!monthlyVisits[key]) monthlyVisits[key] = { month: label, total: 0, approved: 0, rejected: 0, submitted: 0 };
        monthlyVisits[key].total++;
        if (v.status === 'approved') monthlyVisits[key].approved++;
        if (v.status === 'rejected') monthlyVisits[key].rejected++;
        if (v.status === 'submitted') monthlyVisits[key].submitted++;
      });
      const visitTrends = Object.entries(monthlyVisits)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([, data]) => data);

      // === MONTHLY REVENUE ===
      const monthlyRevenue: Record<string, { month: string; topups: number; spend: number }> = {};
      transactions.forEach(t => {
        const date = new Date(t.created_at);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const label = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        if (!monthlyRevenue[key]) monthlyRevenue[key] = { month: label, topups: 0, spend: 0 };
        if (t.type === 'topup' && t.status === 'completed') monthlyRevenue[key].topups += Number(t.amount);
        if (t.type === 'mission_fund') monthlyRevenue[key].spend += Math.abs(Number(t.amount));
      });
      const revenueTrends = Object.entries(monthlyRevenue)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([, data]) => data);

      // === SUBSCRIPTION DISTRIBUTION ===
      const planCounts: Record<string, number> = {};
      subscriptions.forEach(s => {
        const plan = plans.find(p => p.id === s.plan_id);
        const planName = plan?.name || 'Unknown';
        planCounts[planName] = (planCounts[planName] || 0) + 1;
      });
      const subscriptionDist = Object.entries(planCounts).map(([name, value], i) => ({
        name,
        value,
        color: ['#F97316', '#22C55E', '#0EA5E9', '#A855F7', '#F59E0B'][i % 5],
      }));

      return {
        overview,
        missionStatusDist,
        visitStatusDist,
        agentTierDist,
        agentStatusDist,
        branchStatusDist,
        clientAnalytics,
        agentPerformance,
        geographicData,
        visitTrends,
        revenueTrends,
        subscriptionDist,
      };
    },
    refetchInterval: 60000,
  });
}
