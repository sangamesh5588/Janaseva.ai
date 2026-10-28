import { redirect } from 'next/navigation';

export default function OfficialLoginPage() {
  redirect('/portal?tab=official');
}
