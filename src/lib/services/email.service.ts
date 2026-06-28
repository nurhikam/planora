let resendClient: import("resend").Resend | null = null;

async function getResend() {
  if (
    !resendClient &&
    process.env.RESEND_API_KEY &&
    process.env.RESEND_API_KEY !== "re_xxx"
  ) {
    const { Resend } = await import("resend");
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

export const emailService = {
  async sendVerificationEmail(to: string, token: string) {
    const verifyUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify?token=${token}`;
    const client = await getResend();

    if (!client) {
      console.log("Resend not configured. Verification email not sent.");
      console.log(`Would send to ${to}: ${verifyUrl}`);
      return;
    }

    try {
      await client.emails.send({
        from: "Planora <noreply@planora.app>",
        to,
        subject: "Verify your email",
        html: `
          <h1>Welcome to Planora!</h1>
          <p>Click the link below to verify your email:</p>
          <a href="${verifyUrl}">${verifyUrl}</a>
          <p>This link expires in 24 hours.</p>
        `,
      });
    } catch (error) {
      console.error("Failed to send verification email:", error);
    }
  },
};
