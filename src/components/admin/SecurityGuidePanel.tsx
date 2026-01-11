import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Shield, 
  Lock, 
  Key, 
  AlertTriangle, 
  CheckCircle,
  Copy,
  Check,
  Code,
  Database,
  Users,
  FileText
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";
import { SECURITY_GUIDE, SECURITY_CHECKLIST } from "@/lib/security-guide";

const categoryIcons: Record<string, React.ElementType> = {
  authentication: Users,
  rls: Database,
  secrets: Key,
  inputValidation: FileText,
  rateLimiting: AlertTriangle,
  auditLogging: Shield,
};

const SecurityGuidePanel = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [checklistItems, setChecklistItems] = useState<Record<string, boolean>>({});

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Code copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleChecklist = (item: string) => {
    setChecklistItems(prev => ({
      ...prev,
      [item]: !prev[item],
    }));
  };

  const completedCount = Object.values(checklistItems).filter(Boolean).length;
  const totalCritical = SECURITY_CHECKLIST.filter(i => i.critical).length;
  const completedCritical = SECURITY_CHECKLIST.filter(
    i => i.critical && checklistItems[i.item]
  ).length;

  return (
    <div className="space-y-6">
      {/* Security Score */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className={completedCritical === totalCritical ? "border-green-500/50" : "border-yellow-500/50"}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className={`w-5 h-5 ${completedCritical === totalCritical ? "text-green-500" : "text-yellow-500"}`} />
              <span className="text-sm text-muted-foreground">Security Score</span>
            </div>
            <p className="text-3xl font-bold">
              {Math.round((completedCount / SECURITY_CHECKLIST.length) * 100)}%
            </p>
            <p className="text-xs text-muted-foreground">
              {completedCount} of {SECURITY_CHECKLIST.length} items completed
            </p>
          </CardContent>
        </Card>

        <Card className={completedCritical === totalCritical ? "border-green-500/50" : "border-red-500/50"}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className={`w-5 h-5 ${completedCritical === totalCritical ? "text-green-500" : "text-red-500"}`} />
              <span className="text-sm text-muted-foreground">Critical Items</span>
            </div>
            <p className="text-3xl font-bold">
              {completedCritical}/{totalCritical}
            </p>
            <p className="text-xs text-muted-foreground">
              {completedCritical === totalCritical ? "All critical items complete" : "Action required"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Best Practices</span>
            </div>
            <p className="text-3xl font-bold">
              {Object.keys(SECURITY_GUIDE).length}
            </p>
            <p className="text-xs text-muted-foreground">
              Security categories documented
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="guide" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="guide">Security Guide</TabsTrigger>
          <TabsTrigger value="checklist">Implementation Checklist</TabsTrigger>
        </TabsList>

        <TabsContent value="guide" className="space-y-4">
          {Object.entries(SECURITY_GUIDE).map(([key, section]) => {
            const Icon = categoryIcons[key] || Shield;
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon className="w-5 h-5 text-primary" />
                      {section.title}
                    </CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {section.bestPractices.map((practice, index) => (
                        <AccordionItem key={index} value={`${key}-${index}`}>
                          <AccordionTrigger className="text-left">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              {practice.name}
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-4">
                              <p className="text-muted-foreground">
                                {practice.description}
                              </p>
                              <div className="relative">
                                <pre className="p-4 bg-muted rounded-lg overflow-x-auto text-sm">
                                  <code>{practice.example.trim()}</code>
                                </pre>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="absolute top-2 right-2"
                                  onClick={() => handleCopy(practice.example.trim(), `${key}-${index}`)}
                                >
                                  {copiedId === `${key}-${index}` ? (
                                    <Check className="w-4 h-4" />
                                  ) : (
                                    <Copy className="w-4 h-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </TabsContent>

        <TabsContent value="checklist" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                Security Implementation Checklist
              </CardTitle>
              <CardDescription>
                Track your security implementation progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Array.from(new Set(SECURITY_CHECKLIST.map(i => i.category))).map(category => (
                  <div key={category}>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      {category}
                    </h4>
                    <div className="space-y-2">
                      {SECURITY_CHECKLIST.filter(i => i.category === category).map((item, index) => (
                        <motion.div
                          key={item.item}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                            checklistItems[item.item] 
                              ? "bg-green-500/10 border-green-500/30" 
                              : "hover:bg-muted/50"
                          }`}
                          onClick={() => toggleChecklist(item.item)}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              checklistItems[item.item]
                                ? "bg-green-500 border-green-500"
                                : "border-muted-foreground"
                            }`}>
                              {checklistItems[item.item] && (
                                <Check className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <span className={checklistItems[item.item] ? "line-through text-muted-foreground" : ""}>
                              {item.item}
                            </span>
                          </div>
                          {item.critical && (
                            <Badge variant={checklistItems[item.item] ? "secondary" : "destructive"}>
                              Critical
                            </Badge>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityGuidePanel;
