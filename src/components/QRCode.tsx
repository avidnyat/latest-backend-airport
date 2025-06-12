
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeProps {
  value: string;
  size?: number;
  className?: string;
}

const QRCode: React.FC<QRCodeProps> = ({ value, size = 128, className }) => {
  // Ensure we have an absolute URL for the QR code
  const absoluteUrl = value.startsWith('http') 
    ? value 
    : `${window.location.origin}${value}`;
    
  return (
    <div className={className}>
      <QRCodeSVG
        value={absoluteUrl}
        size={size}
        bgColor={"#ffffff"}
        fgColor={"#112369"}
        level={"M"}
        includeMargin={true}
      />
    </div>
  );
};

export default QRCode;
