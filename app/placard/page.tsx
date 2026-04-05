'use client';

import { QRCodeSVG } from 'qrcode.react';
import { clientConfig } from '@/lib/config';

export default function PlacardPage() {
  const formUrl = clientConfig.uploadFormUrl;

  return (
    <div className="min-h-screen bg-[#F5EDE0] flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Event Title */}
        <h1 className="font-display text-[#3d2b1f] text-4xl md:text-5xl leading-tight">
          {clientConfig.eventTitle}
        </h1>

        {/* Subtitle */}
        {clientConfig.eventSubtitle && (
          <p className="font-body text-[#8B7355] text-sm tracking-[0.3em] uppercase">
            {clientConfig.eventSubtitle}
          </p>
        )}

        {/* Divider */}
        <div className="w-16 h-px bg-[#C9A96E] mx-auto" />

        {/* Tagline */}
        <p className="font-body text-[#5C4A32] text-lg tracking-widest">
          Snap &middot; Scan &middot; Share
        </p>

        {/* QR Code */}
        <div className="flex justify-center">
          {formUrl ? (
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <QRCodeSVG
                value={formUrl}
                size={256}
                bgColor="#FFFFFF"
                fgColor="#3d2b1f"
                level="M"
              />
            </div>
          ) : (
            <div className="p-8 border-2 border-dashed border-[#C9A96E] rounded-lg">
              <p className="font-body text-[#8B7355] text-sm">
                Set <code className="font-mono text-xs bg-[#EDE4D4] px-1.5 py-0.5 rounded">
                  NEXT_PUBLIC_UPLOAD_FORM_URL
                </code> to show QR code
              </p>
            </div>
          )}
        </div>

        {/* Form URL fallback text */}
        {formUrl && (
          <p className="font-body text-[#8B7355] text-xs break-all px-4">
            {formUrl}
          </p>
        )}

        {/* Instructions */}
        <p className="font-body text-[#8B7355] text-sm leading-relaxed">
          Scan the QR code with your phone camera to upload your photos.
          <br />
          They&apos;ll appear on the live photo wall!
        </p>

        {/* Print button */}
        <button
          onClick={() => window.print()}
          className="no-print font-body text-[#5C4A32] text-xs tracking-[0.3em] uppercase
                     border border-[#C9A96E] px-6 py-3 rounded-full
                     hover:bg-[#C9A96E] hover:text-white transition-colors duration-300"
        >
          Print this placard
        </button>
      </div>
    </div>
  );
}
