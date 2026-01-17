# Aurelia Private Concierge - GitHub Copilot Instructions

## Project Overview

Aurelia is an ultra-luxury AI-powered private concierge platform. All code must reflect the brand's sophistication, security-first architecture, and accessibility excellence.

---

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS with semantic design tokens
- **UI Components**: shadcn/ui (Radix primitives)
- **Backend**: Lovable Cloud (Supabase-powered)
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Auth**: Supabase Auth with MFA support
- **AI**: Lovable AI Gateway (Gemini/GPT models)
- **Animation**: Framer Motion
- **Icons**: Lucide React

---

## Code Style & Conventions

### Naming Conventions

```typescript
// Components: PascalCase
export const ServiceRequestCard = () => {}

// Hooks: camelCase with "use" prefix
export const useCredits = () => {}

// Files: kebab-case for components, camelCase for hooks
// src/components/service-request-card.tsx
// src/hooks/useCredits.ts

// Constants: SCREAMING_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3;

// Types/Interfaces: PascalCase with descriptive names
interface ServiceRequest {}
type MembershipTier = 'signature' | 'prestige' | 'black-card';
```

### Component Structure

```typescript
// Preferred order in components:
// 1. Imports (external, then internal, then types)
// 2. Types/Interfaces
// 3. Constants
// 4. Component function
// 5. Hooks (useState, useEffect, custom hooks)
// 6. Event handlers
// 7. Render helpers
// 8. Return JSX
```

### File Organization

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui primitives
│   └── dashboard/      # Feature-specific components
├── hooks/              # Custom React hooks
├── pages/              # Route components
├── contexts/           # React contexts
├── lib/                # Utilities and helpers
└── integrations/       # External service integrations
```

---

## Security Requirements (CRITICAL)

### Input Validation (MANDATORY)

All user inputs MUST be validated both client-side AND server-side to prevent injection attacks.

```typescript
import { z } from 'zod';

