import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/* ======================================================================
   TYPES & INTERFACES FOR PDF KEEPSAKE SERVICE
   ====================================================================== */

export type KeepsakeTemplateType = 'love_letter' | 'memory_card' | 'authenticity_certificate' | 'love_vouchers';
export type ParchmentTheme = 'blush' | 'champagne' | 'cream' | 'midnight' | 'velvet';
export type WaxSealType = 'rose' | 'heart' | 'ring' | 'crown' | 'dove';
export type TypographyStyle = 'script' | 'serif' | 'display';

export interface LoveVoucherItem {
  id: string;
  title: string;
  subtitle: string;
  terms?: string;
  icon?: string;
}

export interface MemoryHighlightItem {
  date?: string;
  title: string;
  description: string;
}

export interface PdfKeepsakeOptions {
  template: KeepsakeTemplateType;
  recipientName: string;
  senderName: string;
  title?: string;
  message: string;
  date?: string;
  theme?: ParchmentTheme;
  sealType?: WaxSealType;
  typographyStyle?: TypographyStyle;
  giftTitle?: string;
  giftUrl?: string;
  qrDataUrl?: string;
  photoUrl?: string;
  memories?: MemoryHighlightItem[];
  vouchers?: LoveVoucherItem[];
  includeGoldFoil?: boolean;
  includeWatermark?: boolean;
  includeQrCode?: boolean;
  certificateNumber?: string;
  pageSize?: 'a4' | 'letter';
  orientation?: 'portrait' | 'landscape';
}

/* ======================================================================
   THEME COLOR MAPS (RGB & HEX)
   ====================================================================== */

interface ThemeColorDefinition {
  bgGradientStart: [number, number, number];
  bgGradientEnd: [number, number, number];
  bgHexStart: string;
  bgHexEnd: string;
  primaryText: [number, number, number];
  accentText: [number, number, number];
  goldBorder: [number, number, number];
  goldBorderLight: [number, number, number];
  sealBg: [number, number, number];
  sealText: [number, number, number];
}

const THEME_COLORS: Record<ParchmentTheme, ThemeColorDefinition> = {
  blush: {
    bgGradientStart: [255, 245, 246], // #fff5f6
    bgGradientEnd: [254, 205, 214],   // #fecdd6
    bgHexStart: '#fff5f6',
    bgHexEnd: '#fecdd6',
    primaryText: [76, 5, 26],         // #4c051a
    accentText: [190, 18, 67],        // #be1243
    goldBorder: [207, 178, 126],      // #cfb27e
    goldBorderLight: [237, 226, 204], // #ede2cc
    sealBg: [225, 29, 83],            // #e11d53
    sealText: [255, 255, 255]
  },
  champagne: {
    bgGradientStart: [253, 251, 247], // #fdfbf7
    bgGradientEnd: [237, 226, 204],   // #ede2cc
    bgHexStart: '#fdfbf7',
    bgHexEnd: '#ede2cc',
    primaryText: [69, 53, 24],        // #453518
    accentText: [156, 122, 53],       // #9c7a35
    goldBorder: [191, 160, 96],       // #bfa060
    goldBorderLight: [223, 204, 168], // #dfcca8
    sealBg: [191, 160, 96],           // #bfa060
    sealText: [255, 255, 255]
  },
  cream: {
    bgGradientStart: [255, 253, 250], // #fffdfa
    bgGradientEnd: [245, 238, 220],   // #f5eedc
    bgHexStart: '#fffdfa',
    bgHexEnd: '#f5eedc',
    primaryText: [67, 40, 24],        // #432818
    accentText: [154, 52, 18],        // #9a3412
    goldBorder: [217, 119, 6],        // #d97706
    goldBorderLight: [254, 243, 199], // #fef3c7
    sealBg: [180, 83, 9],             // #b45309
    sealText: [255, 255, 255]
  },
  midnight: {
    bgGradientStart: [25, 10, 20],    // #190a14
    bgGradientEnd: [45, 15, 35],      // #2d0f23
    bgHexStart: '#190a14',
    bgHexEnd: '#2d0f23',
    primaryText: [255, 235, 240],     // #ffebee
    accentText: [251, 113, 133],      // #fb7185
    goldBorder: [212, 175, 55],       // #d4af37
    goldBorderLight: [140, 110, 35],  // #8c6e23
    sealBg: [225, 29, 83],            // #e11d53
    sealText: [255, 255, 255]
  },
  velvet: {
    bgGradientStart: [25, 10, 20],    // #190a14
    bgGradientEnd: [45, 15, 35],      // #2d0f23
    bgHexStart: '#190a14',
    bgHexEnd: '#2d0f23',
    primaryText: [255, 235, 240],     // #ffebee
    accentText: [251, 113, 133],      // #fb7185
    goldBorder: [212, 175, 55],       // #d4af37
    goldBorderLight: [140, 110, 35],  // #8c6e23
    sealBg: [225, 29, 83],            // #e11d53
    sealText: [255, 255, 255]
  }
};

