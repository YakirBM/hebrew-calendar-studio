"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return <main className="fatal-error" dir="rtl"><span>משהו השתבש</span><h1>לא הצלחנו לפתוח את הסטודיו</h1><p>המידע האישי נשאר בדפדפן. אפשר לנסות לטעון את הממשק מחדש.</p><button className="button button--primary" type="button" onClick={reset}>ניסיון נוסף</button></main>;
}
