import { QRCodeCanvas } from 'qrcode.react';

function QRGenerator({ value }: { value: string | undefined }) {
  return (
    <QRCodeCanvas
      value={value || ''}
      size={80}
      bgColor="#FFF"
      fgColor="#000"
      level="H"
      marginSize={1}
    />
  );
}

export default QRGenerator;