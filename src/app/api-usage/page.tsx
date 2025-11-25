'use client';

import MainLayout from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ApiUsage() {
  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">API Usage Guide</h1>
          <p className="text-muted-foreground mt-2">
            Learn how to use the Guard API for content validation
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Guard API Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                The Guard API is used to validate messages against security policies. It checks content for potential violations
                and returns a status indicating whether the message passes validation.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Endpoint</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-md font-mono text-sm">
                POST https://6wrpw23l-8002.inc1.devtunnels.ms/v2/guard
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Headers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h3 className="font-medium">Content-Type</h3>
                  <p className="text-muted-foreground">application/json</p>
                </div>
                <div>
                  <h3 className="font-medium">Authorization</h3>
                  <p className="text-muted-foreground">Bearer {'{blueAPIKey}'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Request Body</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-md">
                <pre className="text-sm">
{`{
  "messages": [
    {
      "content": "Your message content here"
    }
  ]
}`}
                </pre>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Response</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-md">
                <pre className="text-sm">
{`{
  "status": "pass" | "fail"
}`}
                </pre>
              </div>
              <p className="text-muted-foreground mt-4">
                <strong>Status:</strong> &ldquo;pass&rdquo; indicates the message passed validation, &ldquo;fail&rdquo; indicates it failed.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Getting Your Blue API Key</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  To use the Guard API, you need a Blue API Key. Follow these steps to obtain one:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  <li>Navigate to the <strong>Jobs</strong> section in the sidebar</li>
                  <li>Create or select a job with <strong>Project Type: BLUE</strong></li>
                  <li>In the job details, locate the <strong>Blue API Key</strong> field</li>
                  <li>Copy the API key value</li>
                  <li>Use this key in the Authorization header as shown above</li>
                </ol>
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 dark:bg-blue-950 dark:border-blue-800">
                  <p className="text-blue-800 dark:text-blue-200">
                    <strong>Note:</strong> Only Blue team jobs have API keys. Make sure your job is configured for Blue team operations.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Example cURL Request</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-md">
                <pre className="text-sm overflow-x-auto">
{`curl --location 'https://6wrpw23l-8002.inc1.devtunnels.ms/v2/guard' \\
--header 'Content-Type: application/json' \\
--header 'Authorization: Bearer YOUR_BLUE_API_KEY' \\
--data '{
  "messages": [
    {
      "content": "Your work is garbage."
    }
  ]
}'`}
                </pre>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Error Handling</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h3 className="font-medium text-destructive">401 Unauthorized</h3>
                  <p className="text-muted-foreground">Invalid or missing API key</p>
                </div>
                <div>
                  <h3 className="font-medium text-destructive">400 Bad Request</h3>
                  <p className="text-muted-foreground">Invalid request format or missing required fields</p>
                </div>
                <div>
                  <h3 className="font-medium text-destructive">500 Internal Server Error</h3>
                  <p className="text-muted-foreground">Server-side error occurred</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
