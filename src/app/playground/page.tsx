'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { CohereClient } from 'cohere-ai';
import MainLayout from '@/components/layout/main-layout';
import { useJobs } from '@/hooks/use-jobs';
import { Button } from '@/components/ui/button';

const cohere = new CohereClient({
  token: process.env.NEXT_PUBLIC_COHERE_API_KEY || 'your-api-key-here',
});

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Job {
  id?: string;
  projectType?: string;
  blueAPIKey?: string | null;
}

async function validateWithGuard(content: string, apiKey?: string): Promise<boolean> {
  try {
    const response = await axios.post('https://6wrpw23l-8002.inc1.devtunnels.ms/v2/guard', {
      messages: [{ content }],
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
    });
    if (!response || !response.data || typeof response.data.status !== 'string') {
      console.error('Invalid response from guard API:', response);
      return false;
    }
    return response.data.status === 'pass';
  } catch (error) {
    console.error('Guard API error:', error);
    return false;
  }
}

async function getCohereResponse(message: string): Promise<string> {
  if (!process.env.NEXT_PUBLIC_COHERE_API_KEY) {
    throw new Error('Cohere API key not set. Please set NEXT_PUBLIC_COHERE_API_KEY in your .env.local file.');
  }
  try {
    const response = await cohere.chat({
      model: 'command-a-03-2025',
      message: message,
      maxTokens: 100,
    });
    return response.text;
  } catch (error) {
    console.error('Cohere API error:', error);
    throw new Error('Failed to get response from Cohere');
  }
}

export default function Playground() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');

  const { data: jobData } = useJobs();

  useEffect(() => {
    if (jobData?.docs) {
      const blueJobs = jobData.docs.filter((job) => job.projectType === 'BLUE');
      setJobs(blueJobs);
    }
  }, [jobData]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const selectedJob = jobs.find(j => j.id === selectedJobId);
      const apiKey = selectedJob?.blueAPIKey || undefined;

      // Validate user message
      const userPass = await validateWithGuard(input, apiKey);
      if (!userPass) {
        throw new Error('User message failed validation');
      }

      // Get Cohere response
      const cohereRes = await getCohereResponse(input);

      // Validate Cohere response
      const coherePass = await validateWithGuard(cohereRes, apiKey);
      if (!coherePass) {
        throw new Error('Cohere response failed validation');
      }

      // Add Cohere response
      const assistantMessage: Message = { role: 'assistant', content: cohereRes };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: unknown) {
      const errorMessage: Message = {
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
    <div className="flex flex-col h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Chat Playground</h1>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Select Blue Job:</label>
        <select
          value={selectedJobId}
          onChange={(e) => setSelectedJobId(e.target.value)}
          className="border border-gray-700 rounded px-3 py-2 w-full max-w-md"
        >
          <option value="" className='bg-black text-white'>Select a Blue Job</option>
          {jobs.map(job => (
            <option key={job.id} value={job.id} className='bg-black text-white'>{job.id} - {job.projectType}</option>
          ))}
        </select>
      </div>
      <div className="flex-1 overflow-y-auto bg-primary-foreground rounded-2xl p-4 mb-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
            <span className={`inline-block px-3 py-2 rounded ${msg.role === 'user' ? 'bg-[#31b79d] text-black' : 'bg-gray-200 text-black'}`}>
              {msg.content}
            </span>
          </div>
        ))}
        {loading && <div className="text-center">Loading...</div>}
      </div>
      <div className="flex bg-primary-foreground rounded-2xl">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 rounded-l px-3 py-2"
          placeholder="Type your message..."
          disabled={loading}
        />
        <Button
        variant='default'
          onClick={handleSend}
          disabled={loading}
        >
          Send
        </Button>
  


      </div>
    </div>
    </MainLayout>
  );
}
