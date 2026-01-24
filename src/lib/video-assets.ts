// Video Assets - Properly imported for Vite bundling
// These imports ensure videos get the correct hashed paths

import aureliaDemoVideo from '@/assets/aurelia-demo.mp4';
import orlaDemoVideo from '@/assets/orla-demo.mp4';
import demoVisionVideo from '@/assets/demo-vision.mp4';
import demoWatchVideo from '@/assets/demo-watch.mp4';
import heroLuxuryHolidayVideo from '@/assets/hero-luxury-holiday.mp4';
import heroYachtVideo from '@/assets/hero-yacht.mp4';
import heroJetVideo from '@/assets/hero-jet.mp4';
import heroPenthouseVideo from '@/assets/hero-penthouse.mp4';

// Export all video assets with semantic names
export const VIDEO_ASSETS = {
  aureliaDemoVideo,
  orlaDemoVideo,
  demoVisionVideo,
  demoWatchVideo,
  heroLuxuryHolidayVideo,
  heroYachtVideo,
  heroJetVideo,
  heroPenthouseVideo,
} as const;

export default VIDEO_ASSETS;
