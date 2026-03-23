export interface Database {
  public: {
    Tables: {
      user_progress: {
        Row: {
          id: string;
          user_id: string | null;
          lab_id: string;
          completed: boolean;
          attempts: number;
          hints_used: number;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          lab_id: string;
          completed?: boolean;
          attempts?: number;
          hints_used?: number;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          lab_id?: string;
          completed?: boolean;
          attempts?: number;
          hints_used?: number;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      stored_comments: {
        Row: {
          id: string;
          lab_id: string;
          author: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          lab_id: string;
          author?: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          lab_id?: string;
          author?: string;
          content?: string;
          created_at?: string;
        };
      };
      saved_payloads: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          payload: string;
          context: 'html' | 'attribute' | 'javascript' | 'url' | 'css' | 'other';
          description: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          payload: string;
          context: 'html' | 'attribute' | 'javascript' | 'url' | 'css' | 'other';
          description?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          payload?: string;
          context?: 'html' | 'attribute' | 'javascript' | 'url' | 'css' | 'other';
          description?: string;
          created_at?: string;
        };
      };
    };
  };
}
