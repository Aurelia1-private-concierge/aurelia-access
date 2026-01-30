import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, MapPin, Clock, DollarSign, Building2, Bookmark, BookmarkCheck, ExternalLink, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useJobs, Job } from '@/hooks/useJobs';
import { useAuth } from '@/contexts/AuthContext';
import LoadingScreen from '@/components/LoadingScreen';
import { formatDistanceToNow } from 'date-fns';

const jobTypes = ['full-time', 'part-time', 'contract', 'freelance', 'internship', 'temporary'];
const experienceLevels = ['entry', 'mid', 'senior', 'lead', 'executive'];

export default function JobsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { jobs, savedJobs, loading, fetchJobs, saveJob, isJobSaved } = useJobs();
  const [search, setSearch] = useState('');
  const [jobType, setJobType] = useState<string>('');
  const [experienceLevel, setExperienceLevel] = useState<string>('');
  const [isRemote, setIsRemote] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = () => {
    fetchJobs({
      search: search || undefined,
      job_type: jobType || undefined,
      experience_level: experienceLevel || undefined,
      is_remote: isRemote || undefined,
    });
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-light text-foreground mb-2">Job Opportunities</h1>
            <p className="text-muted-foreground">Find your next career opportunity</p>
          </div>
          {savedJobs.length > 0 && (
            <Button variant="outline" onClick={() => navigate('/jobs/saved')} className="gap-2">
              <Bookmark className="h-4 w-4" />
              Saved ({savedJobs.length})
            </Button>
          )}
        </div>

        {/* Search & Filters */}
        <Card className="mb-8 border-border/50">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-4">
                <Input
                  placeholder="Search jobs, titles, keywords..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1"
                />
                <Button 
                  variant="outline" 
                  onClick={() => setShowFilters(!showFilters)}
                  className="gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
                <Button onClick={handleSearch}>Search</Button>
              </div>

              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="flex flex-wrap gap-4 pt-4 border-t border-border/50"
                >
                  <Select value={jobType} onValueChange={setJobType}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Job Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {jobTypes.map((type) => (
                        <SelectItem key={type} value={type} className="capitalize">
                          {type.replace('-', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      {experienceLevels.map((level) => (
                        <SelectItem key={level} value={level} className="capitalize">
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex items-center gap-2">
                    <Checkbox 
                      id="remote" 
                      checked={isRemote}
                      onCheckedChange={(checked) => setIsRemote(!!checked)}
                    />
                    <label htmlFor="remote" className="text-sm cursor-pointer">
                      Remote Only
                    </label>
                  </div>
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Jobs List */}
        <div className="space-y-4">
          {jobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <JobCard job={job} isSaved={isJobSaved(job.id)} onSave={() => saveJob(job.id)} />
            </motion.div>
          ))}
        </div>

        {jobs.length === 0 && (
          <div className="text-center py-16">
            <Briefcase className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-medium mb-2">No Jobs Found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}

function JobCard({ job, isSaved, onSave }: { job: Job; isSaved: boolean; onSave: () => void }) {
  const navigate = useNavigate();

  const formatSalary = () => {
    if (!job.salary_min && !job.salary_max) return null;
    const currency = job.salary_currency || 'USD';
    const period = job.salary_period || 'yearly';
    
    if (job.salary_min && job.salary_max) {
      return `${currency} ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()} / ${period}`;
    }
    if (job.salary_min) return `From ${currency} ${job.salary_min.toLocaleString()} / ${period}`;
    return `Up to ${currency} ${job.salary_max?.toLocaleString()} / ${period}`;
  };

  return (
    <Card 
      className="group cursor-pointer border-border/50 hover:border-primary/30 transition-all duration-300"
      onClick={() => navigate(`/jobs/${job.id}`)}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Company Logo */}
          <Avatar className="h-14 w-14 border-2 border-background shadow-lg flex-shrink-0">
            <AvatarImage src={job.company?.logo_url || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary">
              <Building2 className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>

          {/* Job Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-medium group-hover:text-primary transition-colors">
                  {job.title}
                </h3>
                <p className="text-muted-foreground">
                  {job.company?.name || 'Company'}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                {job.is_featured && (
                  <Badge className="bg-gradient-to-r from-primary to-primary/70">Featured</Badge>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSave();
                  }}
                >
                  {isSaved ? (
                    <BookmarkCheck className="h-5 w-5 text-primary" />
                  ) : (
                    <Bookmark className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              {job.job_type && (
                <Badge variant="secondary" className="capitalize">
                  {job.job_type.replace('-', ' ')}
                </Badge>
              )}
              {job.experience_level && (
                <Badge variant="outline" className="capitalize">
                  {job.experience_level}
                </Badge>
              )}
              {job.is_remote && (
                <Badge variant="outline" className="border-green-500/50 text-green-600">
                  Remote
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
              {(job.location || job.company?.location) && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {job.location || job.company?.location}
                </span>
              )}
              {formatSalary() && (
                <span className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  {formatSalary()}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
              </span>
            </div>

            {job.skills && job.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {job.skills.slice(0, 5).map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {job.skills.length > 5 && (
                  <Badge variant="secondary" className="text-xs">
                    +{job.skills.length - 5}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
