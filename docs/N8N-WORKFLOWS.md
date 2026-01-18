# Aurelia n8n Workflow Automation Guide

## Overview

This document contains ready-to-use n8n workflow prompts and configurations for automating Aurelia's luxury concierge operations. These workflows integrate with Supabase, email services, AI, and external APIs.

---

## 🔐 Required Credentials

Before setting up workflows, configure these credentials in n8n:

```
- Supabase API (URL + Service Role Key)
- SMTP/Email (SendGrid, Resend, or similar)
- OpenAI/Anthropic API Key
- Stripe API Key
- Twilio (for SMS)
- Slack/Discord Webhook
- WhatsApp Business API
```

---

## 📋 Workflow 1: New Member Onboarding Automation

**Trigger:** New user signup in Supabase auth.users

### Workflow Steps:

```json
{
  "name": "Aurelia - New Member Onboarding",
  "nodes": [
    {
      "name": "Supabase Trigger",
      "type": "webhook",
      "parameters": {
        "path": "new-member-signup",
        "method": "POST"
      }
    },
    {
      "name": "Get Member Profile",
      "type": "supabase",
      "parameters": {
        "operation": "select",
        "table": "profiles",
        "filters": {
          "user_id": "={{ $json.user_id }}"
        }
      }
    },
    {
      "name": "Determine Tier",
      "type": "supabase",
      "parameters": {
        "operation": "select",
        "table": "subscriptions",
        "filters": {
          "user_id": "={{ $json.user_id }}"
        }
      }
    },
    {
      "name": "AI Personalized Welcome",
      "type": "openai",
      "parameters": {
        "model": "gpt-4",
        "prompt": "You are Orla, Aurelia's AI concierge. Write a warm, sophisticated welcome message for a new {{ $json.tier }} member named {{ $json.display_name }}. Mention their tier benefits and invite them to explore the platform. Keep it under 150 words. Use elegant, luxury-appropriate language."
      }
    },
    {
      "name": "Send Welcome Email",
      "type": "send_email",
      "parameters": {
        "to": "={{ $json.email }}",
        "subject": "Welcome to Aurelia, {{ $json.display_name }}",
        "html": "={{ $node['AI Personalized Welcome'].json.text }}"
      }
    },
    {
      "name": "Create Welcome Notification",
      "type": "supabase",
      "parameters": {
        "operation": "insert",
        "table": "notifications",
        "data": {
          "user_id": "={{ $json.user_id }}",
          "type": "welcome",
          "title": "Welcome to Aurelia",
          "description": "Your journey into extraordinary begins now.",
          "action_url": "/dashboard"
        }
      }
    },
    {
      "name": "Notify Concierge Team",
      "type": "slack",
      "parameters": {
        "channel": "#new-members",
        "message": "🎉 New {{ $json.tier }} member: {{ $json.display_name }} ({{ $json.email }})"
      }
    },
    {
      "name": "Schedule Follow-up",
      "type": "wait",
      "parameters": {
        "duration": 24,
        "unit": "hours"
      }
    },
    {
      "name": "Send Day 2 Email",
      "type": "send_email",
      "parameters": {
        "to": "={{ $json.email }}",
        "subject": "Discover Your First Aurelia Experience",
        "template": "day2-onboarding"
      }
    }
  ]
}
```

---

## 📋 Workflow 2: Service Request Processing

**Trigger:** New row in service_requests table

### Workflow Steps:

