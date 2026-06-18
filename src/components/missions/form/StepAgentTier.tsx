import { useState } from 'react';
import { Check, Layers, SlidersHorizontal, Users, AlertTriangle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { MissionFormData } from '@/types';
import { AGENT_DEMOGRAPHICS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useActiveAgentTiers, useMatchingAgentCount } from '@/hooks/useAgentTiers';
import type { AgentCustomCriteria, QuestionnaireCriterion } from '@/lib/agentHelpers';
import { QuestionnaireCriteriaEditor } from '@/components/common/QuestionnaireCriteriaEditor';

interface StepAgentTierProps {
  data: MissionFormData;
  onChange: (updates: Partial<MissionFormData>) => void;
}

export function StepAgentTier({ data, onChange }: StepAgentTierProps) {
  const { t, i18n } = useTranslation('missions');
  const { data: tiers, isLoading } = useActiveAgentTiers();
  const mode = data.agent_selection_mode || 'tier';

  const setMode = (m: 'tier' | 'custom') => {
    onChange({ agent_selection_mode: m });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase tracking-wide">
          {t('agent_selection.title')}<span className="text-destructive">*</span>
        </Label>
        <p className="text-sm text-muted-foreground">
          {t('agent_tiers.description')}
        </p>
      </div>

      {/* Mode Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => setMode('tier')}
          className={cn(
            'flex items-start gap-4 border p-4 text-left transition-all',
            mode === 'tier'
              ? 'border-primary bg-primary/5 ring-2 ring-primary'
              : 'border-border hover:border-primary/50'
          )}
        >
          <div className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
            mode === 'tier' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
          )}>
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold">{t('agent_selection.select_by_tier')}</h3>
            <p className="text-sm text-muted-foreground mt-1">{t('agent_selection.select_by_tier_desc')}</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setMode('custom')}
          className={cn(
            'flex items-start gap-4 border p-4 text-left transition-all',
            mode === 'custom'
              ? 'border-primary bg-primary/5 ring-2 ring-primary'
              : 'border-border hover:border-primary/50'
          )}
        >
          <div className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
            mode === 'custom' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
          )}>
            <SlidersHorizontal className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold">{t('agent_selection.custom_profile')}</h3>
            <p className="text-sm text-muted-foreground mt-1">{t('agent_selection.custom_profile_desc')}</p>
          </div>
        </button>
      </div>

      {/* Path 1: Select by Tier */}
      {mode === 'tier' && (
        <TierSelector
          tiers={tiers || []}
          isLoading={isLoading}
          selectedTier={data.agent_tier}
          onSelect={(code) => onChange({ agent_tier: code })}
          i18nLang={i18n.language}
          t={t}
        />
      )}

      {/* Path 2: Custom Agent Profile */}
      {mode === 'custom' && (
        <CustomCriteriaForm
          criteria={data.agent_custom_criteria || {}}
          onChange={(criteria) => onChange({ agent_custom_criteria: criteria })}
          t={t}
        />
      )}
    </div>
  );
}

function TierSelector({
  tiers,
  isLoading,
  selectedTier,
  onSelect,
  i18nLang,
  t,
}: {
  tiers: Array<{
    tier_code: string;
    name: string;
    name_ar: string | null;
    description: string | null;
    description_ar: string | null;
    color: string | null;
  }>;
  isLoading: boolean;
  selectedTier?: string;
  onSelect: (code: string) => void;
  i18nLang: string;
  t: (key: string, opts?: Record<string, unknown>) => string;
}) {
  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading tiers...</div>;
  }

  if (!tiers.length) {
    return <div className="text-center py-8 text-muted-foreground">No tiers available.</div>;
  }

  return (
    <div className="grid gap-4">
      {tiers.map((tier) => {
        const isSelected = selectedTier === tier.tier_code;
        const name = i18nLang === 'ar' && tier.name_ar ? tier.name_ar : tier.name;
        const desc = i18nLang === 'ar' && tier.description_ar ? tier.description_ar : tier.description;

        return (
          <button
            key={tier.tier_code}
            type="button"
            onClick={() => onSelect(tier.tier_code)}
            className={cn(
              'relative flex items-start gap-4 border p-4 text-left transition-all',
              isSelected
                ? 'border-primary bg-primary/5 ring-2 ring-primary'
                : 'border-border hover:border-primary/50'
            )}
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white font-bold"
              style={{ backgroundColor: tier.color || '#6B7280' }}
            >
              {tier.tier_code}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold uppercase tracking-wide">{name}</h3>
                {isSelected && (
                  <Badge className="bg-primary text-primary-foreground text-xs">
                    <Check className="h-3 w-3 mr-1" />
                    {t('agent_tiers.selected')}
                  </Badge>
                )}
              </div>
              {desc && <p className="text-sm text-muted-foreground mt-1">{desc}</p>}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function CustomCriteriaForm({
  criteria,
  onChange,
  t,
}: {
  criteria: AgentCustomCriteria;
  onChange: (c: AgentCustomCriteria) => void;
  t: (key: string, opts?: Record<string, unknown>) => string;
}) {
  const update = (partial: Partial<AgentCustomCriteria>) => {
    onChange({ ...criteria, ...partial });
  };

  return (
    <div className="space-y-6 border rounded-lg p-4">
      {/* Gender */}
      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase tracking-wide">{t('agent_selection.gender_preference')}</Label>
        <div className="flex gap-2">
          {[null, 'male', 'female'].map((g) => (
            <button
              key={g ?? 'any'}
              type="button"
              onClick={() => update({ gender: g as 'male' | 'female' | null })}
              className={cn(
                'px-4 py-2 border rounded text-sm transition-all',
                criteria.gender === g
                  ? 'border-primary bg-primary/5 ring-2 ring-primary font-semibold'
                  : 'border-border hover:border-primary/50'
              )}
            >
              {g === null ? t('agent_selection.any') : t(`agent_selection.${g === 'male' ? 'male' : 'female'}`, { defaultValue: g === 'male' ? 'Male' : 'Female' })}
            </button>
          ))}
        </div>
      </div>

      {/* Age Range */}
      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase tracking-wide">{t('agent_selection.age_range')}</Label>
        <div className="flex gap-3 items-center">
          <Input
            type="number"
            placeholder="Min"
            value={criteria.min_age ?? ''}
            onChange={(e) => update({ min_age: e.target.value ? parseInt(e.target.value) : null })}
            className="w-24"
          />
          <span className="text-muted-foreground">—</span>
          <Input
            type="number"
            placeholder="Max"
            value={criteria.max_age ?? ''}
            onChange={(e) => update({ max_age: e.target.value ? parseInt(e.target.value) : null })}
            className="w-24"
          />
        </div>
      </div>

      {/* Cities */}
      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase tracking-wide">{t('agent_selection.city')}</Label>
        <div className="flex flex-wrap gap-2">
          {AGENT_DEMOGRAPHICS.egyptian_cities.map((city) => {
            const isSelected = criteria.cities?.includes(city);
            return (
              <button
                key={city}
                type="button"
                onClick={() => {
                  const current = criteria.cities || [];
                  update({ cities: isSelected ? current.filter(c => c !== city) : [...current, city] });
                }}
                className={cn(
                  'px-3 py-1 text-xs border rounded transition-all',
                  isSelected ? 'border-primary bg-primary/10 text-primary font-semibold' : 'border-border hover:border-primary/50'
                )}
              >
                {city}
              </button>
            );
          })}
        </div>
      </div>

      {/* Education */}
      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase tracking-wide">{t('agent_selection.education')}</Label>
        <div className="flex flex-wrap gap-2">
          {AGENT_DEMOGRAPHICS.education_levels.filter(e => e !== 'other').map((edu) => {
            const isSelected = criteria.education_levels?.includes(edu);
            return (
              <button
                key={edu}
                type="button"
                onClick={() => {
                  const current = criteria.education_levels || [];
                  update({ education_levels: isSelected ? current.filter(e => e !== edu) : [...current, edu] });
                }}
                className={cn(
                  'px-3 py-1 text-xs border rounded transition-all',
                  isSelected ? 'border-primary bg-primary/10 text-primary font-semibold' : 'border-border hover:border-primary/50'
                )}
              >
                {edu.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </button>
            );
          })}
        </div>
      </div>

      {/* Languages */}
      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase tracking-wide">{t('agent_selection.languages_required')}</Label>
        <div className="flex flex-wrap gap-2">
          {AGENT_DEMOGRAPHICS.languages.map((lang) => {
            const isSelected = criteria.languages?.includes(lang);
            return (
              <button
                key={lang}
                type="button"
                onClick={() => {
                  const current = criteria.languages || [];
                  update({ languages: isSelected ? current.filter(l => l !== lang) : [...current, lang] });
                }}
                className={cn(
                  'px-3 py-1 text-xs border rounded transition-all',
                  isSelected ? 'border-primary bg-primary/10 text-primary font-semibold' : 'border-border hover:border-primary/50'
                )}
              >
                {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Car / Motorcycle */}
      <div className="flex gap-6">
        <div className="flex items-center gap-2">
          <Switch
            checked={criteria.requires_car || false}
            onCheckedChange={(v) => update({ requires_car: v })}
          />
          <Label className="text-sm">{t('agent_selection.must_have_car')}</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={criteria.requires_motorcycle || false}
            onCheckedChange={(v) => update({ requires_motorcycle: v })}
          />
          <Label className="text-sm">{t('agent_selection.must_have_motorcycle')}</Label>
        </div>
      </div>

      {/* Specializations */}
      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase tracking-wide">{t('agent_selection.industry_experience')}</Label>
        <div className="flex flex-wrap gap-2">
          {AGENT_DEMOGRAPHICS.specializations.map((spec) => {
            const isSelected = criteria.specializations?.includes(spec);
            return (
              <button
                key={spec}
                type="button"
                onClick={() => {
                  const current = criteria.specializations || [];
                  update({ specializations: isSelected ? current.filter(s => s !== spec) : [...current, spec] });
                }}
                className={cn(
                  'px-3 py-1 text-xs border rounded transition-all',
                  isSelected ? 'border-primary bg-primary/10 text-primary font-semibold' : 'border-border hover:border-primary/50'
                )}
              >
                {spec.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </button>
            );
          })}
        </div>
      </div>

      {/* Min Experience */}
      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase tracking-wide">{t('agent_selection.min_experience')}</Label>
        <Input
          type="number"
          min={0}
          value={criteria.min_experience_years ?? 0}
          onChange={(e) => update({ min_experience_years: parseInt(e.target.value) || 0 })}
          className="w-24"
        />
      </div>

      {/* Questionnaire-based filters from agent registration */}
      <div className="pt-2 border-t">
        <QuestionnaireCriteriaEditor
          value={(criteria.questionnaire_criteria as QuestionnaireCriterion[]) || []}
          onChange={(next) => update({ questionnaire_criteria: next })}
        />
      </div>

      {/* Price note */}
      <div className="border border-primary/30 bg-primary/5 p-4 rounded">
        <p className="text-sm text-muted-foreground">{t('agent_selection.price_by_tier')}</p>
      </div>
    </div>
  );
}
