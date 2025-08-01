import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { StudyBlock, ConflictError } from '@/lib/study-storage';
import { formatDateForInput } from '@/lib/date-utils';
import { AlertCircle, Save, X } from 'lucide-react';

interface StudyBlockFormProps {
  block?: StudyBlock;
  onSave: (data: Omit<StudyBlock, 'id' | 'color' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  error?: ConflictError | null;
  isLoading?: boolean;
}

export function StudyBlockForm({ block, onSave, onCancel, error, isLoading }: StudyBlockFormProps) {
  const [formData, setFormData] = useState({
    subject: block?.subject || '',
    description: block?.description || '',
    start: block?.start ? formatDateForInput(new Date(block.start)) : '',
    end: block?.end ? formatDateForInput(new Date(block.end)) : '',
    priority: block?.priority || 'normal' as const,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject.trim() || !formData.start || !formData.end) {
      return;
    }

    onSave({
      subject: formData.subject.trim(),
      description: formData.description.trim() || undefined,
      start: new Date(formData.start).toISOString(),
      end: new Date(formData.end).toISOString(),
      priority: formData.priority,
    });
  };

  const isValid = formData.subject.trim() && formData.start && formData.end;

  return (
    <Card className="w-full max-w-md mx-auto shadow-card">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          {block ? 'Edit Study Block' : 'New Study Block'}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Subject Input */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="e.g., Mathematics, Physics"
              className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>

          {/* Description Input */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Optional notes about this study session"
              className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 resize-none"
              rows={2}
            />
          </div>

          {/* Time Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start">Start Time *</Label>
              <Input
                id="start"
                type="datetime-local"
                value={formData.start}
                onChange={(e) => setFormData(prev => ({ ...prev, start: e.target.value }))}
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="end">End Time *</Label>
              <Input
                id="end"
                type="datetime-local"
                value={formData.end}
                onChange={(e) => setFormData(prev => ({ ...prev, end: e.target.value }))}
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>
          </div>

          {/* Priority Select */}
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select value={formData.priority} onValueChange={(value: 'normal' | 'high') => 
              setFormData(prev => ({ ...prev, priority: value }))
            }>
              <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive" className="animate-in slide-in-from-top-2 duration-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={!isValid || isLoading}
              className="flex-1 transition-all duration-200 hover:shadow-md"
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="transition-all duration-200 hover:shadow-md"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}