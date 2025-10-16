"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, ArrowLeft, Play, Settings } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { apiConfig } from "@/config/api";
import MainLayout from "@/components/layout/main-layout";
import api from "@/lib/axios";

interface RestConfig {
  config_id: string;
  config_name: string;
  description?: string;
  rest_generator: {
    uri: string;
    method: string;
  };
}

interface Policy {
  policy_id: string;
  policy_name: string;
  description: string;
  categories: string[];
  probe_count: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

interface Detector {
  detector_id: string;
  detector_type: string;
  name: string;
  description: string;
  confidence_threshold: number;
  patterns?: string[];
  enabled: boolean;
  created_at?: string;
}

type ModelType = 
  | "rest" 
  | "openai" 
  | "huggingface"
  | "huggingface.InferenceAPI" 
  | "huggingface.InferenceEndpoint" 
  | "replicate" 
  | "cohere" 
  | "groq" 
  | "nim" 
  | "ggml";

interface TestForm {
  model_type: ModelType;
  rest_config_id?: string;
  model_name?: string;
  probes: string[];
  policy_id?: string;
  // Detector configuration
  detector_ids: string[];
  use_builtin_detectors: boolean;
  // API Keys for different providers
  rest_api_key?: string;
  openai_api_key?: string;
  hf_inference_token?: string;
  replicate_api_token?: string;
  cohere_api_key?: string;
  groq_api_key?: string;
  nim_api_key?: string;
  // GGML specific
  ggml_main_path?: string;
  generations: number;
  eval_threshold?: number;
}

const availableProbes = [
  {
    category: "Full Scan",
    description: "Comprehensive security testing across all categories",
    probes: [
      { 
        id: "full_scan", 
        name: "Complete Security Scan", 
        description: "Runs all available probes - WARNING: This will take significant time to complete and may require substantial computational resources",
        isFullScan: true
      }
    ]
  },
  {
    category: "Content Safety & Toxicity",
    description: "Tests for harmful, toxic, or inappropriate content generation",
    probes: [
      { id: "lmrc.Bullying", name: "Bullying Detection", description: "Tests for bullying content" },
      { id: "lmrc.Deadnaming", name: "Deadnaming Detection", description: "Tests for deadnaming behavior" },
      { id: "lmrc.Profanity", name: "Profanity Detection", description: "Tests for profanity handling" },
      { id: "lmrc.QuackMedicine", name: "Quack Medicine", description: "Tests for medical misinformation" },
      { id: "lmrc.SexualContent", name: "Sexual Content", description: "Tests for inappropriate sexual content" },
      { id: "lmrc.Sexualisation", name: "Sexualisation", description: "Tests for sexualisation content" },
      { id: "lmrc.SlurUsage", name: "Slur Usage", description: "Tests for slur generation" },
      { id: "realtoxicityprompts.RTPBlank", name: "Real Toxicity Prompts", description: "Tests with real toxicity prompts" },
      { id: "continuation.ContinueSlursReclaimedSlurs", name: "Slur Continuation", description: "Tests slur continuation behavior" }
    ]
  },
  {
    category: "Jailbreaking & DAN Attacks",
    description: "Tests for jailbreak attempts and Do Anything Now (DAN) style attacks",
    probes: [
      { id: "dan.Ablation_Dan_11_0", name: "DAN 11.0 Ablation", description: "DAN 11.0 ablation test" },
      { id: "dan.AutoDANCached", name: "Auto DAN (Cached)", description: "Cached Auto DAN attacks" },
      { id: "dan.DanInTheWild", name: "DAN in the Wild", description: "Real-world DAN variants" },
      { id: "goodside.Tag", name: "Goodside Tag Attack", description: "Tag-based jailbreak attempts" },
      { id: "goodside.ThreatenJSON", name: "Threaten JSON", description: "JSON-based threat attacks" },
      { id: "goodside.WhoIsRiley", name: "Who Is Riley", description: "Identity confusion attacks" }
    ]
  },
  {
    category: "Prompt Injection",
    description: "Tests for prompt injection vulnerabilities",
    probes: [
      { id: "promptinject.HijackHateHumans", name: "Hate Humans Hijack", description: "Hijack prompts to generate hate" },
      { id: "promptinject.HijackKillHumans", name: "Kill Humans Hijack", description: "Hijack prompts for violence" },
      { id: "promptinject.HijackLongPrompt", name: "Long Prompt Hijack", description: "Long prompt injection attacks" },
      { id: "latentinjection.LatentInjectionFactSnippetEiffel", name: "Latent Injection (Eiffel)", description: "Latent injection in fact snippets" },
      { id: "latentinjection.LatentInjectionReport", name: "Latent Injection (Report)", description: "Latent injection in reports" },
      { id: "latentinjection.LatentInjectionResume", name: "Latent Injection (Resume)", description: "Latent injection in resumes" },
      { id: "latentinjection.LatentJailbreak", name: "Latent Jailbreak", description: "Latent jailbreak attempts" }
    ]
  },
  {
    category: "Encoding & Obfuscation",
    description: "Tests for encoded and obfuscated attack vectors",
    probes: [
      { id: "encoding.InjectAscii85", name: "ASCII85 Injection", description: "ASCII85 encoded attacks" },
      { id: "encoding.InjectBase16", name: "Base16 Injection", description: "Base16 encoded attacks" },
      { id: "encoding.InjectBase32", name: "Base32 Injection", description: "Base32 encoded attacks" },
      { id: "encoding.InjectBase64", name: "Base64 Injection", description: "Base64 encoded attacks" },
      { id: "encoding.InjectHex", name: "Hex Injection", description: "Hexadecimal encoded attacks" },
      { id: "encoding.InjectMorse", name: "Morse Code Injection", description: "Morse code encoded attacks" },
      { id: "encoding.InjectROT13", name: "ROT13 Injection", description: "ROT13 encoded attacks" },
      { id: "encoding.InjectZalgo", name: "Zalgo Text Injection", description: "Zalgo text attacks" },
      { id: "ansiescape.AnsiEscaped", name: "ANSI Escaped", description: "ANSI escape sequence attacks" },
      { id: "ansiescape.AnsiRaw", name: "ANSI Raw", description: "Raw ANSI sequence attacks" }
    ]
  },
  {
    category: "Data Leakage & Privacy",
    description: "Tests for data leakage and privacy violations",
    probes: [
      { id: "leakreplay.GuardianCloze", name: "Guardian Cloze Test", description: "Guardian dataset cloze tests" },
      { id: "leakreplay.GuardianComplete", name: "Guardian Complete", description: "Guardian dataset completion" },
      { id: "leakreplay.LiteratureCloze", name: "Literature Cloze", description: "Literature cloze tests" },
      { id: "leakreplay.LiteratureComplete", name: "Literature Complete", description: "Literature completion tests" },
      { id: "leakreplay.NYTCloze", name: "NYT Cloze Test", description: "New York Times cloze tests" },
      { id: "leakreplay.PotterCloze", name: "Potter Cloze Test", description: "Harry Potter cloze tests" },
      { id: "xss.ColabAIDataLeakage", name: "Colab AI Data Leakage", description: "Colab AI data leakage tests" },
      { id: "xss.MarkdownImageExfil", name: "Markdown Image Exfiltration", description: "Image-based data exfiltration" }
    ]
  },
  {
    category: "Malware & Exploitation",
    description: "Tests for malware generation and system exploitation",
    probes: [
      { id: "malwaregen.Evasion", name: "Malware Evasion", description: "Malware evasion techniques" },
      { id: "malwaregen.Payload", name: "Malware Payload", description: "Malware payload generation" },
      { id: "malwaregen.SubFunctions", name: "Malware Sub-functions", description: "Malware component generation" },
      { id: "malwaregen.TopLevel", name: "Top-level Malware", description: "Complete malware generation" },
      { id: "exploitation.JinjaTemplatePythonInjection", name: "Jinja Template Injection", description: "Python template injection" },
      { id: "exploitation.SQLInjectionEcho", name: "SQL Injection Echo", description: "SQL injection echo tests" },
      { id: "grandma.Substances", name: "Grandma Substances", description: "Substance-related exploits" },
      { id: "grandma.Win10", name: "Windows 10 Exploits", description: "Windows 10 system exploits" },
      { id: "grandma.Win11", name: "Windows 11 Exploits", description: "Windows 11 system exploits" }
    ]
  },
  {
    category: "Package & Code Security",
    description: "Tests for package hallucination and code security issues",
    probes: [
      { id: "packagehallucination.JavaScript", name: "JavaScript Package Hallucination", description: "Fake JavaScript packages" },
      { id: "packagehallucination.Python", name: "Python Package Hallucination", description: "Fake Python packages" },
      { id: "packagehallucination.Ruby", name: "Ruby Package Hallucination", description: "Fake Ruby packages" },
      { id: "packagehallucination.Rust", name: "Rust Package Hallucination", description: "Fake Rust packages" },
      { id: "atkgen.Tox", name: "Attack Generation (Tox)", description: "Toxic attack generation" }
    ]
  },
  {
    category: "Misinformation & Deception",
    description: "Tests for misinformation and deceptive content",
    probes: [
      { id: "misleading.FalseAssertion", name: "False Assertions", description: "False assertion generation" },
      { id: "donotanswer.MisinformationHarms", name: "Misinformation Harms", description: "Misinformation harm tests" },
      { id: "phrasing.FutureTense", name: "Future Tense Manipulation", description: "Future tense phrasing attacks" },
      { id: "phrasing.PastTense", name: "Past Tense Manipulation", description: "Past tense phrasing attacks" },
      { id: "divergence.Repeat", name: "Repetition Divergence", description: "Repetition-based attacks" }
    ]
  },
  {
    category: "Specialized Attacks",
    description: "Specialized and advanced attack vectors",
    probes: [
      { id: "snowball.GraphConnectivity", name: "Graph Connectivity", description: "Graph-based reasoning attacks" },
      { id: "suffix.GCGCached", name: "GCG Suffix (Cached)", description: "Cached GCG suffix attacks" },
      { id: "tap.TAPCached", name: "TAP Attack (Cached)", description: "Cached TAP attacks" },
      { id: "topic.WordnetControversial", name: "Controversial Topics", description: "Controversial topic generation" },
      { id: "grandma.Slurs", name: "Grandma Slurs", description: "Slur generation via roleplay" }
    ]
  }
];

export default function NewTestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedConfig = searchParams.get("config");
  const preselectedPolicy = searchParams.get("policy");
  
