// src/app/playground/page.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import MainLayout from '@/components/layout/main-layout';
import { toast } from 'sonner';
import axios from 'axios';

interface PlaygroundResponse {
  status: 'blocked' | 'pass';
  results: {
    job_id: string;
    policy_id: string;
    project_id: string;
    policy_name: string;
    user_prompt: string;
    scanners_used: string[];
    sanitized_content: string;
    scan_results: Record<string, boolean>;
    risk_scores: Record<string, number>;
  };
  is_fail: boolean;
  failed_scanners: string[];
  result_id: string;
}

export default function PlaygroundPage() {
  const [message, setMessage] = useState('Your work is garbage.');
  const [response, setResponse] = useState<PlaygroundResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setLoading(true);
    setResponse(null);

    try {
      const res = await axios.post('https://6wrpw23l-8002.inc1.devtunnels.ms/v2/guard', {
        messages: [{ content: message }]
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer d6173c207265e90949ef117c1a8bd5e09d290954b6fc16247001d8bbb99f96e90f1a9ac470254b364f283385d6dbbb7e06860564abc720e9dd7ab1b478a9cf084184f3c2125831ebc9c860f580af68a4e5c3880b257c9fa896c18dd474aa0157',
          'Cookie': '.Tunnels.Relay.WebForwarding.Cookies=CfDJ8Cs4yarcs6pKkdu0hlKHsZvpPkwFcoihv95CLIULjBCEO4tBbxHEQ4WYxu9HnMaPjC9zYpGXd4PNwoaFd6pxV1Y3PM4xp6n7yHLiqwqTsLC_I4wCUJA5xH0cbNxpONWTDjR35RMwjB3UKGcUcj8NfUT3PTF2BlGYbyGNY0AOXhw1ccAaEwCou1c7WTOSWX10O9Iq1xWrZYwAplUMEZ9RuaILkYHjGypRpnvNnUReFOl8cgRys7Belsj5CemEY84r8hts8xWKOhBcMLZbmAKKF1Axcw5ZCJhUQG4zSckzllsOs1j42anmasoUOcnpqJ91Geu_KN7zgkAaIbBWJeRGI1CBhDQPBDQWxE4asKliIoHu2Z3NU1suiOC4OdvkkqWzhzC4Yk-PVBN4RJgJO3gFIIjg6wss6B2vzeAA8JtzwGqhq4TsX1ZCvwQF1ZWGL1lg9S4WhmjtkT-JdtKMpJ4FXGEarfWAQl5Ncdscj3O3MKlQvQ7uNjoHpIK9qg5g_conpm8fy-IjSqIJSjm8Ib0thWaIhU6D58bQMceSZamJnn4u_h4qjeP4rZks484Iq99IaF3rGtfBaufsaXh_MbfgJxaBHcZWOIEX93RspvriS8IXJCzz3Et1anHEfnLyNAyLZUhAy5VzJa-iC-wXOBa055cWUkUNXwAzQyo31HbPRqZ-jm-zPx8GgsqonpoKnb1HO30z7u0OCTCPiiyM-HaagJEoo1yMF0u9-r6_XR0_RKBUHJMm56h4-wGxJ-QFelm1-i8BI1gI2T8oBImoMfnXhMpQwX5vkv9swvnICbtfW64CYlxLaDwG5JnwkfZrRThW_WOUgSGa375haNkcpQifgFGg-Di9b61mWucDGYfOWVWKz9Z3KMZEmXeYCuYmWBU1CEugimspvQWwVKbEeRXEMsqv9z5B9bnOH98d9axRvM27'
        }
      });

      setResponse(res.data);
      toast.success('Request successful');
    } catch (error) {
      console.error(error);
      toast.error('Request failed');
      setResponse(null); // Reset response on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Guard Playground</h1>

        <Card>
          <CardHeader>
            <CardTitle>Test Guard Endpoint</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Message</label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your message here"
                rows={4}
              />
            </div>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Sending...' : 'Send Request'}
            </Button>
            {response && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Scan Results
                    <Badge variant={response.status === 'pass' ? 'default' : 'destructive'}>
                      {response.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Basic Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Result ID</label>
                      <p className="text-sm font-mono break-all">{response.result_id}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Job ID</label>
                      <p className="text-sm font-mono break-all">{response.results.job_id}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Policy</label>
                      <p className="text-sm">{response.results.policy_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Is Fail</label>
                      <Badge variant={response.is_fail ? 'destructive' : 'default'}>
                        {response.is_fail ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </div>

                  {/* User Prompt */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">User Prompt</label>
                    <div className="mt-1 p-3 bg-muted rounded-md">
                      <p className="text-sm whitespace-pre-wrap">{response.results.user_prompt}</p>
                    </div>
                  </div>

                  {/* Sanitized Content */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Sanitized Content</label>
                    <div className="mt-1 p-3 bg-muted rounded-md">
                      <p className="text-sm whitespace-pre-wrap">{response.results.sanitized_content}</p>
                    </div>
                  </div>

                  {/* Scanners Used */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Scanners Used</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {response.results.scanners_used.map((scanner: string) => (
                        <Badge key={scanner} variant="secondary">
                          {scanner}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Scan Results */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Scan Results</label>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {Object.entries(response.results.scan_results).map(([scanner, result]) => (
                        <div key={scanner} className="flex items-center gap-2">
                          <span className="text-sm">{scanner}:</span>
                          <Badge variant={result ? 'default' : 'destructive'}>
                            {result ? 'Pass' : 'Fail'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Risk Scores */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Risk Scores</label>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {Object.entries(response.results.risk_scores).map(([scanner, score]) => (
                        <div key={scanner} className="flex items-center gap-2">
                          <span className="text-sm">{scanner}:</span>
                          <Badge
                            variant={(score as number) > 0.5 ? 'destructive' : (score as number) > 0.2 ? 'secondary' : 'default'}
                          >
                            {score}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Failed Scanners */}
                  {response.failed_scanners.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Failed Scanners</label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {response.failed_scanners.map((scanner: string) => (
                          <Badge key={scanner} variant="destructive">
                            {scanner}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