/* ======================================================================
   HELPER: DRAW ORNATE GOLD BORDERS AND FILIGREES
   ====================================================================== */

function drawLuxuryBorders(
  doc: jsPDF,
  pageWidth: number,
  pageHeight: number,
  theme: ParchmentTheme,
  includeGoldFoil: boolean = true
) {
  const colors = THEME_COLORS[theme];
  const margin = 12; // mm
  const innerMargin = 16; // mm
  const accentMargin = 18; // mm

  // 1. Background Fill with subtle vertical steps
  const steps = 15;
  const stepHeight = pageHeight / steps;
  for (let i = 0; i < steps; i++) {
    const ratio = i / (steps - 1);
    const r = Math.round(colors.bgGradientStart[0] + (colors.bgGradientEnd[0] - colors.bgGradientStart[0]) * ratio);
    const g = Math.round(colors.bgGradientStart[1] + (colors.bgGradientEnd[1] - colors.bgGradientStart[1]) * ratio);
    const b = Math.round(colors.bgGradientStart[2] + (colors.bgGradientEnd[2] - colors.bgGradientStart[2]) * ratio);
    doc.setFillColor(r, g, b);
    doc.rect(0, i * stepHeight, pageWidth, stepHeight + 0.5, 'F');
  }

  if (!includeGoldFoil) return;

  // 2. Primary Outer Gold Foil Border
  doc.setDrawColor(colors.goldBorder[0], colors.goldBorder[1], colors.goldBorder[2]);
  doc.setLineWidth(1.2);
  doc.roundedRect(margin, margin, pageWidth - margin * 2, pageHeight - margin * 2, 4, 4, 'S');

  // 3. Delicate Inner Border
  doc.setDrawColor(colors.goldBorderLight[0], colors.goldBorderLight[1], colors.goldBorderLight[2]);
  doc.setLineWidth(0.4);
  doc.roundedRect(innerMargin, innerMargin, pageWidth - innerMargin * 2, pageHeight - innerMargin * 2, 2, 2, 'S');

  // 4. Hairline Accent Frame
  doc.setLineWidth(0.2);
  doc.rect(accentMargin, accentMargin, pageWidth - accentMargin * 2, pageHeight - accentMargin * 2, 'S');

  // 5. Ornate Corner Embellishments (Corner Diamonds & Fleur-de-lis flourishes)
  const corners = [
    { x: innerMargin, y: innerMargin },
    { x: pageWidth - innerMargin, y: innerMargin },
    { x: innerMargin, y: pageHeight - innerMargin },
    { x: pageWidth - innerMargin, y: pageHeight - innerMargin }
  ];

  doc.setFillColor(colors.goldBorder[0], colors.goldBorder[1], colors.goldBorder[2]);
  corners.forEach(c => {
    // Diamond mark
    doc.triangle(c.x - 2, c.y, c.x, c.y - 2, c.x + 2, c.y, 'F');
    doc.triangle(c.x - 2, c.y, c.x, c.y + 2, c.x + 2, c.y, 'F');

    // Circular accent
    doc.circle(c.x, c.y, 0.8, 'F');
  });

  // 6. Header Emblem Top Center Ornament
  const centerX = pageWidth / 2;
  doc.setLineWidth(0.6);
  doc.line(centerX - 35, innerMargin, centerX - 10, innerMargin);
  doc.line(centerX + 10, innerMargin, centerX + 35, innerMargin);

  doc.triangle(centerX - 1.5, innerMargin, centerX, innerMargin - 1.5, centerX + 1.5, innerMargin, 'F');
  doc.triangle(centerX - 1.5, innerMargin, centerX, innerMargin + 1.5, centerX + 1.5, innerMargin, 'F');
}

/* ======================================================================
   HELPER: DRAW LUXURY WAX SEAL
   ====================================================================== */

