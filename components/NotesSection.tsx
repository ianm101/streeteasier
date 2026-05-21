"use client";

import { useState } from "react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addNote, deleteNote } from "@/lib/actions/notes";

interface Note {
  id: string;
  body: string;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
}

interface NotesSectionProps {
  apartmentId: string;
  notes: Note[];
  currentUserId: string;
}

export function NotesSection({
  apartmentId,
  notes: initialNotes,
  currentUserId,
}: NotesSectionProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    setLoading(true);
    try {
      await addNote(apartmentId, newNote);
      setNewNote("");
      // Optimistically add note to UI
      window.location.reload(); // Simple reload for now
    } catch (error) {
      console.error("Failed to add note:", error);
      alert("Failed to add note. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm("Are you sure you want to delete this note?")) {
      return;
    }

    try {
      await deleteNote(noteId);
      setNotes(notes.filter((n) => n.id !== noteId));
    } catch (error) {
      console.error("Failed to delete note:", error);
      alert("Failed to delete note. Please try again.");
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Notes</h3>

      {/* Add Note */}
      <div className="space-y-2">
        <Textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a note about this apartment..."
          rows={3}
        />
        <Button onClick={handleAddNote} disabled={loading || !newNote.trim()}>
          {loading ? "Adding..." : "Add Note"}
        </Button>
      </div>

      {/* Notes List */}
      <div className="space-y-3">
        {notes.length === 0 ? (
          <p className="text-sm text-zinc-500 italic">
            No notes yet. Add the first note above!
          </p>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="p-4 bg-zinc-50 rounded-lg border border-zinc-200 space-y-2"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {note.user.image && (
                    <Image
                      src={note.user.image}
                      alt={note.user.name || "User"}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                  )}
                  <div>
                    <p className="text-sm font-medium">
                      {note.user.name || note.user.email}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {formatDistanceToNow(new Date(note.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
                {note.user.id === currentUserId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteNote(note.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <p className="text-sm text-zinc-700 whitespace-pre-wrap">
                {note.body}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
