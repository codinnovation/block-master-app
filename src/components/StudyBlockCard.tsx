import { StudyBlock } from '@/lib/study-storage';
import { formatDisplayTime, calculateDuration } from '@/lib/date-utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Clock, Star, MoreVertical, Edit, Trash } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StudyBlockCardProps {
  block: StudyBlock;
  onEdit: (block: StudyBlock) => void;
  onDelete: (id: string) => void;
  className?: string;
}

export function StudyBlockCard({ block, onEdit, onDelete, className }: StudyBlockCardProps) {
  const duration = calculateDuration(block.start, block.end);
  const startTime = formatDisplayTime(block.start);
  const endTime = formatDisplayTime(block.end);

  return (
    <Card className={cn(
      "group transition-all duration-200 hover:shadow-md hover:scale-[1.02] cursor-pointer",
      "border-l-4 relative overflow-hidden bg-gradient-card",
      className
    )}
    style={{ borderLeftColor: `hsl(var(--${block.color}))` }}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Subject and Priority */}
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-foreground truncate">
                {block.subject}
              </h3>
              {block.priority === 'high' && (
                <Badge variant="secondary" className="bg-warning/20 text-warning-foreground">
                  <Star className="w-3 h-3 mr-1" />
                  High
                </Badge>
              )}
            </div>

            {/* Time and Duration */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Clock className="w-4 h-4" />
              <span>{startTime} - {endTime}</span>
              <Badge variant="outline" className="text-xs">
                {duration}
              </Badge>
            </div>

            {/* Description */}
            {block.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {block.description}
              </p>
            )}
          </div>

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-8 w-8 p-0"
              >
                <MoreVertical className="w-4 h-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem onClick={() => onEdit(block)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(block.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Color indicator */}
        <div 
          className="absolute top-0 right-0 w-2 h-full opacity-20"
          style={{ backgroundColor: `hsl(var(--${block.color}))` }}
        />
      </CardContent>
    </Card>
  );
}