function drawWaxSeal(
  doc: jsPDF,
  x: number,
  y: number,
  sealType: WaxSealType = 'heart',
  theme: ParchmentTheme = 'blush'
) {
  const colors = THEME_COLORS[theme];
  const radius = 9; // mm

  // Outer Fluted Ring
  doc.setFillColor(colors.sealBg[0], colors.sealBg[1], colors.sealBg[2]);
  doc.circle(x, y, radius, 'F');

  // Inner Embossed Gold Ring
  doc.setDrawColor(colors.goldBorder[0], colors.goldBorder[1], colors.goldBorder[2]);
  doc.setLineWidth(0.6);
  doc.circle(x, y, radius - 1.5, 'S');

  // Seal Symbol / Initial
  doc.setTextColor(255, 255, 255);
  doc.setFont('times', 'bold');
  doc.setFontSize(14);

  let sealEmoji = '♥';
  if (sealType === 'rose') sealEmoji = '✦';
  else if (sealType === 'ring') sealEmoji = '◆';
  else if (sealType === 'crown') sealEmoji = '★';
  else if (sealType === 'dove') sealEmoji = '🕊';

  doc.text(sealEmoji, x, y + 2, { align: 'center' });

  // Tiny "GIFTLOVE ATELIER" curved ribbon / text below seal
  doc.setFontSize(5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colors.goldBorder[0], colors.goldBorder[1], colors.goldBorder[2]);
  doc.text('SEALED WITH LOVE', x, y + radius + 3, { align: 'center' });
}

/* ======================================================================
   HELPER: DRAW QR CODE VAULT PORTAL
   ====================================================================== */

async function drawQrCodeVault(
  doc: jsPDF,
  x: number,
  y: number,
  size: number,
  qrDataUrl?: string,
  giftUrl?: string,
  theme: ParchmentTheme = 'blush'
) {
  const colors = THEME_COLORS[theme];

  // QR Container Card
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(colors.goldBorder[0], colors.goldBorder[1], colors.goldBorder[2]);
  doc.setLineWidth(0.4);
  doc.roundedRect(x, y, size, size + 8, 2, 2, 'FD');

  if (qrDataUrl) {
    try {
      doc.addImage(qrDataUrl, 'PNG', x + 2, y + 2, size - 4, size - 4);
    } catch {
      // Fallback placeholder text if image fails
      doc.setFontSize(6);
      doc.setTextColor(100, 100, 100);
      doc.text('Scan for Digital Vault', x + size / 2, y + size / 2, { align: 'center' });
    }
  }

  // Label below QR
  doc.setFontSize(5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.accentText[0], colors.accentText[1], colors.accentText[2]);
  doc.text('SCAN TO REVEAL VAULT', x + size / 2, y + size + 5, { align: 'center' });
}

/* ======================================================================
   1. LOVE LETTER KEEPSAKE PDF GENERATOR
   ====================================================================== */

