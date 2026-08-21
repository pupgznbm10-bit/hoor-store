import nodemailer from 'nodemailer';

const SENDER_NAME = 'متجر حور';
const BRAND_NAVY = '#0B132B';
const BRAND_GOLD = '#D4AF37';

function transporterReady() {
  return !!process.env.EMAIL_USER && !!process.env.EMAIL_PASS;
}

export async function sendOtpEmail(email: string, otp: string, type: 'register' | 'reset' | 'general' = 'general') {
  const subject = type === 'register' ? 'تفعيل حساب متجر حور - رمز التحقق' : 'استعادة كلمة المرور - رمز التحقق من متجر حور';

  const html = `
  <div style="font-family: Arial, Helvetica, sans-serif; background:${BRAND_NAVY}; color: #fff; padding: 24px;">
    <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;color:#111">
      <div style="background:${BRAND_NAVY};padding:20px;text-align:center;color:#fff;">
        <h1 style="margin:0;font-size:20px">${SENDER_NAME}</h1>
      </div>
      <div style="padding:24px;text-align:center;">
        <p style="margin:0 0 12px">${type === 'register' ? 'أهلاً بك في متجر حور! من فضلك استخدم رمز التحقق التالي لإتمام التسجيل.' : 'لقد طلبت إعادة تعيين كلمة المرور. استخدم رمز التحقق التالي لإكمال العملية.'}</p>
        <div style="margin:18px 0;padding:16px;border-radius:8px;background:${BRAND_NAVY};color:#fff;display:inline-block;font-size:28px;letter-spacing:6px;font-weight:700">${otp}</div>
        <p style="color:#666;margin-top:18px;font-size:14px">رمز التحقق صالح لمدة 10 دقائق. إذا لم تطلب هذا الرمز، يمكنك تجاهل هذه الرسالة.</p>
        <div style="margin-top:20px;font-size:13px;color:#999">${SENDER_NAME} &ndash; فريق الدعم</div>
      </div>
    </div>
  </div>
  `;

  if (!transporterReady()) {
   console.warn(`[EMAIL] SMTP not configured for ${email}. OTP generated but email was not sent.`);
   return { sent: false, fallback: true };
  }

  try {
   const transporter = nodemailer.createTransport({
     service: 'gmail',
     auth: {
       user: process.env.EMAIL_USER,
       pass: process.env.EMAIL_PASS,
     },
   });

   await transporter.sendMail({
     from: `${SENDER_NAME} <${process.env.EMAIL_USER}>`,
     to: email,
     subject,
     html,
   });

   return { sent: true, fallback: false };
  } catch (error) {
   console.error('sendOtpEmail failed:', error);
   return { sent: false, fallback: true };
  }
}
