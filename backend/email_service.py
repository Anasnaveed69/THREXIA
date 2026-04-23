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
        body {{ margin:0; padding:0; background:#05050A; font-family:'Inter','Segoe UI',Arial,sans-serif; color:#E2E8F0; }}
        .wrapper {{ max-width:600px; margin:0 auto; padding:60px 20px; }}
        .header {{
          background: #0D0B1A;
          padding:40px;
          text-align:center;
          border-radius:24px 24px 0 0;
          border: 1px solid rgba(139,92,246,0.1);
          border-bottom: none;
        }}
        .logo-text {{ font-size:32px; font-weight:900; letter-spacing:0.3em; color:#fff; text-shadow:0 0 30px rgba(139,92,246,0.5); margin: 0; }}
        .logo-sub  {{ font-size:11px; color:#8B5CF6; letter-spacing:0.4em; text-transform:uppercase; margin-top:8px; font-weight: 600; }}
        .body      {{ 
            background:#0D0B1A; 
            border: 1px solid rgba(139,92,246,0.1); 
            border-top: none; 
            padding:40px;
            border-radius: 0 0 24px 24px;
            box-shadow: 0 20px 50px rgba(0,0,0,0.5);
        }}
        .body h2   {{ color:#fff; font-size:24px; margin:0 0 20px; font-weight: 800; display: flex; align-items: center; gap: 10px; }}
        .body p    {{ color:#94A3B8; font-size:15px; line-height:1.8; margin:0 0 20px; }}
        .badge {{
          display:inline-block; background:rgba(139,92,246,0.1); border:1px solid rgba(139,92,246,0.3);
          color:#A78BFA; padding:6px 14px; border-radius:6px; font-size:11px; font-weight:800;
          letter-spacing:0.1em; text-transform:uppercase;
        }}
        .info-box {{
          background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05);
          border-radius:16px; padding:24px; margin:30px 0;
        }}
        .info-row  {{ display:flex; justify-content:space-between; padding:12px 0; border-bottom:1px solid rgba(255,255,255,0.03); font-size:14px; }}
        .info-row:last-child {{ border-bottom:none; }}
        .info-label {{ color:#475569; font-weight: 600; }}
        .info-value {{ color:#CBD5E1; font-weight:500; text-align: right; }}
        .cta-btn {{
          display:block; width:100%; text-align:center; 
          background: linear-gradient(90deg, #7C3AED 0%, #3B82F6 100%);
          color:#fff; font-weight:800; font-size:14px; letter-spacing:0.15em;
          padding:20px; border-radius:12px; text-decoration:none; margin:32px 0;
          text-transform:uppercase; box-shadow: 0 10px 20px rgba(59, 130, 246, 0.2);
        }}
        .footer {{ text-align:center; padding:40px 20px; color:#475569; font-size:11px; letter-spacing: 0.05em; line-height: 1.6; }}
        .highlight {{ color:#8B5CF6; font-weight:700; }}
        .success   {{ color:#10B981; }}
        .danger    {{ color:#EF4444; }}
        .mono      {{ font-family: 'Courier New', Courier, monospace; background:rgba(0,0,0,0.4); padding:4px 10px; border-radius:6px; font-size:14px; color:#A78BFA; border: 1px solid rgba(139,92,246,0.2); }}
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <h1 class="logo-text">THREXIA</h1>
          <div class="logo-sub">Advanced Threat Intelligence Platform</div>
        </div>
        <div class="body">
          {content}
        </div>
        <div class="footer">
          © {datetime.utcnow().year} THREXIA · FAST-NU Lahore · All rights reserved<br>
          This is an automated security notification. Do not reply to this email.
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
      <h2>🔔 New Access Request</h2>
      <p>A new operator has submitted an access clearance request to the THREXIA platform and is awaiting your review.</p>

      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Full Name</span>
          <span class="info-value">{full_name}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Username</span>
          <span class="info-value"><span class="mono">{username}</span></span>
        </div>
        <div class="info-row">
          <span class="info-label">Email</span>
          <span class="info-value">{email}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Requested Role</span>
          <span class="info-value"><span class="badge">{role}</span></span>
        </div>
        <div class="info-row">
          <span class="info-label">Justification</span>
          <span class="info-value" style="max-width:300px;text-align:right;">{reason}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Submitted At</span>
          <span class="info-value">{datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}</span>
        </div>
      </div>

      <p>Log in as a <span class="highlight">System Administrator</span> to review this request from the <strong>Access Control</strong> dashboard.</p>
      <a class="cta-btn" href="http://localhost:5173/admin/access-control">Review in THREXIA Dashboard →</a>

      <p style="font-size:13px;color:#475569;">If you did not expect this request, you may safely ignore this notification.</p>
    """
    return _send(ADMIN_EMAIL, f"[THREXIA] New Access Request — {full_name} ({role})", _base_template(content))


def notify_user_approved(
    full_name: str,
    email:     str,
    username:  str,
    role:      str,
    temp_password: str,
) -> bool:
    """Notify the user that their account has been approved with credentials."""
    content = f"""
      <h2>✅ Access Granted — Welcome to THREXIA</h2>
      <p>Your access request has been reviewed and <span class="success">approved</span> by the System Administrator. Your intelligence clearance is now active.</p>

      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Full Name</span>
          <span class="info-value">{full_name}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Assigned Role</span>
          <span class="info-value"><span class="badge">{role}</span></span>
        </div>
        <div class="info-row">
          <span class="info-label">Username</span>
          <span class="info-value"><span class="mono">{username}</span></span>
        </div>
        <div class="info-row">
          <span class="info-label">Temporary Passcode</span>
          <span class="info-value"><span class="mono">{temp_password}</span></span>
        </div>
      </div>

      <p>⚠️ <strong>Important:</strong> This is a system-generated temporary passcode. You must use it to log in for the first time. Keep it confidential.</p>
      <a class="cta-btn" href="http://localhost:5173/login">Access THREXIA Platform →</a>

      <p style="font-size:13px;color:#475569;">
        If you did not request access to THREXIA, please contact the system administrator immediately at <span class="highlight">buttanas813@gmail.com</span>.
      </p>
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
      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Administrator Note</span>
          <span class="info-value" style="max-width:300px;text-align:right;">{reason or 'No additional information provided.'}</span>
        </div>
      </div>
    """ if reason else ""

    content = f"""
      <h2>❌ Access Request Declined</h2>
      <p>We regret to inform you that your request for <span class="badge">{role}</span> access to the THREXIA platform has been <span class="danger">declined</span> by the System Administrator.</p>

      {reason_block}

      <p>If you believe this decision was made in error, or if you have additional information to support your request, please contact the administrator directly at <span class="highlight">buttanas813@gmail.com</span>.</p>

      <p style="font-size:13px;color:#475569;">You may submit a new request at any time via the THREXIA registration portal.</p>
    """
    return _send(email, "[THREXIA] Access Request Declined", _base_template(content))


def notify_admin_password_reset(username: str, email: str) -> bool:
    """Alert the admin that a user has requested a password reset."""
    content = f"""
      <h2>🔑 Password Reset Request</h2>
      <p>An operator has requested a manual password reset. For security reasons, this requires administrative verification.</p>

      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Username</span>
          <span class="info-value"><span class="mono">{username}</span></span>
        </div>
        <div class="info-row">
          <span class="info-label">Email</span>
          <span class="info-value">{email}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Requested At</span>
          <span class="info-value">{datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}</span>
        </div>
      </div>

      <p>Verify the identity of the user and fulfill the reset from the <strong>Access Control</strong> command center.</p>
      <a class="cta-btn" href="http://localhost:5173/admin/access-control">Go to Access Control →</a>
    """
    return _send(ADMIN_EMAIL, f"[THREXIA] Password Reset Request — {username}", _base_template(content))


def notify_user_password_reset_fulfilled(email: str, temp_pass: str) -> bool:
    """Send the new temporary password to the user."""
    content = f"""
      <h2>🛡️ Password Reset Complete</h2>
      <p>Your password reset request has been processed by the System Administrator. A new temporary passcode has been generated for your account.</p>

      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Temporary Passcode</span>
          <span class="info-value"><span class="mono">{temp_pass}</span></span>
        </div>
      </div>

      <p>⚠️ <strong>Security Notice:</strong> Please log in immediately and update your password in the <strong>Security Settings</strong> panel.</p>
      <a class="cta-btn" href="http://localhost:5173/login">Log In to THREXIA →</a>
    """
    return _send(email, "[THREXIA] Your Password has been Reset", _base_template(content))
