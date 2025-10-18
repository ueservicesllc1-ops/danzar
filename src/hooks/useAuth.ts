import { useAuth as useAuthContext } from '@/contexts/AuthContext';

export const useAuth = () => {
  const auth = useAuthContext();
  
  // Hook adicional para funcionalidades extra
  const isAuthenticated = !!auth.user;
  const isStudent = auth.user?.role === 'student';
  const isInstructor = auth.user?.role === 'instructor';
  const isAdmin = auth.user?.role === 'admin';
  const isDeveloper = auth.user?.role === 'developer';
  
  return {
    ...auth,
    isAuthenticated,
    isStudent,
    isInstructor,
    isAdmin,
    isDeveloper,
  };
};

export default useAuth;

