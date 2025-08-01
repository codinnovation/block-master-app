import { useState, useEffect, useCallback } from 'react';
import { StudyBlock, ConflictError, studyStorage } from '@/lib/study-storage';
import { StudyBlockForm } from './StudyBlockForm';
import { DailyView } from './DailyView';
import { WeeklyView } from './WeeklyView';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, Trash2, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';

type ViewMode = 'daily' | 'weekly';

export function StudyTimetable() {
  const [blocks, setBlocks] = useState<StudyBlock[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('daily');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<StudyBlock | null>(null);
  const [formError, setFormError] = useState<ConflictError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load blocks from localStorage on mount
  useEffect(() => {
    try {
      const loadedBlocks = studyStorage.loadBlocks();
      setBlocks(loadedBlocks);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load your study schedule. Please refresh the page.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // Save blocks to localStorage whenever blocks change
  const saveBlocks = useCallback((newBlocks: StudyBlock[]) => {
    try {
      studyStorage.saveBlocks(newBlocks);
      setBlocks(newBlocks);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save changes. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  }, [toast]);

  // Handle creating a new block
  const handleCreateBlock = useCallback((data: Omit<StudyBlock, 'id' | 'color' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    setFormError(null);

    try {
      const newBlock = studyStorage.createBlock(data);
      
      // Validate for conflicts
      const conflict = studyStorage.validateBlock(newBlock, blocks);
      if (conflict) {
        setFormError(conflict);
        setIsLoading(false);
        return;
      }

      const newBlocks = [...blocks, newBlock];
      saveBlocks(newBlocks);
      
      setIsFormOpen(false);
      setFormError(null);
      
      toast({
        title: 'Success',
        description: 'Study block created successfully!',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create study block. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [blocks, saveBlocks, toast]);

  // Handle updating an existing block
  const handleUpdateBlock = useCallback((data: Omit<StudyBlock, 'id' | 'color' | 'createdAt' | 'updatedAt'>) => {
    if (!editingBlock) return;

    setIsLoading(true);
    setFormError(null);

    try {
      const updatedBlock = studyStorage.updateBlock(blocks, editingBlock.id, data);
      
      // Validate for conflicts (excluding the current block)
      const conflict = studyStorage.validateBlock(updatedBlock, blocks, editingBlock.id);
      if (conflict) {
        setFormError(conflict);
        setIsLoading(false);
        return;
      }

      const newBlocks = blocks.map(block => 
        block.id === editingBlock.id ? updatedBlock : block
      );
      saveBlocks(newBlocks);
      
      setIsFormOpen(false);
      setEditingBlock(null);
      setFormError(null);
      
      toast({
        title: 'Success',
        description: 'Study block updated successfully!',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update study block. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [blocks, editingBlock, saveBlocks, toast]);

  // Handle form submission
  const handleFormSubmit = useCallback((data: Omit<StudyBlock, 'id' | 'color' | 'createdAt' | 'updatedAt'>) => {
    if (editingBlock) {
      handleUpdateBlock(data);
    } else {
      handleCreateBlock(data);
    }
  }, [editingBlock, handleCreateBlock, handleUpdateBlock]);

  // Handle deleting a block
  const handleDeleteBlock = useCallback((id: string) => {
    try {
      const newBlocks = blocks.filter(block => block.id !== id);
      saveBlocks(newBlocks);
      
      toast({
        title: 'Success',
        description: 'Study block deleted successfully!',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete study block. Please try again.',
        variant: 'destructive',
      });
    }
  }, [blocks, saveBlocks, toast]);

  // Handle opening create form
  const openCreateForm = useCallback(() => {
    setEditingBlock(null);
    setFormError(null);
    setIsFormOpen(true);
  }, []);

  // Handle opening edit form
  const openEditForm = useCallback((block: StudyBlock) => {
    setEditingBlock(block);
    setFormError(null);
    setIsFormOpen(true);
  }, []);

  // Handle closing form
  const closeForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingBlock(null);
    setFormError(null);
  }, []);

  // Clear all blocks
  const handleClearAll = useCallback(() => {
    try {
      studyStorage.clearAll();
      setBlocks([]);
      
      toast({
        title: 'Success',
        description: 'All study blocks have been cleared.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to clear study blocks. Please try again.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // Get stats for current week
  const getWeeklyStats = () => {
    const weekStart = new Date(selectedDate);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    return studyStorage.getSubjectStats(blocks, weekStart, weekEnd);
  };

  const weeklyStats = getWeeklyStats();
  const totalBlocks = blocks.length;

  return (
    <div className="min-h-screen bg-gradient-subtle p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Calendar className="w-6 h-6 text-primary" />
                  Study Timetable
                </CardTitle>
                <p className="text-muted-foreground mt-1">
                  Plan and track your study sessions
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                {totalBlocks > 0 && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear All
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Clear All Study Blocks</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete all {totalBlocks} study blocks. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleClearAll} className="bg-destructive text-destructive-foreground">
                          Clear All
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
                
                <Badge variant="outline" className="gap-1">
                  <BarChart3 className="w-3 h-3" />
                  {totalBlocks} total
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* View Toggle */}
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
          <TabsList className="grid w-full max-w-xs grid-cols-2">
            <TabsTrigger value="daily" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Daily
            </TabsTrigger>
            <TabsTrigger value="weekly" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Weekly
            </TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="mt-6">
            <DailyView
              selectedDate={selectedDate}
              blocks={blocks}
              onDateChange={setSelectedDate}
              onCreateBlock={openCreateForm}
              onEditBlock={openEditForm}
              onDeleteBlock={handleDeleteBlock}
            />
          </TabsContent>

          <TabsContent value="weekly" className="mt-6">
            <WeeklyView
              selectedDate={selectedDate}
              blocks={blocks}
              onDateChange={setSelectedDate}
              onCreateBlock={openCreateForm}
              onEditBlock={openEditForm}
              onDeleteBlock={handleDeleteBlock}
            />
          </TabsContent>
        </Tabs>

        {/* Weekly Stats */}
        {weeklyStats.size > 0 && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">This Week's Study Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Array.from(weeklyStats.entries())
                  .sort(([,a], [,b]) => b - a)
                  .map(([subject, hours]) => (
                    <div key={subject} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="font-medium">{subject}</span>
                      <Badge variant="secondary">
                        {hours.toFixed(1)}h
                      </Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Form Modal */}
      <Dialog open={isFormOpen} onOpenChange={closeForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingBlock ? 'Edit Study Block' : 'Create Study Block'}
            </DialogTitle>
          </DialogHeader>
          <StudyBlockForm
            block={editingBlock || undefined}
            onSave={handleFormSubmit}
            onCancel={closeForm}
            error={formError}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}