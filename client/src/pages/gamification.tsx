// Gamification Page - Main Entry Point
import { GamificationDashboard } from '@/components/gamification/GamificationDashboard';
import { MOCK_USER_ID } from '@/lib/quiz-data';

export default function Gamification() {
  return (
    <GamificationDashboard 
      userId={MOCK_USER_ID}
    />
  );
}