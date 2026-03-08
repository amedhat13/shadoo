// Agent demographic helpers

export function getAge(dateOfBirth: string | null): number | null {
  if (!dateOfBirth) return null;
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export interface AgentDemographics {
  date_of_birth?: string | null;
  gender?: string | null;
  city?: string | null;
  district?: string | null;
  education_level?: string | null;
  languages?: string[] | null;
  has_car?: boolean | null;
  has_motorcycle?: boolean | null;
  marital_status?: string | null;
  employment_status?: string | null;
  experience_years?: number | null;
  specializations?: string[] | null;
  rating_avg?: number | null;
  completed_visits?: number | null;
  questionnaire_answers?: unknown[] | null;
}

export interface TierCriteria {
  tier_code: string;
  min_age?: number | null;
  max_age?: number | null;
  gender?: string | null;
  cities?: string[] | null;
  districts?: string[] | null;
  education_levels?: string[] | null;
  languages?: string[] | null;
  requires_car?: boolean | null;
  requires_motorcycle?: boolean | null;
  marital_statuses?: string[] | null;
  employment_statuses?: string[] | null;
  min_experience_years?: number | null;
  specializations?: string[] | null;
  min_rating?: number | null;
  min_completed_visits?: number | null;
  sort_order?: number | null;
  questionnaire_criteria?: QuestionnaireCriterion[] | null;
}

export interface QuestionnaireCriterion {
  question_label: { en: string; ar?: string };
  question_type: string;
  operator: 'equals' | 'is_one_of' | 'includes_any_of' | 'includes_all_of' | 'greater_than' | 'less_than' | 'between' | 'contains';
  values: string[];
}

export interface AgentCustomCriteria {
  gender?: 'male' | 'female' | null;
  min_age?: number | null;
  max_age?: number | null;
  cities?: string[];
  education_levels?: string[];
  languages?: string[];
  requires_car?: boolean;
  requires_motorcycle?: boolean;
  specializations?: string[];
  min_experience_years?: number;
}

function arrayHasItems(arr: unknown[] | null | undefined): boolean {
  return Array.isArray(arr) && arr.length > 0;
}

function matchesQuestionnaireCriteria(
  criteria: QuestionnaireCriterion[],
  answers: unknown[] | null | undefined
): boolean {
  if (!criteria || criteria.length === 0) return true;
  if (!Array.isArray(answers) || answers.length === 0) return false;

  for (const criterion of criteria) {
    const matchingAnswer = (answers as Array<{ question: string | { en: string; ar?: string }; answer: string }>).find(a => {
      const qLabel = typeof a.question === 'object' ? a.question.en : a.question;
      return qLabel === criterion.question_label.en;
    });

    if (!matchingAnswer) return false;

    const agentAnswer = matchingAnswer.answer;
    const expected = criterion.values;

    switch (criterion.operator) {
      case 'equals':
        if (agentAnswer !== expected[0]) return false;
        break;
      case 'is_one_of':
        if (!expected.includes(agentAnswer)) return false;
        break;
      case 'includes_any_of': {
        const agentValues = agentAnswer.split(',').map(v => v.trim());
        if (!expected.some(v => agentValues.includes(v))) return false;
        break;
      }
      case 'includes_all_of': {
        const agentVals = agentAnswer.split(',').map(v => v.trim());
        if (!expected.every(v => agentVals.includes(v))) return false;
        break;
      }
      case 'greater_than':
        if (parseFloat(agentAnswer) <= parseFloat(expected[0])) return false;
        break;
      case 'less_than':
        if (parseFloat(agentAnswer) >= parseFloat(expected[0])) return false;
        break;
      case 'between':
        if (parseFloat(agentAnswer) < parseFloat(expected[0]) || parseFloat(agentAnswer) > parseFloat(expected[1])) return false;
        break;
      case 'contains':
        if (!agentAnswer.toLowerCase().includes(expected[0].toLowerCase())) return false;
        break;
    }
  }
  return true;
}

export function matchAgentToTiers(agent: AgentDemographics, tiers: TierCriteria[]): string[] {
  const age = getAge(agent.date_of_birth ?? null);
  const matched: string[] = [];

  for (const tier of tiers) {
    let matches = true;

    // Age range
    if (tier.min_age != null && (age == null || age < tier.min_age)) { matches = false; }
    if (matches && tier.max_age != null && (age == null || age > tier.max_age)) { matches = false; }

    // Gender
    if (matches && tier.gender && agent.gender !== tier.gender) { matches = false; }

    // Cities
    if (matches && arrayHasItems(tier.cities) && (!agent.city || !tier.cities!.includes(agent.city))) { matches = false; }

    // Districts
    if (matches && arrayHasItems(tier.districts) && (!agent.district || !tier.districts!.includes(agent.district))) { matches = false; }

    // Education
    if (matches && arrayHasItems(tier.education_levels) && (!agent.education_level || !tier.education_levels!.includes(agent.education_level))) { matches = false; }

    // Languages
    if (matches && arrayHasItems(tier.languages)) {
      const agentLangs = agent.languages || [];
      if (!tier.languages!.some(l => agentLangs.includes(l))) { matches = false; }
    }

    // Car/Motorcycle
    if (matches && tier.requires_car && !agent.has_car) { matches = false; }
    if (matches && tier.requires_motorcycle && !agent.has_motorcycle) { matches = false; }

    // Marital status
    if (matches && arrayHasItems(tier.marital_statuses) && (!agent.marital_status || !tier.marital_statuses!.includes(agent.marital_status))) { matches = false; }

    // Employment status
    if (matches && arrayHasItems(tier.employment_statuses) && (!agent.employment_status || !tier.employment_statuses!.includes(agent.employment_status))) { matches = false; }

    // Experience
    if (matches && tier.min_experience_years != null && tier.min_experience_years > 0 && (agent.experience_years ?? 0) < tier.min_experience_years) { matches = false; }

    // Specializations
    if (matches && arrayHasItems(tier.specializations)) {
      const agentSpecs = agent.specializations || [];
      if (!tier.specializations!.some(s => agentSpecs.includes(s))) { matches = false; }
    }

    // Performance
    if (matches && tier.min_rating != null && tier.min_rating > 0 && (agent.rating_avg ?? 0) < tier.min_rating) { matches = false; }
    if (matches && tier.min_completed_visits != null && tier.min_completed_visits > 0 && (agent.completed_visits ?? 0) < tier.min_completed_visits) { matches = false; }

    // Questionnaire criteria
    if (matches && arrayHasItems(tier.questionnaire_criteria)) {
      matches = matchesQuestionnaireCriteria(tier.questionnaire_criteria!, agent.questionnaire_answers);
    }

    if (matches) {
      matched.push(tier.tier_code);
    }
  }

  return matched;
}

export function matchAgentToCustomCriteria(agent: AgentDemographics, criteria: AgentCustomCriteria): boolean {
  const age = getAge(agent.date_of_birth ?? null);

  if (criteria.gender && agent.gender !== criteria.gender) return false;
  if (criteria.min_age != null && (age == null || age < criteria.min_age)) return false;
  if (criteria.max_age != null && (age == null || age > criteria.max_age)) return false;
  if (arrayHasItems(criteria.cities) && (!agent.city || !criteria.cities!.includes(agent.city))) return false;
  if (arrayHasItems(criteria.education_levels) && (!agent.education_level || !criteria.education_levels!.includes(agent.education_level))) return false;
  if (arrayHasItems(criteria.languages)) {
    const agentLangs = agent.languages || [];
    if (!criteria.languages!.some(l => agentLangs.includes(l))) return false;
  }
  if (criteria.requires_car && !agent.has_car) return false;
  if (criteria.requires_motorcycle && !agent.has_motorcycle) return false;
  if (arrayHasItems(criteria.specializations)) {
    const agentSpecs = agent.specializations || [];
    if (!criteria.specializations!.some(s => agentSpecs.includes(s))) return false;
  }
  if (criteria.min_experience_years && criteria.min_experience_years > 0 && (agent.experience_years ?? 0) < criteria.min_experience_years) return false;

  return true;
}

export function buildTierCriteriaSummary(
  tier: TierCriteria,
  t: (key: string, opts?: Record<string, unknown>) => string
): string {
  const parts: string[] = [];

  if (tier.gender) parts.push(t(`tiers.${tier.gender}`));
  if (tier.min_age != null || tier.max_age != null) {
    const min = tier.min_age ?? '?';
    const max = tier.max_age ?? '?';
    parts.push(`${min}-${max}`);
  }
  if (arrayHasItems(tier.cities)) parts.push(tier.cities!.join(', '));
  if (arrayHasItems(tier.education_levels)) parts.push(tier.education_levels!.map(e => t(`tiers.${e}`)).join(', '));
  if (tier.requires_car) parts.push(t('tiers.has_car'));
  if (tier.requires_motorcycle) parts.push(t('tiers.has_motorcycle'));
  if (arrayHasItems(tier.specializations)) parts.push(tier.specializations!.join(', '));
  if (tier.min_experience_years && tier.min_experience_years > 0) parts.push(`${tier.min_experience_years}+ ${t('tiers.min_experience')}`);

  return parts.length > 0 ? parts.join(' • ') : t('tiers.all_agents');
}
