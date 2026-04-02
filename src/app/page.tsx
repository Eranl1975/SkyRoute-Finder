import { redirect } from 'next/navigation';

// Root → redirect to user app
export default function RootPage() {
  redirect('/user');
}
