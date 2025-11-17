// src/app/policies/[id]/edit/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { PolicyForm } from '@/components/policy/PolicyForm';
import { usePolicy } from '@/hooks/use-policies';
import MainLayout from '@/components/layout/main-layout';

export default function EditPolicyPage() {
  const router = useRouter();
  const { id } = useParams();
  const { data: policy, isLoading } = usePolicy(id as string);
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
        initialData={policy.type === "RED" ? {
          name: policy.name,
          description: policy.description,
          type: policy.type,
          defaultDetector: policy.defaultDetector,
          categoryIds: policy.categories?.map(cat => cat.id) || null,
          detectorIds: policy.detectors?.map(det => det.id) || null,
        } : {
          name: policy.name,
          description: policy.description,
          type: policy.type,
          defaultDetector: policy.defaultDetector,
          // BLUE policy scanner configurations
          anonymize: policy.anonymize,
          anonymizeType: policy.anonymizeType,
          anonymizeHiddenNames: policy.anonymizeHiddenNames,
          anonymizeAllowedNames: policy.anonymizeAllowedNames,
          anonymizePreamble: policy.anonymizePreamble,
          anonymizeUseFaker: policy.anonymizeUseFaker,
          anonymizeThreshold: policy.anonymizeThreshold,
          banCode: policy.banCode,
          banCodeThreshold: policy.banCodeThreshold,
          banCompetitors: policy.banCompetitors,
          banCompetitorsThreshold: policy.banCompetitorsThreshold,
          banCompetitorsCompetitors: policy.banCompetitorsCompetitors,
          banSubstrings: policy.banSubstrings,
          banSubstringsSubstrings: policy.banSubstringsSubstrings,
          banSubstringsMatchType: policy.banSubstringsMatchType,
          banSubstringsCaseSensitive: policy.banSubstringsCaseSensitive,
          banSubstringsRedact: policy.banSubstringsRedact,
          banSubstringsContainsAll: policy.banSubstringsContainsAll,
          banTopics: policy.banTopics,
          banTopicsThreshold: policy.banTopicsThreshold,
          banTopicsTopics: policy.banTopicsTopics,
          code: policy.code,
          codeLanguages: policy.codeLanguages,
          codeIsBlocked: policy.codeIsBlocked,
          gibberish: policy.gibberish,
          gibberishThreshold: policy.gibberishThreshold,
          gibberishMatchType: policy.gibberishMatchType,
          language: policy.language,
          languageValidLanguages: policy.languageValidLanguages,
          languageMatchType: policy.languageMatchType,
          promptInjection: policy.promptInjection,
          promptInjectionThreshold: policy.promptInjectionThreshold,
          promptInjectionMatchType: policy.promptInjectionMatchType,
          regex: policy.regex,
          regexPatterns: policy.regexPatterns,
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
        }}
        onSuccess={handleSuccess}
      />
    </div>
    </MainLayout>
  );
}