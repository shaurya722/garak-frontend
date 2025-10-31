export interface Policy {
  id: string;
  name: string;
  description: string;
  defaultDetector: boolean;
  categoryIds: string[] | null;
  detectorIds: string[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface PolicyCreateData {
  name: string;
  description: string;
  defaultDetector: boolean;
  categoryIds: string[] | null;
  detectorIds: string[] | null;
}

export type PolicyUpdateData = Partial<PolicyCreateData>;

export interface PolicyFormData {
  name: string;
  description: string;
  defaultDetector: boolean;
  categoryIds: string[] | null;
  detectorIds: string[] | null;
}

export interface PolicyFormProps {
  mode?: 'create' | 'edit';
  policyId?: string;
  initialData?: Partial<PolicyFormData>;
  onSuccess?: () => void;
}