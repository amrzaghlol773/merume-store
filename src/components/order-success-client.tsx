
"use client";

import Link from "next/link";
// 1. ضفنا useEffect هنا
import { useEffect, useMemo } from "react"; 
import { useSearchParams } from "next/navigation";

function formatPrice(value: number) {
  return `${value.toLocaleString("en-EG")} EGP`;
}

export default function OrderSuccessClient() {
  const params = useSearchParams();

  const orderId = params.get("orderId") || "-";
  const total = Number(params.get("total") || 0);
  const whatsappUrl = params.get("wa") || "";

  // --- الجزء الجديد اللي هيحل مشكلة العميل ---
  useEffect(() => {
    if (whatsappUrl) {
      // بنستنى ثانية واحدة عشان الصفحة تحمل شكلها الأول وبعدين نحوله
      const timer = setTimeout(() => {
        window.location.assign(decodeURIComponent(whatsappUrl));
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [whatsappUrl]);
  // ----------------------------------------

  const totalLabel = useMemo(() => formatPrice(Number.isFinite(total) ? total : 0), [total]);

  return (
    <main className="min-h-screen bg-[#0f100d] px-4 py-12 text-[#ece9df] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-3xl border border-[#d4af37]/25 bg-[#161711] p-6 sm:p-10">
        <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">Order Confirmed</p>
        <h1 className="mt-3 text-4xl font-semibold">Thank You For Your Order</h1>
        <p className="mt-4 text-sm leading-7 text-[#c7c9bc]">
          Your order has been created successfully. We are redirecting you to WhatsApp for quick follow-up...
        </p>

        <div className="mt-6 grid gap-3 rounded-xl border border-white/10 bg-[#1b1c15] p-4 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-[#aeb0a2]">Order ID</p>
            <p className="mt-1 text-xl font-semibold">#{orderId}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-[#aeb0a2]">Final Total</p>
            <p className="mt-1 text-xl font-semibold text-[#d4af37]">{totalLabel}</p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {whatsappUrl ? (
            <a
              href={whatsappUrl}
              className="rounded-lg bg-[#d4af37] px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-[#11120e]"
            >
              Open WhatsApp Manually
            </a>
          ) : null}
          <Link href="/" className="rounded-lg border border-white/20 px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] hover:bg-white hover:text-[#11120e]">
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}












// "use client";

// import Link from "next/link";
// import { useMemo } from "react";
// import { useSearchParams } from "next/navigation";

// function formatPrice(value: number) {
//   return `${value.toLocaleString("en-EG")} EGP`;
// }

// export default function OrderSuccessClient() {
//   const params = useSearchParams();

//   const orderId = params.get("orderId") || "-";
//   const total = Number(params.get("total") || 0);
//   const whatsappUrl = params.get("wa") || "";

//   const totalLabel = useMemo(() => formatPrice(Number.isFinite(total) ? total : 0), [total]);

//   return (
//     <main className="min-h-screen bg-[#0f100d] px-4 py-12 text-[#ece9df] sm:px-6 lg:px-8">
//       <div className="mx-auto max-w-3xl rounded-3xl border border-[#d4af37]/25 bg-[#161711] p-6 sm:p-10">
//         <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">Order Confirmed</p>
//         <h1 className="mt-3 text-4xl font-semibold">Thank You For Your Order</h1>
//         <p className="mt-4 text-sm leading-7 text-[#c7c9bc]">
//           Your order has been created successfully. We opened WhatsApp confirmation for quick follow-up.
//         </p>

//         <div className="mt-6 grid gap-3 rounded-xl border border-white/10 bg-[#1b1c15] p-4 sm:grid-cols-2">
//           <div>
//             <p className="text-xs uppercase tracking-[0.12em] text-[#aeb0a2]">Order ID</p>
//             <p className="mt-1 text-xl font-semibold">#{orderId}</p>
//           </div>
//           <div>
//             <p className="text-xs uppercase tracking-[0.12em] text-[#aeb0a2]">Final Total</p>
//             <p className="mt-1 text-xl font-semibold text-[#d4af37]">{totalLabel}</p>
//           </div>
//         </div>

//         <div className="mt-8 flex flex-wrap gap-3">
//           {whatsappUrl ? (
//             <a
//               href={whatsappUrl}
//               target="_blank"
//               rel="noopener noreferrer"
//               className="rounded-lg bg-[#d4af37] px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-[#11120e]"
//             >
//               Open WhatsApp Confirmation
//             </a>
//           ) : null}
//           <Link href="/collections" className="rounded-lg border border-white/20 px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] hover:bg-white hover:text-[#11120e]">
//             Continue Shopping
//           </Link>
//           <Link href="/" className="rounded-lg border border-white/20 px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] hover:bg-white hover:text-[#11120e]">
//             Back to Home
//           </Link>
//         </div>
//       </div>
//     </main>
//   );
// }
