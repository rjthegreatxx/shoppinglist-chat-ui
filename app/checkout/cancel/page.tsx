import Link from "next/link";

export default function CheckoutCancel() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 px-6 text-center">
      <div className="bg-white rounded-2xl p-10 shadow-sm max-w-sm w-full flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-2xl">
          ×
        </div>
        <h1 className="text-lg font-semibold text-gray-900">Payment cancelled</h1>
        <p className="text-sm text-gray-500 leading-relaxed">
          Your order was not placed. You can go back and try again.
        </p>
        <Link
          href="/"
          className="mt-2 px-6 py-3 bg-blue-500 text-white rounded-2xl text-sm font-medium hover:bg-blue-600 transition-colors"
        >
          Back to Chat
        </Link>
      </div>
    </div>
  );
}
