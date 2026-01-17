import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Leaf, 
  Users, 
  Globe, 
  TrendingUp, 
  Heart,
  Droplets,
  Sun,
  GraduationCap,
  Stethoscope,
  ChevronRight,
  Plus,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useImpactPortfolio, ImpactProject } from '@/hooks/useImpactPortfolio';
import { toast } from 'sonner';

const categoryIcons: Record<string, React.ReactNode> = {
  environment: <Leaf className="h-5 w-5" />,
  community: <Droplets className="h-5 w-5" />,
  education: <GraduationCap className="h-5 w-5" />,
  healthcare: <Stethoscope className="h-5 w-5" />,
};

const categoryColors: Record<string, string> = {
  environment: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  community: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  education: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  healthcare: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
};

const MetricCard = ({ 
  icon, 
  label, 
  value, 
  suffix = '',
  delay = 0 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: number | string; 
  suffix?: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
  >
    <Card className="bg-card/50 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-colors">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            {icon}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold text-foreground">
              {typeof value === 'number' ? value.toLocaleString() : value}
              {suffix && <span className="text-lg text-muted-foreground ml-1">{suffix}</span>}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const ProjectCard = ({ 
  project, 
  onInvest,
  delay = 0 
}: { 
  project: ImpactProject; 
  onInvest: (project: ImpactProject) => void;
  delay?: number;
}) => {
  const progress = project.target_amount > 0 
    ? (project.current_amount / project.target_amount) * 100 
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="bg-card/50 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5 group">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge 
                  variant="outline" 
                  className={`${categoryColors[project.category]} text-xs`}
                >
                  <span className="mr-1">{categoryIcons[project.category]}</span>
                  {project.category}
                </Badge>
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  {project.region}
                </Badge>
              </div>
              
              <h4 className="font-semibold text-foreground mb-1 truncate">
                {project.title}
              </h4>
              
              {project.partner_name && (
                <p className="text-xs text-muted-foreground mb-3">
                  Partner: {project.partner_name}
                </p>
              )}
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="text-foreground font-medium">
                    ${project.current_amount.toLocaleString()} / ${project.target_amount.toLocaleString()}
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
              
              <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                {project.carbon_offset_tons > 0 && (
                  <span className="flex items-center gap-1">
                    <Leaf className="h-3 w-3 text-emerald-400" />
                    {project.carbon_offset_tons.toLocaleString()} tons CO₂
                  </span>
                )}
                {project.people_helped > 0 && (
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3 text-blue-400" />
                    {project.people_helped.toLocaleString()} helped
                  </span>
                )}
              </div>
            </div>
            
            <Button 
              size="sm" 
              variant="outline"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onInvest(project)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Invest
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const GlobalImpactPlatform = () => {
  const { investments, projects, metrics, loading, addInvestment } = useImpactPortfolio();
  const [selectedProject, setSelectedProject] = useState<ImpactProject | null>(null);
  const [investAmount, setInvestAmount] = useState('');
  const [isInvesting, setIsInvesting] = useState(false);

  const handleInvest = async () => {
    if (!selectedProject || !investAmount) return;
    
    setIsInvesting(true);
    try {
      const amount = parseFloat(investAmount);
      // Estimate impact based on project type
      const carbonPerDollar = selectedProject.category === 'environment' ? 0.05 : 0;
      const peoplePerDollar = selectedProject.category === 'community' ? 0.02 : 
                              selectedProject.category === 'healthcare' ? 0.03 : 
                              selectedProject.category === 'education' ? 0.01 : 0;
      
      await addInvestment(
        selectedProject.id, 
        amount,
        amount * carbonPerDollar,
        Math.floor(amount * peoplePerDollar)
      );
      
      toast.success('Investment recorded successfully', {
        description: `You've contributed $${amount.toLocaleString()} to ${selectedProject.title}`,
      });
      
      setSelectedProject(null);
      setInvestAmount('');
    } catch (error) {
      toast.error('Failed to record investment');
    } finally {
      setIsInvesting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-card/50 h-24" />
          ))}
        </div>
        <Card className="bg-card/50 h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Globe className="h-6 w-6 text-primary" />
            Global Impact Platform
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Track your philanthropic portfolio and measure your positive impact
          </p>
        </div>
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
          <Sparkles className="h-3 w-3 mr-1" />
          Black Card Exclusive
        </Badge>
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Total Invested"
          value={`$${metrics.totalInvested.toLocaleString()}`}
          delay={0}
        />
        <MetricCard
          icon={<Leaf className="h-5 w-5" />}
          label="Carbon Offset"
          value={metrics.carbonOffset}
          suffix="tons CO₂"
          delay={0.1}
        />
        <MetricCard
          icon={<Users className="h-5 w-5" />}
          label="People Helped"
          value={metrics.peopleHelped}
          delay={0.2}
        />
        <MetricCard
          icon={<Heart className="h-5 w-5" />}
          label="Projects Funded"
          value={metrics.projectsFunded}
          delay={0.3}
        />
      </div>

      {/* Active Projects */}
      <Card className="bg-card/30 backdrop-blur-sm border-primary/10">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sun className="h-5 w-5 text-primary" />
            Available Impact Projects
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {projects.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No active projects available at this time.
            </p>
          ) : (
            projects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                onInvest={setSelectedProject}
                delay={0.1 * index}
              />
            ))
          )}
        </CardContent>
      </Card>

      {/* Your Investments */}
      {investments.length > 0 && (
        <Card className="bg-card/30 backdrop-blur-sm border-primary/10">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Your Impact Investments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {investments.map((investment, index) => (
                <motion.div
                  key={investment.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.05 * index }}
                  className="flex items-center justify-between p-4 rounded-lg bg-card/50 border border-primary/10"
                >
                  <div>
                    <p className="font-medium text-foreground">
                      {investment.project?.title || 'Unknown Project'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(investment.investment_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">
                      ${Number(investment.amount).toLocaleString()}
                    </p>
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      {investment.carbon_offset_tons > 0 && (
                        <span>{investment.carbon_offset_tons} tons CO₂</span>
                      )}
                      {investment.people_impacted > 0 && (
                        <span>{investment.people_impacted} helped</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Investment Dialog */}
      <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
        <DialogContent className="bg-card border-primary/20">
          <DialogHeader>
            <DialogTitle>Invest in {selectedProject?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground">
              {selectedProject?.description}
            </p>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Investment Amount (USD)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={investAmount}
                onChange={(e) => setInvestAmount(e.target.value)}
                className="bg-background/50"
              />
            </div>
            
            {investAmount && parseFloat(investAmount) > 0 && (
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/10 space-y-2">
                <p className="text-sm font-medium text-foreground">Estimated Impact:</p>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  {selectedProject?.category === 'environment' && (
                    <span className="flex items-center gap-1">
                      <Leaf className="h-4 w-4 text-emerald-400" />
                      {(parseFloat(investAmount) * 0.05).toFixed(1)} tons CO₂ offset
                    </span>
                  )}
                  {['community', 'healthcare', 'education'].includes(selectedProject?.category || '') && (
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-blue-400" />
                      ~{Math.floor(parseFloat(investAmount) * (
                        selectedProject?.category === 'healthcare' ? 0.03 :
                        selectedProject?.category === 'community' ? 0.02 : 0.01
                      ))} people impacted
                    </span>
                  )}
                </div>
              </div>
            )}
            
            <Button 
              className="w-full" 
              onClick={handleInvest}
              disabled={!investAmount || parseFloat(investAmount) <= 0 || isInvesting}
            >
              {isInvesting ? 'Processing...' : 'Confirm Investment'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GlobalImpactPlatform;
