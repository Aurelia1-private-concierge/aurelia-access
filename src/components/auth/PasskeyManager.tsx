import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Fingerprint, Smartphone, Laptop, Key, Trash2, Plus, Shield, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { usePasskeys } from "@/hooks/usePasskeys";
import { formatDistanceToNow } from "date-fns";

export function PasskeyManager() {
  const {
    isSupported,
    isLoading,
    credentials,
    fetchPasskeys,
    registerPasskey,
    deletePasskey,
    renamePasskey,
  } = usePasskeys();

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [registerName, setRegisterName] = useState("");
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    fetchPasskeys();
  }, [fetchPasskeys]);

  const getDeviceIcon = (deviceType: string | null) => {
    switch (deviceType) {
      case "platform":
        return <Fingerprint className="h-5 w-5" />;
      case "usb":
        return <Key className="h-5 w-5" />;
      default:
        return <Smartphone className="h-5 w-5" />;
    }
  };

  const handleRegister = async () => {
    const success = await registerPasskey(registerName || undefined);
    if (success) {
      setShowRegister(false);
      setRegisterName("");
    }
  };

  if (!isSupported) {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-destructive shrink-0" />
            <div>
              <p className="font-medium text-destructive">Passkeys Not Supported</p>
              <p className="text-sm text-muted-foreground mt-1">
                Your browser or device doesn't support passkeys. Please use a modern browser 
                like Chrome, Safari, or Edge on a compatible device.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Fingerprint className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Passkeys</CardTitle>
              <CardDescription>
                Sign in securely without a password using biometrics or security keys
              </CardDescription>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => setShowRegister(true)}
            disabled={isLoading}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Passkey
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Info Banner */}
        <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
          <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-foreground">Enhanced Security</p>
            <p className="text-muted-foreground mt-1">
              Passkeys are phishing-resistant and more secure than passwords. 
              They use your device's biometric authentication or security key.
            </p>
          </div>
        </div>

        {/* Registration Dialog */}
        <AnimatePresence>
          {showRegister && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 rounded-lg border bg-card space-y-4">
                <div className="flex items-center gap-3">
                  <Laptop className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Register New Passkey</p>
                    <p className="text-sm text-muted-foreground">
                      Give this passkey a name to identify it later
                    </p>
                  </div>
                </div>
                <Input
                  placeholder="e.g., MacBook Pro, iPhone 15"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleRegister}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? "Registering..." : "Register Passkey"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowRegister(false);
                      setRegisterName("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Credentials List */}
        {credentials.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Fingerprint className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No passkeys registered yet</p>
            <p className="text-sm mt-1">Add a passkey for faster, more secure sign-in</p>
          </div>
        ) : (
          <div className="space-y-3">
            {credentials.map((cred) => (
              <motion.div
                key={cred.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    {getDeviceIcon(cred.device_type)}
                  </div>
                  <div>
                    <p className="font-medium">{cred.device_name || "Unnamed Passkey"}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {cred.device_type || "unknown"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Added {formatDistanceToNow(new Date(cred.created_at), { addSuffix: true })}
                      </span>
                      {cred.last_used_at && (
                        <span className="text-xs text-muted-foreground">
                          • Last used {formatDistanceToNow(new Date(cred.last_used_at), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteId(cred.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Passkey?</AlertDialogTitle>
              <AlertDialogDescription>
                This passkey will be removed from your account. You won't be able to use it 
                to sign in anymore. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (deleteId) {
                    deletePasskey(deleteId);
                    setDeleteId(null);
                  }
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Remove Passkey
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}

export default PasskeyManager;