// ✅ Complete form validation schema
const contactSchema = z.object({
  name: z.string()
    .trim()
    .min(1, { message: "Name cannot be empty" })
    .max(100, { message: "Name must be less than 100 characters" }),
  email: z.string()
    .trim()
    .email({ message: "Invalid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
  message: z.string()
    .trim()
    .min(1, { message: "Message cannot be empty" })
    .max(1000, { message: "Message must be less than 1000 characters" }),
  phone: z.string()
    .regex(/^[+]?[\d\s\-()]+$/, { message: "Invalid phone format" })
    .optional(),
});

// ✅ Validate before processing
const result = contactSchema.safeParse(formData);
if (!result.success) {
  return { errors: result.error.flatten().fieldErrors };
}
```

### Security Checklist for Forms

- ✅ Client-side validation with proper error messages
- ✅ Server-side validation (never trust client)
- ✅ Input length limits and character restrictions
- ✅ Proper encoding for external API calls (`encodeURIComponent`)
- ✅ No logging of sensitive form data to console
- ✅ Sanitize HTML if rendering user content (use DOMPurify)

### External URL Security

```typescript
// ❌ NEVER pass unvalidated input to URLs
const whatsappUrl = `https://wa.me/?text=${userInput}`;

// ✅ ALWAYS encode user input
const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(validatedMessage)}`;

// ✅ Validate URLs before use
const urlSchema = z.string().url().startsWith('https://');
```

### End-to-End Encryption

```typescript
// Always encrypt sensitive data before storage
// Use the encryption utilities in lib/security

// NEVER log sensitive data
console.log(user.email); // ❌ BAD
console.log('User authenticated'); // ✅ GOOD
```

### Zero-Trust Architecture

```typescript
// Always validate on the server, never trust client input
const requestSchema = z.object({
  userId: z.string().uuid(),
  amount: z.number().positive().max(1000000),
  currency: z.enum(['USD', 'EUR', 'GBP']),
});

// Validate in edge functions
const body = await req.json();
const parsed = requestSchema.safeParse(body);
if (!parsed.success) {
  return new Response(JSON.stringify({ error: 'Invalid input' }), { status: 400 });
}
```

### Row Level Security (RLS)

```sql
-- Always enable RLS on tables with user data
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;

-- Always scope queries to authenticated user
CREATE POLICY "Users can view own requests"
  ON service_requests FOR SELECT
  USING (auth.uid() = user_id);

-- Add input length constraints at database level
ALTER TABLE profiles ADD CONSTRAINT display_name_length CHECK (char_length(display_name) <= 100);
```

### Authentication Best Practices

```typescript
// Always check authentication state
const { user } = useAuth();
if (!user) return <Navigate to="/auth" />;

// Use MFA for sensitive operations
// Never store passwords or tokens in localStorage
// Use httpOnly cookies for session management
```

### API Security

```typescript
// Edge functions: Always validate authorization
const authHeader = req.headers.get('Authorization');
if (!authHeader) {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
}

// Rate limit sensitive endpoints
// Log security events to audit_logs table
// Validate ALL input before processing
```

### HTML Sanitization

```typescript
// ❌ NEVER render unsanitized user content
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// ✅ Sanitize if HTML rendering is required
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userContent) }} />

// ✅ Prefer plain text rendering when possible
<p>{userContent}</p>
```

---

## Accessibility Standards (WCAG 2.1 AA)

### Required Practices

```tsx
// Always include alt text for images
<img src={logo} alt="Aurelia logo" />

// Use semantic HTML elements
<nav aria-label="Main navigation">
<main role="main">
<button type="button" aria-label="Close dialog">

// Ensure sufficient color contrast (4.5:1 for text)
// Use focus-visible styles
className="focus-visible:ring-2 focus-visible:ring-primary"

// Support keyboard navigation
onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}

// Announce dynamic content changes
<div role="status" aria-live="polite">{statusMessage}</div>
```

### Form Accessibility

```tsx
<Label htmlFor="email">Email Address</Label>
<Input
  id="email"
  type="email"
  aria-describedby="email-error"
  aria-invalid={!!errors.email}
/>
{errors.email && (
  <p id="email-error" role="alert">{errors.email}</p>
)}
```

---

## Design System

### ALWAYS Use Semantic Tokens

```tsx
// ❌ NEVER use hardcoded colors
className="bg-[#1a1a1a] text-white"

// ✅ ALWAYS use design tokens
className="bg-background text-foreground"
className="bg-primary text-primary-foreground"
className="text-muted-foreground"
className="border-border"
```

### Available Tokens

```css
/* Backgrounds */
--background, --foreground
--card, --card-foreground
--muted, --muted-foreground

/* Interactive */
--primary, --primary-foreground
--secondary, --secondary-foreground
--accent, --accent-foreground

/* State */
--destructive, --destructive-foreground

/* Borders */
--border, --input, --ring

/* Luxury Accents (Aurelia-specific) */
--gold, --champagne, --platinum
```

### Animation Guidelines

Use Framer Motion for complex animations, or built-in Tailwind animation utilities:

```tsx
// Framer Motion for complex animations
import { motion } from 'framer-motion';

// Respect reduced motion preferences
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
/>
```

### Built-in Animation Classes

```tsx
// Fade animations
className="animate-fade-in"   // Fade in with slight upward motion
className="animate-fade-out"  // Fade out with downward motion

// Scale animations
className="animate-scale-in"  // Scale up from 0.95
className="animate-scale-out" // Scale down to 0.95

// Slide animations
className="animate-slide-in-right"  // Slide in from right
className="animate-slide-out-right" // Slide out to right

// Combined animations
className="animate-enter"  // Fade + scale in
className="animate-exit"   // Fade + scale out

// Accordion (for expandable content)
className="animate-accordion-down"
className="animate-accordion-up"
```

### Interactive Utility Classes

```tsx
// Hover scale effect
className="hover-scale"  // Scales to 1.05 on hover

// Animated underline for links
className="story-link"   // Underline animation on hover

// Pulse effect
className="pulse"        // Continuous pulse animation
```

---

## GDPR Compliance

### Data Handling

```typescript
// Always provide data export capability
// Implement right to deletion
// Log consent for data processing
// Minimize data collection

// Use purpose-specific data access
const { data } = await supabase
  .from('profiles')
  .select('display_name, avatar_url') // Only fetch needed fields
  .eq('user_id', userId);
```

### Cookie Consent

```typescript
// Check consent before tracking
if (hasAnalyticsConsent) {
  trackEvent('page_view', { path: location.pathname });
}
```

---

## Orla AI Assistant Guidelines

When generating code for Orla (AI concierge):

```typescript
// Orla's persona: warm, sophisticated, discreet
// Never use casual language like "hey" or "cool"
// Address members formally or by name
// Maintain confidentiality at all times

const systemPrompt = `You are Orla, Aurelia's private AI concierge. 
Speak with warmth, discretion, and sophistication.`;
```

---

## Code Review Checklist

Before submitting PRs, ensure:

- [ ] All sensitive data is encrypted at rest
- [ ] RLS policies exist for new tables
- [ ] Input validation with Zod schemas
- [ ] Semantic HTML and ARIA attributes
- [ ] Design tokens used (no hardcoded colors)
- [ ] Reduced motion support for animations
- [ ] Error boundaries for component failures
- [ ] Loading and error states handled
- [ ] TypeScript strict mode compliance
- [ ] No console.log statements in production code
- [ ] Audit logging for security-sensitive operations

---

## Quick References

### Supabase Client Import

```typescript
import { supabase } from '@/integrations/supabase/client';
```

### Common Hooks

```typescript
import { useAuth } from '@/contexts/AuthContext';
import { useCredits } from '@/hooks/useCredits';
import { useSubscription } from '@/hooks/useSubscription';
import { useToast } from '@/hooks/use-toast';
```

### Toast Notifications

```typescript
const { toast } = useToast();

toast({
  title: "Request submitted",
  description: "Your concierge will respond within 4 hours.",
});
```

---

## Forbidden Patterns

```typescript
// ❌ Never expose API keys in client code
const apiKey = 'sk-...'; 

// ❌ Never use any type
const data: any = response;

// ❌ Never disable TypeScript checks
// @ts-ignore

// ❌ Never skip error handling
await supabase.from('table').insert(data);

// ✅ Always handle errors
const { error } = await supabase.from('table').insert(data);
if (error) throw error;
```

---

## API Keys & Secrets Management

### Private Keys (CRITICAL)

```typescript
// ❌ NEVER store private API keys in client code
const stripeSecret = 'sk_live_...';  // NEVER DO THIS

// ✅ Store secrets in Lovable Cloud / Supabase Secrets
// Access them ONLY in Edge Functions:
const apiKey = Deno.env.get('STRIPE_SECRET_KEY');
```

### Publishable Keys

```typescript
// ✅ Publishable keys CAN be in client code
const stripePublic = 'pk_live_...';  // This is OK

// ✅ Use environment variables for flexibility
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
```

### Edge Function Secret Access

```typescript
// Edge functions can access secrets via Deno.env
serve(async (req) => {
  const apiKey = Deno.env.get('PERPLEXITY_API_KEY');
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), { 
      status: 500 
    });
  }
  // Use the key...
});
```

---

## File Storage Policy (CRITICAL)

### NEVER Store Files in Database

```typescript
// ❌ NEVER store base64 or binary data in database
await supabase.from('users').update({ 
  avatar: 'data:image/png;base64,iVBORw0KGgo...'  // NEVER!
});

// ❌ NEVER store file contents in TEXT/BLOB columns
await supabase.from('documents').insert({
  content: fileBuffer  // NEVER!
});
```

### ALWAYS Use Blob Storage

```typescript
// ✅ Upload to Supabase Storage
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`${userId}/avatar.png`, file);

// ✅ Store only the URL reference in database
await supabase.from('profiles').update({
  avatar_url: data?.path  // Store URL, not file!
});
```

### Why This Matters

- Database storage is expensive and limited
- Binary data degrades query performance
- Files can exhaust disk space quickly
- Blob storage is designed for files, databases are not

### Correct Pattern

1. Upload file to Supabase Storage bucket
2. Get the URL/path back
3. Store ONLY the URL string in database
4. Retrieve URL from database, load file from Storage

---

*Last updated: January 2026*
