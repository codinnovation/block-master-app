import { StudyBlock } from '@/lib/study-storage';
import { StudyBlockCard } from './StudyBlockCard';
import { formatDisplayDate, isSameDayAsDate } from '@/lib/date-utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Plus, BookOpen } from 'lucide-react';
import { format } from 'date-fns';

interface DailyViewProps {
  selectedDate: Date;
  blocks: StudyBlock[];
  onDateChange: (date: Date) => void;
  onCreateBlock: () => void;
  onEditBlock: (block: StudyBlock) => void;
  onDeleteBlock: (id: string) => void;
}

export function DailyView({ 
  selectedDate, 
  blocks, 
  onDateChange, 
  onCreateBlock, 
  onEditBlock, 
  onDeleteBlock 
}: DailyViewProps) {
  const dayBlocks = blocks
    .filter(block => isSameDayAsDate(block.start, selectedDate))
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  const totalHours = dayBlocks.reduce((total, block) => {
    const duration = new Date(block.end).getTime() - new Date(block.start).getTime();
    return total + (duration / (1000 * 60 * 60));
  }, 0);

  const navigateDay = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    onDateChange(newDate);
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateDay('prev')}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <CardTitle className="text-lg sm:text-xl">
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </CardTitle>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateDay('next')}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={goToToday}
                className="text-primary"
              >
                Today
              </Button>
            </div>

            <Button 
              onClick={onCreateBlock}
              className="transition-all duration-200 hover:shadow-md"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Add Block</span>
            </Button>
          </div>
          
          {/* Day Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              <span>{dayBlocks.length} session{dayBlocks.length !== 1 ? 's' : ''}</span>
            </div>
            {totalHours > 0 && (
              <Badge variant="outline">
                {totalHours.toFixed(1)}h total
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Study Blocks */}
      {dayBlocks.length > 0 ? (
        <div className="space-y-3">
          {dayBlocks.map((block) => (
            <StudyBlockCard
              key={block.id}
              block={block}
              onEdit={onEditBlock}
              onDelete={onDeleteBlock}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No study sessions planned</h3>
            <p className="text-muted-foreground mb-4 max-w-sm">
              Get started by adding your first study block for {format(selectedDate, 'EEEE, MMM d')}
            </p>
            <Button onClick={onCreateBlock}>
              <Plus className="w-4 h-4 mr-2" />
              Add Study Block
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}