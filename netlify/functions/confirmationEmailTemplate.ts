import {
  COLORS,
  SITE_NAME,
  SITE_TAGLINE,
  RESPONSE_TIME,
  escapeHtml,
  formatMessageHtml,
  firstName,
  resolveSiteUrl,
  truncateText,
  wrapEmailDocument,
} from "./emailTheme";

export interface ConfirmationEmailInput {
  name: string;
  email: string;
  subject: string;
  message: string;
  siteUrl?: string;
}

export function buildConfirmationEmailSubject(input: ConfirmationEmailInput): string {
  return `Thanks for your message — ${SITE_NAME}`;
}

export function buildConfirmationEmailText(input: ConfirmationEmailInput): string {
  const site = resolveSiteUrl(input.siteUrl);
  const greeting = firstName(input.name);

  return [
    `Hi ${greeting},`,
    "",
    `Thank you for reaching out through my portfolio. I've received your message and will get back to you within ${RESPONSE_TIME}.`,
    "",
    `Subject: ${input.subject}`,
    "",
    "Your message:",
    truncateText(input.message, 500),
    "",
    `If anything urgent comes up, you can reply to this email.`,
    "",
    `${SITE_NAME}`,
    site,
    "",
    "This is an automated confirmation. Your original message was delivered successfully.",
  ].join("\n");
}

export function buildConfirmationEmailHtml(input: ConfirmationEmailInput): string {
  const site = resolveSiteUrl(input.siteUrl);
  const greeting = escapeHtml(firstName(input.name));
  const subject = escapeHtml(input.subject);
  const preview = formatMessageHtml(truncateText(input.message, 320));

  const bodyHtml = `
    <p style="margin:0 0 10px;font-family:'Consolas','Courier New',monospace;font-size:13px;line-height:1.4;color:${COLORS.accent1};letter-spacing:0.02em;">
      // Auto-reply
    </p>

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:20px;">
      <tr>
        <td style="vertical-align:middle;padding-right:12px;">
          <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background-color:${COLORS.success};box-shadow:0 0 12px rgba(32,224,128,0.55);"></span>
        </td>
        <td>
          <h1 class="hero-title" style="margin:0;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:30px;font-weight:700;line-height:1.2;color:${COLORS.textPrimary};">
            Message received
          </h1>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 24px;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.5;color:${COLORS.textMuted};">
      ${SITE_TAGLINE}
    </p>

    <p style="margin:0 0 20px;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.7;color:${COLORS.textSoft};">
      Hi <strong style="color:${COLORS.textPrimary};">${greeting}</strong>,
    </p>

    <p style="margin:0 0 24px;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.75;color:${COLORS.textSoft};">
      Thank you for getting in touch. I've received your message and will reply within
      <strong style="color:${COLORS.textPrimary};">${RESPONSE_TIME}</strong>.
      If your note is urgent, feel free to reply to this email.
    </p>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:24px;">
      <tr>
        <td style="background-color:${COLORS.bgGlass};border:1px solid ${COLORS.borderStrong};border-radius:12px;padding:20px 22px;">
          <p style="margin:0 0 12px;font-family:'Consolas','Courier New',monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:${COLORS.textMuted};">
            Your submission
          </p>
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:14px;">
            <tr>
              <td style="background-color:rgba(0,245,212,0.12);border:1px solid rgba(0,245,212,0.35);border-radius:999px;padding:7px 14px;">
                <span style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:13px;font-weight:600;color:${COLORS.accent1};">
                  ${subject}
                </span>
              </td>
            </tr>
          </table>
          <p style="margin:0 0 6px;font-family:'Consolas','Courier New',monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:${COLORS.accent1};">
            // Message preview
          </p>
          <p style="margin:0;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.7;color:${COLORS.textSoft};">
            ${preview}
          </p>
        </td>
      </tr>
    </table>

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:28px;">
      <tr>
        <td align="center">
          <a
            href="${site}"
            style="display:inline-block;padding:14px 32px;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;font-weight:700;color:#050810;text-decoration:none;border-radius:999px;background-color:${COLORS.accent1};border:1px solid rgba(0,245,212,0.6);"
          >
            Visit portfolio
          </a>
        </td>
      </tr>
    </table>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td style="padding-top:20px;border-top:1px solid ${COLORS.border};">
          <p style="margin:0 0 8px;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;font-weight:600;color:${COLORS.textPrimary};">
            ${escapeHtml(SITE_NAME)}
          </p>
          <p style="margin:0 0 6px;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:13px;line-height:1.6;color:${COLORS.textMuted};">
            This is an automated confirmation sent to <span style="color:${COLORS.textSoft};">${escapeHtml(input.email)}</span>.
            Your message was delivered successfully.
          </p>
          <p style="margin:0;font-family:'Consolas','Courier New',monospace;font-size:12px;color:${COLORS.textMuted};">
            <a href="${site}" style="color:${COLORS.textMuted};text-decoration:underline;">${escapeHtml(site)}</a>
          </p>
        </td>
      </tr>
    </table>
  `;

  return wrapEmailDocument({
    title: buildConfirmationEmailSubject(input),
    preheader: `Thanks ${firstName(input.name)} — your message was received.`,
    bodyHtml,
  });
}
