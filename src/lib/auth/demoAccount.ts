export type DemoCredentials = {
  email: string;
  password: string;
  fullName: string;
};

// Single, shared demo account. Reused on every "Try Demo" click so that any
// data seeded inside the demo (e.g. T-Lab Boba branches/missions/visits)
// persists across sessions instead of being wiped by a fresh signup.
export const DEMO_CREDENTIALS: DemoCredentials = {
  email: "demo@shadoo.app",
  password: "DemoShadoo-2026!",
  fullName: "Demo User",
};

export function generateDemoCredentials(): DemoCredentials {
  return DEMO_CREDENTIALS;
}
