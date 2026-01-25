import { motion } from 'framer-motion';
import { MapPin, Verified, MessageCircle, UserPlus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { CircleProfile } from '@/hooks/useCircle';

interface CircleMemberCardProps {
  member: CircleProfile;
  isConnected?: boolean;
  isPending?: boolean;
  matchScore?: number;
  onConnect?: () => void;
  onMessage?: () => void;
  onViewProfile?: () => void;
}

const CircleMemberCard = ({
  member,
  isConnected = false,
  isPending = false,
  matchScore,
  onConnect,
  onMessage,
  onViewProfile,
}: CircleMemberCardProps) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="relative group p-6 bg-card/50 backdrop-blur-xl border border-border/30 rounded-2xl hover:border-gold/30 transition-all duration-300"
    >
      {/* AI Match Score Badge */}
      {matchScore && matchScore > 70 && (
        <div className="absolute -top-2 -right-2 px-2 py-1 bg-gradient-to-r from-gold to-amber-500 rounded-full flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-black" />
          <span className="text-xs font-bold text-black">{matchScore}%</span>
        </div>
      )}

      {/* Verification Badge */}
      {member.verification_status === 'verified' && (
        <div className="absolute top-4 right-4">
          <div className="p-1.5 bg-emerald-500/20 rounded-full">
            <Verified className="w-4 h-4 text-emerald-400" />
          </div>
        </div>
      )}

      {/* Avatar */}
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-4">
          <Avatar className="w-20 h-20 border-2 border-gold/30">
            <AvatarImage src={member.avatar_url || undefined} />
            <AvatarFallback className="bg-gold/10 text-gold text-lg font-medium">
              {getInitials(member.display_name)}
            </AvatarFallback>
          </Avatar>
          {/* Online indicator */}
          <span className="absolute bottom-1 right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-card" />
        </div>

        {/* Name & Title */}
        <h3 
          className="font-semibold text-foreground mb-1 cursor-pointer hover:text-gold transition-colors"
          onClick={onViewProfile}
        >
          {member.display_name}
        </h3>
        {member.title && (
          <p className="text-sm text-muted-foreground mb-2">{member.title}</p>
        )}

        {/* Location */}
        {member.location && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
            <MapPin className="w-3 h-3" />
            <span>{member.location}</span>
          </div>
        )}

        {/* Interests */}
        {member.interests && member.interests.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1 mb-4">
            {member.interests.slice(0, 3).map((interest, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 text-xs bg-gold/10 text-gold/80 rounded-full"
              >
                {interest}
              </span>
            ))}
            {member.interests.length > 3 && (
              <span className="px-2 py-0.5 text-xs bg-muted/50 text-muted-foreground rounded-full">
                +{member.interests.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Assets */}
        {member.assets && member.assets.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1 mb-4">
            {member.assets.slice(0, 2).map((asset, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 text-xs bg-purple-500/10 text-purple-400 rounded-full capitalize"
              >
                {asset}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 w-full">
          {isConnected ? (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-gold/30 hover:bg-gold/10 gap-1"
              onClick={onMessage}
            >
              <MessageCircle className="w-4 h-4" />
              Message
            </Button>
          ) : isPending ? (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              disabled
            >
              Pending
            </Button>
          ) : (
            <Button
              size="sm"
              className="flex-1 bg-gold hover:bg-gold/90 text-black gap-1"
              onClick={onConnect}
            >
              <UserPlus className="w-4 h-4" />
              Connect
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CircleMemberCard;
