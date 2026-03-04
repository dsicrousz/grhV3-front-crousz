import { Image } from "@react-pdf/renderer";

function QRCodePage({value}: {value: string}) {
  const qrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${encodeURIComponent(value)}`;

  return <Image src={qrDataUrl} style={{ width: 55, height: 55 }} />;
}

export default QRCodePage;
