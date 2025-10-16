'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

// Define interfaces for enhanced results
interface DetectorOutput {
  detector_id: string
  confidence_score: number
  tags: string[]
  matched_patterns: string[] | null
  evidence: Record<string, unknown>
}

interface AuditLog {
  decision_metadata: {
    max_confidence: number
    tags: string[]
    decision_method: string
  }
  timestamp: string
  policy_version: string
}

interface EnhancedResult {
  probe_detector: string
  result: string
  ok_on?: string
  attack_success_rate: number | null
  confidence_score: number
  enforcement_action: 'ALLOW' | 'SANITIZE' | 'REFUSE' | 'WARN'
  detector_outputs: DetectorOutput[]
  sanitized_content: string | null
  refusal_reason: string | null
  tags: string[]
  audit_log: AuditLog
}

// Legacy interface for backward compatibility
interface TestResult {
  probe_detector: string
  result: string
  ok_on?: string
  attack_success_rate?: number
}

interface SummaryStats {
  total_probes: number
  fail_count: number
  average_attack_success_rate: number
}

interface EnforcementSummary {
  ALLOW: number
  SANITIZE: number
  REFUSE: number
  WARN: number
}

// Updated report data interface
interface ReportData {
  job_id: string
  status: string
  // Enhanced results fields
  enhanced_results?: EnhancedResult[]
  enforcement_summary?: EnforcementSummary
  policy_violations?: Record<string, unknown>[]
  total_tests?: number
  // Legacy fields for backward compatibility
  summary?: SummaryStats
  results?: TestResult[]
  created_at: string
  completed_at?: string
  config_name?: string
  probes?: string[]
}

interface SecurityReportDownloadProps {
  data: ReportData
  fileName?: string
  children: React.ReactNode
}

