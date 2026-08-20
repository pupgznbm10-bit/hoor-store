import Link from 'next/link';

export default function AboutSection() {
  return (
    <section id="about" className="mx-auto max-w-6xl px-6 py-12 md:py-16">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[28px] bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-8">
          <p className="text-sm font-medium text-[#a67c00]">من نحن</p>
          <h2 className="mt-2 text-3xl font-black text-[#111827]">رحلة عطور فاخرة من الشرق إلى كل بيت</h2>
          <p className="mt-5 text-sm leading-8 text-slate-600">
            متجر حور هو بوتيك عربي يقدّم رائحة منسوجة من العود، الزهور، والحمضيات في تركيبات متوازنة تجمع بين الأصالة والحداثة. نحن نحرص على اختيار أفضل مواد العطور، وتجهيز شكليتنا لتناسب أسلوب حياة العملاء الذين يقدّرون الجودة والهوية.
          </p>
          <p className="mt-4 text-sm leading-8 text-slate-600">
            من خلال تركيباتنا المختارة بعناية، نقدم لكل عطر قصة وأجواء مميزة، مع مراعاة التفاصيل في التغليف والتوصيل والخدمة، لأن تجربة العطر ليست مجرد شراء بل رحلة شخصية.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              ['12+', 'تشكيلة عطرية متكاملة'],
              ['24h', 'توصيل سريع'],
              ['4.9/5', 'تقييم العملاء'],
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-slate-200 bg-[#faf8f2] p-4 text-center">
                <div className="text-2xl font-black text-[#111827]">{value}</div>
                <div className="mt-1 text-xs text-slate-600">{label}</div>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <Link href="/about" className="inline-flex items-center gap-2 rounded-full bg-[#111827] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#1f2937]">
              اكتشف القصة الكاملة
              <span aria-hidden="true">←</span>
            </Link>
          </div>
        </section>

        <aside className="overflow-hidden rounded-[28px] border border-[#efe5d4] bg-[#faf7f0] shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <img
            src="/hoor-logo.jfif"
            alt="عطر حور"
            className="h-full w-full object-cover"
          />
        </aside>
      </div>
    </section>
  );
}
