'use client';

import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Separator } from '@/components/ui/separator';
import { DeleteConfirmDialog } from '@/components/dialogs/delete-confirmation-dialog';
import { ArrowLeft, Edit, Trash2, Shield, Layers } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { usePolicy, useDeletePolicy } from '@/hooks/use-policies';
import Link from 'next/link';
import { useState } from 'react';
import MainLayout from '@/components/layout/main-layout';
import { toast } from 'sonner';

export default function PolicyPage() {
  const router = useRouter();
  const { id } = useParams();
  const { data: policy, isLoading } = usePolicy(id as string);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  
  if (!policy)
    return (
      <MainLayout>
        <div className="flex flex-col justify-center items-center min-h-screen text-muted-foreground">
          <Layers className="w-10 h-10 text-destructive mb-3" />
          <p>Policy not found</p>
        </div>
      </MainLayout>
    );

  const renderScannerDetails = (scanner: string) => {
    switch (scanner) {
      case 'Anonymize':
        return (
          <div className="space-y-2">
            <div><strong>Type:</strong> {policy.anonymizeType?.join(', ') || 'None'}</div>
            <div><strong>Hidden Names:</strong> {policy.anonymizeHiddenNames?.join(', ') || 'None'}</div>
            <div><strong>Allowed Names:</strong> {policy.anonymizeAllowedNames?.join(', ') || 'None'}</div>
            <div><strong>Preamble:</strong> {policy.anonymizePreamble || 'None'}</div>
            <div><strong>Use Faker:</strong> {policy.anonymizeUseFaker ? 'Yes' : 'No'}</div>
            <div><strong>Threshold:</strong> {policy.anonymizeThreshold || 'N/A'}</div>
          </div>
        );
      case 'BanCode':
        return (
          <div className="space-y-2">
            <div><strong>Threshold:</strong> {policy.banCodeThreshold || 'N/A'}</div>
          </div>
        );
      case 'BanCompetitors':
        return (
          <div className="space-y-2">
            <div><strong>Competitors:</strong> {policy.banCompetitorsCompetitors?.join(', ') || 'None'}</div>
            <div><strong>Threshold:</strong> {policy.banCompetitorsThreshold || 'N/A'}</div>
          </div>
        );
      case 'BanSubstrings':
        return (
          <div className="space-y-2">
            <div><strong>Substrings:</strong> {policy.banSubstringsSubstrings?.join(', ') || 'None'}</div>
            <div><strong>Match Type:</strong> {policy.banSubstringsMatchType || 'N/A'}</div>
            <div><strong>Case Sensitive:</strong> {policy.banSubstringsCaseSensitive ? 'Yes' : 'No'}</div>
            <div><strong>Redact:</strong> {policy.banSubstringsRedact ? 'Yes' : 'No'}</div>
            <div><strong>Contains All:</strong> {policy.banSubstringsContainsAll ? 'Yes' : 'No'}</div>
          </div>
        );
      case 'BanTopics':
        return (
          <div className="space-y-2">
            <div><strong>Topics:</strong> {policy.banTopicsTopics?.join(', ') || 'None'}</div>
            <div><strong>Threshold:</strong> {policy.banTopicsThreshold || 'N/A'}</div>
          </div>
        );
      case 'Code':
        return (
          <div className="space-y-2">
            <div><strong>Languages:</strong> {policy.codeLanguages?.join(', ') || 'None'}</div>
            <div><strong>Is Blocked:</strong> {policy.codeIsBlocked ? 'Yes' : 'No'}</div>
          </div>
        );
      case 'Gibberish':
        return (
          <div className="space-y-2">
            <div><strong>Threshold:</strong> {policy.gibberishThreshold || 'N/A'}</div>
            <div><strong>Match Type:</strong> {policy.gibberishMatchType || 'N/A'}</div>
          </div>
        );
      case 'Language':
        return (
          <div className="space-y-2">
            <div><strong>Valid Languages:</strong> {policy.languageValidLanguages?.join(', ') || 'None'}</div>
            <div><strong>Match Type:</strong> {policy.languageMatchType || 'N/A'}</div>
          </div>
        );
      case 'PromptInjection':
        return (
          <div className="space-y-2">
            <div><strong>Threshold:</strong> {policy.promptInjectionThreshold || 'N/A'}</div>
            <div><strong>Match Type:</strong> {policy.promptInjectionMatchType || 'N/A'}</div>
          </div>
        );
      case 'Regex':
        return (
          <div className="space-y-2">
            <div><strong>Patterns:</strong> {policy.regexPatterns?.join(', ') || 'None'}</div>
            <div><strong>Is Blocked:</strong> {policy.regexIsBlocked ? 'Yes' : 'No'}</div>
            <div><strong>Redact:</strong> {policy.regexRedact ? 'Yes' : 'No'}</div>
          </div>
        );
      case 'Secrets':
        return (
          <div className="space-y-2">
            <div><strong>Redact Mode:</strong> {policy.secretsRedactMode || 'N/A'}</div>
          </div>
        );
      case 'Sentiment':
        return (
          <div className="space-y-2">
            <div><strong>Threshold:</strong> {policy.sentimentThreshold || 'N/A'}</div>
            <div><strong>Match Type:</strong> {policy.sentimentMatchType || 'N/A'}</div>
          </div>
        );
      case 'TokenLimit':
        return (
          <div className="space-y-2">
            <div><strong>Limit:</strong> {policy.tokenLimitLimit || 'N/A'}</div>
            <div><strong>Encoding Name:</strong> {policy.tokenLimitEncodingName || 'N/A'}</div>
          </div>
        );
      case 'Toxicity':
        return (
          <div className="space-y-2">
            <div><strong>Threshold:</strong> {policy.toxicityThreshold || 'N/A'}</div>
            <div><strong>Match Type:</strong> {policy.toxicityMatchType || 'N/A'}</div>
          </div>
        );
      default:
        return <div>No details available</div>;
    }
  };

  const enabledScanners = [
    policy.anonymize && 'Anonymize',
    policy.banCode && 'BanCode',
    policy.banCompetitors && 'BanCompetitors',
    policy.banSubstrings && 'BanSubstrings',
    policy.banTopics && 'BanTopics',
    policy.code && 'Code',
    policy.gibberish && 'Gibberish',
    policy.language && 'Language',
    policy.promptInjection && 'PromptInjection',
    policy.regex && 'Regex',
    policy.secrets && 'Secrets',
    policy.sentiment && 'Sentiment',
    policy.tokenLimit && 'TokenLimit',
    policy.toxicity && 'Toxicity',
  ].filter(Boolean);

  if (isLoading)
    return (
      <MainLayout>
        <div className="flex flex-col justify-center items-center min-h-screen text-muted-foreground">
          <Shield className="w-10 h-10 text-primary animate-pulse mb-3" />
          <p>Loading policy details...</p>
        </div>
      </MainLayout>
    );

  if (!policy)
    return (
      <MainLayout>
        <div className="flex flex-col justify-center items-center min-h-screen text-muted-foreground">
          <Layers className="w-10 h-10 text-destructive mb-3" />
          <p>Policy not found</p>
        </div>
      </MainLayout>
    );

  return (
    <MainLayout>
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/policies">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{policy.name}</h1>
            <p className="text-muted-foreground">
              Last updated {formatDate(policy.updatedAt)}
            </p>
          </div>
        </div>

        {/* Main Card */}
        <Card className="border shadow-sm">
          <CardHeader className="flex justify-between items-center">
            <div>
              <Badge variant={policy.defaultDetector ? 'default' : 'outline'}>
                {policy.defaultDetector ? 'Default Policy' : 'Custom Policy'}
              </Badge>
              <CardTitle className="mt-3">{policy.name}</CardTitle>
              <p className="text-muted-foreground mt-1">{policy.description}</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/policies/${policy.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </Link>
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteDialogOpen(true)}
                disabled={policy.defaultDetector}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            </div>
          </CardHeader>

          <CardContent className="mt-6 grid gap-8 md:grid-cols-2">
            {policy.type === "RED" ? (
              <>
                {/* === Categories Section === */}
                <div>
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-primary" /> Categories
                  </h3>
                  <div className="space-y-3">
                    {policy.categoryIds && policy.categoryIds.length > 0 ? (
                      policy.categoryIds.map((catId) => (
                        <div
                          key={catId}
                          className="p-3 rounded-lg border hover:shadow-sm transition-all bg-muted/40"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium font-mono text-sm">{catId}</span>
                            <Badge variant="outline" className="text-xs">
                              Category
                            </Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        No categories assigned
                      </p>
                    )}
                  </div>
                </div>

                {/* === Detectors Section === */}
                <div>
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" /> Detectors
                  </h3>
                  <div className="space-y-3">
                    {policy.detectorIds && policy.detectorIds.length > 0 ? (
                      policy.detectorIds.map((detId) => (
                        <div
                          key={detId}
                          className="p-3 rounded-lg border hover:shadow-sm transition-all bg-muted/40"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium font-mono text-sm">
                              {detId}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              Detector
                            </Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        No detectors assigned
                      </p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* === Enabled Scanners Section === */}
                <div className="md:col-span-2">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" /> Enabled Scanners
                  </h3>
                  <div className="space-y-3">
                    {enabledScanners.length ? (
                      enabledScanners.map((scanner) => (
                        <div
                          key={scanner}
                          className="p-3 rounded-lg border hover:shadow-sm transition-all bg-muted/40"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{scanner}</span>
                            <Badge variant="outline" className="text-xs">
                              Enabled
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {renderScannerDetails(scanner)}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        No scanners enabled
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog
        <DeleteConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDelete}
          title="Delete Policy"
          description="Are you sure you want to delete this policy? This action cannot be undone."
        /> */}
      </div>
    </MainLayout>
  );
}
