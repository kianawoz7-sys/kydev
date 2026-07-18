export function normalizeIndonesianWhatsapp(value: string | null | undefined) {
  const compact = value?.trim().replace(/[\s()-]/g, "") ?? "";
  const digits = compact.startsWith("+") ? compact.slice(1) : compact;

  if (!/^\d+$/.test(digits)) return "";

  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  if (digits.startsWith("8")) return `62${digits}`;
  return digits;
}

export function buildOrderWhatsappUrl({
  whatsappNumber,
  orderCode,
  fullName,
  serviceName,
  formattedPrice,
}: {
  whatsappNumber: string | null | undefined;
  orderCode: string;
  fullName: string;
  serviceName: string;
  formattedPrice: string;
}) {
  const normalizedNumber = normalizeIndonesianWhatsapp(whatsappNumber);

  if (!/^628[1-9][0-9]{6,11}$/.test(normalizedNumber)) return null;

  const message = [
    "Halo Admin MabaTag, saya sudah mengirim pesanan.",
    `Kode pesanan: ${orderCode}`,
    `Nama: ${fullName}`,
    `Jasa: ${serviceName}`,
    `Total: ${formattedPrice}`,
    "Mohon bantu verifikasi pembayaran saya. Terima kasih.",
  ].join("\n");

  return `https://wa.me/${normalizedNumber}?text=${encodeURIComponent(message)}`;
}

export function buildTrackingWhatsappUrl({
  whatsappNumber,
  orderCode,
  fullName,
  serviceName,
}: {
  whatsappNumber: string | null | undefined;
  orderCode: string;
  fullName: string;
  serviceName: string;
}) {
  const normalizedNumber = normalizeIndonesianWhatsapp(whatsappNumber);

  if (!/^628[1-9][0-9]{6,11}$/.test(normalizedNumber)) return null;

  const message = [
    "Halo Kak, saya ingin menanyakan status pesanan MabaTag.",
    "",
    `Kode pesanan: ${orderCode}`,
    `Nama: ${fullName}`,
    `Jasa: ${serviceName}`,
  ].join("\n");

  return `https://wa.me/${normalizedNumber}?text=${encodeURIComponent(message)}`;
}
