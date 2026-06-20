import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = 'Superlatives <onboarding@resend.dev>'

export async function sendApprovalEmail({
  to,
  displayName,
  roomName,
  roomSlug,
}: {
  to: string
  displayName: string
  roomName: string
  roomSlug: string
}) {
  const url = `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/rooms/${roomSlug}/vote`

  await resend.emails.send({
    from: FROM,
    to,
    subject: `You've been approved to join ${roomName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="font-size: 20px; font-weight: 500; margin-bottom: 8px;">You're in, ${displayName}!</h2>
        <p style="color: #666; font-size: 14px; margin-bottom: 24px;">
          The host has approved your request to join <strong>${roomName}</strong>.
          Click below to start voting.
        </p>
        <a href="${url}" style="display: inline-block; background: #000; color: #fff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 14px;">
          Go to ${roomName}
        </a>
        <p style="color: #999; font-size: 12px; margin-top: 24px;">
          If you didn't request to join this room, you can ignore this email.
        </p>
      </div>
    `,
  })
}

export async function sendDeniedEmail({
  to,
  displayName,
  roomName,
}: {
  to: string
  displayName: string
  roomName: string
}) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Your request to join ${roomName} was not approved`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="font-size: 20px; font-weight: 500; margin-bottom: 8px;">Request expired</h2>
        <p style="color: #666; font-size: 14px;">
          Hi ${displayName}, your request to join <strong>${roomName}</strong> was not approved within 7 days and has been automatically declined.
        </p>
        <p style="color: #999; font-size: 12px; margin-top: 24px;">
          If you think this was a mistake, contact the room host directly.
        </p>
      </div>
    `,
  })
}

export async function sendPasswordResetEmail({
  to,
  resetUrl,
}: {
  to: string
  resetUrl: string
}) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Reset your Superlatives password',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="font-size: 20px; font-weight: 500; margin-bottom: 8px;">Reset your password</h2>
        <p style="color: #666; font-size: 14px; margin-bottom: 24px;">
          Click below to reset your password. This link expires in 1 hour.
        </p>
        <a href="${resetUrl}" style="display: inline-block; background: #000; color: #fff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 14px;">
          Reset password
        </a>
        <p style="color: #999; font-size: 12px; margin-top: 24px;">
          If you didn't request this, you can ignore this email.
        </p>
      </div>
    `,
  })
}