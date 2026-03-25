import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Scale, Sparkles, Loader2, Send } from "lucide-react";
import { useInmoAI } from "@/hooks/useInmoAI";
import { UsageLimitBanner } from "@/components/UsageLimitBanner";

const ConsultorLegalPage = () => {
  const [consulta, setConsulta] = useState("");
  const [resultado, setResultado] = useState<{
    respuesta: string;
    resumen: string;
    recomendaciones: string[];
  } | null>(null);
  const { generate, loading } = useInmoAI();

  const consultar = async () => {
    if (!consulta.trim()) return;
    const result = await generate("consultor-legal", { consulta });
    if (result) {
      setResultado({
        respuesta: result.respuesta || "",
        resumen: result.resumen || "",
        recomendaciones: result.recomendaciones || [],
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <UsageLimitBanner toolId="consultor-legal" />
      <div className="flex items-center gap-2 mb-6">
        <Scale className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-semibold">Consultor Jurídico</h1>
        <Sparkles className="h-4 w-4 text-primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base">Tu Consulta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Escribe tu duda legal inmobiliaria... Ej: ¿Qué impuestos se pagan al vender una propiedad en España?"
              value={consulta}
              onChange={(e) => setConsulta(e.target.value)}
              rows={8}
            />
            <Button onClick={consultar} className="w-full" disabled={loading || !consulta.trim()}>
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Consultando...</> : <><Send className="h-4 w-4 mr-2" /> Consultar</>}
            </Button>
            <p className="text-[11px] text-muted-foreground">
              ⚠️ Las respuestas son orientativas y no sustituyen asesoramiento legal profesional.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {resultado ? (
            <>
              <Card className="glass-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Respuesta</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-line leading-relaxed">{resultado.respuesta}</p>
                </CardContent>
              </Card>
              {resultado.resumen && (
                <Card className="glass-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Resumen</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">{resultado.resumen}</p>
                  </CardContent>
                </Card>
              )}
              {resultado.recomendaciones.length > 0 && (
                <Card className="glass-card border-primary/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Recomendaciones</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {resultado.recomendaciones.map((r, i) => (
                        <li key={i} className="text-sm flex gap-2">
                          <span className="text-primary">→</span> {r}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card className="glass-card">
              <CardContent className="p-8 text-center text-muted-foreground">
                <Scale className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Escribe tu consulta legal inmobiliaria y recibirás orientación adaptada a Paraguay.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsultorLegalPage;
