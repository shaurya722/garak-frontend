"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Play, 
  Plus, 
  FileText, 
  ExternalLink,
  Sparkles,
  ArrowDown
} from "lucide-react";
import Link from "next/link";
import MainLayout from "@/components/layout/main-layout";

const GettingStarted = () => {
  return (
    <MainLayout>
      <div className="py-6 px-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="h-8 w-8 text-[#31B79D]" />
              <h1 className="text-3xl font-bold tracking-tight">Getting Started</h1>
            </div>
            <p className="text-muted-foreground">
              Complete these steps to get the most out of Aynigma Security
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-sm">
              4 Steps Left
            </Badge>
          </div>
        </div>

        {/* Progress Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Setup Progress</CardTitle>
            <CardDescription>
              You&apos;re 0% complete. Follow the steps below to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={0} className="w-full" />
          </CardContent>
        </Card>

        {/* Steps Section */}
        <div className="space-y-4">
          {/* Step 1 */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-[#31B79D]/10 rounded-lg flex items-center justify-center">
                      <Play className="h-6 w-6 text-[#31B79D]" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">Check out the tutorial</h3>
                    <p className="text-muted-foreground">
                      The best way to get started is to watch a tutorial for easy user experience throughout your starting journey with Aynigma Security
                    </p>
                  </div>
                </div>
                <Button variant="outline" className="ml-4">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Tutorial
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Step 2 */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-[#31B79D]/10 rounded-lg flex items-center justify-center">
                      <Plus className="h-6 w-6 text-[#31B79D]" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">Create a Project</h3>
                    <p className="text-muted-foreground">
                      Set up your first project to start testing your API endpoints for security vulnerabilities.
                    </p>
                  </div>
                </div>
                <Link href="/projects/new">
                  <Button variant="outline" className="ml-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Project
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Step 3 */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-[#31B79D]/10 rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-[#31B79D]" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">Create a Custom Policy</h3>
                    <p className="text-muted-foreground">
                      Define security policies and rules to customize your testing approach and compliance requirements.
                    </p>
                  </div>
                </div>
                <Link href="/policies">
                  <Button variant="outline" className="ml-4">
                    <FileText className="h-4 w-4 mr-2" />
                    Create Policy
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Step 4 */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-[#31B79D]/10 rounded-lg flex items-center justify-center">
                      <ArrowDown className="h-6 w-6 text-[#31B79D]" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">Assign Policy to Project</h3>
                    <p className="text-muted-foreground">
                      Connect your custom policy to your project to enable comprehensive security testing with your specific requirements.
                    </p>
                  </div>
                </div>
                <Link href="/projects">
                  <Button variant="outline" className="ml-4">
                    <ArrowDown className="h-4 w-4 mr-2" />
                    Assign Policy
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default GettingStarted;
