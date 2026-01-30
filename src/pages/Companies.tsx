import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, MapPin, Users, Globe, Calendar, ExternalLink, Edit, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCompanies, Company } from '@/hooks/useCompanies';
import { useAuth } from '@/contexts/AuthContext';
import LoadingScreen from '@/components/LoadingScreen';

const industries = [
  'Technology', 'Finance', 'Healthcare', 'Real Estate', 'Hospitality',
  'Retail', 'Manufacturing', 'Consulting', 'Legal', 'Education', 'Other'
];

export default function CompaniesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { companies, myCompanies, loading, fetchCompanies } = useCompanies();
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState<string>('');

  const handleSearch = () => {
    fetchCompanies({
      search: search || undefined,
      industry: industry || undefined,
    });
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-light text-foreground mb-2">Companies</h1>
            <p className="text-muted-foreground">Discover and connect with organizations</p>
          </div>
          {user && (
            <Button onClick={() => navigate('/companies/create')} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Company
            </Button>
          )}
        </div>

        {/* My Companies */}
        {myCompanies.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-medium mb-4">Your Companies</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myCompanies.map((company) => (
                <CompanyCard key={company.id} company={company} isOwner />
              ))}
            </div>
          </div>
        )}

        {/* Search & Filters */}
        <Card className="mb-8 border-border/50">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <Input
                placeholder="Search companies..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="All Industries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  {industries.map((ind) => (
                    <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleSearch}>Search</Button>
            </div>
          </CardContent>
        </Card>

        {/* Companies Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company, index) => (
            <motion.div
              key={company.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <CompanyCard company={company} />
            </motion.div>
          ))}
        </div>

        {companies.length === 0 && (
          <div className="text-center py-16">
            <Building2 className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-medium mb-2">No Companies Found</h3>
            <p className="text-muted-foreground">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}

function CompanyCard({ company, isOwner = false }: { company: Company; isOwner?: boolean }) {
  const navigate = useNavigate();

  return (
    <Card 
      className="group cursor-pointer border-border/50 hover:border-primary/30 transition-all duration-300"
      onClick={() => navigate(`/companies/${company.slug}`)}
    >
      {/* Cover Image */}
      {company.cover_image_url && (
        <div className="h-24 overflow-hidden rounded-t-lg">
          <img 
            src={company.cover_image_url} 
            alt="" 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          <Avatar className="h-14 w-14 border-2 border-background shadow-lg">
            <AvatarImage src={company.logo_url || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary text-lg">
              {company.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg truncate">{company.name}</CardTitle>
              {company.is_verified && (
                <Badge variant="secondary" className="text-xs">Verified</Badge>
              )}
            </div>
            {company.industry && (
              <p className="text-sm text-muted-foreground">{company.industry}</p>
            )}
          </div>
          {isOwner && (
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/companies/${company.slug}/edit`);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {company.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {company.description}
          </p>
        )}

        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          {company.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {company.location}
            </span>
          )}
          {company.company_size && (
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {company.company_size} employees
            </span>
          )}
          {company.founded_year && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Est. {company.founded_year}
            </span>
          )}
        </div>

        {company.website && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-3 -ml-2 text-xs gap-1"
            onClick={(e) => {
              e.stopPropagation();
              window.open(company.website!, '_blank');
            }}
          >
            <Globe className="h-3 w-3" />
            Website
            <ExternalLink className="h-3 w-3" />
          </Button>
        )}

        {company.is_featured && (
          <Badge className="mt-3 bg-gradient-to-r from-primary to-primary/70">
            Featured
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
