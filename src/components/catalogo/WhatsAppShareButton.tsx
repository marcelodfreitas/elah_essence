'use client'

import { Share2 } from 'lucide-react'

type WhatsAppShareButtonProps = {
  message: string
  label?: string
  className?: string
}

export default function WhatsAppShareButton({
  message,
  label = 'Compartilhar',
  className = '',
}: WhatsAppShareButtonProps) {
  function handleShare() {
    const currentUrl = window.location.href
    const text = `${message}\n\n${currentUrl}`

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`

    window.open(
      whatsappUrl,
      '_blank',
      'noopener,noreferrer'
    )
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className={className}
    >
      <Share2 className="h-4 w-4" />
      {label}
    </button>
  )
}