import { motion } from "framer-motion";
import { 
  LayoutDashboard, Users, MessageSquare, Clock, Search, 
  Bot, Settings, TrendingUp, Shield, Bell, FileText,
  Zap, Target, BarChart3, Mail, Globe, Database,
  CheckCircle, ArrowRight, BookOpen, HelpCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import SEOHead from "@/components/SEOHead";

const sections = [
  {
    id: "overview",
    title: "Dashboard Overview",
    icon: LayoutDashboard,
    description: "Your command center for platform operations",
    color: "text-primary",
    content: [
      {
        title: "Analytics Dashboard",
        details: "View real-time KPIs including total revenue, active members, pending requests, and partner payouts. Charts show revenue trends, membership growth, and request categories.",
        path: "/admin?tab=analytics"
      },
      {
        title: "Quick Stats",
        details: "At-a-glance metrics updated in real-time from your Supabase database. Includes month-over-month comparisons and performance indicators.",
        path: "/admin"
      }
    ]
  },
  {
    id: "partners",
    title: "Partner Management",
    icon: Users,
    description: "Manage your luxury partner network",
    color: "text-blue-500",
    content: [
      {
        title: "Partner Directory",
        details: "View all approved partners with their company details, contact information, categories, and performance metrics. Filter by category or status.",
        path: "/admin?tab=partners"
      },
      {
        title: "Partner Applications",
        details: "Review new partner applications. Each application includes company details, experience, notable clients, and coverage regions. Approve or reject with notes.",
        path: "/admin?tab=partners"
      },
      {
        title: "AI Vetting",
        details: "Run automated AI vetting on partner applications. The system checks website legitimacy, fraud indicators, category alignment, and contact verification.",
        path: "/admin?tab=partners"
      },
      {
        title: "Commission Tracking",
        details: "Monitor partner commissions, process Stripe Connect payouts, and track payment history. Supports batch payouts and CSV export.",
        path: "/admin?tab=commissions"
      }
    ]
  },
  {
    id: "discovery",
    title: "Auto Discovery",
    icon: Search,
    description: "AI-powered lead discovery engine",
    color: "text-purple-500",
    content: [
      {
        title: "Run Discovery",
        details: "Trigger the auto-discover function to find potential luxury partners across categories: Hotels, Jets, Yachts, Fine Dining, VIP Events, Wellness, and Experiences.",
        path: "/admin?tab=autodiscovery"
      },
      {
        title: "Category Filters",
        details: "Filter discovery by specific categories. Select one or multiple categories to focus your partner acquisition efforts.",
        path: "/admin?tab=autodiscovery"
      },
      {
        title: "Discovery Modes",
        details: "Choose between 'Both' (partners + users), 'Partners Only', or 'Users Only' to control what type of leads are discovered.",
        path: "/admin?tab=autodiscovery"
      },
      {
        title: "Dry Run",
        details: "Enable dry run mode to preview discovery results without saving to the database. Useful for testing filters.",
        path: "/admin?tab=autodiscovery"
      },
      {
        title: "Discovery Logs",
        details: "View historical discovery runs with success/failure status, partners found, and any error messages.",
        path: "/admin?tab=autodiscovery"
      }
    ]
  },
  {
    id: "messages",
    title: "Partner Messages",
    icon: MessageSquare,
    description: "Two-way communication with partners",
    color: "text-green-500",
    content: [
      {
        title: "Message Inbox",
        details: "View all messages from partners. Messages are linked to their related service requests when applicable.",
        path: "/admin?tab=messages"
      },
      {
        title: "Read/Unread Filters",
        details: "Filter messages by status (All, Read, Unread) to prioritize responses. Unread count shown in tab badge.",
        path: "/admin?tab=messages"
      },
      {
        title: "Reply to Partners",
        details: "Click any message to open the reply dialog. Your responses are sent directly to the partner.",
        path: "/admin?tab=messages"
      }
    ]
  },
  {
    id: "waitlist",
    title: "Waitlist Management",
    icon: Clock,
    description: "Manage partner and member waitlists",
    color: "text-orange-500",
    content: [
      {
        title: "Partner Waitlist",
        details: "View partners waiting for approval. Each entry triggers an admin notification email to keep you informed.",
        path: "/admin?tab=waitlist"
      },
      {
        title: "Launch Signups",
        details: "Track newsletter and waitlist signups with source attribution (website, referral, campaign).",
        path: "/admin?tab=waitlist"
      }
    ]
  },
  {
    id: "concierge",
    title: "Concierge Requests",
    icon: Bell,
    description: "Handle member service requests",
    color: "text-pink-500",
    content: [
      {
        title: "Request Queue",
        details: "View all concierge requests sorted by priority and status. Filter by category (Travel, Dining, Events, etc.).",
        path: "/admin?tab=concierge"
      },
      {
        title: "Request Details",
        details: "Each request shows client info, description, budget range, preferred dates, and location requirements.",
        path: "/admin?tab=concierge"
      },
      {
        title: "Response Management",
        details: "Respond to requests with internal notes (visible only to admins) and client-facing responses.",
        path: "/admin?tab=concierge"
      },
      {
        title: "Status Updates",
        details: "Update request status: New → In Progress → Pending Response → Completed → Cancelled.",
        path: "/admin?tab=concierge"
      }
    ]
  },
  {
    id: "automation",
    title: "Automation Hub",
    icon: Zap,
    description: "n8n workflows and integrations",
    color: "text-yellow-500",
    content: [
      {
        title: "n8n Workflows",
        details: "Configure webhook URLs for automated workflows. Categories include Lead Processing, Partner Onboarding, Notifications, and Data Sync.",
        path: "/admin?tab=automation"
      },
      {
        title: "Webhook Testing",
        details: "Test individual workflows with sample payloads. View response times and success/failure status.",
        path: "/admin?tab=automation"
      },
      {
        title: "Contact Automation",
        details: "Monitor automated responses to contact form submissions including auto-responses, admin alerts, and webhook triggers.",
        path: "/admin?tab=automation"
      },
      {
        title: "Apollo.io Integration",
        details: "Manage allowed domains for Apollo.io visitor tracking. Configure up to 5 domains.",
        path: "/admin?tab=automation"
      }
    ]
  },
  {
    id: "analytics",
    title: "Analytics & Reporting",
    icon: BarChart3,
    description: "Deep insights into platform performance",
    color: "text-cyan-500",
    content: [
      {
        title: "Funnel Analytics",
        details: "Track visitor journey from landing → signup → trial → conversion. View drop-off rates at each stage.",
        path: "/admin?tab=funnel"
      },
      {
        title: "Behavior Analytics",
        details: "Real-time page views, click heatmaps, session data, and live visitor counts.",
        path: "/admin?tab=behavior"
      },
      {
        title: "Attribution Analytics",
        details: "See which sources, mediums, and campaigns drive the most conversions. Date range filters available.",
        path: "/admin?tab=attribution"
      },
      {
        title: "Campaign Analytics",
        details: "Track UTM campaign performance with ready-to-use campaign URLs for marketing.",
        path: "/admin?tab=campaigns"
      }
    ]
  },
  {
    id: "content",
    title: "Content Management",
    icon: FileText,
    description: "Blog posts and SEO content",
    color: "text-indigo-500",
    content: [
      {
        title: "Content Generator",
        details: "AI-powered blog post generation. Select keywords and tone, then generate SEO-optimized content.",
        path: "/admin?tab=content"
      },
      {
        title: "Blog Management",
        details: "View, edit, publish, or delete blog posts. Track post status (Draft, Review, Published, Archived).",
        path: "/admin?tab=content"
      },
      {
        title: "Backlink Strategy",
        details: "Manage backlink opportunities with pitch templates and article ideas. Track outreach status.",
        path: "/admin?tab=backlinks"
      }
    ]
  },
  {
    id: "system",
    title: "System & Security",
    icon: Shield,
    description: "Monitoring, logs, and security",
    color: "text-red-500",
    content: [
      {
        title: "System Health",
        details: "Unified status dashboard showing runtime health, infrastructure status, and diagnostic tools.",
        path: "/admin?tab=status"
      },
      {
        title: "Audit Logs",
        details: "View all admin actions with timestamps, user IDs, and action details. Export to CSV.",
        path: "/admin?tab=audit"
      },
      {
        title: "Monitoring Dashboard",
        details: "Track uptime, response times, error rates, and active incidents.",
        path: "/admin?tab=monitoring"
      },
      {
        title: "Broadcast Notifications",
        details: "Send system-wide notifications to all members. Option to include email delivery.",
        path: "/admin?tab=notifications"
      }
    ]
  }
];

const quickTips = [
  "Use the Refresh button on any panel to get the latest data",
  "Most tables support search and status filtering",
  "Click on any row to view detailed information",
  "Admin actions are logged in the Audit Logs tab",
  "Enable email notifications for critical alerts",
  "Use dry run mode when testing automations",
  "Export data to CSV for external reporting"
];

export default function AdminGuide() {
  const navigate = useNavigate();

  return (
    <>
      <SEOHead 
        title="Admin Portal Guide | Aurelia"
        description="Complete guide to using the Aurelia admin portal"
      />
      
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b">
          <div className="container mx-auto px-4 py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl"
            >
              <Badge variant="outline" className="mb-4">
                <BookOpen className="h-3 w-3 mr-1" />
                Documentation
              </Badge>
              <h1 className="text-4xl font-bold text-foreground mb-4">
                Admin Portal Guide
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                Your complete reference for managing the Aurelia platform. Learn how to use 
                each feature of the admin dashboard effectively.
              </p>
              <div className="flex gap-3">
                <Button onClick={() => navigate("/admin")}>
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Go to Admin Portal
                </Button>
                <Button variant="outline" onClick={() => navigate("/guide")}>
                  <HelpCircle className="h-4 w-4 mr-2" />
                  General Help
                </Button>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Quick Navigation</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ScrollArea className="h-[60vh]">
                    <nav className="space-y-1">
                      {sections.map((section) => (
                        <a
                          key={section.id}
                          href={`#${section.id}`}
                          className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors"
                        >
                          <section.icon className={`h-4 w-4 ${section.color}`} />
                          <span>{section.title}</span>
                        </a>
                      ))}
                    </nav>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">
              {/* Quick Tips */}
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Zap className="h-5 w-5 text-primary" />
                    Quick Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {quickTips.map((tip, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">{tip}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Sections */}
              {sections.map((section, index) => (
                <motion.div
                  key={section.id}
                  id={section.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-muted ${section.color}`}>
                          <section.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle>{section.title}</CardTitle>
                          <CardDescription>{section.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible className="w-full">
                        {section.content.map((item, i) => (
                          <AccordionItem key={i} value={`${section.id}-${i}`}>
                            <AccordionTrigger className="text-left">
                              <span className="font-medium">{item.title}</span>
                            </AccordionTrigger>
                            <AccordionContent>
                              <p className="text-muted-foreground mb-3">
                                {item.details}
                              </p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(item.path)}
                              >
                                Open in Admin
                                <ArrowRight className="h-3 w-3 ml-2" />
                              </Button>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}

              {/* Access Requirements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-red-500" />
                    Access Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    The admin portal is restricted to users with the <Badge>admin</Badge> role. 
                    Access is verified through the <code className="text-xs bg-muted px-1 py-0.5 rounded">user_roles</code> table 
                    in the database.
                  </p>
                  <Separator />
                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-medium mb-2">Admin Capabilities</h4>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• View all member data and requests</li>
                        <li>• Manage partner approvals</li>
                        <li>• Process commission payouts</li>
                        <li>• Configure automations</li>
                        <li>• Access all analytics</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Security Notes</h4>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• All actions are logged in audit trail</li>
                        <li>• Role verification happens server-side</li>
                        <li>• Session timeout after inactivity</li>
                        <li>• Sensitive data encrypted at rest</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Need Help */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold mb-1">Need Additional Help?</h3>
                      <p className="text-sm text-muted-foreground">
                        Contact the development team for technical support or feature requests.
                      </p>
                    </div>
                    <Button variant="outline" asChild>
                      <a href="mailto:tyrone.mitchell76@gotmail.com">
                        <Mail className="h-4 w-4 mr-2" />
                        Contact Support
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
