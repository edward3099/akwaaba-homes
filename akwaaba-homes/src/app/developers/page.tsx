import AgentsPageClient from './AgentsPageClient';

// Developers page - renamed from agent-2
// Force fresh deployment - Vercel build cache issue
export default function DevelopersPage() {
  return <AgentsPageClient />;
}
