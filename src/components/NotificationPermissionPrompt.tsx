import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, X, Check, Sparkles } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

export const NotificationPermissionPrompt = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const { isSupported, permission, isSubscribed, subscribe, isLoading } = usePushNotifications();
  const { haptics } = useHapticFeedback();

  useEffect(() => {
    // Check if already dismissed
    const dismissed = localStorage.getItem('notification_prompt_dismissed');
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Show prompt after 10 seconds if supported and not already granted
    if (isSupported && permission === 'default' && !isSubscribed) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [isSupported, permission, isSubscribed]);

  const handleEnable = async () => {
    haptics.tap();
    const success = await subscribe();
    if (success) {
      haptics.success();
      setIsVisible(false);
    } else {
      haptics.error();
    }
  };

  const handleDismiss = () => {
    haptics.selection();
    setIsVisible(false);
    localStorage.setItem('notification_prompt_dismissed', 'true');
    setIsDismissed(true);
  };

  const handleRemindLater = () => {
    haptics.selection();
    setIsVisible(false);
    // Will show again on next session
  };

  if (!isSupported || isDismissed || isSubscribed || permission === 'denied') {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-24 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50"
        >
          <div className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="relative p-5 pb-4">
              <button
                onClick={handleDismiss}
                className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/20 border border-primary/30">
                  <Bell className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Stay in the Loop</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Get instant updates on bookings, exclusive offers, and VIP experiences.
                  </p>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="px-5 pb-4">
              <div className="flex flex-wrap gap-2">
                {['Booking updates', 'VIP offers', 'Travel alerts'].map((benefit) => (
                  <span
                    key={benefit}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-secondary/50 rounded-full text-xs text-muted-foreground"
                  >
                    <Sparkles className="w-3 h-3 text-primary" />
                    {benefit}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 bg-secondary/30 border-t border-border/30 flex gap-3">
              <button
                onClick={handleRemindLater}
                className="flex-1 py-2.5 px-4 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-xl hover:bg-secondary/50"
              >
                Maybe Later
              </button>
              <button
                onClick={handleEnable}
                disabled={isLoading}
                className="flex-1 py-2.5 px-4 bg-primary text-primary-foreground text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Enable
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationPermissionPrompt;
