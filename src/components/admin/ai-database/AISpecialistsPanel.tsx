import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bot, Plus, Pencil, Trash2, Activity, Zap, 
  CheckCircle2, XCircle, Loader2, Brain, Sparkles 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useAIDatabaseManager, AISpecialist } from '@/hooks/useAIDatabaseManager';

const AI_MODELS = [
  { value: 'google/gemini-3-flash-preview', label: 'Gemini 3 Flash (Fast)' },
  { value: 'google/gemini-2.5-flash', label: 'Gemini 2.5 Flash (Balanced)' },
  { value: 'google/gemini-2.5-pro', label: 'Gemini 2.5 Pro (Powerful)' },
  { value: 'openai/gpt-5-mini', label: 'GPT-5 Mini (Efficient)' },
  { value: 'openai/gpt-5', label: 'GPT-5 (Premium)' },
];

const CAPABILITY_OPTIONS = [
  'Database Queries',
  'Data Analysis',
  'Trend Detection',
  'Anomaly Detection',
  'Report Generation',
  'Natural Language Understanding',
  'Member Insights',
  'Partner Analytics',
  'Revenue Analysis',
  'Predictive Modeling',
];

export function AISpecialistsPanel() {
  const {
    specialists,
    fetchSpecialists,
    createSpecialist,
    updateSpecialist,
    deleteSpecialist,
    isLoading,
  } = useAIDatabaseManager();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSpecialist, setEditingSpecialist] = useState<AISpecialist | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    model: 'google/gemini-3-flash-preview',
    capabilities: [] as string[],
    specializations: [] as string[],
    system_prompt: '',
  });

  useEffect(() => {
    fetchSpecialists();
  }, [fetchSpecialists]);

  const handleOpenDialog = (specialist?: AISpecialist) => {
    if (specialist) {
      setEditingSpecialist(specialist);
      setFormData({
        name: specialist.name,
        description: specialist.description || '',
        model: specialist.model,
        capabilities: specialist.capabilities || [],
        specializations: specialist.specializations || [],
        system_prompt: specialist.system_prompt || '',
      });
    } else {
      setEditingSpecialist(null);
      setFormData({
        name: '',
        description: '',
        model: 'google/gemini-3-flash-preview',
        capabilities: [],
        specializations: [],
        system_prompt: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (editingSpecialist) {
      await updateSpecialist(editingSpecialist.id, formData);
    } else {
      await createSpecialist(formData);
    }
    setIsDialogOpen(false);
  };

  const toggleCapability = (cap: string) => {
    setFormData(prev => ({
      ...prev,
      capabilities: prev.capabilities.includes(cap)
        ? prev.capabilities.filter(c => c !== cap)
        : [...prev.capabilities, cap],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Specialists</h2>
          <p className="text-muted-foreground">
            Configure AI agents for database management and insights
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Specialist
        </Button>
      </div>

      {specialists.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Brain className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No AI Specialists Configured</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first AI specialist to start querying your database with natural language
            </p>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Create Specialist
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {specialists.map((specialist, index) => (
            <motion.div
              key={specialist.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="relative overflow-hidden">
                <div className={`absolute inset-x-0 top-0 h-1 ${
                  specialist.is_active ? 'bg-emerald-500' : 'bg-muted'
                }`} />
                
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Bot className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{specialist.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {AI_MODELS.find(m => m.value === specialist.model)?.label || specialist.model}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={specialist.is_active}
                      onCheckedChange={(checked) => 
                        updateSpecialist(specialist.id, { is_active: checked })
                      }
                    />
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {specialist.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {specialist.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-1">
                    {specialist.capabilities?.slice(0, 3).map((cap) => (
                      <Badge key={cap} variant="secondary" className="text-xs">
                        {cap}
                      </Badge>
                    ))}
                    {(specialist.capabilities?.length || 0) > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{specialist.capabilities.length - 3}
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                    <div className="text-center">
                      <p className="text-lg font-semibold">{specialist.total_queries}</p>
                      <p className="text-xs text-muted-foreground">Queries</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold">
                        {specialist.avg_response_time_ms 
                          ? `${(specialist.avg_response_time_ms / 1000).toFixed(1)}s`
                          : '—'}
                      </p>
                      <p className="text-xs text-muted-foreground">Avg Time</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-emerald-500">
                        {specialist.success_rate?.toFixed(0) || 100}%
                      </p>
                      <p className="text-xs text-muted-foreground">Success</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleOpenDialog(specialist)}
                    >
                      <Pencil className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteSpecialist(specialist.id)}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              {editingSpecialist ? 'Edit AI Specialist' : 'Create AI Specialist'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Database Analyst"
                />
              </div>
              <div className="space-y-2">
                <Label>AI Model</Label>
                <Select
                  value={formData.model}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, model: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AI_MODELS.map((model) => (
                      <SelectItem key={model.value} value={model.value}>
                        {model.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this specialist does..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Capabilities</Label>
              <div className="flex flex-wrap gap-2">
                {CAPABILITY_OPTIONS.map((cap) => (
                  <Badge
                    key={cap}
                    variant={formData.capabilities.includes(cap) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleCapability(cap)}
                  >
                    {formData.capabilities.includes(cap) && (
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                    )}
                    {cap}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>System Prompt (Optional)</Label>
              <Textarea
                value={formData.system_prompt}
                onChange={(e) => setFormData(prev => ({ ...prev, system_prompt: e.target.value }))}
                placeholder="Additional instructions for this specialist..."
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Custom instructions appended to the default system prompt
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!formData.name || isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingSpecialist ? 'Update' : 'Create'} Specialist
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
