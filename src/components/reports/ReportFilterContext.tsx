import { ReactNode, createContext, useCallback, useContext, useMemo, useState } from 'react';

export interface ReportFilter {
  branchId: string | null;
  questionKey: string | null;
  /** Month key YYYY-MM, or null for all history. */
  month: string | null;
}

interface Ctx extends ReportFilter {
  setBranch: (id: string | null) => void;
  setQuestion: (key: string | null) => void;
  setMonth: (key: string | null) => void;
  clear: () => void;
  isActive: boolean;
}

const ReportFilterCtx = createContext<Ctx | null>(null);

/** One shared drill-down selection (branch / question / period) for every chart on the page. */
export function ReportFilterProvider({ children }: { children: ReactNode }) {
  const [filter, setFilter] = useState<ReportFilter>({ branchId: null, questionKey: null, month: null });

  const setBranch = useCallback((branchId: string | null) => setFilter(f => ({ ...f, branchId })), []);
  const setQuestion = useCallback((questionKey: string | null) => setFilter(f => ({ ...f, questionKey })), []);
  const setMonth = useCallback((month: string | null) => setFilter(f => ({ ...f, month })), []);
  const clear = useCallback(() => setFilter({ branchId: null, questionKey: null, month: null }), []);

  const value = useMemo<Ctx>(() => ({
    ...filter,
    setBranch,
    setQuestion,
    setMonth,
    clear,
    isActive: !!(filter.branchId || filter.questionKey || filter.month),
  }), [filter, setBranch, setQuestion, setMonth, clear]);

  return <ReportFilterCtx.Provider value={value}>{children}</ReportFilterCtx.Provider>;
}

export function useReportFilter(): Ctx {
  const ctx = useContext(ReportFilterCtx);
  if (ctx) return ctx;
  // Safe fallback so charts can be used outside a provider.
  return {
    branchId: null, questionKey: null, month: null, isActive: false,
    setBranch: () => {}, setQuestion: () => {}, setMonth: () => {}, clear: () => {},
  };
}