// Generate clean HTML report
const generateHTMLReport = (data: ReportData): string => {
  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Security Test Report - ${data.job_id}</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 40px; 
            line-height: 1.6; 
            color: #333;
        }
        .header { 
            border-bottom: 3px solid #DC2626; 
            padding-bottom: 20px; 
            margin-bottom: 30px; 
        }
        .logo { 
            font-size: 28px; 
            font-weight: bold; 
            color: #DC2626; 
            margin-bottom: 5px; 
        }
        .subtitle { 
            color: #6B7280; 
            font-size: 14px; 
            margin-bottom: 15px; 
        }
        .title { 
            font-size: 24px; 
            font-weight: bold; 
            color: #111827; 
        }
        .section { 
            margin-bottom: 30px; 
        }
        .section-title { 
            font-size: 18px; 
            font-weight: bold; 
            color: #374151; 
            border-bottom: 1px solid #E5E7EB; 
            padding-bottom: 8px; 
            margin-bottom: 15px; 
        }
        .info-grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 15px; 
            margin-bottom: 20px; 
        }
        .info-item { 
            padding: 10px; 
            background: #F9FAFB; 
            border-radius: 6px; 
        }
        .info-label { 
            font-weight: bold; 
            color: #6B7280; 
            font-size: 12px; 
            margin-bottom: 5px; 
        }
        .info-value { 
            color: #111827; 
            font-size: 14px; 
        }
        .summary-card { 
            background: #F9FAFB; 
            border: 1px solid #E5E7EB; 
            border-radius: 8px; 
            padding: 20px; 
            margin-bottom: 20px; 
        }
        .summary-grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr 1fr; 
            gap: 20px; 
            text-align: center; 
        }
        .summary-number { 
            font-size: 32px; 
            font-weight: bold; 
            color: #DC2626; 
            margin-bottom: 5px; 
        }
        .summary-label { 
            color: #6B7280; 
            font-size: 12px; 
        }
        .status-success { 
            background: #D1FAE5; 
            color: #065F46; 
            padding: 4px 8px; 
            border-radius: 4px; 
            font-size: 12px; 
            font-weight: bold; 
        }
        .status-failure { 
            background: #FEE2E2; 
            color: #991B1B; 
            padding: 4px 8px; 
            border-radius: 4px; 
            font-size: 12px; 
            font-weight: bold; 
        }
        .enforcement-allow { 
            background: #D1FAE5; 
            color: #065F46; 
            padding: 4px 8px; 
            border-radius: 4px; 
            font-size: 12px; 
            font-weight: bold; 
        }
        .enforcement-warn { 
            background: #FEF3C7; 
            color: #92400E; 
            padding: 4px 8px; 
            border-radius: 4px; 
            font-size: 12px; 
            font-weight: bold; 
        }
        .enforcement-refuse { 
            background: #FEE2E2; 
            color: #991B1B; 
            padding: 4px 8px; 
            border-radius: 4px; 
            font-size: 12px; 
            font-weight: bold; 
        }
        .enforcement-sanitize { 
            background: #DBEAFE; 
            color: #1E40AF; 
            padding: 4px 8px; 
            border-radius: 4px; 
            font-size: 12px; 
            font-weight: bold; 
        }
        .detector-output { 
            background: #F3F4F6; 
            border: 1px solid #D1D5DB; 
            border-radius: 6px; 
            padding: 12px; 
            margin-bottom: 10px; 
        }
        .detector-header { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            margin-bottom: 8px; 
        }
        .confidence-score { 
            font-weight: bold; 
            font-size: 12px; 
        }
        .confidence-high { color: #DC2626; }
        .confidence-medium { color: #F59E0B; }
        .confidence-low { color: #059669; }
        .tag-badge { 
            background: #E5E7EB; 
            color: #374151; 
            padding: 2px 6px; 
            border-radius: 4px; 
            font-size: 10px; 
            margin: 0 2px; 
        }
        .footer { 
            margin-top: 50px; 
            padding-top: 20px; 
            border-top: 1px solid #E5E7EB; 
            text-align: center; 
            color: #9CA3AF; 
            font-size: 12px; 
        }
        @media print {
            body { margin: 20px; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">🛡️ GARAK SECURITY</div>
        <div class="subtitle">AI/LLM Vulnerability Assessment Report</div>
        <div class="title">Security Test Report</div>
    </div>

    <div class="section">
        <div class="section-title">Executive Summary</div>
        ${
          data.enhanced_results && data.enhanced_results.length > 0
            ? `
        <div class="summary-card">
            <div class="summary-grid">
                <div>
                    <div class="summary-number">${
                      data.total_tests || data.enhanced_results.length
                    }</div>
                    <div class="summary-label">Total Tests</div>
                </div>
                <div>
                    <div class="summary-number" style="color: #DC2626;">${
                      data.enhanced_results.filter((r) => r.result === 'FAIL')
                        .length
                    }</div>
                    <div class="summary-label">Failed Tests</div>
                </div>
                <div>
                    <div class="summary-number" style="color: #F59E0B;">${(() => {
                      const enforcement = data.enforcement_summary || {
                        ALLOW: data.enhanced_results.filter(
                          (r) => r.enforcement_action === 'ALLOW'
                        ).length,
                        WARN: data.enhanced_results.filter(
                          (r) => r.enforcement_action === 'WARN'
                        ).length,
                        REFUSE: data.enhanced_results.filter(
                          (r) => r.enforcement_action === 'REFUSE'
                        ).length,
                        SANITIZE: data.enhanced_results.filter(
                          (r) => r.enforcement_action === 'SANITIZE'
                        ).length,
                      }
                      return enforcement.REFUSE + enforcement.WARN
                    })()}</div>
                    <div class="summary-label">Security Issues</div>
                </div>
            </div>
            <div style="margin-top: 20px;">
                <div class="section-title" style="font-size: 16px;">Enforcement Actions</div>
                <div class="summary-grid" style="grid-template-columns: 1fr 1fr 1fr 1fr;">
                    <div>
                        <div class="summary-number" style="color: #059669;">${(() => {
                          const enforcement = data.enforcement_summary || {
                            ALLOW: data.enhanced_results.filter(
                              (r) => r.enforcement_action === 'ALLOW'
                            ).length,
                            WARN: data.enhanced_results.filter(
                              (r) => r.enforcement_action === 'WARN'
                            ).length,
                            REFUSE: data.enhanced_results.filter(
                              (r) => r.enforcement_action === 'REFUSE'
                            ).length,
                            SANITIZE: data.enhanced_results.filter(
                              (r) => r.enforcement_action === 'SANITIZE'
                            ).length,
                          }
                          return enforcement.ALLOW
                        })()}</div>
                        <div class="summary-label">ALLOW</div>
                    </div>
                    <div>
                        <div class="summary-number" style="color: #F59E0B;">${(() => {
                          const enforcement = data.enforcement_summary || {
                            ALLOW: data.enhanced_results.filter(
                              (r) => r.enforcement_action === 'ALLOW'
                            ).length,
                            WARN: data.enhanced_results.filter(
                              (r) => r.enforcement_action === 'WARN'
                            ).length,
                            REFUSE: data.enhanced_results.filter(
                              (r) => r.enforcement_action === 'REFUSE'
                            ).length,
                            SANITIZE: data.enhanced_results.filter(
                              (r) => r.enforcement_action === 'SANITIZE'
                            ).length,
                          }
                          return enforcement.WARN
                        })()}</div>
                        <div class="summary-label">WARN</div>
                    </div>
                    <div>
                        <div class="summary-number" style="color: #DC2626;">${(() => {
                          const enforcement = data.enforcement_summary || {
                            ALLOW: data.enhanced_results.filter(
                              (r) => r.enforcement_action === 'ALLOW'
                            ).length,
                            WARN: data.enhanced_results.filter(
                              (r) => r.enforcement_action === 'WARN'
                            ).length,
                            REFUSE: data.enhanced_results.filter(
                              (r) => r.enforcement_action === 'REFUSE'
                            ).length,
                            SANITIZE: data.enhanced_results.filter(
                              (r) => r.enforcement_action === 'SANITIZE'
                            ).length,
                          }
                          return enforcement.REFUSE
                        })()}</div>
                        <div class="summary-label">REFUSE</div>
                    </div>
                    <div>
                        <div class="summary-number" style="color: #1E40AF;">${(() => {
                          const enforcement = data.enforcement_summary || {
                            ALLOW: data.enhanced_results.filter(
                              (r) => r.enforcement_action === 'ALLOW'
                            ).length,
                            WARN: data.enhanced_results.filter(
                              (r) => r.enforcement_action === 'WARN'
                            ).length,
                            REFUSE: data.enhanced_results.filter(
                              (r) => r.enforcement_action === 'REFUSE'
                            ).length,
                            SANITIZE: data.enhanced_results.filter(
                              (r) => r.enforcement_action === 'SANITIZE'
                            ).length,
                          }
                          return enforcement.SANITIZE
                        })()}</div>
                        <div class="summary-label">SANITIZE</div>
                    </div>
                </div>
            </div>
        </div>
        `
            : data.summary
            ? `
        <div class="summary-card">
            <div class="summary-grid">
                <div>
                    <div class="summary-number">${
                      data.summary.total_probes
                    }</div>
                    <div class="summary-label">Total Probes</div>
                </div>
                <div>
                    <div class="summary-number" style="color: #DC2626;">${
                      data.summary.fail_count
                    }</div>
                    <div class="summary-label">Failed Tests</div>
                </div>
                <div>
                    <div class="summary-number" style="color: #F59E0B;">${
                      data.summary.average_attack_success_rate !== null &&
                      data.summary.average_attack_success_rate !== undefined
                        ? data.summary.average_attack_success_rate.toFixed(1)
                        : '0.0'
                    }%</div>
                    <div class="summary-label">Attack Success</div>
                </div>
            </div>
        </div>
        `
            : '<div>No summary data available</div>'
        }
    </div>

    <div class="section">
        <div class="section-title">Test Information</div>
        <div class="info-grid">
            <div class="info-item">
                <div class="info-label">Job ID</div>
                <div class="info-value">${data.job_id}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Status</div>
                <div class="info-value">
                    <span class="${
                      data.status === 'SUCCESS'
                        ? 'status-success'
                        : 'status-failure'
                    }">${data.status}</span>
                </div>
            </div>
            <div class="info-item">
                <div class="info-label">Configuration</div>
                <div class="info-value">${data.config_name || 'N/A'}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Started</div>
                <div class="info-value">${new Date(
                  data.created_at
                ).toLocaleString()}</div>
            </div>
            ${
              data.completed_at
                ? `
            <div class="info-item">
                <div class="info-label">Completed</div>
                <div class="info-value">${new Date(
                  data.completed_at
                ).toLocaleString()}</div>
            </div>
            `
                : ''
            }
        </div>
    </div>

    ${
      data.enhanced_results && data.enhanced_results.length > 0
        ? `
    <div class="section">
        <div class="section-title">Enhanced Security Analysis</div>
        ${data.enhanced_results
          .map(
            (result: EnhancedResult) => `
        <div class="info-item" style="margin-bottom: 20px; border: 1px solid #E5E7EB; border-radius: 8px; padding: 15px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <strong style="font-size: 14px;">${
                  result.probe_detector
                }</strong>
                <div style="display: flex; gap: 8px; align-items: center;">
                    <span class="${
                      result.result.toLowerCase() === 'pass'
                        ? 'status-success'
                        : 'status-failure'
                    }">${result.result.toUpperCase()}</span>
                    <span class="enforcement-${result.enforcement_action.toLowerCase()}">${
              result.enforcement_action
            }</span>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
                ${
                  result.ok_on
                    ? `<div class="info-label">Test Results: ${result.ok_on}</div>`
                    : ''
                }
                <div class="info-label">Confidence: <span class="confidence-score confidence-${
                  result.confidence_score >= 0.7
                    ? 'high'
                    : result.confidence_score >= 0.4
                    ? 'medium'
                    : 'low'
                }">${(result.confidence_score * 100).toFixed(1)}%</span></div>
            </div>
            
            ${
              result.tags.length > 0
                ? `
            <div style="margin-bottom: 10px;">
                <div class="info-label">Tags:</div>
                <div style="margin-top: 4px;">
                    ${result.tags
                      .map((tag) => `<span class="tag-badge">${tag}</span>`)
                      .join('')}
                </div>
            </div>
            `
                : ''
            }
            
            ${
              result.refusal_reason
                ? `
            <div style="margin-bottom: 10px;">
                <div class="info-label">Refusal Reason:</div>
                <div style="color: #DC2626; font-size: 12px; margin-top: 4px;">${result.refusal_reason}</div>
            </div>
            `
                : ''
            }
            
            ${
              result.detector_outputs.length > 0
                ? `
            <div>
                <div class="info-label">Detector Analysis:</div>
                <div style="margin-top: 8px;">
                    ${result.detector_outputs
                      .map(
                        (output) => `
                    <div class="detector-output">
                        <div class="detector-header">
                            <strong style="font-size: 12px;">${
                              output.detector_id
                            }</strong>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <span class="confidence-score confidence-${
                                  output.confidence_score >= 0.7
                                    ? 'high'
                                    : output.confidence_score >= 0.4
                                    ? 'medium'
                                    : 'low'
                                }">${(output.confidence_score * 100).toFixed(
                          1
                        )}%</span>
                                ${
                                  output.tags.length > 0
                                    ? output.tags
                                        .map(
                                          (tag) =>
                                            `<span class="tag-badge">${tag}</span>`
                                        )
                                        .join('')
                                    : ''
                                }
                            </div>
                        </div>
                        ${
                          output.evidence &&
                          Object.keys(output.evidence).length > 0
                            ? `
                        <div style="font-size: 10px; color: #6B7280; background: #F9FAFB; padding: 6px; border-radius: 4px; margin-top: 4px;">
                            Evidence: ${JSON.stringify(
                              output.evidence
                            ).substring(0, 200)}${
                                JSON.stringify(output.evidence).length > 200
                                  ? '...'
                                  : ''
                              }
                        </div>
                        `
                            : ''
                        }
                    </div>
                    `
                      )
                      .join('')}
                </div>
            </div>
            `
                : ''
            }
            
            ${
              result.audit_log
                ? `
            <div style="margin-top: 10px; padding: 8px; background: #EFF6FF; border-radius: 4px;">
                <div class="info-label">Decision Audit:</div>
                <div style="font-size: 10px; color: #1E40AF; margin-top: 4px;">
                    Max Confidence: ${(
                      result.audit_log.decision_metadata.max_confidence * 100
                    ).toFixed(1)}% | 
                    Method: ${
                      result.audit_log.decision_metadata.decision_method
                    } | 
                    Policy: ${result.audit_log.policy_version} | 
                    Time: ${new Date(
                      result.audit_log.timestamp
                    ).toLocaleString()}
                </div>
            </div>
            `
                : ''
            }
        </div>
        `
          )
          .join('')}
    </div>
    `
        : data.results && data.results.length > 0
        ? `
    <div class="section">
        <div class="section-title">Detailed Results</div>
        ${data.results
          .map(
            (result: TestResult) => `
        <div class="info-item" style="margin-bottom: 15px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <strong>${result.probe_detector}:</strong>
                <span class="${
                  result.result.toLowerCase() === 'pass'
                    ? 'status-success'
                    : 'status-failure'
                }">${result.result.toUpperCase()}</span>
            </div>
            ${
              result.ok_on
                ? `<div class="info-label">Evaluated on: ${result.ok_on}</div>`
                : ''
            }
            ${
              result.attack_success_rate !== undefined &&
              result.attack_success_rate !== null
                ? `<div class="info-label">Attack Success Rate: ${result.attack_success_rate.toFixed(
                    1
                  )}%</div>`
                : ''
            }
        </div>
        `
          )
          .join('')}
    </div>
    `
        : ''
    }

    <div class="footer">
        Generated by Garak Security Platform • ${new Date().toLocaleDateString()} • Confidential
    </div>
</body>
</html>`
}

// Main Report Download Component
const SecurityReportDownload: React.FC<SecurityReportDownloadProps> = ({
  data,
  fileName = `security-report-${data.job_id}`,
  children,
}) => {
  const [isClient, setIsClient] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const reportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const downloadHTML = () => {
    setIsGenerating(true)

    try {
      // Generate the HTML content
      const htmlContent = generateHTMLReport(data)

      // Create a blob with the HTML content
      const blob = new Blob([htmlContent], { type: 'text/html' })

      // Create a download link
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${fileName}.html`

      // Trigger the download
      document.body.appendChild(link)
      link.click()

      // Clean up
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error generating HTML report:', error)
      alert('Report generation failed. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  if (!isClient) {
    return (
      <Button variant='outline' disabled>
        <Download className='h-4 w-4 mr-2' />
        Loading...
      </Button>
    )
  }

  return (
    <>
      {/* Download trigger */}
      <div onClick={downloadHTML} style={{ cursor: 'pointer' }}>
        {isGenerating ? (
          <Button variant='outline' disabled>
            <Download className='h-4 w-4 mr-2' />
            Generating Report...
          </Button>
        ) : (
          children
        )}
      </div>
    </>
  )
}

export default SecurityReportDownload
