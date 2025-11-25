import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: '#667eea',
    padding: 20,
    marginBottom: 20,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 24,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 5,
  },
  section: {
    marginBottom: 20,
    padding: 15,
    border: '1px solid #e9ecef',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#555',
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableCol: {
    width: '20%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableCell: {
    margin: 5,
    fontSize: 10,
  },
  tableCellHeader: {
    margin: 5,
    fontSize: 10,
    fontWeight: 'bold',
  },
  tableColHeader: {
    width: '20%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#f0f0f0',
  },
  tableCellPass: {
    margin: 5,
    fontSize: 10,
    color: '#28a745',
    fontWeight: 'bold',
  },
  tableCellFail: {
    margin: 5,
    fontSize: 10,
    color: '#dc3545',
    fontWeight: 'bold',
  },
});

interface ReportData {
  results: unknown[];
  summary: {
    total_probes: number;
    fail_count: number;
    average_attack_success_rate: number;
  };
  ci_metrics: {
    warn_rate: number;
    refuse_rate: number;
    total_tests: number;
    average_confidence: number;
    critical_incidents: number;
  };
  enforcement_summary: Record<string, unknown>;
}

interface ProbeResult {
  probe_detector: string;
  result: string;
  ok_on: string;
  attack_success_rate?: number;
  confidence_score: number;
}

const Header = ({ jobId }: { jobId: string }) => (
  <View style={styles.header}>
    <Text style={styles.headerTitle}>SECURITY ASSESSMENT REPORT</Text>
    <Text>Job ID: {jobId}</Text>
  </View>
);

interface PDFOptions {
  jobId: string;
  job?: {
    project?: {
      type?: string;
    };
  };
  reportData: {
    data: unknown[];
  };
}

const PDFDocument = ({ data }: { data: PDFOptions }) => {
  const { jobId, reportData } = data;
  const report = (reportData.data[0] as { result?: ReportData })?.result;

  if (!report) return null;

  const { results, summary, ci_metrics, enforcement_summary } = report as ReportData;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Header jobId={jobId} />
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Executive Summary</Text>
          <Text style={styles.text}>Total Probes: {summary.total_probes}</Text>
          <Text style={styles.text}>Failed Probes: {summary.fail_count}</Text>
          <Text style={styles.text}>Average Attack Success Rate: {summary.average_attack_success_rate}%</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Probe Results</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <View style={styles.tableColHeader}>
                <Text style={styles.tableCellHeader}>Probe Detector</Text>
              </View>
              <View style={styles.tableColHeader}>
                <Text style={styles.tableCellHeader}>Result</Text>
              </View>
              <View style={styles.tableColHeader}>
                <Text style={styles.tableCellHeader}>OK On</Text>
              </View>
              <View style={styles.tableColHeader}>
                <Text style={styles.tableCellHeader}>Attack Success Rate</Text>
              </View>
              <View style={styles.tableColHeader}>
                <Text style={styles.tableCellHeader}>Confidence Score</Text>
              </View>
            </View>
            {(results as ProbeResult[]).map((result: ProbeResult, index: number) => (
              <View style={styles.tableRow} key={index}>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{result.probe_detector}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={result.result === 'PASS' ? styles.tableCellPass : styles.tableCellFail}>{result.result}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{result.ok_on}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{result.attack_success_rate || 'N/A'}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{result.confidence_score}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CI Metrics</Text>
          <Text style={styles.text}>Warn Rate: {ci_metrics.warn_rate}</Text>
          <Text style={styles.text}>Refuse Rate: {ci_metrics.refuse_rate}</Text>
          <Text style={styles.text}>Total Tests: {ci_metrics.total_tests}</Text>
          <Text style={styles.text}>Average Confidence: {ci_metrics.average_confidence}</Text>
          <Text style={styles.text}>Critical Incidents: {ci_metrics.critical_incidents}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Enforcement Summary</Text>
          {Object.entries(enforcement_summary).map(([key, value]) => (
            <Text key={key} style={styles.text}>{key}: {String(value)}</Text>
          ))}
        </View>
      </Page>
    </Document>
  );
};

export class PDFService {
  static async generateJobReportPDF(options: PDFOptions): Promise<void> {
    if (!options.reportData?.data || !Array.isArray(options.reportData.data) || options.reportData.data.length === 0) {
      throw new Error('No report data available to generate PDF');
    }

    const blob = await pdf(<PDFDocument data={options} />).toBlob();
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `security-assessment-${options.jobId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }
}
