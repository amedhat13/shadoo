export type DemoCredentials = {
  email: string;
  password: string;
  fullName: string;
};

function randomToken(): string {
  // Prefer crypto when available (browser), fall back to Math.random
  try {
    const arr = new Uint32Array(2);
    crypto.getRandomValues(arr);
    return Array.from(arr)
      .map((n) => n.toString(36))
      .join("-")
      .slice(0, 14);
  } catch {
    return Math.random().toString(36).slice(2, 10);
  }
}

export function generateDemoCredentials(): DemoCredentials {
  const token = randomToken();
  const email = `demo+${Date.now()}-${token}@example.com`;
  // 12+ chars, avoids common password policies while staying simple
  const password = `Demo-${token}-1!`;
  return { email, password, fullName: "Demo User" };
}
