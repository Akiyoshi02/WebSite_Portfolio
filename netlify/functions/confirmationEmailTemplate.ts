import {
  SITE_NAME,
  SITE_TAGLINE,
  RESPONSE_TIME,
  escapeHtml,
  formatMessageHtml,
  firstName,
  truncateText,
  resolveSiteUrl,
  sectionHeading,
  formIntro,
  glassCard,
  chip,
  chipRow,
  availabilityPill,
  monoKicker,
  bodyCopy,
  messageArea,
  buttonOutline,
  emailFooter,
  wrapEmailDocument,
} from "./emailTheme";

export interface ConfirmationEmailInput {
  name: string;
  email: string;
  subject: string;
  message: string;
  siteUrl?: string;
}

export function buildConfirmationEmailSubject(_input: ConfirmationEmailInput): string {
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
  const greet = escapeHtml(firstName(input.name));

  const body = `
    ${sectionHeading(
      "// 08. Contact",
      "Let's Build Something Together",
      "Open to software engineering roles, freelance builds, collaborations, and thoughtful technical conversations.",
    )}
    ${monoKicker("&lt; Message received /&gt;")}
    ${bodyCopy(
      `Hi <strong style="color:#e8eaf0;">${greet}</strong>, thank you for getting in touch. I've received your message and will reply within <strong style="color:#e8eaf0;">${RESPONSE_TIME}</strong>.`,
    )}
    ${availabilityPill("Message delivered · Open to reply")}
    ${formIntro("Your submission", `A copy of what you sent · ${SITE_TAGLINE}`)}
    ${chipRow([chip(input.subject, true)])}
    ${glassCard(messageArea("Message", formatMessageHtml(truncateText(input.message, 420))), "28px")}
    ${buttonOutline(site, "View portfolio")}
    ${emailFooter([
      `This is an automated confirmation sent to <span style="color:#c7ceda;">${escapeHtml(input.email)}</span>.`,
      `If you need to add more detail, reply to this email.`,
      `<a href="${site}" style="color:#9aa4b2;text-decoration:underline;">${escapeHtml(site)}</a>`,
    ])}
  `;

  return wrapEmailDocument({
    title: buildConfirmationEmailSubject(input),
    preheader: `Thanks ${firstName(input.name)} — your message was received.`,
    bodyHtml: body,
  });
}
