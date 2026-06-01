import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Portal de Treinamento — Cirurgia Plástica',
  description: 'Plataforma de treinamento para atendentes de consultório',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
