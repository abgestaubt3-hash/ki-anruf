'use client';
import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState<File|null>(null);
  const [phone, setPhone] = useState('');
  const [pkg, setPkg] = useState('10');
  const [email, setEmail] = useState('');
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !phone || !agree) {
      alert('Bitte alle Felder ausfüllen und Zustimmung anhaken.');
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const upRes = await fetch('/api/upload', { method: 'POST', body: fd });
      const up = await upRes.json();
      if (up.error) throw new Error(up.error);

      const coRes = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, email, pkg, audioUrl: up.publicUrl })
      });
      const data = await coRes.json();
      if (data.error) throw new Error(data.error);
      window.location.href = data.checkoutUrl;
    } catch (err:any) {
      alert(err.message || 'Fehler beim Start');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">KI-Anruf mit personalisierter Stimme</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="w-full border p-2" placeholder="Telefonnummer (+43…)" value={phone} onChange={e=>setPhone(e.target.value)} />
        <input className="w-full border p-2" placeholder="E-Mail (optional)" value={email} onChange={e=>setEmail(e.target.value)} />
        <select className="w-full border p-2" value={pkg} onChange={e=>setPkg(e.target.value)}>
          <option value="5">5 Minuten – 14,99 €</option>
          <option value="10">10 Minuten – 19,99 €</option>
          <option value="20">20 Minuten – 24,99 €</option>
        </select>
        <input type="file" accept="audio/*" onChange={e=>setFile(e.target.files?.[0] ?? null)} />
        <label className="flex items-start gap-2">
          <input type="checkbox" checked={agree} onChange={e=>setAgree(e.target.checked)} />
          <span>Ich bestätige, dass ich die Einwilligung der betroffenen Person zur Stimmnutzung habe.</span>
        </label>
        <button disabled={loading} className="w-full bg-black text-white p-2 rounded">{loading ? 'Bitte warten…' : 'Jetzt bezahlen & Anruf erhalten'}</button>
      </form>
    </main>
  );
}