```json
{
  "name": "Aurelia - Service Request Handler",
  "nodes": [
    {
      "name": "Webhook Trigger",
      "type": "webhook",
      "parameters": {
        "path": "service-request",
        "method": "POST"
      }
    },
    {
      "name": "Enrich Request Data",
      "type": "supabase",
      "parameters": {
        "operation": "select",
        "table": "profiles",
        "join": "subscriptions",
        "filters": {
          "user_id": "={{ $json.user_id }}"
        }
      }
    },
    {
      "name": "AI Request Analysis",
      "type": "openai",
      "parameters": {
        "model": "gpt-4",
        "prompt": "Analyze this luxury service request and provide:\n1. Category classification\n2. Urgency level (1-5)\n3. Estimated complexity\n4. Recommended partners\n5. Budget estimate range\n\nRequest: {{ $json.description }}\nMember Tier: {{ $json.tier }}\nCategory: {{ $json.category }}"
      }
    },
    {
      "name": "Calculate Priority Score",
      "type": "code",
      "parameters": {
        "code": "const tierMultiplier = { 'signature': 1, 'prestige': 2, 'black_card': 3 };\nconst urgency = $json.urgency || 3;\nconst tier = $json.tier || 'signature';\nreturn { priority_score: urgency * tierMultiplier[tier] };"
      }
    },
    {
      "name": "Route by Priority",
      "type": "switch",
      "parameters": {
        "conditions": [
          { "value": "={{ $json.priority_score >= 12 }}", "output": 0 },
          { "value": "={{ $json.priority_score >= 6 }}", "output": 1 },
          { "value": "true", "output": 2 }
        ]
      }
    },
    {
      "name": "High Priority - Immediate Alert",
      "type": "slack",
      "parameters": {
        "channel": "#urgent-requests",
        "message": "🚨 HIGH PRIORITY REQUEST\nMember: {{ $json.display_name }} ({{ $json.tier }})\nRequest: {{ $json.description }}\nAction Required: Immediate"
      }
    },
    {
      "name": "Find Matching Partners",
      "type": "supabase",
      "parameters": {
        "operation": "select",
        "table": "partners",
        "filters": {
          "categories": "cs.{{{ $json.category }}}",
          "status": "eq.approved"
        }
      }
    },
    {
      "name": "Update Request Status",
      "type": "supabase",
      "parameters": {
        "operation": "update",
        "table": "service_requests",
        "data": {
          "status": "processing",
          "ai_analysis": "={{ $node['AI Request Analysis'].json }}",
          "priority_score": "={{ $json.priority_score }}"
        },
        "filters": {
          "id": "={{ $json.request_id }}"
        }
      }
    },
    {
      "name": "Send Confirmation",
      "type": "send_email",
      "parameters": {
        "to": "={{ $json.email }}",
        "subject": "Your Aurelia Request is Being Curated",
        "template": "request-confirmed"
      }
    }
  ]
}
```

---

## 📋 Workflow 3: Surprise Me Experience Fulfillment

**Trigger:** New surprise_me_requests entry

### Workflow Steps:

```json
{
  "name": "Aurelia - Surprise Me Fulfillment",
  "nodes": [
    {
      "name": "Webhook Trigger",
      "type": "webhook",
      "parameters": {
        "path": "surprise-me-request",
        "method": "POST"
      }
    },
    {
      "name": "Get User Preferences",
      "type": "supabase",
      "parameters": {
        "operation": "select",
        "table": "user_surprise_preferences",
        "filters": {
          "user_id": "={{ $json.user_id }}"
        }
      }
    },
    {
      "name": "Get Travel DNA",
      "type": "supabase",
      "parameters": {
        "operation": "select",
        "table": "travel_dna_profiles",
        "filters": {
          "user_id": "={{ $json.user_id }}"
        }
      }
    },
    {
      "name": "AI Experience Curator",
      "type": "openai",
      "parameters": {
        "model": "gpt-4",
        "prompt": "You are Aurelia's luxury experience curator. Based on the member profile, create a personalized surprise experience.\n\nMember Profile:\n- Tier: {{ $json.tier }}\n- Traveler Archetype: {{ $json.traveler_archetype }}\n- Preferred Categories: {{ $json.preferred_categories }}\n- Budget Range: {{ $json.budget_min }} - {{ $json.budget_max }}\n- Exclusions: {{ $json.exclusions }}\n- Past Experiences: {{ $json.past_surprises }}\n\nPackage Requested: {{ $json.package_type }}\nCredits Available: {{ $json.credits_to_spend }}\n\nProvide:\n1. Experience name\n2. Detailed description (luxury language)\n3. What's included\n4. Estimated value\n5. Why this matches their profile\n6. Booking timeline"
      }
    },
    {
      "name": "Search Partner Inventory",
      "type": "supabase",
      "parameters": {
        "operation": "select",
        "table": "partner_services",
        "filters": {
          "category": "in.({{ $json.preferred_categories }})",
          "is_active": "eq.true"
        },
        "limit": 10
      }
    },
    {
      "name": "Create Experience Package",
      "type": "supabase",
      "parameters": {
        "operation": "update",
        "table": "surprise_me_requests",
        "data": {
          "status": "curating",
          "ai_recommendation": "={{ $node['AI Experience Curator'].json }}",
          "matched_services": "={{ $node['Search Partner Inventory'].json }}"
        }
      }
    },
    {
      "name": "Notify Member - Mystery Teaser",
      "type": "send_email",
      "parameters": {
        "to": "={{ $json.email }}",
        "subject": "Something Extraordinary Awaits...",
        "html": "<h1>Your Surprise is Being Crafted</h1><p>Our curators are working on something special, tailored just for you. Expect the unexpected within 48 hours.</p>"
      }
    },
    {
      "name": "Create Concierge Task",
      "type": "supabase",
      "parameters": {
        "operation": "insert",
        "table": "concierge_tasks",
        "data": {
          "type": "surprise_fulfillment",
          "request_id": "={{ $json.id }}",
          "priority": "high",
          "due_date": "={{ $now.plus(48, 'hours').toISO() }}",
          "ai_recommendation": "={{ $node['AI Experience Curator'].json }}"
        }
      }
    }
  ]
}
```