  const [loading, setLoading] = useState(false);
  const [configs, setConfigs] = useState<RestConfig[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [detectors, setDetectors] = useState<Detector[]>([]);
  const [builtinDetectors, setBuiltinDetectors] = useState<Detector[]>([]);
  const [formData, setFormData] = useState<TestForm>({
    model_type: "rest",
    probes: [],
    detector_ids: [],
    use_builtin_detectors: true,
    generations: 10,
    eval_threshold: 0.5
  });

  useEffect(() => {
    fetchProjects();
    fetchPolicies();
    fetchDetectors();
  }, []);

  useEffect(() => {
    if (preselectedConfig) {
      setFormData(prev => ({
        ...prev,
        rest_config_id: preselectedConfig
      }));
    }
  }, [preselectedConfig]);

  useEffect(() => {
    if (preselectedPolicy) {
      setFormData(prev => ({
        ...prev,
        policy_id: preselectedPolicy
      }));
    }
  }, [preselectedPolicy]);

  const fetchProjects = async () => {
    try {
      const { data } = await api.get(apiConfig.endpoints.restConfigs);
      setConfigs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    }
  };

  const fetchPolicies = async () => {
    try {
      const { data } = await api.get(apiConfig.endpoints.policies);
      if (Array.isArray(data)) {
        setPolicies(data);
      } else if (data && Array.isArray(data.policies)) {
        setPolicies(data.policies);
      } else {
        console.warn("Unexpected policies response format:", data);
        setPolicies([]);
      }
    } catch (error) {
      console.error("Failed to fetch policies:", error);
      setPolicies([]);
    }
  };

  const fetchDetectors = async () => {
    try {
      const [{ data: customData }, { data: builtinData }] = await Promise.all([
        api.get(apiConfig.endpoints.detectors),
        api.get(apiConfig.endpoints.detectorsBuiltin)
      ]);
      setDetectors(Array.isArray(customData) ? customData : []);
      setBuiltinDetectors(Array.isArray(builtinData) ? builtinData : []);
    } catch (error) {
      console.error("Failed to fetch detectors:", error);
    }
  };

  const handleInputChange = <K extends keyof TestForm>(field: K, value: TestForm[K]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDetectorToggle = (detectorId: string, checked: boolean) => {
    setFormData(prev => {
      const newDetectorIds = checked 
        ? [...prev.detector_ids, detectorId]
        : prev.detector_ids.filter(id => id !== detectorId);
      
      return {
        ...prev,
        detector_ids: newDetectorIds
      };
    });
  };

  const getAllProbeIds = () => {
    return availableProbes
      .filter(category => category.category !== "Full Scan")
      .flatMap(category => category.probes.map(probe => probe.id));
  };

  const handleProbeToggle = (probeId: string, checked: boolean) => {
    // Prevent manual probe selection when policy is selected
    if (formData.policy_id) {
      return;
    }

    if (probeId === "full_scan") {
      // Handle full scan selection
      setFormData(prev => ({
        ...prev,
        probes: checked ? getAllProbeIds() : []
      }));
    } else {
      // Handle individual probe selection
      setFormData(prev => {
        const newProbes = checked 
          ? [...prev.probes.filter(p => p !== "full_scan"), probeId]
          : prev.probes.filter(p => p !== probeId && p !== "full_scan");
        
        return {
          ...prev,
          probes: newProbes
        };
      });
    }
  };

  const isFullScanSelected = () => {
    const allProbeIds = getAllProbeIds();
    return allProbeIds.length > 0 && allProbeIds.every(id => formData.probes.includes(id));
  };

  const getRequiredApiKey = (): string | undefined => {
    switch (formData.model_type) {
      case "rest": return formData.rest_api_key;
      case "openai": return formData.openai_api_key;
      case "huggingface": return "not_required"; // Basic huggingface doesn't need token
      case "huggingface.InferenceAPI":
      case "huggingface.InferenceEndpoint": return formData.hf_inference_token;
      case "replicate": return formData.replicate_api_token;
      case "cohere": return formData.cohere_api_key;
      case "groq": return formData.groq_api_key;
      case "nim": return formData.nim_api_key;
      case "ggml": return "not_required"; // GGML doesn't need API key
      default: return undefined;
    }
  };

  const validateForm = (): boolean => {
    if (formData.model_type === "rest" && !formData.rest_config_id) {
      toast.error("Please select a REST project");
      return false;
    }
    
    if (formData.model_type !== "rest" && !formData.model_name) {
      toast.error("Please specify a model name");
      return false;
    }
    
    if (!formData.policy_id) {
      toast.error("Please select a security policy");
      return false;
    }
    
    const apiKey = getRequiredApiKey();
    if (apiKey !== "not_required" && (!apiKey || !apiKey.trim())) {
      toast.error("API key is required for this model type");
      return false;
    }
    
    if (formData.model_type === "ggml" && !formData.ggml_main_path) {
      toast.error("GGML main path is required");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Build the request payload based on model type
      const payload: Record<string, unknown> = {
        model_type: formData.model_type,
        generations: formData.generations,
      };

      // Add policy_id (required)
      payload.policy_id = formData.policy_id;

      // Add detector configuration
      if (formData.detector_ids.length > 0) {
        payload.detector_ids = formData.detector_ids;
      }
      payload.use_builtin_detectors = formData.use_builtin_detectors;

      // Add eval_threshold only if it's provided
      if (formData.eval_threshold !== undefined) {
        payload.eval_threshold = formData.eval_threshold;
      }

      // Add model-specific fields
      switch (formData.model_type) {
        case "rest":
          payload.rest_config_id = formData.rest_config_id;
          payload.rest_api_key = formData.rest_api_key;
          break;
        case "openai":
          payload.model_name = formData.model_name;
          payload.openai_api_key = formData.openai_api_key;
          break;
        case "huggingface":
          payload.model_name = formData.model_name;
          payload.hf_inference_token = "default_token_123"; // Default random string
          break;
        case "huggingface.InferenceAPI":
        case "huggingface.InferenceEndpoint":
          payload.model_name = formData.model_name;
          payload.hf_inference_token = formData.hf_inference_token;
          break;
        case "replicate":
          payload.model_name = formData.model_name;
          payload.replicate_api_token = formData.replicate_api_token;
          break;
        case "cohere":
          payload.model_name = formData.model_name;
          payload.cohere_api_key = formData.cohere_api_key;
          break;
        case "groq":
          payload.model_name = formData.model_name;
          payload.groq_api_key = formData.groq_api_key;
          break;
        case "nim":
          payload.model_name = formData.model_name;
          payload.nim_api_key = formData.nim_api_key;
          break;
        case "ggml":
          payload.model_name = formData.model_name;
          payload.ggml_main_path = formData.ggml_main_path;
          break;
      }

      const { data } = await api.post(apiConfig.endpoints.runGarak, payload);
      toast.success("Security test started successfully!");
      router.push(`/tests/${data.job_id}`);
    } catch (error) {
      console.error("Failed to start test:", error);
      toast.error("Failed to start security test");
    } finally {
      setLoading(false);
    }
  };

  const selectedConfig = configs.find(c => c.config_id === formData.rest_config_id);

  return (
    <MainLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">New Security Test</h1>
            <p className="text-muted-foreground">
              Configure and run a comprehensive security test on your AI model
            </p>
          </div>
          <Link href="/tests">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tests
            </Button>
          </Link>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Model Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Model Configuration</CardTitle>
              <CardDescription>
                Choose the type of model and configuration to test
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="model_type">Model Type</Label>
                <Select
                  value={formData.model_type}
                  onValueChange={(value: ModelType) => handleInputChange("model_type", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rest">REST API Endpoint</SelectItem>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="huggingface">Hugging Face</SelectItem>
                    <SelectItem value="huggingface.InferenceAPI">Hugging Face Inference API</SelectItem>
                    <SelectItem value="huggingface.InferenceEndpoint">Hugging Face Inference Endpoint</SelectItem>
                    <SelectItem value="replicate">Replicate</SelectItem>
                    <SelectItem value="cohere">Cohere</SelectItem>
                    <SelectItem value="groq">Groq</SelectItem>
                    <SelectItem value="nim">NIM</SelectItem>
                    <SelectItem value="ggml">GGML</SelectItem>
                  </SelectContent>
                </Select>
              </div>

{/* Model-specific configuration */}
              {formData.model_type === "rest" && (
                <>
                  <div>
                    <Label htmlFor="rest_config_id">REST Project *</Label>
                    <Select
                      value={formData.rest_config_id || ""}
                      onValueChange={(value) => handleInputChange("rest_config_id", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a project" />
                      </SelectTrigger>
                      <SelectContent>
                        {configs.map((config) => (
                          <SelectItem key={config.config_id} value={config.config_id}>
                            {config.config_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {configs.length === 0 && (
                      <p className="text-sm text-gray-600 mt-1">
                        No projects found. <Link href="/projects/new" className="text-blue-600 hover:underline">Create one first</Link>.
                      </p>
                    )}
                    {selectedConfig && (
                      <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          <strong>Selected:</strong> {selectedConfig.config_name}
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-300">
                          {selectedConfig.rest_generator.method.toUpperCase()} {selectedConfig.rest_generator.uri}
                        </p>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="rest_api_key">REST API Key *</Label>
                    <Input
                      id="rest_api_key"
                      type="password"
                      value={formData.rest_api_key || ""}
                      onChange={(e) => handleInputChange("rest_api_key", e.target.value)}
                      placeholder="Your REST API key"
                    />
                  </div>
                </>
              )}

              {formData.model_type === "openai" && (
                <>
                  <div>
                    <Label htmlFor="model_name">OpenAI Model Name *</Label>
                    <Input
                      id="model_name"
                      value={formData.model_name || ""}
                      onChange={(e) => handleInputChange("model_name", e.target.value)}
                      placeholder="gpt-3.5-turbo-0125"
                    />
                  </div>
                  <div>
                    <Label htmlFor="openai_api_key">OpenAI API Key *</Label>
                    <Input
                      id="openai_api_key"
                      type="password"
                      value={formData.openai_api_key || ""}
                      onChange={(e) => handleInputChange("openai_api_key", e.target.value)}
                      placeholder="sk-your-openai-api-key-here"
                    />
                  </div>
                </>
              )}

              {formData.model_type === "huggingface" && (
                <>
                  <div>
                    <Label htmlFor="model_name">Hugging Face Model Name *</Label>
                    <Input
                      id="model_name"
                      value={formData.model_name || ""}
                      onChange={(e) => handleInputChange("model_name", e.target.value)}
                      placeholder="microsoft/DialoGPT-medium"
                    />
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-sm text-green-800 dark:text-green-200">
                      <strong>Basic Hugging Face:</strong> No API token required. A default token will be used automatically.
                    </p>
                  </div>
                </>
              )}

              {(formData.model_type === "huggingface.InferenceAPI" || formData.model_type === "huggingface.InferenceEndpoint") && (
                <>
                  <div>
                    <Label htmlFor="model_name">
                      {formData.model_type === "huggingface.InferenceAPI" ? "Model Name *" : "Endpoint URL *"}
                    </Label>
                    <Input
                      id="model_name"
                      value={formData.model_name || ""}
                      onChange={(e) => handleInputChange("model_name", e.target.value)}
                      placeholder={formData.model_type === "huggingface.InferenceAPI" 
                        ? "mosaicml/mpt-7b-instruct" 
                        : "https://xxx.us-east-1.aws.endpoints.huggingface.cloud"}
                    />
                  </div>
                  <div>
                    <Label htmlFor="hf_inference_token">Hugging Face Token *</Label>
                    <Input
                      id="hf_inference_token"
                      type="password"
                      value={formData.hf_inference_token || ""}
                      onChange={(e) => handleInputChange("hf_inference_token", e.target.value)}
                      placeholder="hf_your-huggingface-token-here"
                    />
                  </div>
                </>
              )}

              {formData.model_type === "replicate" && (
                <>
                  <div>
                    <Label htmlFor="model_name">Replicate Model *</Label>
                    <Input
                      id="model_name"
                      value={formData.model_name || ""}
                      onChange={(e) => handleInputChange("model_name", e.target.value)}
                      placeholder="stability-ai/stablelm-tuned-alpha-7b:c49dae36"
                    />
                  </div>
                  <div>
                    <Label htmlFor="replicate_api_token">Replicate API Token *</Label>
                    <Input
                      id="replicate_api_token"
                      type="password"
                      value={formData.replicate_api_token || ""}
                      onChange={(e) => handleInputChange("replicate_api_token", e.target.value)}
                      placeholder="r8-your-replicate-token-here"
                    />
                  </div>
                </>
              )}

              {formData.model_type === "cohere" && (
                <>
                  <div>
                    <Label htmlFor="model_name">Cohere Model *</Label>
                    <Input
                      id="model_name"
                      value={formData.model_name || ""}
                      onChange={(e) => handleInputChange("model_name", e.target.value)}
                      placeholder="command"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cohere_api_key">Cohere API Key *</Label>
                    <Input
                      id="cohere_api_key"
                      type="password"
                      value={formData.cohere_api_key || ""}
                      onChange={(e) => handleInputChange("cohere_api_key", e.target.value)}
                      placeholder="your-cohere-api-key-here"
                    />
                  </div>
                </>
              )}

              {formData.model_type === "groq" && (
                <>
                  <div>
                    <Label htmlFor="model_name">Groq Model *</Label>
                    <Input
                      id="model_name"
                      value={formData.model_name || ""}
                      onChange={(e) => handleInputChange("model_name", e.target.value)}
                      placeholder="llama3-8b-8192"
                    />
                  </div>
                  <div>
                    <Label htmlFor="groq_api_key">Groq API Key *</Label>
                    <Input
                      id="groq_api_key"
                      type="password"
                      value={formData.groq_api_key || ""}
                      onChange={(e) => handleInputChange("groq_api_key", e.target.value)}
                      placeholder="gsk_your-groq-api-key-here"
                    />
                  </div>
                </>
              )}

              {formData.model_type === "nim" && (
                <>
                  <div>
                    <Label htmlFor="model_name">NIM Model *</Label>
                    <Input
                      id="model_name"
                      value={formData.model_name || ""}
                      onChange={(e) => handleInputChange("model_name", e.target.value)}
                      placeholder="meta/llama-3.1-8b-instruct"
                    />
                  </div>
                  <div>
                    <Label htmlFor="nim_api_key">NIM API Key *</Label>
                    <Input
                      id="nim_api_key"
                      type="password"
                      value={formData.nim_api_key || ""}
                      onChange={(e) => handleInputChange("nim_api_key", e.target.value)}
                      placeholder="your-nim-api-key-here"
                    />
                  </div>
                </>
              )}

              {formData.model_type === "ggml" && (
                <>
                  <div>
                    <Label htmlFor="model_name">GGML Model Path *</Label>
                    <Input
                      id="model_name"
                      value={formData.model_name || ""}
                      onChange={(e) => handleInputChange("model_name", e.target.value)}
                      placeholder="/path/to/your/ggml-model-q4_0.bin"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ggml_main_path">GGML Main Path *</Label>
                    <Input
                      id="ggml_main_path"
                      value={formData.ggml_main_path || ""}
                      onChange={(e) => handleInputChange("ggml_main_path", e.target.value)}
                      placeholder="/path/to/llama.cpp/main"
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      Path to the llama.cpp main executable
                    </p>
                  </div>
                </>
              )}

            </CardContent>
          </Card>

          {/* Security Policy Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Security Policy Selection</CardTitle>
              <CardDescription>
                Select a security policy that defines which categories of tests to run
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="policy_id">Security Policy *</Label>
                <Select
                  value={formData.policy_id || ""}
                  onValueChange={(value) => handleInputChange("policy_id", value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a security policy" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(policies) && policies.map((policy) => (
                      <SelectItem key={policy.policy_id} value={policy.policy_id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{policy.policy_name}</span>
                          <div className="flex items-center space-x-2 ml-2">
                            <span className="text-xs text-gray-500">
                              {policy.categories?.length || 0} categories
                            </span>
                            {policy.is_default && (
                              <span className="text-xs bg-yellow-100 text-yellow-800 px-1 rounded">Default</span>
                            )}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {policies.length === 0 && (
                  <p className="text-sm text-gray-600 mt-1">
                    No policies found. <Link href="/policies/new" className="text-blue-600 hover:underline">Create one first</Link>.
                  </p>
                )}
                {formData.policy_id && (
                  <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Policy Selected:</strong> {policies.find(p => p.policy_id === formData.policy_id)?.policy_name}
                    </p>
                    <div className="mt-2">
                      <p className="text-xs text-blue-600 dark:text-blue-300 mb-1">Categories included:</p>
                      <div className="flex flex-wrap gap-1">
                        {policies.find(p => p.policy_id === formData.policy_id)?.categories?.map(category => (
                          <span key={category} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Test Parameters */}
          <Card>
            <CardHeader>
              <CardTitle>Test Parameters</CardTitle>
              <CardDescription>
                Configure test execution parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="generations">Number of Generations</Label>
                  <Input
                    id="generations"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.generations}
                    onChange={(e) => handleInputChange("generations", parseInt(e.target.value))}
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    How many test prompts to generate per probe
                  </p>
                </div>
                <div>
                  <Label htmlFor="eval_threshold">Evaluation Threshold</Label>
                  <Input
                    id="eval_threshold"
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={formData.eval_threshold}
                    onChange={(e) => handleInputChange("eval_threshold", parseFloat(e.target.value))}
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    Threshold for determining test failures (0.0 - 1.0)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Test Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>Model Type:</strong> {formData.model_type}</p>
                <p><strong>Model:</strong> {
                  formData.model_type === "rest" 
                    ? selectedConfig?.config_name || "Not selected"
                    : formData.model_name || "Not specified"
                }</p>
                {formData.policy_id ? (
                  <>
                    <p><strong>Security Policy:</strong> {policies.find(p => p.policy_id === formData.policy_id)?.policy_name || "Unknown"}</p>
                    <p><strong>Categories:</strong> {policies.find(p => p.policy_id === formData.policy_id)?.categories?.length || 0} selected</p>
                    <div className="mt-1">
                      <div className="flex flex-wrap gap-1">
                        {policies.find(p => p.policy_id === formData.policy_id)?.categories?.map(category => (
                          <span key={category} className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <p><strong>Security Policy:</strong> <span className="text-red-600">Please select a policy above</span></p>
                )}
                <p><strong>Generations:</strong> {formData.generations} per probe</p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex space-x-4">
            <Button type="submit" disabled={loading} className="flex-1">
              <Play className="h-4 w-4 mr-2" />
              {loading ? "Starting Test..." : "Start Security Test"}
            </Button>
            <Link href="/projects">
              <Button type="button" variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Manage Projects
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
