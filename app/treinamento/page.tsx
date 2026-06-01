import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import TrainamentoPlatform from '@/components/TrainamentoPlatform'

export default async function TreinamentoPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (session.role === 'admin') redirect('/admin')
  return <TrainamentoPlatform userName={session.name} />
}
