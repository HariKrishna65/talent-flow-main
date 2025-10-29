import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const teamMembers = ['John Smith', 'Sarah Johnson', 'Mike Chen', 'Emily Davis', 'Alex Brown'];

export default function NotesSection({ candidateId }) {
  const [newNote, setNewNote] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);

  const notes = useLiveQuery(() => db.candidateNotes.where('candidateId').equals(candidateId).toArray()) || [];
  const sortedNotes = notes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleNoteChange = (value) => {
    setNewNote(value);
    const lastAtIndex = value.lastIndexOf('@', cursorPosition);
    if (lastAtIndex !== -1) {
      const textAfterAt = value.substring(lastAtIndex + 1, cursorPosition);
      if (textAfterAt.length > 0 && !textAfterAt.includes(' ')) {
        setMentionSearch(textAfterAt);
        setShowMentions(true);
      } else if (textAfterAt.length === 0) {
        setMentionSearch('');
        setShowMentions(true);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const handleMentionSelect = (name) => {
    const lastAtIndex = newNote.lastIndexOf('@', cursorPosition);
    const beforeMention = newNote.substring(0, lastAtIndex);
    const afterCursor = newNote.substring(cursorPosition);
    setNewNote(`${beforeMention}@${name} ${afterCursor}`);
    setShowMentions(false);
    setMentionSearch('');
  };

  const filteredMembers = teamMembers.filter((name) => name.toLowerCase().includes(mentionSearch.toLowerCase()));

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    try {
      await db.candidateNotes.add({
        id: `note-${Date.now()}-${Math.random()}`,
        candidateId,
        content: newNote,
        createdAt: new Date().toISOString(),
        author: 'Current User',
      });
      setNewNote('');
      toast({ title: 'Note Added', description: 'Your note has been saved successfully' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to add note', variant: 'destructive' });
    }
  };

  const renderNoteContent = (content) => {
    const parts = content.split(/(@[\w\s]+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        return (
          <Badge key={index} variant="secondary" className="mx-1">
            {part}
          </Badge>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Notes
        </CardTitle>
        <CardDescription>Add notes and mention team members with @</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Textarea
            placeholder="Add a note... Use @ to mention team members"
            value={newNote}
            onChange={(e) => {
              handleNoteChange(e.target.value);
              setCursorPosition(e.target.selectionStart);
            }}
            onSelect={(e) => setCursorPosition(e.target.selectionStart)}
            className="min-h-[100px]"
          />

          {showMentions && filteredMembers.length > 0 && (
            <Card className="absolute z-10 mt-1 w-full shadow-lg">
              <CardContent className="p-2">
                {filteredMembers.map((name) => (
                  <button
                    key={name}
                    onClick={() => handleMentionSelect(name)}
                    className="w-full text-left px-3 py-2 hover:bg-accent rounded-sm transition-colors"
                  >
                    @{name}
                  </button>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <Button onClick={handleAddNote} className="w-full">
          <Send className="mr-2 h-4 w-4" />
          Add Note
        </Button>

        <div className="space-y-3 mt-6">
          {sortedNotes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No notes yet. Add your first note above.</p>
          ) : (
            sortedNotes.map((note) => (
              <Card key={note.id}>
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium">{note.author}</span>
                    <span className="text-xs text-muted-foreground">{new Date(note.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-sm">{renderNoteContent(note.content)}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}


