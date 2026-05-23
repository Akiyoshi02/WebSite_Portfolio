import {
  RESPONSE_TIME,
  SITE_NAME,
  SITE_TAGLINE,
  bodyCopy,
  buttonOutline,
  buttonPrimary,
  chip,
  chipRow,
  contactRow,
  emailFooter,
  escapeHtml,
  firstName,
  formatMessageHtml,
  glassCard,
  heroBlock,
  messageArea,
  resolveSiteUrl,
  sectionHeading,
  statGrid,
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

export function buildConfirmationEmailSubject(_input: ConfirmationEmailInput): string {
  return `Thanks for your message - ${SITE_NAME}`;
}

export function buildConfirmationEmailText(input: ConfirmationEmailInput): string {
  const site = resolveSiteUrl(input.siteUrl);
  const greeting = firstName(input.name);

  return [
    `Hi ${greeting},`,
    "",
    `Thank you for reaching out through my portfolio. I received your message and will get back to you within ${RESPONSE_TIME}.`,
    "",
    `Subject: ${input.subject}`,
    "",
    "Your message:",
    truncateText(input.message, 500),
    "",
    "If anything urgent comes up, you can reply to this email with more details.",
    "",
    `${SITE_NAME}`,
    site,
    "",
    "This is an automated confirmation. Your original message was delivered successfully.",
  ].join("\n");
}

export function buildConfirmationEmailHtml(input: ConfirmationEmailInput): string {
  const site = resolveSiteUrl(input.siteUrl);
  const greet = firstName(input.name);

  const body = `
    ${heroBlock({
      kicker: "// Message received",
      title: `Thanks, ${greet}`,
      subtitle: "Your message made it through the portfolio contact form and is now in my inbox.",
      status: "Delivered successfully",
    })}

    ${statGrid([
      { value: "OK", label: "Form status" },
      { value: "1-2d", label: "Typical reply" },
      { value: "SMTP", label: "Email route" },
    ])}

    ${glassCard(`
      ${sectionHeading(
        "// What happens next",
        "I will review this and reply directly",
        `I usually respond within ${RESPONSE_TIME}. If the topic is urgent, reply to this email and add the extra context.`,
      )}
      ${chipRow([chip(input.subject, true), chip(SITE_TAGLINE), chip("Open to reply")])}
      ${bodyCopy(
        `Hi <strong style="color:#e8eaf0;">${escapeHtml(greet)}</strong>, thanks for starting the conversation. I have the contact details and message you submitted, so there is no need to send it again.`,
      )}
      ${contactRow({ icon: "1", title: "Message received", value: "Your form submission was accepted." })}
      ${contactRow({ icon: "2", title: "Inbox notification", value: "A copy was sent to my portfolio inbox." })}
      ${contactRow({ icon: "3", title: "Reply window", value: `I aim to respond within ${RESPONSE_TIME}.` })}
    `)}

    ${messageArea("Your submitted message", formatMessageHtml(truncateText(input.message, 520)))}

    ${glassCard(`
      ${sectionHeading(
        "// Stay connected",
        "Explore more while I review it",
        "You can revisit the portfolio, project case studies, and current focus areas from the same site.",
      )}
      ${contactRow({ icon: "/", title: "Portfolio", value: site.replace(/^https?:\/\//, ""), href: site })}
      ${contactRow({ icon: "@", title: "Confirmation sent to", value: input.email })}
      ${buttonPrimary(site, "View portfolio")}
      ${buttonOutline(`${site}/#projects`, "See projects")}
    `, "24px", "0")}

    ${emailFooter(
      [
        `This automated confirmation was sent to <span style="color:#c7ceda;font-weight:700;">${escapeHtml(input.email)}</span>.`,
        "Reply to this email if you want to add more details to your original message.",
      ],
      [
        { label: "Portfolio", href: site },
        { label: "Projects", href: `${site}/#projects` },
        { label: "Contact", href: `${site}/#contact` },
      ],
    )}
  `;

  return wrapEmailDocument({
    title: buildConfirmationEmailSubject(input),
    preheader: `Thanks ${greet} - your message was delivered to ${SITE_NAME}.`,
    bodyHtml: body,
  });
}