---

## 📋 Workflow 4: Partner Onboarding & Verification

**Trigger:** New partner application

### Workflow Steps:

```json
{
  "name": "Aurelia - Partner Verification Pipeline",
  "nodes": [
    {
      "name": "Webhook Trigger",
      "type": "webhook",
      "parameters": {
        "path": "partner-application",
        "method": "POST"
      }
    },
    {
      "name": "AI Background Check",
      "type": "openai",
      "parameters": {
        "model": "gpt-4",
        "prompt": "Analyze this luxury service provider application:\n\nCompany: {{ $json.company_name }}\nCategory: {{ $json.categories }}\nWebsite: {{ $json.website }}\nDescription: {{ $json.description }}\n\nProvide:\n1. Legitimacy score (1-10)\n2. Luxury market fit score (1-10)\n3. Red flags (if any)\n4. Recommended verification steps\n5. Potential value to Aurelia members"
      }
    },
    {
      "name": "Scrape Website",
      "type": "http_request",
      "parameters": {
        "url": "={{ $json.website }}",
        "method": "GET"
      }
    },
    {
      "name": "Check Business Registry",
      "type": "http_request",
      "parameters": {
        "url": "https://api.company-check.com/verify",
        "method": "POST",
        "body": {
          "company_name": "={{ $json.company_name }}",
          "country": "={{ $json.country }}"
        }
      }
    },
    {
      "name": "Score Application",
      "type": "code",
      "parameters": {
        "code": "const aiScore = $json.legitimacy_score + $json.luxury_fit_score;\nconst hasWebsite = $json.website_status === 200 ? 5 : 0;\nconst isRegistered = $json.business_verified ? 10 : 0;\nreturn { total_score: aiScore + hasWebsite + isRegistered, auto_approve: (aiScore + hasWebsite + isRegistered) >= 25 };"
      }
    },
    {
      "name": "Route by Score",
      "type": "switch",
      "parameters": {
        "conditions": [
          { "value": "={{ $json.auto_approve === true }}", "output": 0 },
          { "value": "={{ $json.total_score >= 15 }}", "output": 1 },
          { "value": "true", "output": 2 }
        ]
      }
    },
    {
      "name": "Auto-Approve Partner",
      "type": "supabase",
      "parameters": {
        "operation": "update",
        "table": "partners",
        "data": {
          "status": "approved",
          "verified_at": "={{ $now.toISO() }}",
          "verification_notes": "Auto-approved by AI verification"
        }
      }
    },
    {
      "name": "Manual Review Queue",
      "type": "supabase",
      "parameters": {
        "operation": "update",
        "table": "partners",
        "data": {
          "status": "pending_review",
          "ai_analysis": "={{ $node['AI Background Check'].json }}"
        }
      }
    },
    {
      "name": "Reject Application",
      "type": "supabase",
      "parameters": {
        "operation": "update",
        "table": "partners",
        "data": {
          "status": "rejected",
          "rejection_reason": "Did not meet quality standards"
        }
      }
    },
    {
      "name": "Send Partner Welcome",
      "type": "send_email",
      "parameters": {
        "to": "={{ $json.email }}",
        "subject": "Welcome to the Aurelia Partner Network",
        "template": "partner-approved"
      }
    }
  ]
}
```

