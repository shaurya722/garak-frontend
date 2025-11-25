'use client';

import { useParams, useRouter } from 'next/navigation';
import { PolicyForm } from '@/components/policy/PolicyForm';
import { usePolicy } from '@/hooks/use-policies';
import MainLayout from '@/components/layout/main-layout';
import type { PolicyFormData } from '@/types/policies.type';

export default function EditPolicyPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: policy, isLoading } = usePolicy(id);
  const handleSuccess = () => {
    router.push(`/policies`);
  };

  if (isLoading) return <div>Loading...</div>;
  if (!policy) return <div>Policy not found</div>;

  return (
    <MainLayout>
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Policy</h1>
      <PolicyForm
        mode="edit"
        policyId={id as string}
        initialData={(policy.type === "RED" ? {
          name: policy.name,
          description: policy.description,
          type: policy.type,
          defaultDetector: policy.defaultDetector,
          categoryIds: policy.categoryIds,
          detectorIds: policy.detectorIds,
        } : {
          name: policy.name,
          description: policy.description,
          type: policy.type,
          defaultDetector: policy.defaultDetector,
          // BLUE policy scanner configurations - convert arrays to comma-separated strings
          anonymize: policy.anonymize,
          anonymizeType: policy.anonymizeType,
          anonymizeHiddenNames: Array.isArray(policy.anonymizeHiddenNames) ? policy.anonymizeHiddenNames.join(', ') : policy.anonymizeHiddenNames || '',
          anonymizeAllowedNames: Array.isArray(policy.anonymizeAllowedNames) ? policy.anonymizeAllowedNames.join(', ') : policy.anonymizeAllowedNames || '',
          anonymizePreamble: policy.anonymizePreamble,
          anonymizeUseFaker: policy.anonymizeUseFaker,
          anonymizeThreshold: policy.anonymizeThreshold,
          banCode: policy.banCode,
          banCodeThreshold: policy.banCodeThreshold,
          banCompetitors: policy.banCompetitors,
          banCompetitorsThreshold: policy.banCompetitorsThreshold,
          banCompetitorsCompetitors: Array.isArray(policy.banCompetitorsCompetitors) ? policy.banCompetitorsCompetitors.join(', ') : policy.banCompetitorsCompetitors || '',
          banSubstrings: policy.banSubstrings,
          banSubstringsSubstrings: Array.isArray(policy.banSubstringsSubstrings) ? policy.banSubstringsSubstrings.join(', ') : policy.banSubstringsSubstrings || '',
          banSubstringsMatchType: policy.banSubstringsMatchType,
          banSubstringsCaseSensitive: policy.banSubstringsCaseSensitive,
          banSubstringsRedact: policy.banSubstringsRedact,
          banSubstringsContainsAll: policy.banSubstringsContainsAll,
          banTopics: policy.banTopics,
          banTopicsThreshold: policy.banTopicsThreshold,
          banTopicsTopics: Array.isArray(policy.banTopicsTopics) ? policy.banTopicsTopics.join(', ') : policy.banTopicsTopics || '',
          code: policy.code,
          codeLanguages: Array.isArray(policy.codeLanguages) ? policy.codeLanguages.join(', ') : policy.codeLanguages || '',
          codeIsBlocked: policy.codeIsBlocked,
          gibberish: policy.gibberish,
          gibberishThreshold: policy.gibberishThreshold,
          gibberishMatchType: policy.gibberishMatchType,
          language: policy.language,
          languageValidLanguages: Array.isArray(policy.languageValidLanguages) ? policy.languageValidLanguages.join(', ') : policy.languageValidLanguages || '',
          languageMatchType: policy.languageMatchType,
          promptInjection: policy.promptInjection,
          promptInjectionThreshold: policy.promptInjectionThreshold,
          promptInjectionMatchType: policy.promptInjectionMatchType,
          regex: policy.regex,
          regexPatterns: Array.isArray(policy.regexPatterns) ? policy.regexPatterns.join(', ') : policy.regexPatterns || '',
          regexIsBlocked: policy.regexIsBlocked,
          regexRedact: policy.regexRedact,
          secrets: policy.secrets,
          secretsRedactMode: policy.secretsRedactMode,
          sentiment: policy.sentiment,
          sentimentThreshold: policy.sentimentThreshold,
          sentimentMatchType: policy.sentimentMatchType,
          tokenLimit: policy.tokenLimit,
          tokenLimitLimit: policy.tokenLimitLimit,
          tokenLimitEncodingName: policy.tokenLimitEncodingName,
          toxicity: policy.toxicity,
          toxicityThreshold: policy.toxicityThreshold,
          toxicityMatchType: policy.toxicityMatchType,
        }) as Partial<PolicyFormData>}
        onSuccess={handleSuccess}
      />
    </div>
    </MainLayout>
  );
}