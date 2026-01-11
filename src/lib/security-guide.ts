// Security Best Practices for Aurelia Platform
// This guide documents security patterns and implementations

export const SECURITY_GUIDE = {
  // =====================================================
  // 1. AUTHENTICATION & AUTHORIZATION
  // =====================================================
  authentication: {
    title: "Authentication & Authorization",
    description: "Secure user authentication patterns",
    
    bestPractices: [
      {
        name: "Use Supabase Auth",
        description: "Leverage Supabase's built-in authentication instead of custom solutions",
        example: `
// ✅ CORRECT: Use Supabase Auth
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
});

// ❌ WRONG: Store passwords manually
// Never store passwords in your own database`,
      },
      {
        name: "Store Roles Separately",
        description: "Never store roles on profiles table - use a separate user_roles table",
        example: `
-- ✅ CORRECT: Separate roles table
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- ❌ WRONG: Role on profiles
-- ALTER TABLE profiles ADD COLUMN role TEXT; -- NEVER DO THIS`,
      },
      {
        name: "Server-Side Role Checks",
        description: "Always validate roles server-side, never trust client-side checks",
        example: `
// ✅ CORRECT: Use security definer function
CREATE FUNCTION has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Use in RLS policies:
CREATE POLICY "Admins can view all"
ON sensitive_table FOR SELECT
USING (has_role(auth.uid(), 'admin'));`,
      },
    ],
  },

  // =====================================================
  // 2. ROW LEVEL SECURITY (RLS)
  // =====================================================
  rls: {
    title: "Row Level Security",
    description: "Protecting data at the database level",
    
    bestPractices: [
      {
        name: "Enable RLS on All Tables",
        description: "Every table with user data must have RLS enabled",
        example: `
-- Always enable RLS
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

-- Create restrictive policies
CREATE POLICY "Users can only see own data"
ON user_data FOR SELECT
USING (auth.uid() = user_id);`,
      },
      {
        name: "Avoid Permissive Policies",
        description: "Never use (true) for INSERT/UPDATE/DELETE policies",
        example: `
-- ❌ WRONG: Too permissive
CREATE POLICY "Bad policy" ON data
FOR INSERT WITH CHECK (true);

-- ✅ CORRECT: Restrict to authenticated users
CREATE POLICY "Good policy" ON data
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);`,
      },
      {
        name: "Use Security Invoker Views",
        description: "Views should respect the caller's permissions",
        example: `
-- ✅ CORRECT: Security invoker view
CREATE VIEW my_view
WITH (security_invoker = true)
AS SELECT * FROM sensitive_table;

-- ❌ WRONG: Security definer view (bypasses RLS)
-- CREATE VIEW my_view AS SELECT * FROM sensitive_table;`,
      },
    ],
  },

  // =====================================================
  // 3. SECRETS & API KEYS
  // =====================================================
  secrets: {
    title: "Secrets & API Keys Management",
    description: "Secure handling of sensitive credentials",
    
    bestPractices: [
      {
        name: "Never Hardcode Secrets",
        description: "Use environment variables for all secrets",
        example: `
// ❌ WRONG: Hardcoded API key
const API_KEY = "sk_live_abc123...";

// ✅ CORRECT: Environment variable
const API_KEY = Deno.env.get("STRIPE_SECRET_KEY");`,
      },
      {
        name: "Encrypt Sensitive Data at Rest",
        description: "OAuth tokens and sensitive data should be encrypted",
        example: `
// Use AES-GCM encryption for tokens
import { encrypt, decrypt } from "../_shared/crypto-utils";

// Before storing
const encryptedToken = await encrypt(accessToken);
await supabase.from("connections").insert({
  access_token: encryptedToken
});

// When reading
const { data } = await supabase.from("connections").select();
const accessToken = await decrypt(data.access_token);`,
      },
      {
        name: "Edge Functions for Secrets",
        description: "Access secrets only in edge functions, never client-side",
        example: `
// Edge function (server-side)
const OPENAI_KEY = Deno.env.get("OPENAI_API_KEY");

// ❌ NEVER expose in client code
// import.meta.env.VITE_SECRET_KEY`,
      },
    ],
  },

  // =====================================================
  // 4. INPUT VALIDATION
  // =====================================================
  inputValidation: {
    title: "Input Validation",
    description: "Preventing injection and data corruption",
    
    bestPractices: [
      {
        name: "Use Zod for Validation",
        description: "Validate all inputs with schema validation",
        example: `
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().email().max(255),
  phone: z.string().regex(/^\\+?[1-9]\\d{1,14}$/).optional(),
  message: z.string().min(10).max(2000)
});

// Validate before processing
const result = contactSchema.safeParse(userInput);
if (!result.success) {
  throw new Error(result.error.message);
}`,
      },
      {
        name: "Sanitize HTML Content",
        description: "Never render unsanitized user HTML",
        example: `
// ❌ WRONG: XSS vulnerability
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// ✅ CORRECT: Use sanitization library
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ 
  __html: DOMPurify.sanitize(userContent) 
}} />`,
      },
      {
        name: "Encode URL Parameters",
        description: "Always encode user input in URLs",
        example: `
// ✅ CORRECT: Encode parameters
const whatsappUrl = \`https://wa.me/\${encodeURIComponent(phone)}?text=\${encodeURIComponent(message)}\`;

// ❌ WRONG: Direct concatenation
// const url = \`https://wa.me/\${phone}?text=\${message}\`;`,
      },
    ],
  },

  // =====================================================
  // 5. RATE LIMITING
  // =====================================================
  rateLimiting: {
    title: "Rate Limiting",
    description: "Protecting against abuse and DDoS",
    
    bestPractices: [
      {
        name: "Database Rate Limiting",
        description: "Use database-backed rate limiting for persistence",
        example: `
-- Rate limiting function
CREATE FUNCTION check_rate_limit(
  p_action TEXT,
  p_identifier TEXT,
  p_max_requests INT DEFAULT 10,
  p_window_minutes INT DEFAULT 60
) RETURNS BOOLEAN AS $$
DECLARE
  recent_count INT;
BEGIN
  SELECT COUNT(*) INTO recent_count
  FROM rate_limits
  WHERE action_type = p_action
    AND identifier = p_identifier
    AND created_at > NOW() - INTERVAL '1 minute' * p_window_minutes;
  
  IF recent_count >= p_max_requests THEN
    RETURN FALSE;
  END IF;
  
  INSERT INTO rate_limits (action_type, identifier) 
  VALUES (p_action, p_identifier);
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;`,
      },
      {
        name: "Login Rate Limiting",
        description: "Protect login endpoints from brute force",
        example: `
// Check rate limit before login
const canProceed = await supabase.rpc('check_rate_limit', {
  p_action: 'login',
  p_identifier: email,
  p_max_requests: 5,
  p_window_minutes: 15
});

if (!canProceed) {
  throw new Error('Too many attempts. Try again later.');
}`,
      },
    ],
  },

  // =====================================================
  // 6. AUDIT LOGGING
  // =====================================================
  auditLogging: {
    title: "Audit Logging",
    description: "Tracking security-relevant events",
    
    bestPractices: [
      {
        name: "Log Sensitive Actions",
        description: "Track all security-relevant operations",
        example: `
// Log important actions
await supabase.from('audit_logs').insert({
  user_id: user.id,
  action: 'ROLE_CHANGE',
  resource_type: 'user_roles',
  resource_id: targetUserId,
  details: { 
    old_role: oldRole, 
    new_role: newRole,
    ip_address: request.headers.get('x-forwarded-for')
  }
});`,
      },
      {
        name: "Include Context",
        description: "Log IP, user agent, and timestamps",
        example: `
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);`,
      },
    ],
  },
} as const;

// Quick security checklist
export const SECURITY_CHECKLIST = [
  { category: "Authentication", item: "RLS enabled on all tables", critical: true },
  { category: "Authentication", item: "Roles stored in separate table", critical: true },
  { category: "Authentication", item: "Server-side role validation", critical: true },
  { category: "Data Protection", item: "Sensitive data encrypted", critical: true },
  { category: "Data Protection", item: "No secrets in client code", critical: true },
  { category: "Input Validation", item: "All inputs validated with Zod", critical: true },
  { category: "Input Validation", item: "HTML content sanitized", critical: true },
  { category: "Rate Limiting", item: "Login rate limiting enabled", critical: true },
  { category: "Rate Limiting", item: "API rate limiting configured", critical: false },
  { category: "Monitoring", item: "Audit logging implemented", critical: false },
  { category: "Monitoring", item: "Error tracking configured", critical: false },
  { category: "Headers", item: "CORS properly configured", critical: true },
  { category: "Headers", item: "Security headers set", critical: false },
] as const;

export type SecurityCategory = typeof SECURITY_CHECKLIST[number]["category"];