---

## 📋 Workflow 5: Credit & Subscription Management

**Trigger:** Stripe webhook events

### Workflow Steps:

```json
{
  "name": "Aurelia - Subscription & Credits Handler",
  "nodes": [
    {
      "name": "Stripe Webhook",
      "type": "webhook",
      "parameters": {
        "path": "stripe-events",
        "method": "POST"
      }
    },
    {
      "name": "Route by Event Type",
      "type": "switch",
      "parameters": {
        "conditions": [
          { "value": "={{ $json.type === 'customer.subscription.created' }}", "output": 0 },
          { "value": "={{ $json.type === 'customer.subscription.updated' }}", "output": 1 },
          { "value": "={{ $json.type === 'customer.subscription.deleted' }}", "output": 2 },
          { "value": "={{ $json.type === 'invoice.payment_succeeded' }}", "output": 3 },
          { "value": "={{ $json.type === 'invoice.payment_failed' }}", "output": 4 }
        ]
      }
    },
    {
      "name": "New Subscription",
      "type": "supabase",
      "parameters": {
        "operation": "upsert",
        "table": "subscriptions",
        "data": {
          "user_id": "={{ $json.data.object.metadata.user_id }}",
          "stripe_subscription_id": "={{ $json.data.object.id }}",
          "tier": "={{ $json.data.object.metadata.tier }}",
          "status": "active",
          "current_period_end": "={{ $json.data.object.current_period_end }}"
        }
      }
    },
    {
      "name": "Allocate Monthly Credits",
      "type": "supabase",
      "parameters": {
        "operation": "call_function",
        "function": "allocate_monthly_credits",
        "parameters": {
          "user_id": "={{ $json.data.object.metadata.user_id }}",
          "tier": "={{ $json.data.object.metadata.tier }}"
        }
      }
    },
    {
      "name": "Upgrade Celebration",
      "type": "send_email",
      "parameters": {
        "to": "={{ $json.email }}",
        "subject": "Welcome to {{ $json.tier }} - Your New Benefits Await",
        "template": "tier-upgrade"
      }
    },
    {
      "name": "Payment Failed Alert",
      "type": "send_email",
      "parameters": {
        "to": "={{ $json.email }}",
        "subject": "Action Required: Update Your Payment Method",
        "template": "payment-failed"
      }
    },
    {
      "name": "Notify Finance Team",
      "type": "slack",
      "parameters": {
        "channel": "#finance-alerts",
        "message": "⚠️ Payment failed for {{ $json.email }} - Amount: {{ $json.amount_due }}"
      }
    }
  ]
}
```

---

## 📋 Workflow 6: AI Concierge Escalation

**Trigger:** Chat message flagged for human review

### Workflow Steps:

