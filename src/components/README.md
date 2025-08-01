# Study Timetable Component

A production-ready, mobile-first study timetable component built with React, TypeScript, and Tailwind CSS. Features complete localStorage persistence, conflict detection, and beautiful responsive design.

## Features

### ✨ Core Functionality
- **Study Block Management**: Create, edit, and delete study sessions with subject, time, description, and priority
- **Conflict Detection**: Real-time validation prevents overlapping blocks with clear error messages
- **localStorage Persistence**: All data automatically saved and restored between sessions
- **Color Coding**: Automatic subject-based color assignment with consistent palette

### 📱 Views & Navigation
- **Daily View**: Timeline of study blocks with total time tracking
- **Weekly View**: Grid layout showing all blocks across the week
- **Responsive Design**: Mobile-first approach with touch-friendly controls
- **Date Navigation**: Easy navigation between days/weeks with "Today" shortcuts

### 🎨 Design System
- **Academic Theme**: Soft, professional color palette designed for focus
- **Smooth Animations**: Micro-interactions and transitions throughout
- **Accessibility**: ARIA labels, keyboard navigation, proper contrast ratios
- **Dark Mode Ready**: Complete dark mode support (toggle not included)

## Data Structure

```typescript
interface StudyBlock {
  id: string;              // UUID v4
  subject: string;         // Required subject name
  description?: string;    // Optional notes
  start: string;          // ISO datetime string
  end: string;            // ISO datetime string
  priority: 'normal' | 'high';
  color: string;          // Auto-assigned theme color
  createdAt: string;      // ISO datetime
  updatedAt: string;      // ISO datetime
}
```

### localStorage Schema
```json
{
  "studyTimetable": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "subject": "Mathematics",
      "description": "Calculus practice problems",
      "start": "2025-08-04T08:00:00.000Z",
      "end": "2025-08-04T09:30:00.000Z",
      "priority": "high",
      "color": "subject-blue",
      "createdAt": "2025-08-01T10:00:00.000Z",
      "updatedAt": "2025-08-01T10:00:00.000Z"
    }
  ]
}
```

## Component Architecture

```
StudyTimetable (main container)
├── StudyBlockForm (create/edit modal)
├── DailyView (daily timeline)
├── WeeklyView (weekly grid)
├── StudyBlockCard (individual block display)
└── Various UI components (Button, Card, Dialog, etc.)
```

## Usage

### Basic Integration
```tsx
import { StudyTimetable } from '@/components/StudyTimetable';

function App() {
  return <StudyTimetable />;
}
```

### Custom Integration
```tsx
import { studyStorage } from '@/lib/study-storage';
import { StudyBlockForm } from '@/components/StudyBlockForm';
import { DailyView } from '@/components/DailyView';

// Access storage directly
const blocks = studyStorage.loadBlocks();
const newBlock = studyStorage.createBlock({
  subject: 'Physics',
  start: '2025-08-04T10:00:00.000Z',
  end: '2025-08-04T11:00:00.000Z',
  priority: 'normal'
});
```

## Dependencies

- **React 18+** with hooks
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **date-fns** for date manipulation
- **uuid** for unique IDs
- **Lucide React** for icons

## Mobile Optimization

- Touch-friendly button sizes (min 44px)
- Responsive breakpoints: `sm: 640px`, `lg: 1024px`
- Mobile-first CSS approach
- Optimized form inputs for mobile keyboards
- Swipe-friendly navigation controls

## Accessibility Features

- Full keyboard navigation support
- ARIA labels on interactive elements
- High contrast color schemes
- Screen reader friendly structure
- Focus management in modals

## Customization

### Theme Colors
Subject colors can be customized in `src/index.css`:
```css
:root {
  --subject-blue: 200 80% 75%;
  --subject-green: 140 60% 70%;
  /* Add more colors as needed */
}
```

### Design System
The complete design system is defined in:
- `src/index.css` - CSS custom properties
- `tailwind.config.ts` - Tailwind configuration
- `src/components/ui/` - Component variants

## Production Considerations

### Performance
- Efficient re-rendering with React.memo and useCallback
- Debounced localStorage writes
- Minimal bundle size with tree-shaking

### Error Handling
- Graceful localStorage failures
- Form validation with user feedback
- Toast notifications for all actions

### Browser Support
- Modern browsers (ES2017+)
- localStorage required
- CSS Grid and Flexbox support needed

## Future Enhancements

- Drag & drop for block rearrangement
- Import/export functionality
- Study session templates
- Time tracking and analytics
- Notification reminders
- Multiple timetable support

---

Built with ❤️ for students who want to stay organized and focused on their studies.