import React, { useEffect, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import { ShieldCheck, QrCode as QrIcon, Barcode as BarcodeIcon } from 'lucide-react';

export type BarcodeType = 'barcode' | 'qrcode' | 'both';
export type BarcodeFormat = 'simple' | 'prefix' | 'full';

interface CertificateBarcodeProps {
  nisn: string;
  urutan: number | string;
  type?: BarcodeType;
  format?: BarcodeFormat;
  customPrefix?: string;
  showDetails?: boolean;
  compact?: boolean;
  className?: string;
}

export const CertificateBarcode: React.FC<CertificateBarcodeProps> = ({
  nisn,
  urutan,
  type = 'barcode',
  format = 'simple',
  customPrefix = 'SMKMA',
  showDetails = true,
  compact = false,
  className = '',
}) => {
  const barcodeSvgRef = useRef<SVGSVGElement | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [barcodeError, setBarcodeError] = useState(false);

  // Pad sequence number to 3 digits (e.g. 1 -> '001')
  const formattedUrutan = String(urutan).padStart(3, '0');
  const cleanNisn = (nisn || '0071234567').trim().replace(/[^a-zA-Z0-9]/g, '');

  // Generate dynamic code string from NISN and Urutan
  const barcodeValue = React.useMemo(() => {
    switch (format) {
      case 'prefix':
        return `${customPrefix}-${cleanNisn}-${formattedUrutan}`;
      case 'full':
        return `PKL-2026-${cleanNisn}-${formattedUrutan}`;
      case 'simple':
      default:
        return `${cleanNisn}-${formattedUrutan}`;
    }
  }, [format, customPrefix, cleanNisn, formattedUrutan]);

  // Render 1D Barcode with JsBarcode
  useEffect(() => {
    if ((type === 'barcode' || type === 'both') && barcodeSvgRef.current) {
      try {
        setBarcodeError(false);
        JsBarcode(barcodeSvgRef.current, barcodeValue, {
          format: 'CODE128',
          width: compact ? 1.0 : 1.25,
          height: compact ? 26 : 34,
          displayValue: false, // We render custom styled readable text
          margin: 0,
          background: 'transparent',
          lineColor: '#0f172a',
        });
      } catch (err) {
        console.warn('JsBarcode render error, falling back:', err);
        setBarcodeError(true);
      }
    }
  }, [barcodeValue, type, compact]);

  // Generate 2D QR Code data URL with qrcode
  useEffect(() => {
    if (type === 'qrcode' || type === 'both') {
      const qrPayload = `https://smkmathlaulanwar.sch.id/verifikasi?nisn=${cleanNisn}&urutan=${formattedUrutan}&code=${barcodeValue}`;
      QRCode.toDataURL(qrPayload, {
        width: compact ? 64 : 88,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff00', // transparent background
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => {
          console.warn('QRCode generation error:', err);
          setQrDataUrl(null);
        });
    }
  }, [barcodeValue, cleanNisn, formattedUrutan, type, compact]);

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Visual Barcode / QR container */}
      <div className="flex items-center gap-2 bg-white/95 p-1.5 rounded-xl border border-teal-300/80 shadow-2xs backdrop-blur-xs">
        {/* 1D Barcode Mode */}
        {(type === 'barcode' || type === 'both') && (
          <div className="flex flex-col items-center justify-center px-1">
            <svg
              ref={barcodeSvgRef}
              className={`max-w-full ${compact ? 'h-[26px]' : 'h-[34px]'}`}
            />
            {barcodeError && (
              <div className="text-[8px] font-mono text-slate-500 tracking-wider">
                |||||| | ||||| |||| || |
              </div>
            )}
            <div className="text-[8px] font-mono text-slate-700 tracking-widest mt-0.5 font-bold">
              *{barcodeValue}*
            </div>
          </div>
        )}

        {/* 2D QR Code Mode */}
        {(type === 'qrcode' || type === 'both') && (
          <div className="flex flex-col items-center justify-center p-0.5">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`QR Verifikasi ${barcodeValue}`}
                className={compact ? 'w-10 h-10' : 'w-12 h-12'}
              />
            ) : (
              <QrIcon className={compact ? 'w-8 h-8 text-slate-700' : 'w-10 h-10 text-slate-700'} />
            )}
          </div>
        )}
      </div>

      {/* Human-readable metadata & verification seal */}
      {showDetails && (
        <div className="space-y-0.5 text-left min-w-0">
          <div className="flex items-center gap-1 text-[9.5px] font-black text-emerald-800 tracking-wide">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="uppercase">E-Verifikasi Resmi</span>
          </div>
          <p className="text-[9px] font-mono font-bold text-slate-900 truncate">
            No. Seri: <span className="text-teal-900">{barcodeValue}</span>
          </p>
          <div className="flex items-center gap-1.5 text-[8.5px] text-slate-600 font-medium">
            <span>NISN: <strong className="font-mono text-slate-800">{cleanNisn}</strong></span>
            <span>•</span>
            <span>Urutan: <strong className="font-mono text-slate-800">{formattedUrutan}</strong></span>
          </div>
          <p className="text-[8px] text-slate-500 truncate max-w-[210px]">
            Sertifikat Sah Terdaftar di SMK MA Buaranjati
          </p>
        </div>
      )}
    </div>
  );
};