```json
{
  "name": "Aurelia - Concierge Escalation",
  "nodes": [
    {
      "name": "Webhook Trigger",
      "type": "webhook",
      "parameters": {
        "path": "chat-escalation",
        "method": "POST"
      }
    },
    {
      "name": "Get Conversation History",
      "type": "supabase",
      "parameters": {
        "operation": "select",
        "table": "conversation_messages",
        "filters": {
          "conversation_id": "={{ $json.conversation_id }}"
        },
        "order": "created_at.asc",
        "limit": 50
      }
    },
    {
      "name": "AI Summarize Conversation",
      "type": "openai",
      "parameters": {
        "model": "gpt-4",
        "prompt": "Summarize this conversation between a luxury concierge AI and a member. Identify:\n1. Member's primary request\n2. Why escalation was triggered\n3. Sentiment analysis\n4. Recommended next steps\n5. Urgency level\n\nConversation:\n{{ $json.messages }}"
      }
    },
    {
      "name": "Get Member Details",
      "type": "supabase",
      "parameters": {
        "operation": "select",
        "table": "profiles",
        "join": "subscriptions",
        "filters": {
          "user_id": "={{ $json.user_id }}"
        }
      }
    },
    {
      "name": "Route by Tier",
      "type": "switch",
      "parameters": {
        "conditions": [
          { "value": "={{ $json.tier === 'black_card' }}", "output": 0 },
          { "value": "={{ $json.tier === 'prestige' }}", "output": 1 },
          { "value": "true", "output": 2 }
        ]
      }
    },
    {
      "name": "Black Card - Immediate Call",
      "type": "twilio",
      "parameters": {
        "to": "={{ $json.concierge_phone }}",
        "message": "URGENT: Black Card member {{ $json.display_name }} requires immediate assistance. Check Slack for details."
      }
    },
    {
      "name": "Create Escalation Ticket",
      "type": "supabase",
      "parameters": {
        "operation": "insert",
        "table": "escalation_tickets",
        "data": {
          "user_id": "={{ $json.user_id }}",
          "conversation_id": "={{ $json.conversation_id }}",
          "summary": "={{ $node['AI Summarize Conversation'].json }}",
          "priority": "={{ $json.tier === 'black_card' ? 'critical' : 'high' }}",
          "status": "open"
        }
      }
    },
    {
      "name": "Notify Team",
      "type": "slack",
      "parameters": {
        "channel": "#escalations",
        "blocks": [
          {
            "type": "header",
            "text": "🆘 Escalation: {{ $json.tier }} Member"
          },
          {
            "type": "section",
            "text": "**Member:** {{ $json.display_name }}\n**Summary:** {{ $json.summary }}\n**Urgency:** {{ $json.urgency }}"
          },
          {
            "type": "actions",
            "elements": [
              {
                "type": "button",
                "text": "Take Ownership",
                "action_id": "claim_escalation"
              }
            ]
          }
        ]
      }
    }
  ]
}
```

---

## 📋 Workflow 7: Proactive Engagement Engine

**Trigger:** Daily scheduled (9 AM member timezone)

### Workflow Steps:

```json
{
  "name": "Aurelia - Proactive Engagement",
  "nodes": [
    {
      "name": "Schedule Trigger",
      "type": "schedule",
      "parameters": {
        "cron": "0 9 * * *"
      }
    },
    {
      "name": "Get Active Members",
      "type": "supabase",
      "parameters": {
        "operation": "select",
        "table": "profiles",
        "join": "subscriptions",
        "filters": {
          "status": "eq.active"
        }
      }
    },
    {
      "name": "Loop Through Members",
      "type": "splitInBatches",
      "parameters": {
        "batchSize": 10
      }
    },
    {
      "name": "Get Member Activity",
      "type": "supabase",
      "parameters": {
        "operation": "select",
        "table": "analytics_events",
        "filters": {
          "user_id": "={{ $json.user_id }}",
          "created_at": "gte.{{ $now.minus(7, 'days').toISO() }}"
        }
      }
    },
    {
      "name": "Check Engagement Score",
      "type": "code",
      "parameters": {
        "code": "const events = $json.events || [];\nconst loginCount = events.filter(e => e.event_name === 'login').length;\nconst requestCount = events.filter(e => e.event_name === 'service_request').length;\nconst lastActive = events.length > 0 ? new Date(events[events.length-1].created_at) : null;\nconst daysSinceActive = lastActive ? Math.floor((Date.now() - lastActive) / (1000*60*60*24)) : 999;\nreturn { engagement_score: loginCount + (requestCount * 3), days_inactive: daysSinceActive, needs_reengagement: daysSinceActive > 7 };"
      }
    },
    {
      "name": "Route by Engagement",
      "type": "switch",
      "parameters": {
        "conditions": [
          { "value": "={{ $json.needs_reengagement === true }}", "output": 0 },
          { "value": "={{ $json.engagement_score < 5 }}", "output": 1 },
          { "value": "true", "output": 2 }
        ]
      }
    },
    {
      "name": "AI Re-engagement Message",
      "type": "openai",
      "parameters": {
        "model": "gpt-4",
        "prompt": "Write a sophisticated, personalized re-engagement message for Aurelia luxury concierge. The member {{ $json.display_name }} hasn't been active in {{ $json.days_inactive }} days. Their tier is {{ $json.tier }}. Reference their past interests if available: {{ $json.interests }}. Keep it under 100 words, warm but not pushy."
      }
    },
    {
      "name": "Send Re-engagement Email",
      "type": "send_email",
      "parameters": {
        "to": "={{ $json.email }}",
        "subject": "We've Missed You, {{ $json.display_name }}",
        "html": "={{ $node['AI Re-engagement Message'].json.text }}"
      }
    },
    {
      "name": "Get Personalized Recommendations",
      "type": "openai",
      "parameters": {
        "model": "gpt-4",
        "prompt": "Based on member profile, suggest 3 luxury experiences for today:\nTier: {{ $json.tier }}\nLocation: {{ $json.timezone }}\nInterests: {{ $json.interests }}\nSeason: {{ $now.format('MMMM') }}\n\nFormat as JSON array with: title, description, why_now"
      }
    },
    {
      "name": "Create Daily Notification",
      "type": "supabase",
      "parameters": {
        "operation": "insert",
        "table": "notifications",
        "data": {
          "user_id": "={{ $json.user_id }}",
          "type": "recommendation",
          "title": "Today's Curated Experiences",
          "description": "={{ $node['Get Personalized Recommendations'].json[0].title }}",
          "action_url": "/discover"
        }
      }
    }
  ]
}
```

