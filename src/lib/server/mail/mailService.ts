import { Resend } from 'resend';

interface EmailOptions {
    to: string | string[];
    subject: string;
    html?: string;
    text?: string;
    from?: string;
}

class MailService {
    private resend: Resend;
    private isDevelopment: boolean;
    private emailFrom: string;

    constructor(env: Cloudflare.Env) {
        this.isDevelopment = env.ENVIRONMENT === 'development';
        this.resend = new Resend(env.RESEND_API_KEY);
        this.emailFrom = env.EMAIL_FROM;
    }

    async sendEmail(options: EmailOptions): Promise<{ success: boolean; id?: string; error?: any }> {
        try {
            const from = options.from || this.emailFrom || 'onboarding@duitgee.com';

            let toEmail = options.to;
            if (this.isDevelopment) {
                toEmail = 'delivered+user1@resend.dev'
            }

            // Send via Resend API
            const { data, error } = await this.resend.emails.send({
                from,
                to: toEmail,
                subject: options.subject,
                html: options.html || '',
                text: options.text
            });

            if (error) {
                throw error;
            }

            return { success: true, id: data?.id };

            throw new Error('No email service configured');
        } catch (error) {
            console.error('Failed to send email:', error);
            return { success: false, error };
        }
    }
}

export default MailService;