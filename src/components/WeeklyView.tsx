import { StudyBlock } from '@/lib/study-storage';
import { getWeekDays, formatDisplayTime, isSameDayAsDate } from '@/lib/date-utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { cn } from '@/lib/utils';

interface WeeklyViewProps {
  selectedDate: Date;
  blocks: StudyBlock[];
  onDateChange: (date: Date) => void;
  onCreateBlock: () => void;
  onEditBlock: (block: StudyBlock) => void;
  onDeleteBlock: (id: string) => void;
}

export function WeeklyView({ 
  selectedDate, 
  blocks, 
  onDateChange, 
  onCreateBlock, 
  onEditBlock, 
  onDeleteBlock 
}: WeeklyViewProps) {
  const weekDays = getWeekDays(selectedDate);
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    onDateChange(newDate);
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  const getBlocksForDay = (day: Date) => {
    return blocks
      .filter(block => isSameDayAsDate(block.start, day))
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  };

  const isToday = (day: Date) => {
    const today = new Date();
    return day.toDateString() === today.toDateString();
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
                  onClick={() => navigateWeek('prev')}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <CardTitle className="text-lg sm:text-xl">
                  {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
                </CardTitle>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateWeek('next')}
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
        </CardHeader>
      </Card>

      {/* Weekly Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
        {weekDays.map((day) => {
          const dayBlocks = getBlocksForDay(day);
          const today = isToday(day);
          
          return (
            <Card 
              key={day.toISOString()}
              className={cn(
                "transition-all duration-200 hover:shadow-md",
                today && "ring-2 ring-primary/20 bg-primary/5"
              )}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-center">
                  <div className={cn(
                    "rounded-full w-8 h-8 mx-auto flex items-center justify-center",
                    today && "bg-primary text-primary-foreground"
                  )}>
                    {format(day, 'd')}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {format(day, 'EEE')}
                  </div>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="pt-0 space-y-2">
                {dayBlocks.length > 0 ? (
                  dayBlocks.map((block) => (
                    <div
                      key={block.id}
                      onClick={() => onEditBlock(block)}
                      className="p-2 rounded-md cursor-pointer transition-all duration-200 hover:scale-105 text-xs"
                      style={{ backgroundColor: `hsl(var(--${block.color}) / 0.3)` }}
                    >
                      <div className="font-medium truncate">{block.subject}</div>
                      <div className="text-muted-foreground">
                        {formatDisplayTime(block.start)}
                      </div>
                      {block.priority === 'high' && (
                        <div className="text-warning-foreground">★</div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <div className="text-xs text-muted-foreground">No sessions</div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}