---

## 📋 Workflow 8: Commission & Payout Processing

**Trigger:** Service request completed

### Workflow Steps:

```json
{
  "name": "Aurelia - Commission Processing",
  "nodes": [
    {
      "name": "Webhook Trigger",
      "type": "webhook",
      "parameters": {
        "path": "service-completed",
        "method": "POST"
      }
    },
    {
      "name": "Get Service Details",
      "type": "supabase",
      "parameters": {
        "operation": "select",
        "table": "service_requests",
        "join": "partners",
        "filters": {
          "id": "={{ $json.request_id }}"
        }
      }
    },
    {
      "name": "Calculate Commission",
      "type": "code",
      "parameters": {
        "code": "const booking_amount = $json.final_amount || 0;\nconst commission_rate = $json.partner_commission_rate || 0.15;\nconst commission = booking_amount * commission_rate;\nconst aurelia_fee = commission * 0.20; // Aurelia takes 20% of commission\nconst partner_payout = commission - aurelia_fee;\nreturn { commission, aurelia_fee, partner_payout };"
      }
    },
    {
      "name": "Create Commission Record",
      "type": "supabase",
      "parameters": {
        "operation": "insert",
        "table": "partner_commissions",
        "data": {
          "partner_id": "={{ $json.partner_id }}",
          "service_request_id": "={{ $json.request_id }}",
          "booking_amount": "={{ $json.final_amount }}",
          "commission_amount": "={{ $json.partner_payout }}",
          "commission_rate": "={{ $json.commission_rate }}",
          "status": "pending"
        }
      }
    },
    {
      "name": "Check Payout Threshold",
      "type": "supabase",
      "parameters": {
        "operation": "select",
        "table": "partner_commissions",
        "filters": {
          "partner_id": "={{ $json.partner_id }}",
          "status": "eq.pending"
        },
        "aggregate": "sum(commission_amount)"
      }
    },
    {
      "name": "Route by Threshold",
      "type": "switch",
      "parameters": {
        "conditions": [
          { "value": "={{ $json.total_pending >= 500 }}", "output": 0 },
          { "value": "true", "output": 1 }
        ]
      }
    },
    {
      "name": "Initiate Stripe Payout",
      "type": "http_request",
      "parameters": {
        "url": "https://api.stripe.com/v1/transfers",
        "method": "POST",
        "headers": {
          "Authorization": "Bearer {{ $env.STRIPE_SECRET_KEY }}"
        },
        "body": {
          "amount": "={{ Math.round($json.total_pending * 100) }}",
          "currency": "usd",
          "destination": "={{ $json.stripe_account_id }}",
          "metadata": {
            "partner_id": "={{ $json.partner_id }}"
          }
        }
      }
    },
    {
      "name": "Update Commission Status",
      "type": "supabase",
      "parameters": {
        "operation": "update",
        "table": "partner_commissions",
        "data": {
          "status": "paid",
          "paid_at": "={{ $now.toISO() }}",
          "stripe_transfer_id": "={{ $json.transfer_id }}"
        },
        "filters": {
          "partner_id": "={{ $json.partner_id }}",
          "status": "eq.pending"
        }
      }
    },
    {
      "name": "Notify Partner",
      "type": "send_email",
      "parameters": {
        "to": "={{ $json.partner_email }}",
        "subject": "Payout Processed - ${{ $json.total_pending }}",
        "template": "partner-payout"
      }
    }
  ]
}
```

