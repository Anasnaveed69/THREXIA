"""
THREXIA — Email Service
Handles all outgoing notification emails using SMTP (Gmail App Password).
"""

import smtplib
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text      import MIMEText
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

# ─────────────────────────────────────────────
#  SMTP Config  (set these in backend/.env)
# ─────────────────────────────────────────────
SMTP_HOST     = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT     = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER     = os.getenv("SMTP_USER", "")          # your Gmail address
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")       # Gmail App Password
ADMIN_EMAIL   = os.getenv("ADMIN_EMAIL", "buttanas813@gmail.com")


def _send(to: str, subject: str, html_body: str) -> bool:
    """Low-level send helper. Falls back to console-logging if SMTP not configured."""
    if not SMTP_USER or not SMTP_PASSWORD:
        # Graceful degradation — log to console for development
        print("\n" + "─" * 60)
        print(f"[EMAIL] To: {to}")
        print(f"[EMAIL] Subject: {subject}")
        print("[EMAIL] (SMTP not configured — printing to console)")
        print("─" * 60 + "\n")
        return False  # indicates email was not sent via SMTP

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"]    = f"THREXIA Intelligence Platform <{SMTP_USER}>"
        msg["To"]      = to
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.ehlo()
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SMTP_USER, to, msg.as_string())
        return True
    except Exception as e:
        print(f"[EMAIL ERROR] Failed to send to {to}: {e}")
        return False


# ─────────────────────────────────────────────
#  Email Templates
# ─────────────────────────────────────────────

