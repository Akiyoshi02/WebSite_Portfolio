export const COLORS = {
  bgPrimary: "#050810",
  bgSecondary: "#0d1117",
  bgElevated: "#111827",
  bgGlass: "rgba(255, 255, 255, 0.04)",
  bgGlassSolid: "#141c2b",
  bgInput: "rgba(255, 255, 255, 0.04)",
  accent1: "#00f5d4",
  accent2: "#7b2fff",
  accent3: "#ff4ecd",
  success: "#20e080",
  textPrimary: "#e8eaf0",
  textSoft: "#c7ceda",
  textMuted: "#9aa4b2",
  textOnAccent: "#031111",
  border: "rgba(255, 255, 255, 0.08)",
  borderStrong: "rgba(255, 255, 255, 0.18)",
  shadow: "0 30px 80px rgba(0, 0, 0, 0.35)",
  glowCyan: "rgba(0, 245, 212, 0.16)",
  glowGreen: "rgba(32, 224, 128, 0.08)",
} as const;

export const SITE_NAME = "Akiyoshi Yapa";
export const SITE_TAGLINE = "Software Engineer · Full-Stack Developer";
export const RESPONSE_TIME = "1–2 business days";

const FONT_LINK =
  "https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,600;9..40,700;9..40,800&family=JetBrains+Mono:wght@400;500;700&family=Syne:wght@700;800&display=swap";

const FONT_BODY = "'DM Sans', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const FONT_DISPLAY = "'Syne', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const FONT_MONO = "'JetBrains Mono', Consolas, 'Courier New', monospace";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function formatMessageHtml(message: string): string {
  return escapeHtml(message).replace(/\r\n|\r|\n/g, "<br />");
}

export function resolveSiteUrl(siteUrl?: string): string {
  const raw = siteUrl?.trim() || process.env.SITE_URL?.trim() || "https://akiyoshiyapa.netlify.app";
  return raw.replace(/\/$/, "");
}

export function firstName(fullName: string): string {
  const part = fullName.trim().split(/\s+/)[0];
  return part || fullName;
}

export function truncateText(text: string, max = 280): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trimEnd()}…`;
}

function progressBar(): string {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td height="3" style="height:3px;font-size:0;line-height:0;background:linear-gradient(90deg, ${COLORS.accent1} 0%, ${COLORS.accent2} 50%, ${COLORS.accent3} 100%);">&nbsp;</td>
      </tr>
    </table>
  `;
}

function heroGlow(): string {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:${COLORS.bgPrimary};">
      <tr>
        <td align="center" style="padding:28px 20px 8px;background-color:${COLORS.bgPrimary};background-image:radial-gradient(circle at 50% -30%, ${COLORS.glowCyan}, transparent 420px);">
          <p style="margin:0 0 8px;font-family:${FONT_MONO};font-size:13px;line-height:1.5;color:${COLORS.accent1};letter-spacing:0.02em;">
            &lt; ${escapeHtml(SITE_NAME)} /&gt;
          </p>
          <h1 style="margin:0;font-family:${FONT_DISPLAY};font-size:28px;font-weight:800;line-height:1.05;letter-spacing:-0.02em;">
            <span style="color:${COLORS.accent1};">Akiyoshi</span>
            <span style="color:${COLORS.textPrimary};"> </span>
            <span style="color:${COLORS.accent2};">Yapa</span>
          </h1>
        </td>
      </tr>
    </table>
  `;
}

export function sectionHeading(kicker: string, title: string, description?: string): string {
  const desc = description
    ? `<p style="margin:12px 0 0;font-family:${FONT_BODY};font-size:15px;line-height:1.75;color:${COLORS.textSoft};">${escapeHtml(description)}</p>`
    : "";

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:28px;">
      <tr>
        <td>
          <p style="margin:0;font-family:${FONT_MONO};font-size:14px;line-height:1.4;color:${COLORS.accent1};">${escapeHtml(kicker)}</p>
          <h2 style="margin:8px 0 0;font-family:${FONT_BODY};font-size:clamp(26px, 5vw, 38px);font-weight:700;line-height:1.08;color:${COLORS.textPrimary};">${escapeHtml(title)}</h2>
          ${desc}
        </td>
      </tr>
    </table>
  `;
}

