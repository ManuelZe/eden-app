/** Modèles des endpoints SaaS de l'API (/saas, /ingest, /fhir). */

export type SourceType = 'gnuhealth' | 'api' | 'fhir';
export type LinkStatus = 'pending' | 'active' | 'revoked';
export type RecordKind = 'laboratoire' | 'imagerie' | 'exploration' | 'facture';

export interface TenantSettings {
  display_name: string;
  result_access_days: number;
  block_unpaid_results: boolean;
  commissions_enabled: boolean;
  link_token_days: number;
  primary_color: string;
  contact_email: string;
  contact_phone: string;
}

export interface Tenant {
  id: number;
  slug: string;
  name: string;
  display_name: string;
  source_type: SourceType;
  is_active: boolean;
  has_api_key: boolean;
  api_key_hint: string | null;
  created_at: string | null;
  updated_at: string | null;
  settings?: TenantSettings;
}

export interface TenantStats {
  patients_known: number;
  links_active: number;
  links_pending: number;
  links_revoked: number;
  tokens_active: number;
  records: Record<RecordKind, number>;
  records_total: number;
  last_record_at: string | null;
  doctors: number;
  admins: number;
}

export interface TenantWithStats extends Tenant {
  stats: TenantStats;
  api_key?: string | null;
}

export interface AuditEntry {
  id: number;
  tenant_id: number | null;
  establishment: string | null;
  user_id: number | null;
  user_name: string | null;
  user_email: string | null;
  action: string;
  target: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

export interface TenantDashboard extends TenantStats {
  tenant: Tenant;
  recent_activity: AuditEntry[];
}

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

export interface PatientLinkView {
  id: number | null;
  patient_id: number | null;
  tenant_id: number;
  establishment: string | null;
  local_ref: string;
  status: LinkStatus;
  method: string | null;
  verified_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  patient_name?: string | null;
  patient_email?: string | null;
  patient_federation_id?: string | null;
}

export interface TenantPatientRow {
  local_ref: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  birth_date: string | null;
  gender: string | null;
  link_status: LinkStatus | 'none';
  link_id: number | null;
  account: { patient_email?: string | null; method?: string | null } | null;
  records: number | null;
  phone?: string | null;
  source?: string | null;
}

export interface RecordSummary {
  id: number;
  tenant_id: number;
  local_ref: string;
  kind: RecordKind;
  code: string;
  title: string;
  validated_at: string | null;
  source: string | null;
  created_at: string | null;
  updated_at: string | null;
  details_count: number;
}

export interface LinkTokenView {
  id: number;
  tenant_id: number;
  local_ref: string;
  email_hint: string | null;
  expires_at: string;
  used_at: string | null;
  revoked_at: string | null;
  created_at: string;
  status: 'active' | 'used' | 'expired' | 'revoked';
}

export interface PatientDetail {
  patient: TenantPatientRow;
  records: RecordSummary[];
  tokens: LinkTokenView[];
}

export interface IssuedLinkToken {
  already_linked: boolean;
  local_ref: string;
  token_id?: number;
  url?: string;
  short_code?: string;
  expires_at?: string;
  qr_png?: string;
  establishment?: string;
}

export interface DoctorLinkView {
  id: number;
  doctor_id: number;
  tenant_id: number;
  local_ref: string | null;
  created_at: string;
  name: string | null;
  email: string | null;
  matricule: string | null;
  speciality: string | null;
  is_confirmed: boolean;
}

export interface SaasMe {
  is_super_admin: boolean;
  admin_tenants: Tenant[];
  links: PatientLinkView[];
  features: { commissions: boolean };
  patient_federation_id: string | null;
}

export interface SuperStats {
  tenants: number;
  tenants_active: number;
  users: number;
  patients: number;
  doctors: number;
  admins: number;
  links_active: number;
  links_pending: number;
  records: Record<RecordKind, number>;
  records_total: number;
  recent_activity: AuditEntry[];
}

export interface TenantAdminView {
  user_id: number;
  tenant_id: number;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  active: boolean;
  created_at: string;
  email_sent?: boolean;
}

export interface AccountView {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  active: boolean;
  roles: string[];
  is_super_admin: boolean;
  admin_of: string[];
  patient_id: number | null;
  doctor_id: number | null;
}

export const SOURCE_LABELS: Record<SourceType, string> = {
  gnuhealth: 'GNU Health (lecture directe)',
  api: 'API EDEN (format EDEN)',
  fhir: 'HL7 FHIR R4',
};

export const RECORD_KIND_LABELS: Record<RecordKind, string> = {
  laboratoire: 'Laboratoire',
  imagerie: 'Imagerie',
  exploration: 'Exploration',
  facture: 'Facture',
};

export const LINK_STATUS_LABELS: Record<LinkStatus | 'none', string> = {
  active: 'Rattaché',
  pending: 'En attente',
  revoked: 'Retiré',
  none: 'Non rattaché',
};

/** Libellés lisibles des actions du journal d'audit. */
export const AUDIT_LABELS: Record<string, string> = {
  'account.created': 'Compte créé',
  'link_token.issued': 'QR code généré',
  'link_token.revoked': 'QR code annulé',
  'link.active': 'Dossier rattaché',
  'link.pending': 'Rattachement en attente',
  'link.revoked': 'Rattachement retiré',
  'link.revoked_by_patient': 'Retiré par le patient',
  'link.conflict': 'Tentative sur un dossier déjà rattaché',
  'tenant.created': 'Établissement créé',
  'tenant.updated': 'Établissement modifié',
  'tenant.settings_updated': 'Réglages modifiés',
  'tenant.api_key_rotated': "Nouvelle clé d'API",
  'tenant.admin_added': 'Administrateur ajouté',
  'tenant.admin_removed': 'Administrateur retiré',
  'patient.saved': 'Dossier patient enregistré',
  'doctor.linked': 'Médecin rattaché',
  'doctor.unlinked': 'Médecin retiré',
  'ingest.api': 'Données reçues (API EDEN)',
  'ingest.fhir': 'Données reçues (FHIR)',
  'ingest.deleted': 'Donnée retirée par l’établissement',
  'result.viewed': 'Résultat consulté par un médecin',
  'user.activated': 'Compte réactivé',
  'user.deactivated': 'Compte désactivé',
  'user.super_admin_granted': 'Droits super-administrateur accordés',
  'user.super_admin_revoked': 'Droits super-administrateur retirés',
};

export function auditLabel(action: string): string {
  return AUDIT_LABELS[action] ?? action;
}