def _base_template(content: str) -> str:
    return f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=JetBrains+Mono:wght@500&display=swap');
        
        body {{ 
            margin: 0; padding: 0; background-color: #030305; 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            color: #94A3B8; -webkit-font-smoothing: antialiased; 
        }}
        .email-container {{ max-width: 600px; margin: 40px auto; background-color: #0A0A0F; border-radius: 24px; overflow: hidden; border: 1px solid #1E1E26; box-shadow: 0 40px 100px rgba(0,0,0,0.6); }}
        
        /* Header Section */
        .header {{ background: linear-gradient(180deg, #0D0D14 0%, #0A0A0F 100%); padding: 48px 40px 32px; text-align: center; border-bottom: 1px solid #1E1E26; position: relative; }}
        .header-top {{ display: flex; align-items: center; justify-content: center; margin-bottom: 24px; }}
        .logo-box {{ 
            display: inline-block; padding: 12px; border-radius: 12px; background: rgba(139, 92, 246, 0.1); 
            border: 1px solid rgba(139, 92, 246, 0.2); margin-bottom: 16px;
        }}
        .logo-text {{ font-size: 32px; font-weight: 800; letter-spacing: 0.15em; color: #FFFFFF; margin: 0; text-transform: uppercase; }}
        .logo-sub {{ font-size: 11px; color: #A78BFA; letter-spacing: 0.4em; text-transform: uppercase; margin-top: 12px; font-weight: 700; opacity: 1; }}
        .system-badge {{ 
            display: inline-block; padding: 4px 12px; background: rgba(16, 185, 129, 0.1); 
            border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 100px; 
            color: #10B981; font-size: 10px; font-weight: 900; letter-spacing: 0.1em; margin-top: 20px;
        }}
        
        /* Body Section */
        .body {{ padding: 48px 48px 40px; }}
        .content-heading {{ font-size: 24px; font-weight: 800; color: #FFFFFF; margin: 0 0 24px; letter-spacing: -0.02em; line-height: 1.2; }}
        .content-text {{ font-size: 16px; line-height: 1.6; color: #94A3B8; margin-bottom: 32px; }}
        
        /* Information Grid */
        .info-card {{ background: #0F0F17; border: 1px solid #1E1E26; border-radius: 16px; padding: 24px; margin: 32px 0; }}
        .info-row {{ padding: 12px 0; border-bottom: 1px solid #1E1E26; display: block; }}
        .info-row:last-child {{ border-bottom: none; }}
        .info-label {{ display: block; font-size: 12px; font-weight: 700; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 6px; }}
        .info-value {{ display: block; font-size: 16px; color: #F1F5F9; font-weight: 500; }}
        .mono {{ font-family: 'JetBrains Mono', 'Courier New', monospace; color: #C4B5FD; background: rgba(167, 139, 250, 0.1); padding: 2px 6px; border-radius: 4px; font-weight: 600; }}
        
        /* Button */
        .button-wrapper {{ text-align: center; margin: 40px 0 16px; }}
        .action-button {{ 
            display: inline-block; background: linear-gradient(90deg, #7C3AED 0%, #3B82F6 100%); 
            color: #FFFFFF !important; font-weight: 800; font-size: 14px; letter-spacing: 0.12em; 
            padding: 18px 40px; border-radius: 12px; text-decoration: none; 
            text-transform: uppercase; box-shadow: 0 20px 40px rgba(124, 58, 237, 0.2);
            transition: all 0.3s ease;
        }}
        
        /* Footer */
        .footer {{ padding: 0 48px 48px; text-align: center; }}
        .footer-divider {{ height: 1px; background: #1E1E26; margin-bottom: 32px; }}
        .footer-text {{ font-size: 11px; color: #475569; line-height: 1.8; letter-spacing: 0.02em; }}
        .security-stamp {{ 
            margin-top: 24px; font-family: 'JetBrains Mono', monospace; font-size: 9px; 
            color: #1E1E26; text-transform: uppercase; letter-spacing: 0.2em; 
        }}
        
        /* Status Colors */
        .text-purple {{ color: #8B5CF6; }}
        .text-success {{ color: #10B981; }}
        .text-danger  {{ color: #EF4444; }}
        .badge {{ 
            display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; 
            font-weight: 800; background: rgba(139, 92, 246, 0.1); color: #8B5CF6; 
            border: 1px solid rgba(139, 92, 246, 0.2); 
        }}
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <div style="margin-bottom: 20px;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block;">
                <path d="M12 2L3 7V12C3 17.41 6.84 22.38 12 24C17.16 22.38 21 17.41 21 12V7L12 2Z" fill="url(#logo-grad)" />
                <path d="M9 12L11 14L15 10" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <defs>
                    <linearGradient id="logo-grad" x1="3" y1="2" x2="21" y2="24" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#7C3AED" />
                        <stop offset="1" stop-color="#3B82F6" />
                    </linearGradient>
                </defs>
            </svg>
          </div>
          <h1 class="logo-text">THREXIA</h1>
          <div class="logo-sub">Advanced Intelligence Platform</div>
          <div class="system-badge">SYSTEM STATUS: SECURE</div>
        </div>
        
        <div class="body">
          {content}
        </div>
        
        <div class="footer">
          <div class="footer-divider"></div>
          <p class="footer-text">
            © {datetime.utcnow().year} THREXIA Core · FAST-NU Intelligence Lab<br/>
            All data encrypted via AES-256 standards. Confidentiality strictly enforced.
          </p>
          <div class="security-stamp">
            VERIFICATION_ID: {datetime.utcnow().strftime('%H%M%S')}-TX-INTEL-SEC
          </div>
        </div>
      </div>
    </body>
    </html>
    """



def notify_admin_new_request(
    full_name: str,
    username:  str,
    email:     str,
    role:      str,
    reason:    str,
) -> bool:
    """Alert the system administrator about a new access request."""
    content = f"""
      <h2 class="content-heading">🔔 Inbound Access Request</h2>
      <p class="content-text">Neural telemetry has detected a new operator registration attempt. The following identity is awaiting administrative clearance for platform ingestion.</p>

      <div class="info-card">
        <div class="info-row">
          <span class="info-label">Full Name</span>
          <span class="info-value">{full_name}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Identification</span>
          <span class="info-value"><span class="mono">@{username}</span></span>
        </div>
        <div class="info-row">
          <span class="info-label">Communication Channel</span>
          <span class="info-value">{email}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Requested Authorization</span>
          <span class="info-value"><span class="badge">{role}</span></span>
        </div>
        <div class="info-row">
          <span class="info-label">Operational Justification</span>
          <span class="info-value">{reason}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Detection Timestamp</span>
          <span class="info-value">{datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}</span>
        </div>
      </div>

      <p class="content-text">Proceed to the <strong>Access Control</strong> module to authorize or terminate this request. Standard security protocols apply.</p>
      
      <div class="button-wrapper">
        <a class="action-button" href="http://localhost:5173/admin/access-control">Open Command Center →</a>
      </div>

      <p style="font-size:12px;color:#475569;margin-top:24px;text-align:center;">This request was captured via the public registration gateway.</p>
    """
    return _send(ADMIN_EMAIL, f"[THREXIA] Access Request: {full_name} ({role})", _base_template(content))


def notify_user_approved(
    full_name: str,
    email:     str,
    username:  str,
    role:      str,
    temp_password: str,
) -> bool:
    """Notify the user that their account has been approved with credentials."""
    content = f"""
      <h2 class="content-heading">✅ Clearance Granted</h2>
      <p class="content-text">Your request for THREXIA platform access has been <span class="text-success">verified and approved</span>. Your security profile has been integrated into the central node.</p>

      <div class="info-card">
        <div class="info-row">
          <span class="info-label">Full Name</span>
          <span class="info-value">{full_name}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Authorization Tier</span>
          <span class="info-value"><span class="badge">{role}</span></span>
        </div>
        <div class="info-row">
          <span class="info-label">Identification Tag</span>
          <span class="info-value"><span class="mono">{username}</span></span>
        </div>
        <div class="info-row">
          <span class="info-label">Temporary Cipher</span>
          <span class="info-value"><span class="mono">{temp_password}</span></span>
        </div>
      </div>

      <p class="content-text"><strong>Security Protocol:</strong> This temporary cipher is valid for initial ingestion only. You are required to update your security credentials upon first entry.</p>
      
      <div class="button-wrapper">
        <a class="action-button" href="http://localhost:5173/login">Initiate Secure Login →</a>
      </div>

      <p style="font-size:12px;color:#475569;margin-top:24px;">This is a system-level automated transmission. Please do not disseminate these credentials.</p>
    """
    return _send(email, "[THREXIA] Intelligence Clearance Granted — Your Credentials", _base_template(content))


def notify_user_rejected(
    full_name: str,
    email:     str,
    role:      str,
    reason:    str | None = None,
) -> bool:
    """Notify the user that their access request was declined."""
    reason_block = f"""
      <div class="info-card">
        <div class="info-row">
          <span class="info-label">Administrative Note</span>
          <span class="info-value">{reason or 'Compliance failure or insufficient justification.'}</span>
        </div>
      </div>
    """ if reason else ""

    content = f"""
      <h2 class="content-heading">❌ Authorization Declined</h2>
      <p class="content-text">Your request for <span class="badge">{role}</span> access to the THREXIA platform has been <span class="text-danger">declined</span> following a security review.</p>

      {reason_block}

      <p class="content-text">If you believe this decision was made in error, or if you have additional intelligence to support your request, please contact the System Administrator.</p>

      <div class="button-wrapper">
        <a class="action-button" href="mailto:buttanas813@gmail.com">Contact Security Admin</a>
      </div>
    """
    return _send(email, "[THREXIA] Access Request Declined", _base_template(content))


def notify_admin_password_reset(username: str, email: str) -> bool:
    """Alert the admin that a user has requested a password reset."""
    content = f"""
      <h2 class="content-heading">🔑 Security Reset Alert</h2>
      <p class="content-text">A manual password reset event has been triggered for the following user account. Administrative override is required to finalize this operation.</p>

      <div class="info-card">
        <div class="info-row">
          <span class="info-label">Target Account</span>
          <span class="info-value"><span class="mono">@{username}</span></span>
        </div>
        <div class="info-row">
          <span class="info-label">Registered Email</span>
          <span class="info-value">{email}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Event Timestamp</span>
          <span class="info-value">{datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}</span>
        </div>
      </div>

      <p class="content-text">Verify the identity of the operator before authorizing the credential reset in the <strong>Access Control</strong> module.</p>
      
      <div class="button-wrapper">
        <a class="action-button" href="http://localhost:5173/admin/access-control">Manage Reset Request →</a>
      </div>
    """
    return _send(ADMIN_EMAIL, f"[THREXIA] Reset Request: {username}", _base_template(content))


def notify_user_password_reset_fulfilled(email: str, temp_pass: str) -> bool:
    """Send the new temporary password to the user."""
    content = f"""
      <h2 class="content-heading">🛡️ Protocol Reset Complete</h2>
      <p class="content-text">Your account security reset has been finalized by the System Administrator. A new temporary access cipher has been provisioned.</p>

      <div class="info-card">
        <div class="info-row">
          <span class="info-label">Temporary Cipher</span>
          <span class="info-value"><span class="mono">{temp_pass}</span></span>
        </div>
      </div>

      <p class="content-text"><strong>Security Notice:</strong> Access the platform immediately and update your credentials via the <strong>Security Settings</strong> node to maintain account integrity.</p>
      
      <div class="button-wrapper">
        <a class="action-button" href="http://localhost:5173/login">Access Terminal →</a>
      </div>
    """
    return _send(email, "[THREXIA] Your Password has been Reset", _base_template(content))
