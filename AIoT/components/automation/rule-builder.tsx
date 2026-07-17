"use client";

import { FormEvent, useState } from "react";
import { createClientId } from "@/lib/client-id";

interface Rule {
  id: string;
  condition: string;
  action: string;
}

export function RuleBuilder() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [condition, setCondition] = useState("Temperature > 30 C AND FaceDetected = true");
  const [action, setAction] = useState("Publish ON to /relay/1");

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    setRules((prev) => [
      {
        id: createClientId("rule"),
        condition,
        action
      },
      ...prev
    ]);
    setCondition("");
    setAction("");
  };

  return (
    <section className="glass rounded-2xl p-5">
      <h3 className="font-[var(--font-sora)] text-xl font-semibold">Automation (AI Rules)</h3>
      <p className="mt-2 text-sm text-slate-200/85">ตั้งเงื่อนไข เช่น ถ้าอุณหภูมิสูงกว่า 30°C และ AI พบใบหน้า ให้สั่ง Relay เปิด</p>

      <form className="mt-5 grid gap-3 md:grid-cols-5" onSubmit={onSubmit}>
        <input
          className="rounded-xl border border-white/20 bg-slate-900/40 px-3 py-2 text-sm md:col-span-3"
          value={condition}
          onChange={(event) => setCondition(event.target.value)}
          placeholder="If [temperature > 30] and [face=true]"
          required
        />
        <input
          className="rounded-xl border border-white/20 bg-slate-900/40 px-3 py-2 text-sm md:col-span-2"
          value={action}
          onChange={(event) => setAction(event.target.value)}
          placeholder="Then publish ON"
          required
        />

        <button className="rounded-xl bg-gradient-to-r from-teal to-cyan px-4 py-2 text-sm font-semibold text-ink md:col-span-5" type="submit">
          Add Rule
        </button>
      </form>

      <div className="mt-5 space-y-2">
        {rules.length === 0 && <p className="text-sm text-slate-200/75">ยังไม่มี rule, ลองเพิ่ม rule แรกของทีม</p>}
        {rules.map((rule) => (
          <article key={rule.id} className="rounded-xl border border-white/15 bg-white/5 p-3 text-sm">
            <p>
              <span className="text-cyan-200">IF:</span> {rule.condition}
            </p>
            <p className="mt-1">
              <span className="text-coral">THEN:</span> {rule.action}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
