"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useDetectors } from "@/hooks/use-detectors";
import { useCreatePolicy, useUpdatePolicy } from "@/hooks/use-policies";
import { PolicyFormProps } from "@/types/policies.type";

interface Probe {
  id: string;
  name: string;
  description: string;
}

interface Category {
  id: string;
  category_id: string;
  category: string;
  description: string;
  probes: Probe[];
  created_at: string;
  updated_at: string;
}

// Static categories data
const staticCategories: Category[] = [
  {
    "id": "content_safety_toxicity",
    "category_id": "content_safety_toxicity",
    "category": "Content Safety & Toxicity",
    "description": "Tests for harmful, toxic, or inappropriate content generation",
    "probes": [
      {
        "id": "lmrc.Bullying",
        "name": "Bullying Detection",
        "description": "Tests for bullying content"
      },
      {
        "id": "lmrc.Deadnaming",
        "name": "Deadnaming Detection",
        "description": "Tests for deadnaming behavior"
      },
      {
        "id": "lmrc.Profanity",
        "name": "Profanity Detection",
        "description": "Tests for profanity handling"
      },
      {
        "id": "lmrc.QuackMedicine",
        "name": "Quack Medicine",
        "description": "Tests for medical misinformation"
      },
      {
        "id": "lmrc.SexualContent",
        "name": "Sexual Content",
        "description": "Tests for inappropriate sexual content"
      },
      {
        "id": "lmrc.Sexualisation",
        "name": "Sexualisation",
        "description": "Tests for sexualisation content"
      },
      {
        "id": "lmrc.SlurUsage",
        "name": "Slur Usage",
        "description": "Tests for slur generation"
      },
      {
        "id": "realtoxicityprompts.RTPBlank",
        "name": "Real Toxicity Prompts",
        "description": "Tests with real toxicity prompts"
      },
      {
        "id": "continuation.ContinueSlursReclaimedSlurs",
        "name": "Slur Continuation",
        "description": "Tests slur continuation behavior"
      }
    ],
    "created_at": "2024-01-01 00:00:00",
    "updated_at": "2024-01-01 00:00:00"
  },
  {
    "id": "data_leakage_privacy",
    "category_id": "data_leakage_privacy",
    "category": "Data Leakage & Privacy",
    "description": "Tests for data leakage and privacy violations",
    "probes": [
      {
        "id": "leakreplay.GuardianCloze",
        "name": "Guardian Cloze Test",
        "description": "Guardian dataset cloze tests"
      },
      {
        "id": "leakreplay.GuardianComplete",
        "name": "Guardian Complete",
        "description": "Guardian dataset completion"
      },
      {
        "id": "leakreplay.LiteratureCloze",
        "name": "Literature Cloze",
        "description": "Literature cloze tests"
      },
      {
        "id": "leakreplay.LiteratureComplete",
        "name": "Literature Complete",
        "description": "Literature completion tests"
      },
      {
        "id": "leakreplay.NYTCloze",
        "name": "NYT Cloze Test",
        "description": "New York Times cloze tests"
      },
      {
        "id": "leakreplay.PotterCloze",
        "name": "Potter Cloze Test",
        "description": "Harry Potter cloze tests"
      },
      {
        "id": "xss.ColabAIDataLeakage",
        "name": "Colab AI Data Leakage",
        "description": "Colab AI data leakage tests"
      },
      {
        "id": "xss.MarkdownImageExfil",
        "name": "Markdown Image Exfiltration",
        "description": "Image-based data exfiltration"
      }
    ],
    "created_at": "2024-01-01 00:00:00",
    "updated_at": "2024-01-01 00:00:00"
  },
  {
    "id": "encoding_obfuscation",
    "category_id": "encoding_obfuscation",
    "category": "Encoding & Obfuscation",
    "description": "Tests for encoded and obfuscated attack vectors",
    "probes": [
      {
        "id": "encoding.InjectAscii85",
        "name": "ASCII85 Injection",
        "description": "ASCII85 encoded attacks"
      },
      {
        "id": "encoding.InjectBase16",
        "name": "Base16 Injection",
        "description": "Base16 encoded attacks"
      },
      {
        "id": "encoding.InjectBase32",
        "name": "Base32 Injection",
        "description": "Base32 encoded attacks"
      },
      {
        "id": "encoding.InjectBase64",
        "name": "Base64 Injection",
        "description": "Base64 encoded attacks"
      },
      {
        "id": "encoding.InjectHex",
        "name": "Hex Injection",
        "description": "Hexadecimal encoded attacks"
      },
      {
        "id": "encoding.InjectMorse",
        "name": "Morse Code Injection",
        "description": "Morse code encoded attacks"
      },
      {
        "id": "encoding.InjectROT13",
        "name": "ROT13 Injection",
        "description": "ROT13 encoded attacks"
      },
      {
        "id": "encoding.InjectZalgo",
        "name": "Zalgo Text Injection",
        "description": "Zalgo text attacks"
      },
      {
        "id": "ansiescape.AnsiEscaped",
        "name": "ANSI Escaped",
        "description": "ANSI escape sequence attacks"
      },
      {
        "id": "ansiescape.AnsiRaw",
        "name": "ANSI Raw",
        "description": "Raw ANSI sequence attacks"
      }
    ],
    "created_at": "2024-01-01 00:00:00",
    "updated_at": "2024-01-01 00:00:00"
  },
  {
    "id": "full_scan",
    "category_id": "full_scan",
    "category": "Full Scan",
    "description": "Comprehensive security testing across all categories - WARNING: This will take significant time to complete and may require substantial computational resources",
    "probes": [
      {
        "id": "lmrc.Bullying",
        "name": "Bullying Detection",
        "description": "Tests for bullying content"
      },
      {
        "id": "lmrc.Deadnaming",
        "name": "Deadnaming Detection",
        "description": "Tests for deadnaming behavior"
      },
      {
        "id": "lmrc.Profanity",
        "name": "Profanity Detection",
        "description": "Tests for profanity handling"
      },
      {
        "id": "lmrc.QuackMedicine",
        "name": "Quack Medicine",
        "description": "Tests for medical misinformation"
      },
      {
        "id": "lmrc.SexualContent",
        "name": "Sexual Content",
        "description": "Tests for inappropriate sexual content"
      },
      {
        "id": "lmrc.Sexualisation",
        "name": "Sexualisation",
        "description": "Tests for sexualisation content"
      },
      {
        "id": "lmrc.SlurUsage",
        "name": "Slur Usage",
        "description": "Tests for slur generation"
      },
      {
        "id": "realtoxicityprompts.RTPBlank",
        "name": "Real Toxicity Prompts",
        "description": "Tests with real toxicity prompts"
      },
      {
        "id": "continuation.ContinueSlursReclaimedSlurs",
        "name": "Slur Continuation",
        "description": "Tests slur continuation behavior"
      },
      {
        "id": "dan.Ablation_Dan_11_0",
        "name": "DAN 11.0 Ablation",
        "description": "DAN 11.0 ablation test"
      },
      {
        "id": "dan.AutoDANCached",
        "name": "Auto DAN (Cached)",
        "description": "Cached Auto DAN attacks"
      },
      {
        "id": "dan.DanInTheWild",
        "name": "DAN in the Wild",
        "description": "Real-world DAN variants"
      },
      {
        "id": "goodside.Tag",
        "name": "Goodside Tag Attack",
        "description": "Tag-based jailbreak attempts"
      },
      {
        "id": "goodside.ThreatenJSON",
        "name": "Threaten JSON",
        "description": "JSON-based threat attacks"
      },
      {
        "id": "goodside.WhoIsRiley",
        "name": "Who Is Riley",
        "description": "Identity confusion attacks"
      },
      {
        "id": "promptinject.HijackHateHumans",
        "name": "Hate Humans Hijack",
        "description": "Hijack prompts to generate hate"
      },
      {
        "id": "promptinject.HijackKillHumans",
        "name": "Kill Humans Hijack",
        "description": "Hijack prompts for violence"
      },
      {
        "id": "promptinject.HijackLongPrompt",
        "name": "Long Prompt Hijack",
        "description": "Long prompt injection attacks"
      },
      {
        "id": "latentinjection.LatentInjectionFactSnippetEiffel",
        "name": "Latent Injection (Eiffel)",
        "description": "Latent injection in fact snippets"
      },
      {
        "id": "latentinjection.LatentInjectionReport",
        "name": "Latent Injection (Report)",
        "description": "Latent injection in reports"
      },
      {
        "id": "latentinjection.LatentInjectionResume",
        "name": "Latent Injection (Resume)",
        "description": "Latent injection in resumes"
      },
      {
        "id": "latentinjection.LatentJailbreak",
        "name": "Latent Jailbreak",
        "description": "Latent jailbreak attempts"
      },
      {
        "id": "encoding.InjectAscii85",
        "name": "ASCII85 Injection",
        "description": "ASCII85 encoded attacks"
      },
      {
        "id": "encoding.InjectBase16",
        "name": "Base16 Injection",
        "description": "Base16 encoded attacks"
      },
      {
        "id": "encoding.InjectBase32",
        "name": "Base32 Injection",
        "description": "Base32 encoded attacks"
      },
      {
        "id": "encoding.InjectBase64",
        "name": "Base64 Injection",
        "description": "Base64 encoded attacks"
      },
      {
        "id": "encoding.InjectHex",
        "name": "Hex Injection",
        "description": "Hexadecimal encoded attacks"
      },
      {
        "id": "encoding.InjectMorse",
        "name": "Morse Code Injection",
        "description": "Morse code encoded attacks"
      },
      {
        "id": "encoding.InjectROT13",
        "name": "ROT13 Injection",
        "description": "ROT13 encoded attacks"
      },
      {
        "id": "encoding.InjectZalgo",
        "name": "Zalgo Text Injection",
        "description": "Zalgo text attacks"
      },
      {
        "id": "ansiescape.AnsiEscaped",
        "name": "ANSI Escaped",
        "description": "ANSI escape sequence attacks"
      },
      {
        "id": "ansiescape.AnsiRaw",
        "name": "ANSI Raw",
        "description": "Raw ANSI sequence attacks"
      },
      {
        "id": "leakreplay.GuardianCloze",
        "name": "Guardian Cloze Test",
        "description": "Guardian dataset cloze tests"
      },
      {
        "id": "leakreplay.GuardianComplete",
        "name": "Guardian Complete",
        "description": "Guardian dataset completion"
      },
      {
        "id": "leakreplay.LiteratureCloze",
        "name": "Literature Cloze",
        "description": "Literature cloze tests"
      },
      {
        "id": "leakreplay.LiteratureComplete",
        "name": "Literature Complete",
        "description": "Literature completion tests"
      },
      {
        "id": "leakreplay.NYTCloze",
        "name": "NYT Cloze Test",
        "description": "New York Times cloze tests"
      },
      {
        "id": "leakreplay.PotterCloze",
        "name": "Potter Cloze Test",
        "description": "Harry Potter cloze tests"
      },
      {
        "id": "xss.ColabAIDataLeakage",
        "name": "Colab AI Data Leakage",
        "description": "Colab AI data leakage tests"
      },
      {
        "id": "xss.MarkdownImageExfil",
        "name": "Markdown Image Exfiltration",
        "description": "Image-based data exfiltration"
      },
      {
        "id": "malwaregen.Evasion",
        "name": "Malware Evasion",
        "description": "Malware evasion techniques"
      },
      {
        "id": "malwaregen.Payload",
        "name": "Malware Payload",
        "description": "Malware payload generation"
      },
      {
        "id": "malwaregen.SubFunctions",
        "name": "Malware Sub-functions",
        "description": "Malware component generation"
      },
      {
        "id": "malwaregen.TopLevel",
        "name": "Top-level Malware",
        "description": "Complete malware generation"
      },
      {
        "id": "exploitation.JinjaTemplatePythonInjection",
        "name": "Jinja Template Injection",
        "description": "Python template injection"
      },
      {
        "id": "exploitation.SQLInjectionEcho",
        "name": "SQL Injection Echo",
        "description": "SQL injection echo tests"
      },
      {
        "id": "grandma.Substances",
        "name": "Grandma Substances",
        "description": "Substance-related exploits"
      },
      {
        "id": "grandma.Win10",
        "name": "Windows 10 Exploits",
        "description": "Windows 10 system exploits"
      },
      {
        "id": "grandma.Win11",
        "name": "Windows 11 Exploits",
        "description": "Windows 11 system exploits"
      },
      {
        "id": "packagehallucination.JavaScript",
        "name": "JavaScript Package Hallucination",
        "description": "Fake JavaScript packages"
      },
      {
        "id": "packagehallucination.Python",
        "name": "Python Package Hallucination",
        "description": "Fake Python packages"
      },
      {
        "id": "packagehallucination.Ruby",
        "name": "Ruby Package Hallucination",
        "description": "Fake Ruby packages"
      },
      {
        "id": "packagehallucination.Rust",
        "name": "Rust Package Hallucination",
        "description": "Fake Rust packages"
      },
      {
        "id": "atkgen.Tox",
        "name": "Attack Generation (Tox)",
        "description": "Toxic attack generation"
      },
      {
        "id": "misleading.FalseAssertion",
        "name": "False Assertions",
        "description": "False assertion generation"
      },
      {
        "id": "donotanswer.MisinformationHarms",
        "name": "Misinformation Harms",
        "description": "Misinformation harm tests"
      },
      {
        "id": "phrasing.FutureTense",
        "name": "Future Tense Manipulation",
        "description": "Future tense phrasing attacks"
      },
      {
        "id": "phrasing.PastTense",
        "name": "Past Tense Manipulation",
        "description": "Past tense phrasing attacks"
      },
      {
        "id": "divergence.Repeat",
        "name": "Repetition Divergence",
        "description": "Repetition-based attacks"
      },
      {
        "id": "snowball.GraphConnectivity",
        "name": "Graph Connectivity",
        "description": "Graph-based reasoning attacks"
      },
      {
        "id": "suffix.GCGCached",
        "name": "GCG Suffix (Cached)",
        "description": "Cached GCG suffix attacks"
      },
      {
        "id": "tap.TAPCached",
        "name": "TAP Attack (Cached)",
        "description": "Cached TAP attacks"
      },
      {
        "id": "topic.WordnetControversial",
        "name": "Controversial Topics",
        "description": "Controversial topic generation"
      },
      {
        "id": "grandma.Slurs",
        "name": "Grandma Slurs",
        "description": "Slur generation via roleplay"
      }
    ],
    "created_at": "2024-01-01 00:00:00",
    "updated_at": "2024-01-01 00:00:00"
  },
  {
    "id": "jailbreaking_dan",
    "category_id": "jailbreaking_dan",
    "category": "Jailbreaking & DAN Attacks",
    "description": "Tests for jailbreak attempts and Do Anything Now (DAN) style attacks",
    "probes": [
      {
        "id": "dan.Ablation_Dan_11_0",
        "name": "DAN 11.0 Ablation",
        "description": "DAN 11.0 ablation test"
      },
      {
        "id": "dan.AutoDANCached",
        "name": "Auto DAN (Cached)",
        "description": "Cached Auto DAN attacks"
      },
      {
        "id": "dan.DanInTheWild",
        "name": "DAN in the Wild",
        "description": "Real-world DAN variants"
      },
      {
        "id": "goodside.Tag",
        "name": "Goodside Tag Attack",
        "description": "Tag-based jailbreak attempts"
      },
      {
        "id": "goodside.ThreatenJSON",
        "name": "Threaten JSON",
        "description": "JSON-based threat attacks"
      },
      {
        "id": "goodside.WhoIsRiley",
        "name": "Who Is Riley",
        "description": "Identity confusion attacks"
      }
    ],
    "created_at": "2024-01-01 00:00:00",
    "updated_at": "2024-01-01 00:00:00"
  },
  {
    "id": "malware_exploitation",
    "category_id": "malware_exploitation",
    "category": "Malware & Exploitation",
    "description": "Tests for malware generation and system exploitation",
    "probes": [
      {
        "id": "malwaregen.Evasion",
        "name": "Malware Evasion",
        "description": "Malware evasion techniques"
      },
      {
        "id": "malwaregen.Payload",
        "name": "Malware Payload",
        "description": "Malware payload generation"
      },
      {
        "id": "malwaregen.SubFunctions",
        "name": "Malware Sub-functions",
        "description": "Malware component generation"
      },
      {
        "id": "malwaregen.TopLevel",
        "name": "Top-level Malware",
        "description": "Complete malware generation"
      },
      {
        "id": "exploitation.JinjaTemplatePythonInjection",
        "name": "Jinja Template Injection",
        "description": "Python template injection"
      },
      {
        "id": "exploitation.SQLInjectionEcho",
        "name": "SQL Injection Echo",
        "description": "SQL injection echo tests"
      },
      {
        "id": "grandma.Substances",
        "name": "Grandma Substances",
        "description": "Substance-related exploits"
      },
      {
        "id": "grandma.Win10",
        "name": "Windows 10 Exploits",
        "description": "Windows 10 system exploits"
      },
      {
        "id": "grandma.Win11",
        "name": "Windows 11 Exploits",
        "description": "Windows 11 system exploits"
      }
    ],
    "created_at": "2024-01-01 00:00:00",
    "updated_at": "2024-01-01 00:00:00"
  },
  {
    "id": "misinformation_deception",
    "category_id": "misinformation_deception",
    "category": "Misinformation & Deception",
    "description": "Tests for misinformation and deceptive content",
    "probes": [
      {
        "id": "misleading.FalseAssertion",
        "name": "False Assertions",
        "description": "False assertion generation"
      },
      {
        "id": "donotanswer.MisinformationHarms",
        "name": "Misinformation Harms",
        "description": "Misinformation harm tests"
      },
      {
        "id": "phrasing.FutureTense",
        "name": "Future Tense Manipulation",
        "description": "Future tense phrasing attacks"
      },
      {
        "id": "phrasing.PastTense",
        "name": "Past Tense Manipulation",
        "description": "Past tense phrasing attacks"
      },
      {
        "id": "divergence.Repeat",
        "name": "Repetition Divergence",
        "description": "Repetition-based attacks"
      }
    ],
    "created_at": "2024-01-01 00:00:00",
    "updated_at": "2024-01-01 00:00:00"
  },
  {
    "id": "package_code_security",
    "category_id": "package_code_security",
    "category": "Package & Code Security",
    "description": "Tests for package hallucination and code security issues",
    "probes": [
      {
        "id": "packagehallucination.JavaScript",
        "name": "JavaScript Package Hallucination",
        "description": "Fake JavaScript packages"
      },
      {
        "id": "packagehallucination.Python",
        "name": "Python Package Hallucination",
        "description": "Fake Python packages"
      },
      {
        "id": "packagehallucination.Ruby",
        "name": "Ruby Package Hallucination",
        "description": "Fake Ruby packages"
      },
      {
        "id": "packagehallucination.Rust",
        "name": "Rust Package Hallucination",
        "description": "Fake Rust packages"
      },
      {
        "id": "atkgen.Tox",
        "name": "Attack Generation (Tox)",
        "description": "Toxic attack generation"
      }
    ],
    "created_at": "2024-01-01 00:00:00",
    "updated_at": "2024-01-01 00:00:00"
  },
  {
    "id": "prompt_injection",
    "category_id": "prompt_injection",
    "category": "Prompt Injection",
    "description": "Tests for prompt injection vulnerabilities",
    "probes": [
      {
        "id": "promptinject.HijackHateHumans",
        "name": "Hate Humans Hijack",
        "description": "Hijack prompts to generate hate"
      },
      {
        "id": "promptinject.HijackKillHumans",
        "name": "Kill Humans Hijack",
        "description": "Hijack prompts for violence"
      },
      {
        "id": "promptinject.HijackLongPrompt",
        "name": "Long Prompt Hijack",
        "description": "Long prompt injection attacks"
      },
      {
        "id": "latentinjection.LatentInjectionFactSnippetEiffel",
        "name": "Latent Injection (Eiffel)",
        "description": "Latent injection in fact snippets"
      },
      {
        "id": "latentinjection.LatentInjectionReport",
        "name": "Latent Injection (Report)",
        "description": "Latent injection in reports"
      },
      {
        "id": "latentinjection.LatentInjectionResume",
        "name": "Latent Injection (Resume)",
        "description": "Latent injection in resumes"
      },
      {
        "id": "latentinjection.LatentJailbreak",
        "name": "Latent Jailbreak",
        "description": "Latent jailbreak attempts"
      }
    ],
    "created_at": "2024-01-01 00:00:00",
    "updated_at": "2024-01-01 00:00:00"
  },
  {
    "id": "specialized_attacks",
    "category_id": "specialized_attacks",
    "category": "Specialized Attacks",
    "description": "Specialized and advanced attack vectors",
    "probes": [
      {
        "id": "snowball.GraphConnectivity",
        "name": "Graph Connectivity",
        "description": "Graph-based reasoning attacks"
      },
      {
        "id": "suffix.GCGCached",
        "name": "GCG Suffix (Cached)",
        "description": "Cached GCG suffix attacks"
      },
      {
        "id": "tap.TAPCached",
        "name": "TAP Attack (Cached)",
        "description": "Cached TAP attacks"
      },
      {
        "id": "topic.WordnetControversial",
        "name": "Controversial Topics",
        "description": "Controversial topic generation"
      },
      {
        "id": "grandma.Slurs",
        "name": "Grandma Slurs",
        "description": "Slur generation via roleplay"
      }
    ],
    "created_at": "2024-01-01 00:00:00",
    "updated_at": "2024-01-01 00:00:00"
  }
];

const policyFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  defaultDetector: z.boolean().optional(),
  categoryIds: z.array(z.string()).nullable(),
  detectorIds: z.array(z.string()).nullable(),
});

type PolicyFormValues = z.infer<typeof policyFormSchema>;

export function PolicyForm({
  mode = "create",
  policyId,
  initialData,
  onSuccess,
}: PolicyFormProps) {
  const router = useRouter();
  const { data: detectors } = useDetectors();

  const { mutate: createMutation, isPending: isCreating } = useCreatePolicy();
  const { mutate: updateMutation, isPending: isUpdating } = useUpdatePolicy();

  const isEditMode = mode === "edit";
  const isSubmitting = isCreating || isUpdating;

  const form = useForm<PolicyFormValues>({
    resolver: zodResolver(policyFormSchema),
    defaultValues: {
      name: "",
      description: "",
      defaultDetector: false,
      categoryIds: null,
      detectorIds: null,
      ...initialData,
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = form;

  const selectedCategoryIds = watch("categoryIds") || [];
  const selectedDetectorIds = watch("detectorIds") || [];

  const onSubmit = (data: PolicyFormValues) => {
    const submitData = {
      ...data,
      defaultDetector: data.defaultDetector ?? false,
    };

    if (isEditMode && policyId) {
      updateMutation(
        { id: policyId, ...submitData },
        { onSuccess: () => {
          router.push(`/policies`);
          onSuccess?.();
        } }
      );
    } else {
      createMutation(submitData, { onSuccess: () => {
        router.push(`/policies`);
        onSuccess?.();
      } });
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    const current = selectedCategoryIds || [];
    const newIds = current.includes(categoryId)
      ? current.filter((id) => id !== categoryId)
      : [...current, categoryId];
    setValue("categoryIds", newIds.length > 0 ? newIds : null);
  };

  const handleDetectorToggle = (detectorId: string) => {
    const current = selectedDetectorIds || [];
    const newIds = current.includes(detectorId)
      ? current.filter((id) => id !== detectorId)
      : [...current, detectorId];
    setValue("detectorIds", newIds.length > 0 ? newIds : null);
  };

  return (
    <form
      onSubmit={handleSubmit((data) =>
        onSubmit(data as unknown as PolicyFormValues)
      )}
      className="space-y-8 bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-neutral-800 transition-colors"
    >
      <div className="space-y-2">
        <h2 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-100">
          {isEditMode ? "Edit Policy" : "Create New Policy"}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Define your policy details and assign related detectors and
          categories.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Policy Name
          </label>
          <Input
            id="name"
            placeholder="Enter policy name"
            {...register("name")}
            className="mt-1 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-neutral-700 focus-visible:ring-[var(--brand-primary)]"
          />
          {errors.name && (
            <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Description
          </label>
          <Textarea
            id="description"
            placeholder="Describe this policy..."
            {...register("description")}
            rows={4}
            className="mt-1 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-neutral-700 focus-visible:ring-[var(--brand-primary)]"
          />
          {errors.description && (
            <p className="text-xs text-red-500 mt-1">
              {errors.description.message}
            </p>
          )}
        </div>
      </div>

      {/* Categories Section */}
      <div className="space-y-4 border-t border-gray-100 dark:border-neutral-800 pt-6">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2">
          Categories
        </h3>
        <div className="grid grid-cols-1 gap-4">
          {staticCategories.map((category: Category) => (
            <div
              key={category.id}
              className="border rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 transition border-gray-200 dark:border-neutral-700"
            >
              {/* Category Header */}
              <div className="flex items-start gap-3 p-4 border-b border-gray-100 dark:border-neutral-800">
                <Checkbox
                  id={`category-${category.id}`}
                  checked={selectedCategoryIds.includes(category.id)}
                  onCheckedChange={() => handleCategoryToggle(category.id)}
                />
                <div className="flex-1">
                  <label
                    htmlFor={`category-${category.id}`}
                    className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-none cursor-pointer"
                  >
                    {category.category}
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {category.description}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {category.probes.length} probes available
                  </p>
                </div>
              </div>

              {/* Probes List */}
              <div className="p-4 pt-3">
                <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                  Available Probes
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {category.probes.map((probe) => (
                    <div
                      key={probe.id}
                      className="text-xs p-2 bg-gray-50 dark:bg-neutral-800 rounded border border-gray-200 dark:border-neutral-700"
                    >
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {probe.name}
                      </div>
                      <div className="text-gray-500 dark:text-gray-400 mt-0.5">
                        {probe.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detectors Section */}
      <div className="space-y-4 border-t border-gray-100 dark:border-neutral-800 pt-6">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2">
          Detectors
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {detectors?.docs?.map((detector) => (
            <div
              key={detector.id}
              className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 transition border-gray-200 dark:border-neutral-700"
            >
              <Checkbox
                id={`detector-${detector.id}`}
                checked={selectedDetectorIds.includes(detector.id)}
                onCheckedChange={() => handleDetectorToggle(detector.id)}
              />
              <div className="flex flex-col">
                <label
                  htmlFor={`detector-${detector.id}`}
                  className="text-sm font-medium text-gray-900 dark:text-gray-100"
                >
                  {detector.detectorName || "Unnamed Detector"}
                </label>
                {detector.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {detector.description}
                  </p>
                )}
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  Type: {detector.detectorType} • Confidence:{" "}
                  {detector.confidence ? `${(detector.confidence * 100).toFixed(0)}%` : "N/A"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-neutral-800">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="dark:border-neutral-700 dark:text-gray-200 dark:hover:bg-neutral-800"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          variant="default"
          // className="min-w-[130px] bg-[var(--brand-primary)] hover:bg-[var(--brand-bg-primary] text-white dark:text-gray-100"
        >
          {isSubmitting
            ? "Saving..."
            : isEditMode
            ? "Update Policy"
            : "Create Policy"}
        </Button>
      </div>
    </form>
  );
}
