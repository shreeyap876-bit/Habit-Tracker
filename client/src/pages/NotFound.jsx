import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import Button from '../components/ui/Button.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';

export default function NotFound() {
  return (
    <div className="auth">
      <div className="auth-card" style={{ width: 'min(460px, 100%)', textAlign: 'center' }}>
        <EmptyState
          icon={Compass}
          title="This page wandered off"
          message="The link you followed does not lead anywhere in Habit Tracker."
          action={
            <Link to="/dashboard">
              <Button variant="primary">Back to dashboard</Button>
            </Link>
          }
        />
      </div>
    </div>
  );
}
