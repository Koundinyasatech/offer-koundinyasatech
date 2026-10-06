import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import AppButton from './AppButton';

/* "Logout all devices" — ends every session of this user: other browsers, phones and this device */
const LogoutAllButton = ({ style = {} }) => {
  const { logoutAll } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!window.confirm('Log out from all devices?\n\nYou will be signed out everywhere, including this device.')) return;
    setLoading(true);
    try {
      const { devicesLoggedOut } = await logoutAll();
      toast.success(devicesLoggedOut > 1 ? `Logged out from ${devicesLoggedOut} devices` : 'Logged out from all devices');
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not log out from all devices. Please try again.');
      setLoading(false);
    }
  };

  return (
    <AppButton variant="outline" onClick={handleClick} disabled={loading} style={{ color: '#C62828', ...style }}>
      {loading ? 'Logging out…' : 'Logout all devices'}
    </AppButton>
  );
};

export default LogoutAllButton;
