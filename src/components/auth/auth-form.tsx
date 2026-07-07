"use client";

import { verticales } from "@/lib/config";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";
import { ArrowRight, Loader2, Lock, Mail, Store } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Mode = "login" | "registro";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const [negocio, setNegocio] = useState("");
  const [vertical, setVertical] = useState(verticales[0].id);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      const supabase = createClient();
      if (mode === "registro") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              negocio_nombre: negocio,
              negocio_slug: slugify(negocio),
              vertical,
            },
          },
        });
        if (error) throw error;
        // Si el proyecto no exige confirmar el email (p. ej. en local), la
        // sesión llega ya activa: llevamos al usuario directo al onboarding.
        if (data.session) {
          router.push("/app/onboarding");
          router.refresh();
        } else {
          setInfo("Te hemos enviado un email para confirmar tu cuenta.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/app");
        router.refresh();
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Ha ocurrido un error inesperado.";
      // Mensaje claro si aún no hay backend configurado.
      setError(
        message.includes("supabaseUrl") || message.includes("fetch")
          ? "Configura las claves de Supabase en .env.local para activar el registro."
          : message,
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {mode === "registro" && (
        <>
          <Field
            id="negocio"
            label="Nombre de tu negocio"
            icon={<Store className="h-4 w-4" />}
            value={negocio}
            onChange={setNegocio}
            placeholder="Estudio Martina"
            required
          />
          <div>
            <label htmlFor="vertical" className="mb-1.5 block text-sm font-medium text-ink-700">
              Tipo de negocio
            </label>
            <select
              id="vertical"
              value={vertical}
              onChange={(e) => setVertical(e.target.value)}
              className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10"
            >
              {verticales.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.emoji} {v.nombre}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      <Field
        id="email"
        label="Email"
        type="email"
        icon={<Mail className="h-4 w-4" />}
        value={email}
        onChange={setEmail}
        placeholder="tu@email.com"
        required
      />

      <Field
        id="password"
        label="Contraseña"
        type="password"
        icon={<Lock className="h-4 w-4" />}
        value={password}
        onChange={setPassword}
        placeholder="••••••••"
        required
        minLength={8}
      />

      {error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}
      {info && (
        <p className="rounded-xl bg-accent-50 px-3 py-2 text-sm text-accent-700">{info}</p>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full py-3">
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            {mode === "registro" ? "Crear cuenta gratis" : "Entrar"}
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>

      <p className="text-center text-sm text-ink-500">
        {mode === "registro" ? (
          <>
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="font-medium text-brand-600 hover:text-brand-700">
              Entrar
            </Link>
          </>
        ) : (
          <>
            ¿Aún no tienes cuenta?{" "}
            <Link href="/registro" className="font-medium text-brand-600 hover:text-brand-700">
              Crear cuenta
            </Link>
          </>
        )}
      </p>
    </form>
  );
}

function Field({
  id,
  label,
  icon,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
  minLength,
}: {
  id: string;
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink-700">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400">
          {icon}
        </span>
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          minLength={minLength}
          autoComplete={type === "password" ? "current-password" : "on"}
          className="w-full rounded-2xl border border-ink-200 bg-white py-2.5 pl-10 pr-4 text-sm text-ink-900 outline-none transition placeholder:text-ink-300 focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10"
        />
      </div>
    </div>
  );
}
