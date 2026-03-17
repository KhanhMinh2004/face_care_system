import smtplib
from email.message import EmailMessage


def send_reset_email(to_email):

    msg = EmailMessage()

    msg["Subject"] = "Reset Password"

    msg["From"] = "btrankhanhminh@gmail.com"

    msg["To"] = to_email

    msg.set_content(
        f"Click link to reset password: http://localhost:5173/reset-password?email={to_email}"
    )

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
        smtp.login("btrankhanhminh@gmail.com", "qtjb auup jgsy znhq")
        smtp.send_message(msg)