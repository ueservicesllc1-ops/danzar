export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'student' | 'instructor' | 'admin' | 'developer';
  createdAt: Date;
  updatedAt: Date;
}

export interface DanceClass {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: number; // en minutos
  level: 'beginner' | 'intermediate' | 'advanced';
  style: string;
  schedule: {
    day: string;
    time: string;
  };
  maxStudents: number;
  enrolledStudents: number;
  price: number;
  imageUrl?: string;
}

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  method: 'card' | 'cash' | 'transfer';
  description: string;
  receiptUrl?: string;
  createdAt: Date;
  dueDate?: Date;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  price: number;
  imageUrl?: string;
  attendees: number;
  maxAttendees: number;
}

export interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  type: 'photo' | 'video';
  eventId?: string;
  classId?: string;
  createdAt: Date;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

