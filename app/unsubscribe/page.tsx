"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function UnsubscribeContent() {
  const params = useSearchParams();
  const email = params.get("email");
  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");

  useEffect(() => {
    if (!email) {
      setStatus("error");
      return;
    }
    fetch(`/api/unsubscribe?email=${encodeURIComponent(email)}`)
      .then((res) => setStatus(res.ok ? "done" : "error"))
      .catch(() => setStatus("error"));
  }, [email]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-md text-center">
        {status === "loading" && <p className="text-gray-500">Even geduld...</p>}
        {status === "done" && (
          <>
            <div className="text-4xl mb-4">&#10003;</div>
            <h1 className="text-xl font-bold mb-2">Uitgeschreven</h1>
            <p className="text-gray-500 text-sm">Je ontvangt geen review e-mails meer.</p>
          </>
        )}
        {status === "error" && (
          <>
            <h1 className="text-xl font-bold mb-2">Er ging iets mis</h1>
            <p className="text-gray-500 text-sm">Probeer het later opnieuw.</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="text-gray-500">Laden...</p></div>}>
      <UnsubscribeContent />
    </Suspense>
  );
}
