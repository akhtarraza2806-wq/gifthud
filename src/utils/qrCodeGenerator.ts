/**
 * Utility functions for generating and downloading framed, branded QR codes for gifts.
 */

export interface FramedQrCardOptions {
  qrCanvasElement?: HTMLCanvasElement | null;
  qrDataUrl?: string;
  giftUrl: string;
  recipientName: string;
  senderName?: string;
  giftTitle?: string;
  tagline?: string;
  theme?: 'blush' | 'champagne' | 'midnight' | 'burgundy';
  sealIcon?: 'rose' | 'heart' | 'ring' | 'crown';
  fileName?: string;
}

/**
 * Downloads a raw canvas element as a PNG image
 */
export function downloadCanvasAsPng(canvas: HTMLCanvasElement, filename: string = 'gift-qr-code.png') {
  const dataUrl = canvas.toDataURL('image/png', 1.0);
  const link = document.createElement('a');
  link.download = filename.endsWith('.png') ? filename : `${filename}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generates and downloads a high-resolution, luxury branded gift card containing the QR code.
 */
export async function downloadFramedGiftQrCard(options: FramedQrCardOptions): Promise<void> {
  const {
    qrCanvasElement,
    qrDataUrl,
    giftUrl,
    recipientName = 'Beloved',
    senderName = 'With Love',
    giftTitle = 'A Special Gift Awaits You',
    tagline = 'Scan with your camera to open your handwritten note & gift reveal',
    theme = 'blush',
    sealIcon = 'heart',
    fileName = 'giftlove-qr-card',
  } = options;

  // 1. Prepare high-resolution offscreen canvas (2x retina quality: 900x1200)
  const width = 900;
  const height = 1200;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas 2D context could not be initialized');
  }

  // 2. Determine color palette based on theme
  let bgGradientStart = '#fff5f6';
  let bgGradientMid = '#ffe4e8';
  let bgGradientEnd = '#fecdd6';
  let primaryTextColor = '#4c051a';
  let accentTextColor = '#be1243';
  let scriptColor = '#e11d53';
  let goldFoilColor = '#cfb27e';
  let goldFoilLight = '#ede2cc';
  let qrContainerBg = '#ffffff';
  let qrBorderColor = '#fda4b4';

  if (theme === 'champagne') {
    bgGradientStart = '#fdfbf7';
    bgGradientMid = '#f7f2e7';
    bgGradientEnd = '#ede2cc';
    primaryTextColor = '#261a06';
    accentTextColor = '#876930';
    scriptColor = '#a88544';
    goldFoilColor = '#b89859';
    goldFoilLight = '#dfcca8';
    qrContainerBg = '#ffffff';
    qrBorderColor = '#dfcca8';
  } else if (theme === 'midnight') {
    bgGradientStart = '#17060e';
    bgGradientMid = '#260917';
    bgGradientEnd = '#0d0208';
    primaryTextColor = '#fff5f6';
    accentTextColor = '#fda4b4';
    scriptColor = '#fb718b';
    goldFoilColor = '#e2c58e';
    goldFoilLight = '#f7f2e7';
    qrContainerBg = '#220b16';
    qrBorderColor = '#5c1731';
  } else if (theme === 'burgundy') {
    bgGradientStart = '#4c051a';
    bgGradientMid = '#881337';
    bgGradientEnd = '#31020f';
    primaryTextColor = '#ffffff';
    accentTextColor = '#fecdd6';
    scriptColor = '#ffd0db';
    goldFoilColor = '#e6cb95';
    goldFoilLight = '#fff4dc';
    qrContainerBg = '#ffffff';
    qrBorderColor = '#be1243';
  }

  // 3. Draw rounded card background with subtle inner glow
  const cornerRadius = 40;
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(0, 0, width, height, cornerRadius);
  ctx.clip();

  // Background gradient fill
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, bgGradientStart);
  bgGrad.addColorStop(0.5, bgGradientMid);
  bgGrad.addColorStop(1, bgGradientEnd);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Decorative luxury ambient circles
  ctx.globalAlpha = 0.35;
  const radialGrad1 = ctx.createRadialGradient(150, 150, 10, 150, 150, 350);
  radialGrad1.addColorStop(0, goldFoilLight);
  radialGrad1.addColorStop(1, 'transparent');
  ctx.fillStyle = radialGrad1;
  ctx.fillRect(0, 0, 500, 500);

  const radialGrad2 = ctx.createRadialGradient(width - 150, height - 150, 10, width - 150, height - 150, 350);
  radialGrad2.addColorStop(0, accentTextColor);
  radialGrad2.addColorStop(1, 'transparent');
  ctx.fillStyle = radialGrad2;
  ctx.fillRect(width - 500, height - 500, 500, 500);
  ctx.globalAlpha = 1.0;
  ctx.restore();

  // 4. Gold Foil Filigree Double Border
  ctx.save();
  ctx.strokeStyle = goldFoilColor;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(24, 24, width - 48, height - 48, 30);
  ctx.stroke();

  ctx.strokeStyle = goldFoilLight;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(32, 32, width - 64, height - 64, 24);
  ctx.stroke();

  // Corner ornaments
  const drawCorner = (cx: number, cy: number, rot: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    ctx.strokeStyle = goldFoilColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 18);
    ctx.lineTo(0, 0);
    ctx.lineTo(18, 0);
    ctx.stroke();
    ctx.restore();
  };
  drawCorner(44, 44, 0);
  drawCorner(width - 44, 44, Math.PI / 2);
  drawCorner(width - 44, height - 44, Math.PI);
  drawCorner(44, height - 44, -Math.PI / 2);
  ctx.restore();

  // 5. Header Brand Title & Filigree
  ctx.save();
  ctx.textAlign = 'center';

  // "G I F T L O V E" brand text
  ctx.fillStyle = accentTextColor;
  ctx.font = '700 16px "Plus Jakarta Sans", sans-serif';
  ctx.letterSpacing = '8px';
  ctx.fillText('• G I F T L O V E •', width / 2, 85);

  // Small separator line with diamond
  ctx.strokeStyle = goldFoilColor;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 120, 105);
  ctx.lineTo(width / 2 - 20, 105);
  ctx.moveTo(width / 2 + 20, 105);
  ctx.lineTo(width / 2 + 120, 105);
  ctx.stroke();

  ctx.fillStyle = goldFoilColor;
  ctx.beginPath();
  ctx.arc(width / 2, 105, 4, 0, Math.PI * 2);
  ctx.fill();

  // Recipient Greeting
  ctx.fillStyle = primaryTextColor;
  ctx.font = 'bold 42px "Playfair Display", Georgia, serif';
  ctx.letterSpacing = '0px';
  ctx.fillText(`Dearest ${recipientName || 'Beloved'}`, width / 2, 175);

  // Gift Title
  ctx.fillStyle = accentTextColor;
  ctx.font = 'italic 24px "Cormorant Garamond", Georgia, serif';
  ctx.fillText(giftTitle, width / 2, 218);

  ctx.restore();

  // 6. Draw the QR Code in an elevated luxury white frame
  const qrBoxSize = 440;
  const qrBoxX = (width - qrBoxSize) / 2;
  const qrBoxY = 270;

  ctx.save();
  // Frame Drop Shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.16)';
  ctx.shadowBlur = 28;
  ctx.shadowOffsetY = 12;

  // Frame Background
  ctx.fillStyle = qrContainerBg;
  ctx.beginPath();
  ctx.roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 28);
  ctx.fill();
  ctx.restore();

  // Frame Border
  ctx.save();
  ctx.strokeStyle = qrBorderColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 28);
  ctx.stroke();

  // Inner gold border around QR
  ctx.strokeStyle = goldFoilColor;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(qrBoxX + 16, qrBoxY + 16, qrBoxSize - 32, qrBoxSize - 32, 20);
  ctx.stroke();
  ctx.restore();

  // 7. Obtain and draw the QR image onto the canvas
  let qrImg: HTMLImageElement | null = null;

  if (qrCanvasElement) {
    const dataUrl = qrCanvasElement.toDataURL('image/png');
    qrImg = await loadImage(dataUrl);
  } else if (qrDataUrl) {
    qrImg = await loadImage(qrDataUrl);
  }

  if (qrImg) {
    const qrSize = 340;
    const qrX = (width - qrSize) / 2;
    const qrY = qrBoxY + (qrBoxSize - qrSize) / 2;
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
  }

  // 8. Instructions & Tagline
  ctx.save();
  ctx.textAlign = 'center';

  // "SCAN TO REVEAL" badge
  const badgeWidth = 240;
  const badgeHeight = 38;
  const badgeX = (width - badgeWidth) / 2;
  const badgeY = 740;

  ctx.fillStyle = accentTextColor;
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 19);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px "Plus Jakarta Sans", sans-serif';
  ctx.letterSpacing = '2px';
  ctx.fillText('✨ SCAN TO REVEAL ✨', width / 2, badgeY + 24);

  // Subtitle tagline
  ctx.fillStyle = primaryTextColor;
  ctx.font = '500 18px "Plus Jakarta Sans", sans-serif';
  ctx.letterSpacing = '0px';
  wrapText(ctx, tagline, width / 2, 820, 620, 26);

  // 9. Wax Seal / Heart Emblem at the bottom
  const sealY = 930;
  const sealRadius = 38;

  // Wax seal gradient shadow
  ctx.save();
  ctx.shadowColor = 'rgba(225, 29, 83, 0.4)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 8;

  const sealGrad = ctx.createRadialGradient(
    width / 2 - 10,
    sealY - 10,
    5,
    width / 2,
    sealY,
    sealRadius
  );
  sealGrad.addColorStop(0, '#f43f68');
  sealGrad.addColorStop(0.7, '#be1243');
  sealGrad.addColorStop(1, '#881337');

  ctx.fillStyle = sealGrad;
  ctx.beginPath();
  ctx.arc(width / 2, sealY, sealRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Seal gold ring
  ctx.strokeStyle = goldFoilLight;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(width / 2, sealY, sealRadius - 4, 0, Math.PI * 2);
  ctx.stroke();

  // Seal Icon Emoji / Emblem
  ctx.font = '28px "Apple Color Emoji", "Segoe UI Emoji", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  let sealEmoji = '💖';
  if (sealIcon === 'rose') sealEmoji = '🌹';
  if (sealIcon === 'ring') sealEmoji = '💍';
  if (sealIcon === 'crown') sealEmoji = '👑';
  ctx.fillText(sealEmoji, width / 2, sealY + 2);

  // 10. Script Sign-off & Sender
  ctx.font = 'italic 34px "Playfair Display", Georgia, cursive';
  ctx.fillStyle = scriptColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(`Forever yours, ${senderName || 'Your Love'}`, width / 2, 1025);

  // Destination gift URL small subtitle
  ctx.font = '12px "Plus Jakarta Sans", monospace';
  ctx.fillStyle = accentTextColor;
  ctx.globalAlpha = 0.75;
  const truncatedUrl = giftUrl.length > 50 ? `${giftUrl.slice(0, 47)}...` : giftUrl;
  ctx.fillText(truncatedUrl, width / 2, 1070);

  ctx.restore();

  // 11. Trigger Download
  downloadCanvasAsPng(canvas, fileName);
}

/**
 * Helper to wrap text cleanly onto canvas
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(' ');
  let line = '';

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}

/**
 * Promise helper to load image from URL or Data URL
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}