---

## 📋 Workflow 9: Real-time Alerts & Monitoring

**Trigger:** System events

### Workflow Steps:

```json
{
  "name": "Aurelia - System Monitoring",
  "nodes": [
    {
      "name": "Schedule Trigger",
      "type": "schedule",
      "parameters": {
        "cron": "*/5 * * * *"
      }
    },
    {
      "name": "Check Pending Requests",
      "type": "supabase",
      "parameters": {
        "operation": "select",
        "table": "service_requests",
        "filters": {
          "status": "eq.pending",
          "created_at": "lt.{{ $now.minus(4, 'hours').toISO() }}"
        }
      }
    },
    {
      "name": "Check Failed Payments",
      "type": "supabase",
      "parameters": {
        "operation": "select",
        "table": "subscriptions",
        "filters": {
          "status": "eq.past_due"
        }
      }
    },
    {
      "name": "Check Expiring Subscriptions",
      "type": "supabase",
      "parameters": {
        "operation": "select",
        "table": "subscriptions",
        "filters": {
          "current_period_end": "lt.{{ $now.plus(3, 'days').toISO() }}",
          "status": "eq.active"
        }
      }
    },
    {
      "name": "Aggregate Alerts",
      "type": "code",
      "parameters": {
        "code": "return {\n  stale_requests: $node['Check Pending Requests'].json.length,\n  failed_payments: $node['Check Failed Payments'].json.length,\n  expiring_soon: $node['Check Expiring Subscriptions'].json.length,\n  has_issues: $node['Check Pending Requests'].json.length > 0 || $node['Check Failed Payments'].json.length > 0\n};"
      }
    },
    {
      "name": "Route if Issues",
      "type": "if",
      "parameters": {
        "conditions": [
          { "value": "={{ $json.has_issues === true }}" }
        ]
      }
    },
    {
      "name": "Send Alert",
      "type": "slack",
      "parameters": {
        "channel": "#ops-alerts",
        "blocks": [
          {
            "type": "header",
            "text": "⚠️ Aurelia System Alert"
          },
          {
            "type": "section",
            "text": "**Stale Requests:** {{ $json.stale_requests }}\n**Failed Payments:** {{ $json.failed_payments }}\n**Expiring Subscriptions:** {{ $json.expiring_soon }}"
          }
        ]
      }
    }
  ]
}
```

---

## 📋 Workflow 10: Referral & Rewards Processing

**Trigger:** New referral signup

### Workflow Steps:

```json
{
  "name": "Aurelia - Referral Rewards",
  "nodes": [
    {
      "name": "Webhook Trigger",
      "type": "webhook",
      "parameters": {
        "path": "referral-signup",
        "method": "POST"
      }
    },
    {
      "name": "Validate Referral Code",
      "type": "supabase",
      "parameters": {
        "operation": "select",
        "table": "referral_codes",
        "filters": {
          "code": "={{ $json.referral_code }}",
          "is_active": "eq.true"
        }
      }
    },
    {
      "name": "Check if Valid",
      "type": "if",
      "parameters": {
        "conditions": [
          { "value": "={{ $json.length > 0 }}" }
        ]
      }
    },
    {
      "name": "Get Referrer Details",
      "type": "supabase",
      "parameters": {
        "operation": "select",
        "table": "profiles",
        "filters": {
          "user_id": "={{ $json[0].user_id }}"
        }
      }
    },
    {
      "name": "Create Referral Record",
      "type": "supabase",
      "parameters": {
        "operation": "insert",
        "table": "referrals",
        "data": {
          "referrer_id": "={{ $json.referrer_id }}",
          "referred_id": "={{ $json.new_user_id }}",
          "referral_code": "={{ $json.referral_code }}",
          "status": "pending"
        }
      }
    },
    {
      "name": "Wait for Subscription",
      "type": "wait",
      "parameters": {
        "resume": "webhook",
        "webhookPath": "referral-converted-{{ $json.referral_id }}"
      }
    },
    {
      "name": "Award Referrer Credits",
      "type": "supabase",
      "parameters": {
        "operation": "call_function",
        "function": "add_credits",
        "parameters": {
          "user_id": "={{ $json.referrer_id }}",
          "amount": 50,
          "reason": "Referral reward"
        }
      }
    },
    {
      "name": "Award Referee Credits",
      "type": "supabase",
      "parameters": {
        "operation": "call_function",
        "function": "add_credits",
        "parameters": {
          "user_id": "={{ $json.referred_id }}",
          "amount": 25,
          "reason": "Welcome referral bonus"
        }
      }
    },
    {
      "name": "Update Referral Status",
      "type": "supabase",
      "parameters": {
        "operation": "update",
        "table": "referrals",
        "data": {
          "status": "completed",
          "converted_at": "={{ $now.toISO() }}"
        }
      }
    },
    {
      "name": "Notify Referrer",
      "type": "send_email",
      "parameters": {
        "to": "={{ $json.referrer_email }}",
        "subject": "🎉 Your Referral Just Joined Aurelia!",
        "template": "referral-success"
      }
    },
    {
      "name": "Check Milestone",
      "type": "supabase",
      "parameters": {
        "operation": "select",
        "table": "referrals",
        "filters": {
          "referrer_id": "={{ $json.referrer_id }}",
          "status": "eq.completed"
        },
        "aggregate": "count"
      }
    },
    {
      "name": "Award Milestone Bonus",
      "type": "if",
      "parameters": {
        "conditions": [
          { "value": "={{ $json.count === 5 }}" }
        ]
      }
    },
    {
      "name": "Grant Tier Upgrade",
      "type": "supabase",
      "parameters": {
        "operation": "update",
        "table": "subscriptions",
        "data": {
          "tier": "prestige",
          "upgrade_reason": "Referral milestone - 5 successful referrals"
        }
      }
    }
  ]
}
```

---

## 🔧 Setup Instructions

### 1. Create Webhook Endpoints

In your Supabase Edge Functions, create webhook handlers:

```typescript
// supabase/functions/n8n-webhook/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const N8N_WEBHOOK_URL = Deno.env.get("N8N_WEBHOOK_URL");

serve(async (req) => {
  const { event, data } = await req.json();
  
  await fetch(`${N8N_WEBHOOK_URL}/${event}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  
  return new Response(JSON.stringify({ success: true }));
});
```

### 2. Configure Database Triggers

```sql
-- Trigger for new service requests
CREATE OR REPLACE FUNCTION notify_n8n_service_request()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM net.http_post(
    url := current_setting('app.n8n_webhook_url') || '/service-request',
    body := row_to_json(NEW)::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER service_request_notify
AFTER INSERT ON service_requests
FOR EACH ROW EXECUTE FUNCTION notify_n8n_service_request();
```

### 3. Environment Variables

Add to your n8n instance:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
STRIPE_SECRET_KEY=sk_live_xxx
OPENAI_API_KEY=sk-xxx
SLACK_WEBHOOK_URL=https://hooks.slack.com/xxx
TWILIO_ACCOUNT_SID=xxx
TWILIO_AUTH_TOKEN=xxx
SENDGRID_API_KEY=SG.xxx
```

---

## 📊 Monitoring Dashboard

Create a monitoring workflow that aggregates:

- Active workflows status
- Error rates per workflow
- Average execution time
- Queue depths
- API rate limit usage

---

## 🔒 Security Considerations

1. **Webhook Authentication**: Use HMAC signatures
2. **Rate Limiting**: Implement per-workflow limits
3. **Data Encryption**: Encrypt sensitive payload data
4. **Audit Logging**: Log all workflow executions
5. **Error Handling**: Implement retry logic with exponential backoff

---

## 📈 Scaling Tips

1. Use batch processing for high-volume operations
2. Implement queue-based workflows for reliability
3. Use caching for frequently accessed data
4. Set up separate n8n instances for production/staging
5. Monitor memory usage and optimize large payloads

---

*Last Updated: January 2026*
*Version: 1.0*
*Author: Aurelia Development Team*
