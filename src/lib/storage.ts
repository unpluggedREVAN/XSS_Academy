interface UserProgress {
  lab_id: string;
  completed: boolean;
  attempts: number;
  hints_used: number;
  completed_at: string | null;
}

interface Comment {
  id: string;
  lab_id: string;
  author: string;
  content: string;
  created_at: string;
}

const SESSION_KEY = 'xss_academy_session';
const PROGRESS_KEY = 'xss_academy_progress';
const COMMENTS_KEY = 'xss_academy_comments';

function getSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

function getStorageKey(baseKey: string): string {
  return `${baseKey}_${getSessionId()}`;
}

export const storage = {
  getProgress(): UserProgress[] {
    const data = localStorage.getItem(getStorageKey(PROGRESS_KEY));
    return data ? JSON.parse(data) : [];
  },

  saveProgress(labId: string, completed: boolean, attempts: number, hintsUsed: number) {
    const progress = this.getProgress();
    const existing = progress.find(p => p.lab_id === labId);

    if (existing) {
      existing.completed = completed;
      existing.attempts = attempts;
      existing.hints_used = hintsUsed;
      if (completed && !existing.completed_at) {
        existing.completed_at = new Date().toISOString();
      }
    } else {
      progress.push({
        lab_id: labId,
        completed,
        attempts,
        hints_used: hintsUsed,
        completed_at: completed ? new Date().toISOString() : null
      });
    }

    localStorage.setItem(getStorageKey(PROGRESS_KEY), JSON.stringify(progress));
  },

  getLabProgress(labId: string): UserProgress | undefined {
    const progress = this.getProgress();
    return progress.find(p => p.lab_id === labId);
  },

  getComments(labId: string): Comment[] {
    const data = localStorage.getItem(getStorageKey(COMMENTS_KEY));
    const allComments: Comment[] = data ? JSON.parse(data) : [];
    return allComments.filter(c => c.lab_id === labId);
  },

  addComment(labId: string, author: string, content: string): Comment {
    const comment: Comment = {
      id: Date.now().toString() + Math.random().toString(36),
      lab_id: labId,
      author,
      content,
      created_at: new Date().toISOString()
    };

    const data = localStorage.getItem(getStorageKey(COMMENTS_KEY));
    const comments: Comment[] = data ? JSON.parse(data) : [];
    comments.push(comment);
    localStorage.setItem(getStorageKey(COMMENTS_KEY), JSON.stringify(comments));

    return comment;
  },

  deleteComment(commentId: string) {
    const data = localStorage.getItem(getStorageKey(COMMENTS_KEY));
    const comments: Comment[] = data ? JSON.parse(data) : [];
    const filtered = comments.filter(c => c.id !== commentId);
    localStorage.setItem(getStorageKey(COMMENTS_KEY), JSON.stringify(filtered));
  },

  clearComments(labId: string) {
    const data = localStorage.getItem(getStorageKey(COMMENTS_KEY));
    const comments: Comment[] = data ? JSON.parse(data) : [];
    const filtered = comments.filter(c => c.lab_id !== labId);
    localStorage.setItem(getStorageKey(COMMENTS_KEY), JSON.stringify(filtered));
  },

  clearAll() {
    const sessionId = getSessionId();
    localStorage.removeItem(getStorageKey(PROGRESS_KEY));
    localStorage.removeItem(getStorageKey(COMMENTS_KEY));
  },

  getSessionId
};