export function formIntro(title: string, subtitle: string): string {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:22px;">
      <tr>
        <td style="padding-bottom:18px;border-bottom:1px solid ${COLORS.border};">
          <p style="margin:0;font-family:${FONT_BODY};font-size:18px;font-weight:800;line-height:1.2;color:${COLORS.textPrimary};">${escapeHtml(title)}</p>
          <p style="margin:8px 0 0;font-family:${FONT_BODY};font-size:14px;line-height:1.45;color:${COLORS.textMuted};">${escapeHtml(subtitle)}</p>
        </td>
      </tr>
    </table>
  `;
}

export function glassCard(innerHtml: string, padding = "28px"): string {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:20px;">
      <tr>
        <td style="background-color:${COLORS.bgGlassSolid};background:${COLORS.bgGlass};border:1px solid ${COLORS.border};border-radius:16px;padding:${padding};box-shadow:${COLORS.shadow};">
          ${innerHtml}
        </td>
      </tr>
    </table>
  `;
}

export function chip(text: string, accent = false): string {
  const bg = accent ? "rgba(0, 245, 212, 0.08)" : "rgba(255, 255, 255, 0.045)";
  const border = accent ? "rgba(0, 245, 212, 0.24)" : COLORS.border;
  const color = accent ? COLORS.accent1 : COLORS.textPrimary;

  return `
    <span style="display:inline-block;min-height:32px;padding:6px 12px;border-radius:999px;font-family:${FONT_BODY};font-size:13px;font-weight:800;line-height:20px;color:${color};background:${bg};border:1px solid ${border};">
      ${escapeHtml(text)}
    </span>
  `;
}

export function chipRow(chips: string[]): string {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:20px;">
      <tr>
        <td>${chips.join("&nbsp;&nbsp;")}</td>
      </tr>
    </table>
  `;
}

export function availabilityPill(label: string): string {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:22px;">
      <tr>
        <td>
          <span style="display:inline-block;padding:8px 12px;border-radius:999px;background:${COLORS.glowGreen};border:1px solid rgba(32, 224, 128, 0.22);font-family:${FONT_BODY};font-size:14px;font-weight:800;color:${COLORS.textPrimary};">
            <span style="display:inline-block;width:10px;height:10px;margin-right:9px;border-radius:50%;background:${COLORS.success};vertical-align:middle;box-shadow:0 0 10px rgba(32,224,128,0.45);"></span>${escapeHtml(label)}
          </span>
        </td>
      </tr>
    </table>
  `;
}

export function contactCardRow(options: {
  icon: string;
  title: string;
  subtitle: string;
  href?: string;
}): string {
  const subtitleHtml = options.href
    ? `<a href="${options.href}" style="color:${COLORS.textMuted};text-decoration:none;font-weight:600;">${escapeHtml(options.subtitle)}</a>`
    : `<span style="color:${COLORS.textMuted};">${escapeHtml(options.subtitle)}</span>`;

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:12px;">
      <tr>
        <td width="46" valign="top" style="width:46px;padding-right:14px;">
          <div style="width:46px;height:46px;border-radius:50%;background:rgba(255,255,255,0.045);border:1px solid ${COLORS.border};text-align:center;line-height:46px;font-size:17px;color:${COLORS.accent1};">
            ${options.icon}
          </div>
        </td>
        <td valign="middle" style="padding:4px 0;">
          <p style="margin:0;font-family:${FONT_BODY};font-size:15px;font-weight:800;color:${COLORS.textPrimary};">${escapeHtml(options.title)}</p>
          <p style="margin:2px 0 0;font-family:${FONT_BODY};font-size:14px;line-height:1.45;">${subtitleHtml}</p>
        </td>
      </tr>
    </table>
  `;
}

export function fieldBlock(label: string, valueHtml: string): string {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:14px;">
      <tr>
        <td>
          <p style="margin:0 0 7px;font-family:${FONT_BODY};font-size:14px;font-weight:800;color:${COLORS.textPrimary};">${escapeHtml(label)}</p>
          <div style="min-height:48px;padding:12px 14px;border-radius:12px;background:${COLORS.bgInput};border:1px solid ${COLORS.border};font-family:${FONT_BODY};font-size:15px;line-height:1.5;color:${COLORS.textPrimary};">
            ${valueHtml}
          </div>
        </td>
      </tr>
    </table>
  `;
}

