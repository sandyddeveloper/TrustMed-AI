import axios from "axios";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

export interface FeatureContribution {
  feature: string;
  value: number;
  importance: number;
  direction: "positive" | "negative";
  is_masked?: boolean;
}

export interface SecREMetrics {
  is_compliant: boolean;
  status: "COMPLIANT" | "DEGRADED" | "NON_COMPLIANT" | string;
  security_rate: number;
  explainability_rate: number;
  violations: string[];
  standard: string;
}

export interface MedicalInferenceResponse {
  patient_id: string;
  prediction: number;
  prediction_label: string;
  confidence: number;
  model_type: "random_forest" | "xgboost" | string;
  model_version: string;
  cross_val_auc: number;
  xai_method?: string;
  feature_attributions?: FeatureContribution[];
  secre_compliance: SecREMetrics;
  ipfs_cid?: string;
}

export interface MedicalInferenceRequest {
  patient_id: string;
  features: Record<string, number>;
  model_type?: "random_forest" | "xgboost";
  explain?: boolean;
  xai_method?: "shap" | "lime";
  mask_demographics?: boolean;
  pin_to_ipfs?: boolean;
}

export interface Web3StatusResponse {
  is_connected: boolean;
  network: string;
  chain_id: number;
  latest_block?: number;
  provider_uri: string;
}

export interface AnchorRecordRequest {
  record_id: string;
  record_hash: string;
  ipfs_cid?: string;
  metadata?: Record<string, unknown>;
}

export interface AnchorRecordResponse {
  status: string;
  record_id: string;
  record_hash: string;
  ipfs_cid?: string;
  tx_hash?: string;
  block_number?: number;
}

export interface PractitionerProfile {
  practitioner_id: string;
  name: string;
  email: string;
  specialty: string;
  institution: string;
  npi_number: string;
  license_number: string;
  wallet_address: string;
  role: string;
  total_signed_diagnoses: number;
  mean_security_rate: number;
  secre_certified: boolean;
}

export interface SystemSettings {
  default_model: string;
  default_xai_method: string;
  risk_threshold: number;
  auto_mask_demographics: boolean;
  strict_boundary_enforcement: boolean;
  ipfs_auto_pin: boolean;
  active_evm_network: string;
  ipfs_gateway_url: string;
  alert_email_notifications: boolean;
}

export interface AuditCertificateResponse {
  certificate_id: string;
  patient_id: string;
  practitioner_name: string;
  practitioner_license: string;
  risk_score: number;
  risk_label: string;
  model_version: string;
  security_rate: number;
  explainability_rate: number;
  record_hash: string;
  ipfs_cid?: string;
  evm_contract_address: string;
  blockchain_network: string;
  issued_at: string;
  standard: string;
}

export interface CohortPatientItem {
  patient_id: string;
  age: number;
  blood_pressure: number;
  glucose_level: number;
  bmi: number;
  cholesterol: number;
  heart_rate: number;
}

export interface BatchCohortRequest {
  cohort_name: string;
  patients: CohortPatientItem[];
  model_type?: string;
  pin_batch_to_ipfs?: boolean;
}

export interface BatchCohortResponse {
  cohort_name: string;
  total_patients: number;
  high_risk_count: number;
  low_risk_count: number;
  mean_risk_score: number;
  cohort_security_rate: number;
  cohort_explainability_rate: number;
  batch_record_hash: string;
  ipfs_cid?: string;
  patient_results: Array<{
    patient_id: string;
    prediction: number;
    prediction_label: string;
    confidence: number;
    security_rate: number;
    explainability_rate: number;
    top_risk_factor: string;
  }>;
}

// API functions
export async function fetchHealthCheck() {
  const { data } = await apiClient.get("/health");
  return data;
}

export async function fetchWeb3Status(): Promise<Web3StatusResponse> {
  const { data } = await apiClient.get("/web3/status");
  return data;
}

export async function predictClinicalRisk(
  payload: MedicalInferenceRequest
): Promise<MedicalInferenceResponse> {
  const { data } = await apiClient.post("/ai/predict", payload);
  return data;
}

export async function anchorRecordOnChain(
  payload: AnchorRecordRequest
): Promise<AnchorRecordResponse> {
  const { data } = await apiClient.post("/web3/anchor", payload);
  return data;
}

export async function fetchPractitionerProfile(): Promise<PractitionerProfile> {
  const { data } = await apiClient.get("/practitioner/profile");
  return data;
}

export async function updatePractitionerProfile(
  payload: Partial<PractitionerProfile>
): Promise<PractitionerProfile> {
  const { data } = await apiClient.put("/practitioner/profile", payload);
  return data;
}

export async function fetchAuditCertificate(
  patientId: string
): Promise<AuditCertificateResponse> {
  const { data } = await apiClient.get(`/practitioner/audit-certificate/${patientId}`);
  return data;
}

export async function fetchSystemSettings(): Promise<SystemSettings> {
  const { data } = await apiClient.get("/settings");
  return data;
}

export async function updateSystemSettings(
  payload: Partial<SystemSettings>
): Promise<SystemSettings> {
  const { data } = await apiClient.put("/settings", payload);
  return data;
}

export async function runBatchCohortAnalysis(
  payload: BatchCohortRequest
): Promise<BatchCohortResponse> {
  const { data } = await apiClient.post("/cohort/batch-predict", payload);
  return data;
}
