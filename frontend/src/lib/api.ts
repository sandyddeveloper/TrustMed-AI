import axios from "axios";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
  timeout: 30000,
  withCredentials: true,
});

// Intercept requests to add Authorization and Accept-Language header
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("trustmed_jwt_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const lang = localStorage.getItem("trustmed_language") || "en";
    if (lang && config.headers) {
      config.headers["Accept-Language"] = lang;
    }
  }
  return config;
});

// Auto-refresh access token on 401 Unauthorized
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !originalRequest?.url?.includes("/auth/login") &&
      !originalRequest?.url?.includes("/auth/signup") &&
      !originalRequest?.url?.includes("/auth/refresh")
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (token && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshed = await refreshAccessToken();
        if (refreshed?.access_token) {
          processQueue(null, refreshed.access_token);
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${refreshed.access_token}`;
          }
          return apiClient(originalRequest);
        } else {
          processQueue(error, null);
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("trustmed:session-expired"));
          }
          return Promise.reject(error);
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("trustmed:session-expired"));
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

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

export interface DiseaseRiskAssessment {
  disease_name: string;
  risk_score: number;
  risk_percentage: string;
  risk_level: "HIGH_RISK" | "MODERATE_RISK" | "LOW_RISK" | string;
  clinical_stage: string;
  icd10_code?: string;
  confidence_interval?: string;
  severity_tier?: string;
  pathophysiological_mechanism?: string;
  primary_driver: string;
  confirmatory_test: string;
  intervention_guideline?: string;
}

export interface DerivedClinicalMetrics {
  homa_ir: number;
  homa_ir_status: string;
  quicki: number;
  estimated_hba1c?: number;
  mean_arterial_pressure: number;
  pulse_pressure: number;
  rate_pressure_product?: number;
  rate_pressure_status?: string;
  atherogenic_ratio: number;
  metabolic_inflammatory_score: number;
  bmr_estimate_kcal: number;
  visceral_adiposity_load?: string;
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
  deterministic_hash?: string;
  ipfs_cid?: string;
  ai_explanation?: string;
  multi_disease_risks?: DiseaseRiskAssessment[];
  derived_metrics?: DerivedClinicalMetrics;
}

export interface MedicalInferenceRequest {
  patient_id: string;
  features: Record<string, number>;
  model_type?: "random_forest" | "xgboost";
  explain?: boolean;
  xai_method?: "shap" | "lime";
  mask_demographics?: boolean;
  strict_compliance?: boolean;
  pin_to_ipfs?: boolean;
  language?: string;
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
  patient_id?: string;
  diagnostic_result?: string;
  confidence_score?: number;
  risk_score?: number;
  clinician_address?: string;
  metadata?: Record<string, unknown>;
}

export interface AnchorRecordResponse {
  status: string;
  record_id: string;
  record_hash: string;
  ipfs_cid?: string;
  tx_hash?: string;
  block_number?: number;
  recorded_at?: string;
}

export interface VerifyRecordRequest {
  record_id: string;
  claimed_hash?: string;
}

export interface VerifyRecordResponse {
  record_id: string;
  is_authentic: boolean;
  local_hash: string;
  blockchain_hash?: string;
  ipfs_cid?: string;
  tx_hash?: string;
  block_number?: number;
  verified_at: string;
  authenticity_badge: "VERIFIED_AUTHENTIC" | "TAMPER_DETECTED" | string;
  message: string;
}

export interface AuditRecordItem {
  record_id: string;
  patient_id?: string;
  action: string;
  patient_data_hash?: string;
  diagnostic_result?: string;
  confidence_score?: number;
  risk_score?: number;
  ipfs_cid?: string;
  tx_hash?: string;
  block_number?: number;
  clinician_address?: string;
  created_at?: string;
  is_verified: boolean;
}

export interface UserSignupRequest {
  email: string;
  password: string;
  phone_number: string;
  first_name: string;
  last_name: string;
  age?: number;
  gender?: string;
  address?: string;
  role?: string;
  npi_number?: string;
  wallet_address?: string;
}

export interface UserLoginRequest {
  phone_number: string;
  password: string;
}

export interface UserResponse {
  id: number;
  email: string;
  phone_number?: string;
  patient_id?: string;
  record_number?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  age?: number;
  gender?: string;
  address?: string;
  role: string;
  npi_number?: string;
  wallet_address?: string;
  is_active: boolean;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: UserResponse;
}

export interface TokenRefreshResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user?: UserResponse;
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
  insulin?: number;
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
export async function signupUser(payload: UserSignupRequest): Promise<TokenResponse> {
  const { data } = await apiClient.post("/auth/signup", payload);
  return data;
}

export async function loginUser(payload: UserLoginRequest): Promise<TokenResponse> {
  const { data } = await apiClient.post("/auth/login", payload);
  return data;
}

export async function logoutUser(): Promise<{ message: string }> {
  try {
    const { data } = await apiClient.post("/auth/logout");
    return data;
  } finally {
    if (typeof window !== "undefined") {
      localStorage.removeItem("trustmed_jwt_token");
      localStorage.removeItem("trustmed_refresh_token");
      localStorage.removeItem("trustmed_practitioner_session");
      document.cookie = "trustmed_access_token=; path=/; max-age=0; SameSite=Lax";
      document.cookie = "trustmed_refresh_token=; path=/; max-age=0; SameSite=Lax";
    }
  }
}

export async function refreshAccessToken(): Promise<TokenRefreshResponse | null> {
  if (typeof window === "undefined") return null;
  const refreshToken = localStorage.getItem("trustmed_refresh_token");
  if (!refreshToken) return null;

  try {
    // Make direct unauthenticated axios request to prevent attaching expired Bearer token
    const { data } = await axios.post<TokenRefreshResponse>(
      `${API_BASE_URL}/auth/refresh`,
      { refresh_token: refreshToken },
      {
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        withCredentials: true,
        timeout: 15000,
      }
    );

    if (data && data.access_token) {
      localStorage.setItem("trustmed_jwt_token", data.access_token);
      if (data.refresh_token) {
        localStorage.setItem("trustmed_refresh_token", data.refresh_token);
      }
      if (data.user) {
        const existingSession = localStorage.getItem("trustmed_practitioner_session");
        const parsedExisting = existingSession ? JSON.parse(existingSession) : {};
        const updatedSession = {
          ...parsedExisting,
          id: data.user.id,
          address: data.user.wallet_address || parsedExisting.address || "0x71C84010a3b08803450942475E2582775a6fA6f1",
          role: data.user.role || parsedExisting.role || "Chief Medical Officer",
          licenseNumber: data.user.npi_number || data.user.patient_id || parsedExisting.licenseNumber || "1487290145",
          institution: data.user.address || parsedExisting.institution || "TrustMed Clinical Health System",
          email: data.user.email || parsedExisting.email,
          phone_number: data.user.phone_number || parsedExisting.phone_number,
          patient_id: data.user.patient_id || parsedExisting.patient_id,
          record_number: data.user.record_number || parsedExisting.record_number,
          first_name: data.user.first_name || parsedExisting.first_name,
          last_name: data.user.last_name || parsedExisting.last_name,
          full_name:
            data.user.full_name ||
            `${data.user.first_name || ""} ${data.user.last_name || ""}`.trim() ||
            parsedExisting.full_name,
          age: data.user.age ?? parsedExisting.age,
          gender: data.user.gender || parsedExisting.gender,
          npi_number: data.user.npi_number || parsedExisting.npi_number,
          wallet_address: data.user.wallet_address || parsedExisting.wallet_address,
          issuedAt: new Date().toISOString(),
        };
        localStorage.setItem("trustmed_practitioner_session", JSON.stringify(updatedSession));
      }
      document.cookie = `trustmed_access_token=${data.access_token}; path=/; max-age=${data.expires_in || 3600}; SameSite=Lax`;
      if (data.refresh_token) {
        document.cookie = `trustmed_refresh_token=${data.refresh_token}; path=/; max-age=1728000; SameSite=Lax`;
      }
      return data;
    }
    return null;
  } catch (err) {
    localStorage.removeItem("trustmed_jwt_token");
    localStorage.removeItem("trustmed_refresh_token");
    localStorage.removeItem("trustmed_practitioner_session");
    document.cookie = "trustmed_access_token=; path=/; max-age=0; SameSite=Lax";
    document.cookie = "trustmed_refresh_token=; path=/; max-age=0; SameSite=Lax";
    return null;
  }
}

export async function fetchCurrentUser(): Promise<UserResponse> {
  const { data } = await apiClient.get("/auth/me");
  return data;
}

export async function fetchHealthCheck() {
  const { data } = await apiClient.get("/health");
  return data;
}

export async function fetchWeb3Status(): Promise<Web3StatusResponse> {
  const { data } = await apiClient.get("/web3/status");
  return data;
}

export interface BiomarkerExplanationRequest {
  patient_id?: string;
  prediction_label?: string;
  risk_score?: number;
  model_type?: string;
  xai_method?: string;
  attributions?: FeatureContribution[];
  vitals?: Record<string, number>;
  language?: string;
}

export interface BiomarkerExplanationResponse {
  summary: string;
  provider: string;
  model: string;
  is_live: boolean;
  doctor_questions?: string[];
  lifestyle_tips?: string[];
  biomarker_highlights?: Array<{
    feature: string;
    title: string;
    value?: number;
    unit?: string;
    status: "optimal" | "borderline" | "elevated";
    normal_range: string;
    why_it_matters: string;
    action_tip: string;
  }>;
}

export interface TextSummaryRequest {
  text: string;
}

export interface TextSummaryResponse {
  summary: string;
  provider: string;
}

export async function predictClinicalRisk(
  payload: MedicalInferenceRequest
): Promise<MedicalInferenceResponse> {
  const { data } = await apiClient.post("/ai/predict", payload);
  return data;
}

export async function explainBiomarkersWithGemini(
  payload: BiomarkerExplanationRequest
): Promise<BiomarkerExplanationResponse> {
  const { data } = await apiClient.post("/ai/explain-biomarkers", payload);
  return data;
}

export interface PatientAssessmentItem {
  record_id: string;
  patient_id: string;
  report_name: string;
  vitals: Record<string, number>;
  prediction_label?: string;
  risk_score?: number;
  confidence?: number;
  model_type: string;
  xai_method: string;
  attributions?: FeatureContribution[];
  benchmark_summary?: Record<string, unknown>;
  ai_explanation?: string;
  security_rate: number;
  explainability_rate: number;
  deterministic_hash?: string;
  ipfs_cid?: string;
  doctor_decision?: string;
  doctor_notes?: string;
  doctor_signed_at?: string;
  created_at?: string;
}

export interface DoctorDecisionRequest {
  record_id: string;
  patient_id: string;
  doctor_decision: string;
  doctor_notes?: string;
  reanchor_blockchain?: boolean;
}

export interface DoctorDecisionResponse {
  status: string;
  record_id: string;
  patient_id: string;
  doctor_decision: string;
  doctor_notes: string;
  doctor_signed_at: string;
  tx_hash?: string;
  record_hash?: string;
  message: string;
}

export async function saveDoctorDecision(
  payload: DoctorDecisionRequest
): Promise<DoctorDecisionResponse> {
  const { data } = await apiClient.post("/reports/doctor-decision", payload);
  return data;
}

export interface PatientAssessmentHistoryResponse {
  total_count: number;
  records: PatientAssessmentItem[];
}

export async function fetchPatientAssessmentHistory(
  patientId?: string
): Promise<PatientAssessmentHistoryResponse> {
  const query = patientId ? `?patient_id=${encodeURIComponent(patientId)}` : "";
  const { data } = await apiClient.get(`/reports/history${query}`);
  return data;
}

export async function fetchLatestPatientAssessment(
  patientId?: string
): Promise<PatientAssessmentItem | null> {
  const query = patientId ? `?patient_id=${encodeURIComponent(patientId)}` : "";
  const { data } = await apiClient.get(`/reports/latest${query}`);
  return data;
}

export async function savePatientAssessment(
  payload: Partial<PatientAssessmentItem>
): Promise<PatientAssessmentItem> {
  const { data } = await apiClient.post("/reports/save-assessment", payload);
  return data;
}

export async function deletePatientAssessment(
  recordId: string
): Promise<{ status: string; message: string }> {
  const { data } = await apiClient.delete(`/reports/history/${recordId}`);
  return data;
}

export interface CopilotChatRequest {
  question: string;
  context?: string;
  language?: string;
}

export interface CopilotChatResponse {
  answer: string;
  provider: string;
  model: string;
  suggested_followups: string[];
}

export async function askHealthCopilot(
  payload: CopilotChatRequest
): Promise<CopilotChatResponse> {
  const { data } = await apiClient.post("/ai/copilot-chat", payload);
  return data;
}

export async function summarizeWithGemini(
  payload: TextSummaryRequest
): Promise<TextSummaryResponse> {
  const { data } = await apiClient.post("/ai/summarize", payload);
  return data;
}

export async function anchorRecordOnChain(
  payload: AnchorRecordRequest
): Promise<AnchorRecordResponse> {
  const { data } = await apiClient.post("/web3/anchor", payload);
  return data;
}

export async function verifyRecordIntegrity(
  payload: VerifyRecordRequest
): Promise<VerifyRecordResponse> {
  const { data } = await apiClient.post("/web3/verify", payload);
  return data;
}

export async function fetchAuditRecords(limit: number = 50): Promise<AuditRecordItem[]> {
  const { data } = await apiClient.get(`/web3/records?limit=${limit}`);
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

export interface AdminSummaryStats {
  total_registered_users: number;
  total_patients: number;
  total_clinicians: number;
  total_admins: number;
  total_diagnostic_assessments: number;
  total_blockchain_anchors: number;
  system_security_compliance_rate: number;
  active_evm_network: string;
  smart_contract_status: string;
  roles_distribution: Array<{ role: string; count: number }>;
  recent_activity_timeline: Array<{
    period: string;
    assessment_count: number;
    anchored_count: number;
  }>;
  privacy_shield_active: boolean;
}

export async function fetchAdminSummary(): Promise<AdminSummaryStats> {
  const { data } = await apiClient.get("/admin/summary");
  return data;
}

export interface BiomarkerBenchmark {
  name: string;
  key: string;
  patient_value: number;
  unit: string;
  normal_range: string;
  min_optimal: number;
  max_optimal: number;
  status: "OPTIMAL" | "BORDERLINE" | "ELEVATED" | "CRITICAL" | "LOW";
  status_color: string;
  delta_from_median: number;
  interpretation: string;
  guideline_source: string;
  severity_level: number;
}

export interface ReportBenchmarkSummary {
  overall_health_index: number;
  total_metrics_evaluated: number;
  optimal_count: number;
  elevated_count: number;
  critical_count: number;
  primary_clinical_concerns: string[];
  benchmarks: BiomarkerBenchmark[];
}

export interface ReportUploadResponse {
  filename: string;
  file_type: string;
  file_size_bytes: number;
  detected_patient_id?: string;
  detected_patient_name?: string;
  extracted_vitals: Record<string, number>;
  extraction_confidence: Record<string, number>;
  raw_text_snippet: string;
  benchmark_summary: ReportBenchmarkSummary;
}

export async function uploadAndExtractReport(file: File, lang?: string): Promise<ReportUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  const currentLang = lang || (typeof window !== "undefined" ? localStorage.getItem("trustmed_language") || "en" : "en");
  const { data } = await apiClient.post(`/reports/upload-extract?lang=${currentLang}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      "Accept-Language": currentLang,
    },
  });
  return data;
}

export async function recalculateBenchmarks(
  vitals: Record<string, number>,
  language?: string
): Promise<{ benchmark_summary: ReportBenchmarkSummary }> {
  const currentLang = language || (typeof window !== "undefined" ? localStorage.getItem("trustmed_language") || "en" : "en");
  const { data } = await apiClient.post("/reports/evaluate-benchmarks", { vitals, language: currentLang });
  return data;
}

export async function runBatchCohortAnalysis(
  payload: BatchCohortRequest
): Promise<BatchCohortResponse> {
  const { data } = await apiClient.post("/cohort/batch-predict", payload);
  return data;
}
