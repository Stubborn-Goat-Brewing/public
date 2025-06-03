"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import type { ButtonProps } from "@/components/ui/button"

interface PopupButtonProps extends ButtonProps {
  url: string
  popupTitle?: string
  width?: number
  height?: number
  iconSrc?: string
  iconAlt?: string
  children: React.ReactNode
}

export function PopupButton({
  url,
  popupTitle = "Popup",
  width = 600,
  height = 700,
  iconSrc,
  iconAlt,
  children,
  ...props
}: PopupButtonProps) {
  const handleClick = () => {
    window.open(url, popupTitle.replace(/\s+/g, ""), `width=${width},height=${height},resizable=yes,scrollbars=yes`)
  }

  return (
    <Button onClick={handleClick} {...props}>
      {iconSrc && (
        <Image
          src={iconSrc || "/placeholder.svg"}
          alt={iconAlt || ""}
          width={20}
          height={20}
          className="h-5 w-5 mr-2"
        />
      )}
      {children}
    </Button>
  )
}
