export const runtime = 'nodejs';
import { NextRequest } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !subject || !message) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.MAIL_FROM || user;
    const to = process.env.MAIL_TO || 'ankurashishindia@gmail.com';

    if (!host || !user || !pass || !from || !to) {
      return new Response(JSON.stringify({ error: 'Email service not configured' }), { status: 500 });
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    // Verify SMTP connection for clearer error messages during setup
    try {
      await transporter.verify();
    } catch (verifyErr: any) {
      return new Response(
        JSON.stringify({ error: 'SMTP verify failed', detail: String(verifyErr?.message || verifyErr) }),
        { status: 500 }
      );
    }

    const text = `New contact form submission\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`;
    const html = `
      <div style="font-family: Arial,Helvetica,sans-serif; line-height:1.6;">
        <h2>New contact form submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br/>')}</p>
      </div>
    `;

    await transporter.sendMail({
      from,
      to,
      replyTo: email,
      subject: `[Portfolio] ${subject}`,
      text,
      html,
    });

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Failed to send message', detail: String((err as any)?.message || err) }),
      { status: 500 }
    );
  }
}