export function formRowTwoCol(left: string, right: string): string {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:14px;">
      <tr>
        <td width="48%" valign="top" style="padding-right:7px;">${left}</td>
        <td width="48%" valign="top" style="padding-left:7px;">${right}</td>
      </tr>
    </table>
  `;
}

export function messageArea(label: string, contentHtml: string): string {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:0;">
      <tr>
        <td>
          <p style="margin:0 0 7px;font-family:${FONT_BODY};font-size:14px;font-weight:800;color:${COLORS.textPrimary};">${escapeHtml(label)}</p>
          <div style="min-height:120px;padding:14px;border-radius:12px;background:${COLORS.bgInput};border:1px solid ${COLORS.borderStrong};font-family:${FONT_BODY};font-size:15px;line-height:1.75;color:${COLORS.textSoft};">
            ${contentHtml}
          </div>
        </td>
      </tr>
    </table>
  `;
}

export function monoKicker(text: string): string {
  return `
    <p style="margin:0 0 16px;padding:0 14px;border-radius:999px;display:inline-block;border:1px solid rgba(0, 245, 212, 0.24);background:rgba(0, 245, 212, 0.06);font-family:${FONT_MONO};font-size:13px;line-height:32px;color:${COLORS.accent1};">
      ${escapeHtml(text)}
    </p>
  `;
}

export function bodyCopy(html: string): string {
  return `
    <p style="margin:0 0 18px;font-family:${FONT_BODY};font-size:16px;line-height:1.75;color:${COLORS.textSoft};">
      ${html}
    </p>
  `;
}

export function buttonPrimary(href: string, label: string): string {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:28px auto 8px;">
      <tr>
        <td align="center" style="border-radius:999px;background:linear-gradient(135deg, ${COLORS.accent1} 0%, ${COLORS.accent2} 55%, ${COLORS.accent3} 100%);box-shadow:0 18px 45px rgba(0, 245, 212, 0.22);">
          <a href="${href}" style="display:inline-block;min-height:46px;padding:0 24px;line-height:46px;font-family:${FONT_BODY};font-size:15px;font-weight:700;color:${COLORS.textOnAccent};text-decoration:none;border-radius:999px;">
            ${escapeHtml(label)}
          </a>
        </td>
      </tr>
    </table>
  `;
}

export function buttonOutline(href: string, label: string): string {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:28px auto 8px;">
      <tr>
        <td align="center" style="border-radius:999px;background:rgba(255,255,255,0.03);border:1px solid ${COLORS.borderStrong};">
          <a href="${href}" style="display:inline-block;min-height:46px;padding:0 24px;line-height:46px;font-family:${FONT_BODY};font-size:15px;font-weight:700;color:${COLORS.textPrimary};text-decoration:none;border-radius:999px;">
            ${escapeHtml(label)}
          </a>
        </td>
      </tr>
    </table>
  `;
}

export function emailFooter(lines: string[]): string {
  const rows = lines
    .map(
      (line) => `
      <p style="margin:0 0 8px;font-family:${FONT_BODY};font-size:13px;line-height:1.6;color:${COLORS.textMuted};">${line}</p>
    `,
    )
    .join("");

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:28px;">
      <tr>
        <td style="padding-top:20px;border-top:1px solid ${COLORS.border};">
          ${rows}
          <p style="margin:14px 0 0;font-family:${FONT_MONO};font-size:12px;color:${COLORS.textMuted};">
            &lt; ${escapeHtml(SITE_NAME)} /&gt;
          </p>
        </td>
      </tr>
    </table>
  `;
}

export function wrapEmailDocument(options: {
  title: string;
  preheader: string;
  bodyHtml: string;
}): string {
  const { title, preheader, bodyHtml } = options;

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="color-scheme" content="dark" />
  <meta name="supported-color-schemes" content="dark" />
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="${FONT_LINK}" />
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: ${COLORS.bgPrimary}; }
    @media only screen and (max-width: 620px) {
      .shell { width: 100% !important; max-width: 100% !important; }
      .pad { padding-left: 18px !important; padding-right: 18px !important; }
      .stack { display: block !important; width: 100% !important; padding: 0 !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${COLORS.bgPrimary};background-image:linear-gradient(180deg, ${COLORS.bgPrimary} 0%, ${COLORS.bgSecondary} 55%, ${COLORS.bgPrimary} 100%);">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${escapeHtml(preheader)}</div>
  ${progressBar()}
  ${heroGlow()}
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:${COLORS.bgPrimary};">
    <tr>
      <td align="center" style="padding:8px 16px 40px;">
        <table role="presentation" class="shell" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;">
          <tr>
            <td class="pad" style="padding:8px 8px 0;">
              ${bodyHtml}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
