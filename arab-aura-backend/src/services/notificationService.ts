// src/services/notificationService.ts
import nodemailer from "nodemailer";

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// إنشاء ناقل البريد الإلكتروني (Transporter)
const createMailTransporter = () => {
  // إذا كانت بيانات SMTP مجهزة في المتغيرات البيئية
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 465,
      secure: Number(process.env.SMTP_PORT) === 465 || !process.env.SMTP_PORT, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // في حالة عدم توفر إعدادات SMTP رسمية، استخدام حساب اختبار Ethereal تلقائياً
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: "arab.aura.test@ethereal.email",
      pass: "auraTestPass1234",
    },
  });
};

/**
 * 📧 إرسال كود التحقق (OTP) عبر البريد الإلكتروني (Gmail)
 */
export const sendOtpEmail = async (
  toEmail: string,
  otpCode: string,
  recipientName = "عميلنا العزيز"
): Promise<EmailResult> => {
  try {
    const transporter = createMailTransporter();

    const mailOptions = {
      from: `"عرب أورا - 3ARB AURA" <${process.env.SMTP_USER || "noreply@arab-aura.com"}>`,
      to: toEmail,
      subject: `رمز استعادة كلمة المرور: ${otpCode} - منصة عرب أورا`,
      html: `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b1120; color: #f8fafc; padding: 20px; direction: rtl; text-align: right; }
            .container { max-width: 500px; margin: 0 auto; background-color: #1e293b; border-radius: 16px; border: 1px solid #334155; padding: 32px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5); }
            .header { text-align: center; border-bottom: 1px solid #334155; padding-bottom: 20px; margin-bottom: 24px; }
            .logo { font-size: 26px; font-weight: 800; color: #38bdf8; letter-spacing: -0.5px; }
            .otp-box { background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); border-radius: 12px; padding: 24px; text-align: center; margin: 28px 0; border: 1px solid #38bdf8; }
            .otp-code { font-family: monospace; font-size: 38px; font-weight: 900; letter-spacing: 8px; color: #ffffff; text-shadow: 0 2px 4px rgba(0,0,0,0.4); }
            .badge { display: inline-block; background-color: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-size: 13px; color: #e0f2fe; margin-top: 8px; }
            .warning { background-color: rgba(245, 158, 11, 0.1); border-right: 4px solid #f59e0b; padding: 12px; border-radius: 6px; font-size: 13px; color: #fde68a; margin: 20px 0; }
            .footer { text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #334155; padding-top: 20px; margin-top: 24px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">3ARB AURA | عرب أورا</div>
              <p style="color: #94a3b8; font-size: 14px; margin-top: 6px;">المنصة المصرية المبتكرة للأزياء وتجارة الأحياء</p>
            </div>
            
            <p style="font-size: 16px; line-height: 1.6;">مرحباً <strong>${recipientName}</strong>،</p>
            <p style="color: #cbd5e1; font-size: 14px; line-height: 1.7;">
              تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك على منصة عرب أورا. استخدم رمز التحقق السري التالي لتأكيد هويتك:
            </p>

            <div class="otp-box">
              <div class="otp-code">${otpCode}</div>
              <div class="badge">صالح لمدة 10 دقائق فقط</div>
            </div>

            <div class="warning">
              ⚠️ <strong>تحذير أمان:</strong> لا تشارك هذا الرمز مع أي شخص، حتى وإن ادعى أنه من فريق دعم منصة عرب أورا.
            </div>

            <p style="color: #94a3b8; font-size: 13px;">
              إذا لم تكن أنت من قام بهذا الطلب، يمكنك تجاهل هذا البريد بأمان ولن يتم إجراء أي تعديل على حسابك.
            </p>

            <div class="footer">
              © 2026 عرب أورا - 3ARB AURA. جميع الحقوق محفوظة.<br>
              جمهورية مصر العربية - القاهرة والجيزة
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ [Nodemailer]: Email sent successfully to ${toEmail}. MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.warn(`⚠️ [Nodemailer Delivery Warning]: ${error.message} (Fallback logged for ${toEmail}: OTP ${otpCode})`);
    return { success: false, error: error.message };
  }
};

/**
 * 💬 تجهيز رسالة ورابط واتساب (WhatsApp Direct OTP Link)
 */
export const generateWhatsAppOtpPayload = (
  rawPhone: string,
  otpCode: string,
  userName = "عميلنا العزيز"
) => {
  // تنظيف رقم الهاتف وتوحيد الصيغة المصرية الدولية
  let cleanPhone = rawPhone.replace(/\D/g, "");
  if (cleanPhone.startsWith("0")) {
    cleanPhone = "20" + cleanPhone.slice(1);
  } else if (!cleanPhone.startsWith("20") && cleanPhone.length === 10) {
    cleanPhone = "20" + cleanPhone;
  }

  const messageText = `مرحباً بك ${userName} في عرب أورا 3ARB AURA 🛍️\nكود التحقق السري الخاص بك لإعادة تعيين كلمة المرور هو:\n\n*${otpCode}*\n\nالرمز صالح لمدة 10 دقائق. يُرجى عدم مشاركة الكود مع أي شخص للحفاظ على أمان حسابك.`;
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(
    messageText
  )}`;

  console.log(`💬 [WhatsApp OTP Service]: Generated WhatsApp payload for ${cleanPhone} (OTP: ${otpCode})`);

  return {
    phone: cleanPhone,
    whatsappUrl,
    messageText,
  };
};