export async function generateLoveLetterPdf(options: PdfKeepsakeOptions): Promise<jsPDF> {
  const {
    recipientName = 'Beloved',
    senderName = 'Yours Always',
    title = 'A Handcrafted Expression of Eternal Love',
    message,
    date = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    theme = 'blush',
    sealType = 'heart',
    includeGoldFoil = true,
    includeWatermark = true,
    includeQrCode = true,
    qrDataUrl,
    giftUrl = 'https://giftlove.app/reveal',
    pageSize = 'a4'
  } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: pageSize
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const colors = THEME_COLORS[theme];

  // 1. Draw Background and Borders
  drawLuxuryBorders(doc, pageWidth, pageHeight, theme, includeGoldFoil);

  // 2. Subtle Watermark
  if (includeWatermark) {
    doc.setTextColor(colors.goldBorderLight[0], colors.goldBorderLight[1], colors.goldBorderLight[2]);
    doc.setFont('times', 'italic');
    doc.setFontSize(48);
    // Draw rotated faint brand watermark in center
    doc.text('Giftlove Atelier', pageWidth / 2, pageHeight / 2 + 10, {
      align: 'center',
      angle: 30
    });
  }

  // 3. Header Title & Brand Top
  const contentTop = 26; // mm
  doc.setTextColor(colors.goldBorder[0], colors.goldBorder[1], colors.goldBorder[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('G I F T L O V E   L U X U R Y   A T E L I E R', pageWidth / 2, contentTop, { align: 'center' });

  doc.setFont('times', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(colors.accentText[0], colors.accentText[1], colors.accentText[2]);
  doc.text('Official Handwritten Parchment Keepsake', pageWidth / 2, contentTop + 5, { align: 'center' });

  // 4. Date & Keepsake Registration
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(colors.primaryText[0], colors.primaryText[1], colors.primaryText[2]);
  doc.text(date, pageWidth - 24, contentTop + 14, { align: 'right' });

  // 5. Salutation (Dearest ...)
  const salutationY = contentTop + 24;
  doc.setFont('times', 'bolditalic');
  doc.setFontSize(20);
  doc.setTextColor(colors.primaryText[0], colors.primaryText[1], colors.primaryText[2]);
  doc.text(`Dearest ${recipientName},`, 24, salutationY);

  // 6. Letter Body Text (Multi-line word wrapped)
  const bodyY = salutationY + 12;
  const maxBodyWidth = pageWidth - 48;
  doc.setFont('times', 'normal');
  doc.setFontSize(12.5);
  doc.setLineHeightFactor(1.6);
  doc.setTextColor(colors.primaryText[0], colors.primaryText[1], colors.primaryText[2]);

  const splitMessage = doc.splitTextToSize(message, maxBodyWidth);
  doc.text(splitMessage, 24, bodyY);

  // Calculate bottom coordinate of body
  const bodyHeight = (splitMessage.length * 12.5 * 0.3527 * 1.6);
  const closingY = Math.min(pageHeight - 65, Math.max(bodyY + bodyHeight + 10, pageHeight - 85));

  // 7. Complimentary Close & Signature
  doc.setFont('times', 'italic');
  doc.setFontSize(14);
  doc.setTextColor(colors.accentText[0], colors.accentText[1], colors.accentText[2]);
  doc.text('Forever & unconditionally yours,', 24, closingY);

  doc.setFont('times', 'bolditalic');
  doc.setFontSize(18);
  doc.setTextColor(colors.primaryText[0], colors.primaryText[1], colors.primaryText[2]);
  doc.text(senderName, 24, closingY + 8);

  // 8. Wax Seal Stamp
  drawWaxSeal(doc, pageWidth / 2, pageHeight - 38, sealType, theme);

  // 9. Scannable Digital Vault QR Code (Bottom Right)
  if (includeQrCode && qrDataUrl) {
    await drawQrCodeVault(doc, pageWidth - 44, pageHeight - 52, 22, qrDataUrl, giftUrl, theme);
  }

  // 10. Footer Atelier Hallmark
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(colors.goldBorder[0], colors.goldBorder[1], colors.goldBorder[2]);
  doc.text('GIFTLOVE ROMANTIC KEEPSAKE • EDITION ARCHIVE NO. GL-' + Math.floor(100000 + Math.random() * 900000), pageWidth / 2, pageHeight - 16, { align: 'center' });

  return doc;
}

/* ======================================================================
   2. MEMORY CARD & PHOTO KEEPSAKE PDF GENERATOR
   ====================================================================== */

export async function generateMemoryCardPdf(options: PdfKeepsakeOptions): Promise<jsPDF> {
  const {
    recipientName = 'Beloved',
    senderName = 'Yours Truly',
    title = 'Our Timeless Love Story',
    message,
    date = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    theme = 'champagne',
    memories = [
      { date: 'First Sight', title: 'The Day We Met', description: 'When time stopped and everything changed forever.' },
      { date: 'Favorite Memory', title: 'Stargazing by the Shore', description: 'Whispering our future dreams with the sound of waves.' },
      { date: 'Special Milestone', title: 'Our Journey Continues', description: 'Every single day with you is a cherished gift.' }
    ],
    sealType = 'rose',
    includeGoldFoil = true,
    includeWatermark = true,
    includeQrCode = true,
    qrDataUrl,
    giftUrl,
    photoUrl,
    pageSize = 'a4'
  } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: pageSize
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const colors = THEME_COLORS[theme];

  // 1. Draw Background and Borders
  drawLuxuryBorders(doc, pageWidth, pageHeight, theme, includeGoldFoil);

  // 2. Header
  const contentTop = 24;
  doc.setTextColor(colors.goldBorder[0], colors.goldBorder[1], colors.goldBorder[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('G I F T L O V E   M E M O R Y   K E E P S A K E', pageWidth / 2, contentTop, { align: 'center' });

  doc.setFont('times', 'bolditalic');
  doc.setFontSize(22);
  doc.setTextColor(colors.primaryText[0], colors.primaryText[1], colors.primaryText[2]);
  doc.text(title, pageWidth / 2, contentTop + 10, { align: 'center' });

  doc.setFont('times', 'italic');
  doc.setFontSize(11);
  doc.setTextColor(colors.accentText[0], colors.accentText[1], colors.accentText[2]);
  doc.text(`Dedicated to ${recipientName} • Presented by ${senderName}`, pageWidth / 2, contentTop + 17, { align: 'center' });

  // 3. Central Memory Quote Ribbon
  const ribbonY = contentTop + 24;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(colors.goldBorderLight[0], colors.goldBorderLight[1], colors.goldBorderLight[2]);
  doc.setLineWidth(0.4);
  doc.roundedRect(24, ribbonY, pageWidth - 48, 26, 3, 3, 'FD');

  doc.setFont('times', 'italic');
  doc.setFontSize(10.5);
  doc.setTextColor(colors.primaryText[0], colors.primaryText[1], colors.primaryText[2]);
  const splitQuote = doc.splitTextToSize(`"${message}"`, pageWidth - 60);
  doc.text(splitQuote, pageWidth / 2, ribbonY + 8, { align: 'center' });

  // 4. Milestone Timeline Cards Grid
  const timelineY = ribbonY + 34;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(colors.goldBorder[0], colors.goldBorder[1], colors.goldBorder[2]);
  doc.text('C H E R I S H E D   M I L E S T O N E S', pageWidth / 2, timelineY, { align: 'center' });

  let cardY = timelineY + 6;
  const cardHeight = 26;
  const cardWidth = pageWidth - 48;

  memories.slice(0, 3).forEach((item, index) => {
    // Card background
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(colors.goldBorderLight[0], colors.goldBorderLight[1], colors.goldBorderLight[2]);
    doc.setLineWidth(0.3);
    doc.roundedRect(24, cardY, cardWidth, cardHeight, 2, 2, 'FD');

    // Index & Date Badge
    doc.setFillColor(colors.sealBg[0], colors.sealBg[1], colors.sealBg[2]);
    doc.roundedRect(28, cardY + 4, 28, 6, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(255, 255, 255);
    doc.text((item.date || `Chapter ${index + 1}`).toUpperCase(), 42, cardY + 8, { align: 'center' });

    // Milestone Title
    doc.setFont('times', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(colors.primaryText[0], colors.primaryText[1], colors.primaryText[2]);
    doc.text(item.title, 60, cardY + 9);

    // Milestone Description
    doc.setFont('times', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(colors.primaryText[0], colors.primaryText[1], colors.primaryText[2]);
    const splitDesc = doc.splitTextToSize(item.description, cardWidth - 38);
    doc.text(splitDesc, 28, cardY + 16);

    cardY += cardHeight + 4;
  });

  // 5. Wax Seal in bottom center
  drawWaxSeal(doc, pageWidth / 2, pageHeight - 36, sealType, theme);

  // 6. QR Vault on Right
  if (includeQrCode && qrDataUrl) {
    await drawQrCodeVault(doc, pageWidth - 44, pageHeight - 52, 22, qrDataUrl, giftUrl, theme);
  }

  // 7. Signature on Left
  doc.setFont('times', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(colors.accentText[0], colors.accentText[1], colors.accentText[2]);
  doc.text('Crafted with eternal devotion,', 24, pageHeight - 44);

  doc.setFont('times', 'bolditalic');
  doc.setFontSize(14);
  doc.setTextColor(colors.primaryText[0], colors.primaryText[1], colors.primaryText[2]);
  doc.text(senderName, 24, pageHeight - 37);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(colors.goldBorder[0], colors.goldBorder[1], colors.goldBorder[2]);
  doc.text(`Recorded Date: ${date}`, 24, pageHeight - 31);

  return doc;
}

/* ======================================================================
   3. CERTIFICATE OF ETERNAL LOVE & AUTHENTICITY PDF GENERATOR
   ====================================================================== */

export async function generateAuthenticityCertificatePdf(options: PdfKeepsakeOptions): Promise<jsPDF> {
  const {
    recipientName = 'Eleanor Vance',
    senderName = 'Alexander Sterling',
    title = 'Certificate of Eternal Devotion & Boundless Love',
    message = 'This certifies that Eleanor holds the entire heart, soul, and unconditional devotion of Alexander forever and always without expiration.',
    date = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    theme = 'champagne',
    sealType = 'crown',
    includeGoldFoil = true,
    includeWatermark = true,
    includeQrCode = true,
    certificateNumber = `GL-${Math.floor(100000 + Math.random() * 900000)}-VAL`,
    qrDataUrl,
    giftUrl
  } = options;

  // Landscape format for formal certificates
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const colors = THEME_COLORS[theme];

  // 1. Borders and Filigrees
  drawLuxuryBorders(doc, pageWidth, pageHeight, theme, includeGoldFoil);

  // 2. Header
  const contentTop = 22;
  doc.setTextColor(colors.goldBorder[0], colors.goldBorder[1], colors.goldBorder[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('G I F T L O V E   H A U T E   R O M A N C E   A T E L I E R', pageWidth / 2, contentTop, { align: 'center' });

  doc.setFont('times', 'bolditalic');
  doc.setFontSize(26);
  doc.setTextColor(colors.primaryText[0], colors.primaryText[1], colors.primaryText[2]);
  doc.text('Official Certificate of Eternal Devotion', pageWidth / 2, contentTop + 13, { align: 'center' });

  doc.setFont('times', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(colors.accentText[0], colors.accentText[1], colors.accentText[2]);
  doc.text('A Solemn & Sacred Covenant of Love and Unconditional Affinity', pageWidth / 2, contentTop + 20, { align: 'center' });

  // 3. Proclamation Statement
  const proY = contentTop + 34;
  doc.setFont('times', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(colors.primaryText[0], colors.primaryText[1], colors.primaryText[2]);
  doc.text('KNOW ALL TO WHOM THESE PRESENTS SHALL COME, GREETINGS:', pageWidth / 2, proY, { align: 'center' });

  doc.setFont('times', 'italic');
  doc.setFontSize(13);
  doc.text('It is hereby solemnly proclaimed and registered in the Eternal Archive that', pageWidth / 2, proY + 8, { align: 'center' });

  // Recipient Focus Name
  doc.setFont('times', 'bolditalic');
  doc.setFontSize(28);
  doc.setTextColor(colors.accentText[0], colors.accentText[1], colors.accentText[2]);
  doc.text(recipientName, pageWidth / 2, proY + 22, { align: 'center' });

  // Underline bar under recipient
  doc.setDrawColor(colors.goldBorder[0], colors.goldBorder[1], colors.goldBorder[2]);
  doc.setLineWidth(0.6);
  doc.line(pageWidth / 2 - 50, proY + 25, pageWidth / 2 + 50, proY + 25);

  // Message / Covenant Body
  doc.setFont('times', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(colors.primaryText[0], colors.primaryText[1], colors.primaryText[2]);
  const splitMsg = doc.splitTextToSize(message, pageWidth - 80);
  doc.text(splitMsg, pageWidth / 2, proY + 34, { align: 'center' });

  // 4. Signatures & Hallmarks Row
  const sigY = pageHeight - 44;

  // Left: Giver / Promiser Signature
  doc.setDrawColor(colors.goldBorder[0], colors.goldBorder[1], colors.goldBorder[2]);
  doc.setLineWidth(0.4);
  doc.line(35, sigY, 95, sigY);

  doc.setFont('times', 'bolditalic');
  doc.setFontSize(14);
  doc.setTextColor(colors.primaryText[0], colors.primaryText[1], colors.primaryText[2]);
  doc.text(senderName, 65, sigY - 4, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(colors.goldBorder[0], colors.goldBorder[1], colors.goldBorder[2]);
  doc.text('SOLEMNLY PLEDGED BY (GIVER)', 65, sigY + 4, { align: 'center' });

  // Center: Wax Seal Stamp
  drawWaxSeal(doc, pageWidth / 2, sigY - 4, sealType, theme);

  // Right: Date & Verification Hallmark
  doc.setDrawColor(colors.goldBorder[0], colors.goldBorder[1], colors.goldBorder[2]);
  doc.line(pageWidth - 95, sigY, pageWidth - 35, sigY);

  doc.setFont('times', 'italic');
  doc.setFontSize(11);
  doc.setTextColor(colors.primaryText[0], colors.primaryText[1], colors.primaryText[2]);
  doc.text(date, pageWidth - 65, sigY - 4, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(colors.goldBorder[0], colors.goldBorder[1], colors.goldBorder[2]);
  doc.text('DATE OF CONSECRATION', pageWidth - 65, sigY + 4, { align: 'center' });

  // Certificate Registry Code (Bottom)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(colors.goldBorder[0], colors.goldBorder[1], colors.goldBorder[2]);
  doc.text(`REGISTRY ARCHIVE NO: ${certificateNumber} • VALID FOR ALL ETERNITY`, pageWidth / 2, pageHeight - 16, { align: 'center' });

  // Optional QR Code on far left bottom
  if (includeQrCode && qrDataUrl) {
    await drawQrCodeVault(doc, 22, pageHeight - 38, 16, qrDataUrl, giftUrl, theme);
  }

  return doc;
}

/* ======================================================================
   4. ROMANTIC LOVE VOUCHERS BOOKLET PDF GENERATOR
   ====================================================================== */

export async function generateLoveVouchersPdf(options: PdfKeepsakeOptions): Promise<jsPDF> {
  const {
    recipientName = 'My Love',
    senderName = 'Forever Yours',
    theme = 'blush',
    sealType = 'heart',
    vouchers = [
      { id: '1', title: 'Breakfast in Bed Deluxe', subtitle: 'Warm croissants, freshly brewed espresso, and sweet kisses.', terms: 'Redeemable on any lazy weekend morning of your choice.' },
      { id: '2', title: 'Midnight Starlight Walk', subtitle: 'An uninterrupted romantic stroll under the stars with hot cocoa.', terms: 'Valid on any clear moonlit evening.' },
      { id: '3', title: 'Unconditional 30-Min Massage', subtitle: 'A soothing essential oil back & shoulder massage.', terms: 'No questions asked, anytime you feel tired or stressed.' },
      { id: '4', title: 'Chef Dinner Date of Choice', subtitle: 'I cook your all-time favorite meal with candlelight and music.', terms: 'Includes full cleanup duties by the chef.' },
      { id: '5', title: 'Movie Night Monarch', subtitle: 'You choose the movie, snacks, and receive unlimited cuddle rights.', terms: 'No complaints or phone distractions allowed.' },
      { id: '6', title: 'One Free "You Were Right" Pass', subtitle: 'Instant surrender of any playful debate or disagreement.', terms: 'Single use with guaranteed smiling embrace.' }
    ],
    pageSize = 'a4',
    includeGoldFoil = true
  } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: pageSize
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const colors = THEME_COLORS[theme];

  // 1. Background & Border
  drawLuxuryBorders(doc, pageWidth, pageHeight, theme, includeGoldFoil);

  // 2. Header
  const contentTop = 22;
  doc.setTextColor(colors.goldBorder[0], colors.goldBorder[1], colors.goldBorder[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('G I F T L O V E   R O M A N T I C   C O U P O N   B O O K L E T', pageWidth / 2, contentTop, { align: 'center' });

  doc.setFont('times', 'bolditalic');
  doc.setFontSize(22);
  doc.setTextColor(colors.primaryText[0], colors.primaryText[1], colors.primaryText[2]);
  doc.text(`Romantic Love Vouchers for ${recipientName}`, pageWidth / 2, contentTop + 9, { align: 'center' });

  doc.setFont('times', 'italic');
  doc.setFontSize(9.5);
  doc.setTextColor(colors.accentText[0], colors.accentText[1], colors.accentText[2]);
  doc.text(`Gifted with endless love by ${senderName} • Printable & Redeemable Anytime`, pageWidth / 2, contentTop + 15, { align: 'center' });

  // 3. Grid of 6 Love Coupons (2 columns x 3 rows)
  const gridStartX = 20;
  const gridStartY = contentTop + 22;
  const colWidth = (pageWidth - 48) / 2; // ~81 mm
  const rowHeight = 64; // mm

  vouchers.slice(0, 6).forEach((voucher, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = gridStartX + col * (colWidth + 8);
    const y = gridStartY + row * (rowHeight + 6);

    // Coupon Card Container with Scalloped/Dashed Cut Line
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(colors.goldBorder[0], colors.goldBorder[1], colors.goldBorder[2]);
    doc.setLineWidth(0.4);
    doc.roundedRect(x, y, colWidth, rowHeight, 3, 3, 'FD');

    // Dashed border inside coupon
    doc.setDrawColor(colors.goldBorderLight[0], colors.goldBorderLight[1], colors.goldBorderLight[2]);
    doc.setLineWidth(0.2);
    doc.roundedRect(x + 2, y + 2, colWidth - 4, rowHeight - 4, 2, 2, 'S');

    // Coupon Header Badge
    doc.setFillColor(colors.sealBg[0], colors.sealBg[1], colors.sealBg[2]);
    doc.roundedRect(x + 5, y + 5, 24, 5, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(255, 255, 255);
    doc.text(`VOUCHER #${idx + 1}`, x + 17, y + 8.5, { align: 'center' });

    // Gift Icon / Heart
    doc.setTextColor(colors.accentText[0], colors.accentText[1], colors.accentText[2]);
    doc.setFontSize(9);
    doc.text('♥ GIFTLOVE', x + colWidth - 7, y + 9, { align: 'right' });

    // Title
    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(colors.primaryText[0], colors.primaryText[1], colors.primaryText[2]);
    const splitTitle = doc.splitTextToSize(voucher.title, colWidth - 10);
    doc.text(splitTitle, x + 5, y + 17);

    // Subtitle / Description
    doc.setFont('times', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(colors.primaryText[0], colors.primaryText[1], colors.primaryText[2]);
    const splitSub = doc.splitTextToSize(voucher.subtitle, colWidth - 10);
    doc.text(splitSub, x + 5, y + 27);

    // Terms / Fine Print
    if (voucher.terms) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.setTextColor(colors.goldBorder[0], colors.goldBorder[1], colors.goldBorder[2]);
      const splitTerms = doc.splitTextToSize(voucher.terms, colWidth - 10);
      doc.text(splitTerms, x + 5, y + 43);
    }

    // Cut here scissor icon / dashed line indicator
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.15);
    doc.line(x + 5, y + rowHeight - 9, x + colWidth - 5, y + rowHeight - 9);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5);
    doc.setTextColor(150, 150, 150);
    doc.text('✂ Cut out to redeem • Non-transferable • Bound with eternal love', x + colWidth / 2, y + rowHeight - 4, { align: 'center' });
  });

  // Footer Hallmark
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(colors.goldBorder[0], colors.goldBorder[1], colors.goldBorder[2]);
  doc.text('GIFTLOVE ROMANTIC VOUCHER EDITION • VALID WORLDWIDE WITHOUT EXPIRATION', pageWidth / 2, pageHeight - 14, { align: 'center' });

  return doc;
}

/* ======================================================================
   5. MASTER ROUTER: GENERATE AND DOWNLOAD PDF KEEPSAKE
   ====================================================================== */

export async function exportKeepsakeAsPdf(options: PdfKeepsakeOptions): Promise<{ doc: jsPDF; filename: string }> {
  let doc: jsPDF;
  const cleanName = (options.recipientName || 'beloved').toLowerCase().replace(/\s+/g, '-');
  let filename = `giftlove-keepsake-${cleanName}.pdf`;

  switch (options.template) {
    case 'love_letter':
      doc = await generateLoveLetterPdf(options);
      filename = `giftlove-love-letter-${cleanName}.pdf`;
      break;
    case 'memory_card':
      doc = await generateMemoryCardPdf(options);
      filename = `giftlove-memory-card-${cleanName}.pdf`;
      break;
    case 'authenticity_certificate':
      doc = await generateAuthenticityCertificatePdf(options);
      filename = `giftlove-love-certificate-${cleanName}.pdf`;
      break;
    case 'love_vouchers':
      doc = await generateLoveVouchersPdf(options);
      filename = `giftlove-love-vouchers-${cleanName}.pdf`;
      break;
    default:
      doc = await generateLoveLetterPdf(options);
      filename = `giftlove-love-letter-${cleanName}.pdf`;
  }

  // Trigger browser download
  doc.save(filename);

  return { doc, filename };
}

/* ======================================================================
   6. DOM SNAPSHOT TO HIGH-RES PDF (HTML2CANVAS + JSPDF)
   ====================================================================== */

export async function exportElementAsPdf(
  element: HTMLElement,
  filename: string = 'giftlove-custom-keepsake.pdf',
  pageSize: 'a4' | 'letter' = 'a4'
): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 2.5, // Ultra-sharp 300 DPI equivalent
    useCORS: true,
    logging: false,
    backgroundColor: null
  });

  const imgData = canvas.toDataURL('image/png', 1.0);
  const pdf = new jsPDF({
    orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
    unit: 'mm',
    format: pageSize
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pdfWidth - 20; // 10mm margins
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  const yPos = Math.max(10, (pdfHeight - imgHeight) / 2);
  pdf.addImage(imgData, 'PNG', 10, yPos, imgWidth, imgHeight);
  pdf.save(filename);
}
