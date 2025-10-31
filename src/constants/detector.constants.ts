// Detector related constants

import { type DetectorType } from "@/types";

export const DETECTOR_TYPES: Record<DetectorType, string> = {
  REGEX: "Regex Pattern",
  PII: "Personal Information",
  HEURISTIC: "Heuristic Analysis",
  EMBEDDING: "Embedding Based",
  PACKAGE_REGISTRY: "Package Registry",
} as const;

export const DETECTOR_TYPE_COLORS: Record<string, string> = {
  REGEX: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  PII: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  HEURISTIC: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  EMBEDDING: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  PACKAGE_REGISTRY: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  default: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
} as const;

export const DETECTOR_CREATION_TYPES = {
  EXTERNAL: "External",
  BUILTIN: "BuiltIn",
} as const;

export const DEFAULT_CONFIDENCE_VALUE = 0.7;

export const CONFIDENCE_RANGE = {
  MIN: 0,
  MAX: 1,
  STEP: 0.1,
} as const;

export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 10,
  SIZE_OPTIONS: [5, 10, 20, 30, 40, 50],
} as const;
