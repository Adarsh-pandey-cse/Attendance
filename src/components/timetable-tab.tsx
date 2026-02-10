'use client';

import { useAttendance } from '@/hooks/use-attendance';
import { DayOfWeek, TimetableEntry } from '@/types';
import { Card, CardContent } from './ui/card';
import { PlusCircle, Clock, Trash2 } from 'lucide-react';
import { ScheduleDialog } from './schedule-dialog';
import { useState } from 'react';

export function TimetableTab({ day }: { day: DayOfWeek }) {
  const { subjects, timetable, updateTimetable } = useAttendance();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);

  const daySchedule = timetable?.[day] || [];

  const getSubjectName = (subjectId: string) => {
    return subjects.find(s => s.id === subjectId)?.name || 'Unknown Subject';
  };
  
  const handleEdit = (entry: TimetableEntry) => {
    setEditingEntry(entry);
    setDialogOpen(true);
  };
  
  const handleAdd = () => {
    setEditingEntry(null);
    setDialogOpen(true);
  };

  const handleDelete = (entryId: string) => {
    const updatedTimetable = { ...(timetable || {}) };
    updatedTimetable[day] = (updatedTimetable[day] || []).filter(entry => entry.id !== entryId);
    updateTimetable(updatedTimetable);
  };

  return (
    <Card className="glass-card mt-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold capitalize">{day}</h3>
          <ScheduleDialog
            day={day}
            isOpen={dialogOpen}
            setIsOpen={setDialogOpen}
            entry={editingEntry}
          >
            <button onClick={handleAdd} className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors duration-300">
              <PlusCircle className="w-5 h-5" />
              <span className="font-bold">Add Class</span>
            </button>
          </ScheduleDialog>
        </div>

        {daySchedule.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 mx-auto text-muted-foreground" />
            <p className="mt-4 font-semibold text-muted-foreground">No classes scheduled for {day}.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {daySchedule.sort((a,b) => a.startTime.localeCompare(b.startTime)).map(entry => (
              <div key={entry.id} className="glass-card p-3 rounded-lg flex justify-between items-center transition-shadow hover:shadow-lg">
                <div>
                  <p className="font-bold text-lg">{getSubjectName(entry.subjectId)}</p>
                  <p className="text-sm text-muted-foreground font-semibold">{entry.startTime} - {entry.endTime}</p>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={() => handleEdit(entry)} className="p-2 rounded-full hover:bg-white/10 text-muted-foreground">
                        <Clock className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDelete(entry.id)} className="p-2 rounded-full hover:bg-destructive/20 text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
