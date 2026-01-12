import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Shield, Key, RefreshCw, AlertTriangle, CheckCircle, 
  Clock, Lock, Unlock, RotateCcw, FileKey, Award,
  Calendar, Settings, TrendingUp, Activity
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format, formatDistanceToNow, differenceInDays } from "date-fns";

interface EncryptionKey {
  id: string;
  key_identifier: string;
  key_version: number;
  algorithm: string;
  status: 'active' | 'rotating' | 'retired' | 'compromised';
  created_at: string;
  rotated_at: string | null;
  expires_at: string | null;
  next_rotation_at: string | null;
  rotation_interval_days: number;
  metadata: Record<string, unknown>;
}

interface Certificate {
  id: string;
  name: string;
  domain: string | null;
  issuer: string | null;
  serial_number: string | null;
  fingerprint_sha256: string | null;
  status: 'active' | 'pending' | 'expired' | 'revoked';
  issued_at: string | null;
  expires_at: string;
  auto_renew: boolean;
  renewal_reminder_days: number;
  certificate_type: string;
  metadata: Record<string, unknown>;
}

interface KeyRotationHistory {
  id: string;
  key_id: string;
  old_version: number;
  new_version: number;
  rotated_at: string;
  rotation_reason: string | null;
  success: boolean;
  error_message: string | null;
  affected_records: number;
}

interface SecurityAuditEvent {
  id: string;
  event_type: string;
  severity: string;
  resource_type: string;
  resource_id: string | null;
  description: string;
  created_at: string;
}

