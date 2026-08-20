import EditProfileClient from './EditProfileClient';
import { useAuth } from '../../../context/AuthContext';

export default function EditProfilePage() {
  // This is a server component wrapper that passes current user to client
  // The useAuth hook is client-only; instead read from localStorage fallback
  let user = null;
  try {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('hoor_user_v1');
      if (raw) user = JSON.parse(raw);
    }
  } catch (e) {
    user = null;
  }

  return <EditProfileClient user={user} />;
}
