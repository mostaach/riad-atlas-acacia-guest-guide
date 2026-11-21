import React from 'react';

interface WhatsAppIconProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  className?: string;
  size?: number;
}

/**
 * WhatsApp icon using the user-provided official badge image.
 * Crisp 512x512 transparent PNG at /whatsapp.png.
 */
export function WhatsAppIcon({
  className = 'w-5 h-5',
  size,
  alt = 'WhatsApp',
  ...props
}: WhatsAppIconProps) {
  return (
    <img
      src="/whatsapp.png"
      alt={alt}
      className={`inline-block object-contain shrink-0 ${className}`}
      style={size ? { width: size, height: size, ...props.style } : props.style}
      {...props}
    />
  );
}

export default WhatsAppIcon;
