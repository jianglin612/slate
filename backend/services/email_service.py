from typing import Optional
import resend
from config import get_settings

settings = get_settings()


class EmailService:
    def __init__(self):
        resend.api_key = settings.RESEND_API_KEY

    def send_share_invite(
        self,
        to_email: str,
        from_name: str,
        share_url: str,
        report_title: Optional[str] = None,
    ) -> bool:
        """Send a share invite email."""
        try:
            subject = f"{from_name} shared a report with you"
            if report_title:
                subject = f"{from_name} shared '{report_title}' with you"

            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 40px 20px;">
                <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                    <h1 style="font-size: 24px; font-weight: 600; color: #1a1a1a; margin: 0 0 16px 0;">
                        {from_name} shared a report with you
                    </h1>
                    <p style="font-size: 16px; color: #666; line-height: 1.5; margin: 0 0 24px 0;">
                        You've been invited to view a task report on Slate. Click the button below to see it.
                    </p>
                    <a href="{share_url}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #3b82f6); color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 500; font-size: 16px;">
                        View Report
                    </a>
                    <p style="font-size: 14px; color: #999; margin: 32px 0 0 0;">
                        Or copy this link: <a href="{share_url}" style="color: #7c3aed;">{share_url}</a>
                    </p>
                </div>
                <p style="text-align: center; font-size: 12px; color: #999; margin-top: 24px;">
                    Sent from <a href="https://fromslate.com" style="color: #7c3aed; text-decoration: none;">Slate</a>
                </p>
            </body>
            </html>
            """

            resend.Emails.send({
                "from": "Slate <noreply@fromslate.com>",
                "to": [to_email],
                "subject": subject,
                "html": html_content,
            })

            return True
        except Exception as e:
            print(f"Failed to send email: {e}")
            return False
