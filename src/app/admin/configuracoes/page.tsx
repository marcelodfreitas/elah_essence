"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  Check,
  Loader2,
  Save,
  Settings,
  Smartphone,
  ArrowLeft,
} from "lucide-react";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type StoreSettings = {
  id: string;
  store_name: string;
  logo_url: string | null;
  whatsapp_number: string | null;
  instagram_url: string | null;
  pix_description: string | null;
  primary_color: string | null;
  secondary_color: string | null;
};

function isValidHex(value: string) {
  return /^#[0-9A-Fa-f]{6}$/.test(value);
}

export default function ConfiguracoesPage() {
  const [settingsId, setSettingsId] = useState<string | null>(null);

  const [storeName, setStoreName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [pixDescription, setPixDescription] = useState("");

  const [primaryColor, setPrimaryColor] = useState("#a88950");
  const [secondaryColor, setSecondaryColor] = useState("#1c1b19");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const router = useRouter();

  useEffect(() => {
    async function loadSettings() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("store_settings")
        .select(
          `
            id,
            store_name,
            logo_url,
            whatsapp_number,
            instagram_url,
            pix_description,
            primary_color,
            secondary_color
          `,
        )
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Erro ao carregar configurações:", error);
        setError("Não foi possível carregar as configurações.");
        setLoading(false);
        return;
      }

      if (data) {
        const settings = data as StoreSettings;

        setSettingsId(settings.id);
        setStoreName(settings.store_name ?? "");
        setLogoUrl(settings.logo_url ?? "");
        setWhatsappNumber(settings.whatsapp_number ?? "");
        setInstagramUrl(settings.instagram_url ?? "");
        setPixDescription(settings.pix_description ?? "");

        setPrimaryColor(
          isValidHex(settings.primary_color ?? "")
            ? settings.primary_color!
            : "#a88950",
        );

        setSecondaryColor(
          isValidHex(settings.secondary_color ?? "")
            ? settings.secondary_color!
            : "#1c1b19",
        );
      }

      setLoading(false);
    }

    loadSettings();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const cleanStoreName = storeName.trim();

    if (!cleanStoreName) {
      setError("Informe o nome da loja.");
      return;
    }

    if (!isValidHex(primaryColor)) {
      setError("A cor principal precisa estar no formato #000000.");
      return;
    }

    if (!isValidHex(secondaryColor)) {
      setError("A cor secundária precisa estar no formato #000000.");
      return;
    }

    setSaving(true);

    const supabase = createClient();

    const payload = {
      store_name: cleanStoreName,
      logo_url: logoUrl.trim() || null,
      whatsapp_number: whatsappNumber.replace(/\D/g, "") || null,
      instagram_url: instagramUrl.trim() || null,
      pix_description: pixDescription.trim() || null,
      primary_color: primaryColor.toUpperCase(),
      secondary_color: secondaryColor.toUpperCase(),
      updated_at: new Date().toISOString(),
    };

    let saveError = null;

    if (settingsId) {
      const { error } = await supabase
        .from("store_settings")
        .update(payload)
        .eq("id", settingsId);

      saveError = error;
    } else {
      const { data, error } = await supabase
        .from("store_settings")
        .insert(payload)
        .select("id")
        .single();

      saveError = error;

      if (data) {
        setSettingsId(data.id);
      }
    }

    if (saveError) {
      console.error("Erro ao salvar configurações:", saveError);

      setError(
        saveError.message || "Não foi possível salvar as configurações.",
      );

      setSaving(false);
      return;
    }

    setSuccess("Configurações salvas com sucesso.");
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#f7f5f1]">
        <Loader2 className="h-5 w-5 animate-spin text-[#a88950]" />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#f7f5f1]">
      <div className="mx-auto w-full max-w-[1100px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
        <button
          type="button"
          onClick={() => router.push("/admin")}
          className="group mb-6 cursor-pointer inline-flex items-center gap-2 text-sm font-medium text-black/50 transition-all duration-300 hover:text-[#1c1b19]"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-black/[0.07] bg-[#fdfcf9] transition-all duration-300 group-hover:-translate-x-0.5 group-hover:border-[#a88950]/40 group-hover:bg-[#fbf8f1]">
            <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5 group-hover:text-[#a88950]" />
          </span>

          <span className="relative">
            Voltar
            <span className="absolute -bottom-1 left-0 h-px w-0 bg-[#a88950] transition-all duration-300 group-hover:w-full" />
          </span>
        </button>
        {/* Cabeçalho */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.25em] text-[#a88950]">
              Sistema
            </p>

            <h1 className="font-serif text-3xl tracking-tight text-[#1c1b19] sm:text-4xl">
              Configurações
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-black/45">
              Gerencie as informações principais utilizadas pelo catálogo ELAH.
            </p>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f3efe7]">
            <Settings className="h-6 w-6 text-[#a88950]" strokeWidth={1.5} />
          </div>
        </div>

        {/* Mensagens */}
        {error && (
          <div className="mt-8 rounded-xl border border-red-200 bg-[#fffafa] px-4 py-3">
            <p className="text-xs leading-5 text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mt-8 rounded-xl border border-[#b8d8c1] bg-[#f4fbf6] px-4 py-3">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-[#39734b]" />

              <p className="text-xs font-medium text-[#39734b]">{success}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8">
          <div className="overflow-hidden rounded-2xl border border-black/[0.06] bg-[#fdfcf9]">
            {/* Identidade */}
            <section className="border-b border-black/[0.06] px-6 py-6 sm:px-8">
              <h2 className="text-sm font-medium text-[#1c1b19]">
                Identidade da loja
              </h2>

              <p className="mt-1 text-xs text-black/35">
                Informações principais da marca.
              </p>

              <div className="mt-7 grid gap-6">
                <div>
                  <label
                    htmlFor="storeName"
                    className="text-xs font-medium text-black/65"
                  >
                    Nome da loja
                  </label>

                  <input
                    id="storeName"
                    type="text"
                    value={storeName}
                    onChange={(event) => setStoreName(event.target.value)}
                    placeholder="Ex.: ELAH"
                    className="mt-2 h-11 w-full rounded-xl border border-black/[0.08] bg-white px-4 text-sm text-[#1c1b19] outline-none transition placeholder:text-black/25 focus:border-[#a88950]/60 focus:ring-2 focus:ring-[#a88950]/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="logoUrl"
                    className="text-xs font-medium text-black/65"
                  >
                    URL da logo
                  </label>

                  <input
                    id="logoUrl"
                    type="url"
                    value={logoUrl}
                    onChange={(event) => setLogoUrl(event.target.value)}
                    placeholder="https://..."
                    className="mt-2 h-11 w-full rounded-xl border border-black/[0.08] bg-white px-4 text-sm text-[#1c1b19] outline-none transition placeholder:text-black/25 focus:border-[#a88950]/60 focus:ring-2 focus:ring-[#a88950]/10"
                  />

                  <p className="mt-2 text-[11px] text-black/30">
                    Opcional. Será utilizada pelo catálogo quando configurada.
                  </p>
                </div>
              </div>
            </section>

            {/* Contato */}
            <section className="border-b border-black/[0.06] px-6 py-6 sm:px-8">
              <h2 className="text-sm font-medium text-[#1c1b19]">Contato</h2>

              <p className="mt-1 text-xs text-black/35">
                Canais utilizados pelos clientes.
              </p>

              <div className="mt-7 grid gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="whatsappNumber"
                    className="flex items-center gap-2 text-xs font-medium text-black/65"
                  >
                    <Smartphone className="h-3.5 w-3.5 text-[#a88950]" />
                    WhatsApp
                  </label>

                  <input
                    id="whatsappNumber"
                    type="tel"
                    value={whatsappNumber}
                    onChange={(event) => setWhatsappNumber(event.target.value)}
                    placeholder="51999999999"
                    className="mt-2 h-11 w-full rounded-xl border border-black/[0.08] bg-white px-4 text-sm text-[#1c1b19] outline-none transition placeholder:text-black/25 focus:border-[#a88950]/60 focus:ring-2 focus:ring-[#a88950]/10"
                  />

                  <p className="mt-2 text-[11px] text-black/30">
                    Informe o número com DDD.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="instagramUrl"
                    className="flex items-center gap-2 text-xs font-medium text-black/65"
                  >
                    <span className="text-xs font-semibold text-[#a88950]">
                      @
                    </span>
                    Instagram
                  </label>

                  <input
                    id="instagramUrl"
                    type="url"
                    value={instagramUrl}
                    onChange={(event) => setInstagramUrl(event.target.value)}
                    placeholder="https://instagram.com/..."
                    className="mt-2 h-11 w-full rounded-xl border border-black/[0.08] bg-white px-4 text-sm text-[#1c1b19] outline-none transition placeholder:text-black/25 focus:border-[#a88950]/60 focus:ring-2 focus:ring-[#a88950]/10"
                  />
                </div>
              </div>
            </section>

            {/* Pagamento */}
            <section className="border-b border-black/[0.06] px-6 py-6 sm:px-8">
              <h2 className="text-sm font-medium text-[#1c1b19]">Pagamento</h2>

              <p className="mt-1 text-xs text-black/35">
                Informações que podem aparecer durante o processo de compra.
              </p>

              <div className="mt-7">
                <label
                  htmlFor="pixDescription"
                  className="text-xs font-medium text-black/65"
                >
                  Descrição do PIX
                </label>

                <textarea
                  id="pixDescription"
                  value={pixDescription}
                  onChange={(event) => setPixDescription(event.target.value)}
                  rows={4}
                  placeholder="Ex.: Pagamento via PIX. Envie o comprovante pelo WhatsApp."
                  className="mt-2 w-full resize-none rounded-xl border border-black/[0.08] bg-white px-4 py-3 text-sm leading-6 text-[#1c1b19] outline-none transition placeholder:text-black/25 focus:border-[#a88950]/60 focus:ring-2 focus:ring-[#a88950]/10"
                />
              </div>
            </section>

            {/* Identidade visual */}
            <section className="px-6 py-6 sm:px-8">
              <h2 className="text-sm font-medium text-[#1c1b19]">
                Identidade visual
              </h2>

              <p className="mt-1 text-xs text-black/35">
                Cores que poderão ser utilizadas pelo catálogo.
              </p>

              {/* CORES */}
              <div className="mt-7 grid gap-6 sm:grid-cols-2">
                {/* Cor principal */}
                <div>
                  <label
                    htmlFor="primaryColor"
                    className="text-xs font-medium text-black/65"
                  >
                    Cor principal
                  </label>

                  <div className="mt-2 flex h-11 overflow-hidden rounded-xl border border-black/[0.08] bg-white">
                    <label
                      htmlFor="primaryColorPicker"
                      className="relative flex w-14 shrink-0 cursor-pointer items-center justify-center border-r border-black/[0.06] bg-white"
                    >
                      <span
                        className="h-7 w-7 rounded-lg border border-black/10 shadow-sm"
                        style={{
                          backgroundColor: isValidHex(primaryColor)
                            ? primaryColor
                            : "#ffffff",
                        }}
                      />

                      <input
                        id="primaryColorPicker"
                        type="color"
                        value={
                          isValidHex(primaryColor) ? primaryColor : "#a88950"
                        }
                        onChange={(event) =>
                          setPrimaryColor(event.target.value)
                        }
                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                      />
                    </label>

                    <input
                      id="primaryColor"
                      type="text"
                      value={primaryColor}
                      onChange={(event) => setPrimaryColor(event.target.value)}
                      maxLength={7}
                      placeholder="#A88950"
                      className="min-w-0 flex-1 bg-white px-3 text-sm uppercase text-[#1c1b19] outline-none placeholder:text-black/25"
                    />
                  </div>
                </div>

                {/* Cor secundária */}
                <div>
                  <label
                    htmlFor="secondaryColor"
                    className="text-xs font-medium text-black/65"
                  >
                    Cor secundária
                  </label>

                  <div className="mt-2 flex h-11 overflow-hidden rounded-xl border border-black/[0.08] bg-white">
                    <label
                      htmlFor="secondaryColorPicker"
                      className="relative flex w-14 shrink-0 cursor-pointer items-center justify-center border-r border-black/[0.06] bg-white"
                    >
                      <span
                        className="h-7 w-7 rounded-lg border border-black/10 shadow-sm"
                        style={{
                          backgroundColor: isValidHex(secondaryColor)
                            ? secondaryColor
                            : "#ffffff",
                        }}
                      />

                      <input
                        id="secondaryColorPicker"
                        type="color"
                        value={
                          isValidHex(secondaryColor)
                            ? secondaryColor
                            : "#1c1b19"
                        }
                        onChange={(event) =>
                          setSecondaryColor(event.target.value)
                        }
                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                      />
                    </label>

                    <input
                      id="secondaryColor"
                      type="text"
                      value={secondaryColor}
                      onChange={(event) =>
                        setSecondaryColor(event.target.value)
                      }
                      maxLength={7}
                      placeholder="#1C1B19"
                      className="min-w-0 flex-1 bg-white px-3 text-sm uppercase text-[#1c1b19] outline-none placeholder:text-black/25"
                    />
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="mt-6 rounded-xl border border-black/[0.06] bg-[#faf9f6] p-5">
                <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-black/30">
                  Pré-visualização
                </p>

                <div className="mt-4 overflow-hidden rounded-xl border border-black/[0.06] bg-white">
                  <div
                    className="flex items-center justify-between px-5 py-4"
                    style={{
                      backgroundColor: isValidHex(primaryColor)
                        ? primaryColor
                        : "#a88950",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-lg"
                        style={{
                          backgroundColor: isValidHex(secondaryColor)
                            ? secondaryColor
                            : "#1c1b19",
                          color: "#ffffff",
                        }}
                      >
                        <Settings className="h-5 w-5" strokeWidth={1.5} />
                      </div>

                      <span
                        className="font-serif text-lg"
                        style={{ color: "#ffffff" }}
                      >
                        {storeName || "ELAH"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-white" />

                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{
                          backgroundColor: isValidHex(secondaryColor)
                            ? secondaryColor
                            : "#1c1b19",
                        }}
                      />
                    </div>
                  </div>

                  <div className="px-5 py-4">
                    <p className="text-xs text-black/40">
                      Exemplo de como a identidade visual poderá aparecer no
                      catálogo.
                    </p>

                    <div className="mt-4 flex gap-2">
                      <span
                        className="rounded-lg px-4 py-2 text-[10px] font-medium text-white"
                        style={{
                          backgroundColor: isValidHex(primaryColor)
                            ? primaryColor
                            : "#a88950",
                        }}
                      >
                        Ação principal
                      </span>

                      <span
                        className="rounded-lg px-4 py-2 text-[10px] font-medium"
                        style={{
                          backgroundColor: isValidHex(secondaryColor)
                            ? `${secondaryColor}12`
                            : "#1c1b1912",
                          color: isValidHex(secondaryColor)
                            ? secondaryColor
                            : "#1c1b19",
                        }}
                      >
                        Secundário
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Ações */}
            <div className="flex justify-end border-t border-black/[0.06] bg-[#faf9f6] px-6 py-5 sm:px-8">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1c1b19] px-6 text-xs font-medium text-white transition hover:bg-[#302e2a] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}

                {saving ? "Salvando..." : "Salvar configurações"}
              </button>
            </div>
          </div>
        </form>

        {/* Informação */}
        <div className="mt-6 rounded-2xl border border-[#c8aa6e]/20 bg-[#fbf8f1] px-6 py-5">
          <div className="flex gap-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f3ead9]">
              <Settings className="h-4 w-4 text-[#a88950]" strokeWidth={1.5} />
            </div>

            <div>
              <p className="text-sm font-medium text-[#1c1b19]">
                Configurações centralizadas
              </p>

              <p className="mt-1 max-w-3xl text-xs leading-5 text-black/45">
                Essas informações ficam armazenadas no sistema e poderão ser
                utilizadas automaticamente pelo catálogo público, evitando dados
                fixos espalhados pelo código.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
