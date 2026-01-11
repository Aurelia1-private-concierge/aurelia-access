import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Wifi, 
  WifiOff, 
  Database, 
  Shield, 
  RefreshCw, 
  Check, 
  AlertTriangle,
  X,
  Zap,
  Cloud,
  CloudOff
} from 'lucide-react';
import { useSelfHealing } from '@/hooks/useSelfHealing';
import { useOfflineAI } from '@/hooks/useOfflineAI';

export const SystemHealthIndicator = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { healthStatus, healingLog, isHealing, forceHeal } = useSelfHealing();
  const { offlineState } = useOfflineAI();

  const getOverallHealth = () => {
    if (healthStatus.network === 'offline') return 'offline';
    if (healthStatus.database === 'offline') return 'critical';
    if (healthStatus.database === 'degraded' || healthStatus.auth === 'expired') return 'warning';
    return 'healthy';
  };

  const overallHealth = getOverallHealth();

  const healthColors = {
    healthy: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
    warning: 'text-amber-400 bg-amber-500/20 border-amber-500/30',
    critical: 'text-red-400 bg-red-500/20 border-red-500/30',
    offline: 'text-slate-400 bg-slate-500/20 border-slate-500/30',
  };

  const healthIcons = {
    healthy: Check,
    warning: AlertTriangle,
    critical: AlertTriangle,
    offline: WifiOff,
  };

  const HealthIcon = healthIcons[overallHealth];

  return (
    <>
      {/* Compact indicator - positioned at bottom left, above other elements */}
      <motion.button
        onClick={() => setIsExpanded(true)}
        className={`fixed bottom-32 left-4 z-40 p-2.5 rounded-full border backdrop-blur-xl shadow-lg ${healthColors[overallHealth]} hidden md:flex items-center gap-2`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 2 }}
      >
        {isHealing ? (
          <RefreshCw className="w-4 h-4 animate-spin" />
        ) : (
          <HealthIcon className="w-4 h-4" />
        )}
        
        {healthStatus.autoHealed > 0 && (
          <span className="text-xs font-medium">
            {healthStatus.autoHealed} healed
          </span>
        )}
      </motion.button>

      {/* Expanded panel */}
      <AnimatePresence>
        {isExpanded && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setIsExpanded(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed left-4 bottom-32 z-50 w-80 max-w-[calc(100vw-2rem)] bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b border-border/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${healthColors[overallHealth]}`}>
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">System Health</h3>
                    <p className="text-xs text-muted-foreground capitalize">{overallHealth}</p>
                  </div>
                </div>
                
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1.5 rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {/* Status Grid */}
              <div className="p-4 space-y-3">
                {/* Network */}
                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    {healthStatus.network === 'online' ? (
                      <Wifi className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <WifiOff className="w-4 h-4 text-red-400" />
                    )}
                    <span className="text-sm">Network</span>
                  </div>
                  <span className={`text-xs font-medium ${
                    healthStatus.network === 'online' ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {healthStatus.network}
                  </span>
                </div>

                {/* Database */}
                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Database className={`w-4 h-4 ${
                      healthStatus.database === 'healthy' ? 'text-emerald-400' :
                      healthStatus.database === 'degraded' ? 'text-amber-400' : 'text-red-400'
                    }`} />
                    <span className="text-sm">Database</span>
                  </div>
                  <span className={`text-xs font-medium ${
                    healthStatus.database === 'healthy' ? 'text-emerald-400' :
                    healthStatus.database === 'degraded' ? 'text-amber-400' : 'text-red-400'
                  }`}>
                    {healthStatus.database}
                  </span>
                </div>

                {/* Auth */}
                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Shield className={`w-4 h-4 ${
                      healthStatus.auth === 'authenticated' ? 'text-emerald-400' :
                      healthStatus.auth === 'expired' ? 'text-amber-400' : 'text-muted-foreground'
                    }`} />
                    <span className="text-sm">Authentication</span>
                  </div>
                  <span className={`text-xs font-medium ${
                    healthStatus.auth === 'authenticated' ? 'text-emerald-400' :
                    healthStatus.auth === 'expired' ? 'text-amber-400' : 'text-muted-foreground'
                  }`}>
                    {healthStatus.auth}
                  </span>
                </div>

                {/* Offline Mode */}
                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    {offlineState.isOffline ? (
                      <CloudOff className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Cloud className="w-4 h-4 text-emerald-400" />
                    )}
                    <span className="text-sm">Offline Mode</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {offlineState.cachedPages.length} pages cached
                  </span>
                </div>

                {/* Pending Sync */}
                {offlineState.pendingSync > 0 && (
                  <div className="flex items-center justify-between p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <div className="flex items-center gap-3">
                      <RefreshCw className="w-4 h-4 text-amber-400" />
                      <span className="text-sm">Pending Sync</span>
                    </div>
                    <span className="text-xs text-amber-400 font-medium">
                      {offlineState.pendingSync} actions
                    </span>
                  </div>
                )}
              </div>

              {/* AI Healing Stats */}
              <div className="px-4 pb-4">
                <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-primary" />
                    <span className="text-xs font-medium text-primary">AI Self-Healing</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Auto-healed issues</span>
                    <span className="font-medium text-primary">{healthStatus.autoHealed}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs mt-1">
                    <span className="text-muted-foreground">Last check</span>
                    <span className="text-muted-foreground">
                      {healthStatus.lastCheck.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent Healing Log */}
              {healingLog.length > 0 && (
                <div className="px-4 pb-4">
                  <p className="text-xs text-muted-foreground mb-2">Recent Activity</p>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {healingLog.slice(-3).reverse().map((action, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs p-2 bg-secondary/20 rounded-lg">
                        {action.success ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <AlertTriangle className="w-3 h-3 text-amber-400" />
                        )}
                        <span className="text-muted-foreground truncate">{action.details}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Force Heal Button */}
              {overallHealth !== 'healthy' && (
                <div className="p-4 border-t border-border/30">
                  <button
                    onClick={forceHeal}
                    disabled={isHealing}
                    className="w-full py-2.5 px-4 bg-primary text-primary-foreground rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {isHealing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Healing...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        Force Heal
                      </>
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default SystemHealthIndicator;
