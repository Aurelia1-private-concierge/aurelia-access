import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Cloud, RefreshCw, Database } from 'lucide-react';
import { useOfflineAI } from '@/hooks/useOfflineAI';

export const OfflineBanner = () => {
  const { offlineState, processSyncQueue } = useOfflineAI();

  if (!offlineState.isOffline && offlineState.pendingSync === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      {(offlineState.isOffline || offlineState.pendingSync > 0) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-0 left-0 right-0 z-[100] px-4 py-2"
        >
          <div className={`max-w-md mx-auto flex items-center justify-between gap-3 px-4 py-2.5 rounded-full backdrop-blur-xl border shadow-lg ${
            offlineState.isOffline 
              ? 'bg-amber-500/10 border-amber-500/30' 
              : 'bg-primary/10 border-primary/30'
          }`}>
            <div className="flex items-center gap-3">
              {offlineState.isOffline ? (
                <div className="p-1.5 rounded-full bg-amber-500/20">
                  <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                </div>
              ) : (
                <div className="p-1.5 rounded-full bg-primary/20">
                  <Cloud className="w-3.5 h-3.5 text-primary" />
                </div>
              )}
              
              <div>
                <p className={`text-xs font-medium ${
                  offlineState.isOffline ? 'text-amber-400' : 'text-primary'
                }`}>
                  {offlineState.isOffline 
                    ? 'You\'re offline' 
                    : `${offlineState.pendingSync} changes to sync`
                  }
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {offlineState.isOffline 
                    ? 'AI managing cached content' 
                    : 'Will sync when connection improves'
                  }
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {offlineState.isOffline && (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-secondary/50 rounded-full">
                  <Database className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">
                    {offlineState.cachedPages.length} cached
                  </span>
                </div>
              )}
              
              {!offlineState.isOffline && offlineState.pendingSync > 0 && (
                <motion.button
                  onClick={() => processSyncQueue()}
                  className="p-1.5 rounded-full bg-primary/20 hover:bg-primary/30 transition-colors"
                  whileTap={{ scale: 0.9 }}
                >
                  <RefreshCw className="w-3.5 h-3.5 text-primary" />
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineBanner;