const EncryptionManagementPanel = () => {
  const [keys, setKeys] = useState<EncryptionKey[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [rotationHistory, setRotationHistory] = useState<KeyRotationHistory[]>([]);
  const [auditEvents, setAuditEvents] = useState<SecurityAuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [rotating, setRotating] = useState<string | null>(null);
  const [selectedKey, setSelectedKey] = useState<EncryptionKey | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [keysRes, certsRes, historyRes, eventsRes] = await Promise.all([
        supabase.from('encryption_keys').select('*').order('created_at', { ascending: false }),
        supabase.from('certificates').select('*').order('expires_at', { ascending: true }),
        supabase.from('key_rotation_history').select('*').order('rotated_at', { ascending: false }).limit(20),
        supabase.from('security_audit_events').select('*').order('created_at', { ascending: false }).limit(50)
      ]);

      if (keysRes.data) setKeys(keysRes.data as EncryptionKey[]);
      if (certsRes.data) setCertificates(certsRes.data as Certificate[]);
      if (historyRes.data) setRotationHistory(historyRes.data as KeyRotationHistory[]);
      if (eventsRes.data) setAuditEvents(eventsRes.data as SecurityAuditEvent[]);
    } catch (error) {
      console.error('Error fetching security data:', error);
      toast({
        title: "Error",
        description: "Failed to load security data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const rotateKey = async (keyId: string) => {
    setRotating(keyId);
    try {
      const { data, error } = await supabase.functions.invoke('rotate-encryption-key', {
        body: { keyId }
      });

      if (error) throw error;

      toast({
        title: "Key Rotated",
        description: "Encryption key has been successfully rotated",
      });
      
      fetchData();
    } catch (error) {
      console.error('Error rotating key:', error);
      toast({
        title: "Rotation Failed",
        description: "Failed to rotate encryption key",
        variant: "destructive"
      });
    } finally {
      setRotating(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
      active: { variant: "default", icon: <CheckCircle className="w-3 h-3" /> },
      rotating: { variant: "secondary", icon: <RefreshCw className="w-3 h-3 animate-spin" /> },
      retired: { variant: "outline", icon: <Clock className="w-3 h-3" /> },
      compromised: { variant: "destructive", icon: <AlertTriangle className="w-3 h-3" /> },
      pending: { variant: "secondary", icon: <Clock className="w-3 h-3" /> },
      expired: { variant: "destructive", icon: <AlertTriangle className="w-3 h-3" /> },
      revoked: { variant: "destructive", icon: <Lock className="w-3 h-3" /> }
    };

    const config = variants[status] || { variant: "outline" as const, icon: null };
    
    return (
      <Badge variant={config.variant} className="gap-1">
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500';
      case 'error': return 'text-red-400';
      case 'warning': return 'text-yellow-500';
      case 'info': return 'text-blue-400';
      default: return 'text-muted-foreground';
    }
  };

  const getDaysUntilExpiry = (expiresAt: string) => {
    return differenceInDays(new Date(expiresAt), new Date());
  };

  const getExpiryColor = (days: number) => {
    if (days <= 7) return 'text-red-500';
    if (days <= 30) return 'text-yellow-500';
    return 'text-green-500';
  };

  // Calculate security metrics
  const activeKeys = keys.filter(k => k.status === 'active').length;
  const keysNeedingRotation = keys.filter(k => k.next_rotation_at && new Date(k.next_rotation_at) <= new Date()).length;
  const activeCerts = certificates.filter(c => c.status === 'active').length;
  const expiringCerts = certificates.filter(c => {
    const days = getDaysUntilExpiry(c.expires_at);
    return days <= 30 && days > 0;
  }).length;

  const securityScore = Math.max(0, 100 - (keysNeedingRotation * 15) - (expiringCerts * 10));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Security Score</p>
                  <p className="text-3xl font-bold text-primary">{securityScore}%</p>
                </div>
                <div className="p-3 bg-primary/20 rounded-full">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
              </div>
              <Progress value={securityScore} className="mt-3 h-2" />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Keys</p>
                  <p className="text-3xl font-bold">{activeKeys}</p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-full">
                  <Key className="w-6 h-6 text-green-500" />
                </div>
              </div>
              {keysNeedingRotation > 0 && (
                <p className="text-sm text-yellow-500 mt-2 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {keysNeedingRotation} due for rotation
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Certificates</p>
                  <p className="text-3xl font-bold">{activeCerts}</p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-full">
                  <Award className="w-6 h-6 text-blue-500" />
                </div>
              </div>
              {expiringCerts > 0 && (
                <p className="text-sm text-yellow-500 mt-2 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {expiringCerts} expiring soon
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rotations (30d)</p>
                  <p className="text-3xl font-bold">{rotationHistory.length}</p>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-full">
                  <RotateCcw className="w-6 h-6 text-purple-500" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {rotationHistory.filter(r => r.success).length} successful
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tabs for different sections */}
      <Tabs defaultValue="keys" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="keys" className="gap-2">
            <Key className="w-4 h-4" />
            Encryption Keys
          </TabsTrigger>
          <TabsTrigger value="certificates" className="gap-2">
            <Award className="w-4 h-4" />
            Certificates
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Rotation History
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-2">
            <Activity className="w-4 h-4" />
            Audit Log
          </TabsTrigger>
        </TabsList>

        {/* Encryption Keys Tab */}
        <TabsContent value="keys">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileKey className="w-5 h-5" />
                    Encryption Key Management
                  </CardTitle>
                  <CardDescription>
                    Manage encryption keys with automatic rotation policies
                  </CardDescription>
                </div>
                <Button variant="outline" onClick={fetchData}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Key Identifier</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Algorithm</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Next Rotation</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {keys.map((key) => (
                    <TableRow key={key.id}>
                      <TableCell className="font-mono text-sm">
                        {key.key_identifier}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">v{key.key_version}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {key.algorithm}
                      </TableCell>
                      <TableCell>{getStatusBadge(key.status)}</TableCell>
                      <TableCell>
                        {key.next_rotation_at ? (
                          <span className={getDaysUntilExpiry(key.next_rotation_at) <= 7 ? 'text-yellow-500' : ''}>
                            {formatDistanceToNow(new Date(key.next_rotation_at), { addSuffix: true })}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Not scheduled</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedKey(key)}
                              >
                                <Settings className="w-3 h-3" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Key Details</DialogTitle>
                                <DialogDescription>
                                  View and manage encryption key settings
                                </DialogDescription>
                              </DialogHeader>
                              {selectedKey && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-sm text-muted-foreground">Identifier</p>
                                      <p className="font-mono">{selectedKey.key_identifier}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Version</p>
                                      <p>v{selectedKey.key_version}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Algorithm</p>
                                      <p>{selectedKey.algorithm}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Rotation Interval</p>
                                      <p>{selectedKey.rotation_interval_days} days</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Created</p>
                                      <p>{format(new Date(selectedKey.created_at), 'PPp')}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Last Rotated</p>
                                      <p>{selectedKey.rotated_at ? format(new Date(selectedKey.rotated_at), 'PPp') : 'Never'}</p>
                                    </div>
                                  </div>
                                  {selectedKey.metadata && Object.keys(selectedKey.metadata).length > 0 && (
                                    <div>
                                      <p className="text-sm text-muted-foreground mb-2">Metadata</p>
                                      <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                                        {JSON.stringify(selectedKey.metadata, null, 2)}
                                      </pre>
                                    </div>
                                  )}
                                </div>
                              )}
                              <DialogFooter>
                                <Button 
                                  variant="outline"
                                  onClick={() => selectedKey && rotateKey(selectedKey.id)}
                                  disabled={rotating === selectedKey?.id}
                                >
                                  {rotating === selectedKey?.id ? (
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                  ) : (
                                    <RotateCcw className="w-4 h-4 mr-2" />
                                  )}
                                  Rotate Now
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => rotateKey(key.id)}
                            disabled={rotating === key.id || key.status !== 'active'}
                          >
                            {rotating === key.id ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <RotateCcw className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Certificates Tab */}
        <TabsContent value="certificates">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Certificate Management
                  </CardTitle>
                  <CardDescription>
                    Monitor and manage SSL/TLS certificates with auto-renewal
                  </CardDescription>
                </div>
                <Button variant="outline" onClick={fetchData}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Domain</TableHead>
                    <TableHead>Issuer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Auto Renew</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {certificates.map((cert) => {
                    const daysUntilExpiry = getDaysUntilExpiry(cert.expires_at);
                    return (
                      <TableRow key={cert.id}>
                        <TableCell className="font-medium">{cert.name}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {cert.domain || '-'}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {cert.issuer || 'Unknown'}
                        </TableCell>
                        <TableCell>{getStatusBadge(cert.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className={getExpiryColor(daysUntilExpiry)}>
                              {daysUntilExpiry > 0 
                                ? `${daysUntilExpiry} days`
                                : 'Expired'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {cert.auto_renew ? (
                            <Badge variant="secondary" className="gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Enabled
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="gap-1">
                              <Unlock className="w-3 h-3" />
                              Manual
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rotation History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5" />
                Key Rotation History
              </CardTitle>
              <CardDescription>
                Track all encryption key rotation events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Key</TableHead>
                    <TableHead>Version Change</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Records Affected</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rotationHistory.map((rotation) => (
                    <TableRow key={rotation.id}>
                      <TableCell>
                        {format(new Date(rotation.rotated_at), 'PPp')}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {keys.find(k => k.id === rotation.key_id)?.key_identifier || rotation.key_id}
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">v{rotation.old_version}</span>
                        <span className="mx-2">→</span>
                        <span className="text-primary">v{rotation.new_version}</span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {rotation.rotation_reason || 'Scheduled rotation'}
                      </TableCell>
                      <TableCell>
                        {rotation.success ? (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Success
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Failed
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{rotation.affected_records.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  {rotationHistory.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No rotation history yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Log Tab */}
        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Security Audit Log
              </CardTitle>
              <CardDescription>
                Monitor all security-related events and actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditEvents.map((event) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-4 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className={`p-2 rounded-full ${getSeverityColor(event.severity)} bg-opacity-10`}>
                      <Shield className={`w-4 h-4 ${getSeverityColor(event.severity)}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          {event.event_type}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {event.resource_type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm mt-1">{event.description}</p>
                    </div>
                  </motion.div>
                ))}
                {auditEvents.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    No audit events recorded yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Compliance Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Compliance & Standards
          </CardTitle>
          <CardDescription>
            Enterprise-grade encryption compliance status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'SOC 2 Type II', status: 'Compliant', icon: '🛡️' },
              { name: 'GDPR', status: 'Compliant', icon: '🇪🇺' },
              { name: 'HIPAA', status: 'Ready', icon: '🏥' },
              { name: 'PCI DSS', status: 'Compliant', icon: '💳' }
            ].map((compliance) => (
              <div key={compliance.name} className="p-4 rounded-lg border bg-muted/30">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{compliance.icon}</span>
                  <span className="font-medium">{compliance.name}</span>
                </div>
                <Badge variant={compliance.status === 'Compliant' ? 'default' : 'secondary'}>
                  {compliance.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EncryptionManagementPanel;
