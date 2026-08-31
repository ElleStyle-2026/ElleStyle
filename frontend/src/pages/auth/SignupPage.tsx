import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import { AuthComponent } from '../../components/ui/auth-component';


export default function SignupPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleAuthSubmit = async (data: any) => {
    const response = await authService.signup({ name: data.name, email: data.email, password: data.password });
    return response;
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const response = await authService.googleAuth(credentialResponse.credential);
      if (response.success) {
        login(response.user, response.accessToken);
        handleSuccessRedirect('logged_in');
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleSuccessRedirect = (status?: string, email?: string) => {
    if (status === 'verify_email') {
      navigate('/check-email', { replace: true, state: { email } });
    } else {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  };

  return (
    <AuthComponent 
      mode="signup" 
      onAuthSubmit={handleAuthSubmit}
      onGoogleSuccess={handleGoogleSuccess}
      onSuccessRedirect={handleSuccessRedirect}
    />
  );
}
