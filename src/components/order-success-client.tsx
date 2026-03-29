
"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

function formatPrice(value: number) {
  return `${value.toLocaleString("en-EG")} EGP`;
}

export default function OrderSuccessClient() {
  const params = useSearchParams();

  const orderId = params.get("orderId") || "-";
  const total = Number(params.get("total") || 0);
  const whatsappUrl = params.get("wa") || "";



  const totalLabel = useMemo(() => formatPrice(Number.isFinite(total) ? total : 0), [total]);

  return (
    <main className="min-h-screen bg-[#0f100d] px-4 py-12 text-[#ece9df] sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="mx-auto w-full max-w-md rounded-3xl border border-[#d4af37]/25 bg-[#161711] p-6 sm:p-10 flex flex-col items-center">
        {/* Success Checkmark */}
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
          <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="2.5" fill="none" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 13l3 3 6-6" />
          </svg>
        </div>
        <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">Order Confirmed</p>
        <h1 className="mt-3 text-3xl sm:text-4xl font-semibold text-center">Thank You For Your Order</h1>
        <p className="mt-4 text-base leading-7 text-[#c7c9bc] text-center">
          Your order has been created successfully.<br />
          <span className="font-semibold text-green-400">Please confirm your order on WhatsApp to complete the process.</span>
        </p>

        <div className="mt-6 w-full grid gap-3 rounded-xl border border-white/10 bg-[#1b1c15] p-4 grid-cols-1 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-[#aeb0a2]">Order ID</p>
            <p className="mt-1 text-xl font-semibold">#{orderId}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-[#aeb0a2]">Final Total</p>
            <p className="mt-1 text-xl font-semibold text-[#d4af37]">{totalLabel}</p>
          </div>
        </div>

        {/* WhatsApp Button */}
        {whatsappUrl ? (
          <button
            type="button"
            className="mt-8 flex items-center justify-center w-full rounded-xl bg-[#25D366] px-6 py-4 text-lg font-bold uppercase tracking-wide text-white shadow-lg hover:bg-[#1ebe57] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#25D366]/60"
            onClick={() => {
              window.location.href = decodeURIComponent(whatsappUrl);
            }}
          >
            {/* WhatsApp SVG Icon */}
            <svg className="w-7 h-7 mr-3" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
              <path d="M16 3C9.373 3 4 8.373 4 15c0 2.385.832 4.584 2.236 6.393L4 29l7.828-2.05A12.94 12.94 0 0016 27c6.627 0 12-5.373 12-12S22.627 3 16 3zm0 22.917c-1.98 0-3.91-.52-5.59-1.5l-.4-.236-4.65 1.217 1.24-4.527-.26-.418A9.93 9.93 0 016 15c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10zm5.29-7.41c-.29-.145-1.71-.844-1.98-.94-.27-.1-.47-.145-.67.145-.2.29-.77.94-.95 1.13-.17.2-.35.22-.64.075-.29-.145-1.22-.45-2.33-1.43-.86-.77-1.44-1.72-1.61-2-.17-.29-.02-.44.13-.58.13-.13.29-.34.43-.51.14-.17.19-.29.29-.48.1-.2.05-.37-.025-.52-.075-.145-.67-1.62-.92-2.22-.24-.58-.48-.5-.67-.51-.17-.01-.37-.01-.57-.01-.2 0-.52.075-.8.37-.27.29-1.05 1.03-1.05 2.5 0 1.47 1.08 2.89 1.23 3.09.15.2 2.13 3.25 5.17 4.43.72.31 1.28.5 1.72.64.72.23 1.37.2 1.88.12.57-.09 1.71-.7 1.95-1.37.24-.67.24-1.25.17-1.37-.07-.12-.26-.19-.55-.33z" />
            </svg>
            Confirm Order on WhatsApp
          </button>
        ) : null}

        <div className="mt-6 w-full flex flex-col sm:flex-row gap-3">
          <Link href="/" className="flex-1 rounded-lg border border-white/20 px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] hover:bg-white hover:text-[#11120e] text-center">
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
