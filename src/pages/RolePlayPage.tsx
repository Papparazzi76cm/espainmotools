import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UsageLimitBanner } from "@/components/UsageLimitBanner";
import { useTrialContext } from "@/contexts/TrialContext";
import { toast } from "sonner";
import {
  Users, Send, Loader2, Mic, MicOff, RotateCcw, Trophy,
  MessageSquare, Star, AlertTriangle, CheckCircle, XCircle, Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const CLIENT_PROFILES = [
  { value: "comprensivo", label: "Comprensivo", difficulty: "baja", color: "text-green-400" },
  { value: "curioso", label: "Curioso", difficulty: "baja", color: "text-green-400" },
  { value: "tecnico", label: "Técnico", difficulty: "media", color: "text-yellow-400" },
  { value: "reticente", label: "Reticente", difficulty: "media", color: "text-yellow-400" },
  { value: "desconfiado", label: "Desconfiado", difficulty: "alta", color: "text-red-400" },
  { value: "malas_experiencias", label: "Malas experiencias previas", difficulty: "alta", color: "text-red-400" },
  { value: "negociador_agresivo", label: "Negociador agresivo", difficulty: "alta", color: "text-red-400" },
];

const MAX_MESSAGES = 10;

type Message = { role: "user" | "assistant"; content: string };

interface Evaluation {
  puntuacion: number;
  resumen: string;
  aciertos: string[];
  mejoras: string[];
  objeciones_resueltas: number;
  objeciones_pendientes: string[];
  consejo_final: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/roleplay-chat`;

const RolePlayPage = () => {
  const [role, setRole] = useState<string>("");
  const [profile, setProfile] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const { canUseTool, logUsage, trial } = useTrialContext();

  const userMessageCount = messages.filter((m) => m.role === "user").length;
  const canSendMore = userMessageCount < MAX_MESSAGES;
  const selectedProfile = CLIENT_PROFILES.find((p) => p.value === profile);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startSession = async () => {
    if (!role || !profile) {
      toast.error("Selecciona un rol y un perfil de cliente.");
      return;
    }

    if (!trial.isPaid) {
      const check = canUseTool("roleplay");
      if (!check.allowed) {
        if (trial.isTrialExpired) {
          toast.error("Tu período de prueba ha expirado.");
        } else {
          toast.error(`Límite diario alcanzado (${check.used}/${check.max}).`);
        }
        return;
      }
    }

    setMessages([]);
    setEvaluation(null);
    setSessionStarted(true);

    // Send initial greeting from AI client
    setIsStreaming(true);
    const initialMessages: Message[] = [
      { role: "user", content: role === "comprador"
        ? "Hola, buenas tardes. Soy agente inmobiliario y me gustaría mostrarle una propiedad que puede interesarle."
        : "Hola, buenas tardes. Soy agente inmobiliario y me gustaría hablar con usted sobre la gestión de su propiedad." },
    ];

    await streamChat(initialMessages);
  };

  const streamChat = async (chatMessages: Message[]) => {
    setIsStreaming(true);
    let assistantContent = "";

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: chatMessages, role, profile }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || `Error ${resp.status}`);
      }

      const reader = resp.body?.getReader();
      if (!reader) throw new Error("No stream");
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIdx: number;
        while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIdx);
          buffer = buffer.slice(newlineIdx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantContent += delta;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantContent } : m);
                }
                return [...prev, { role: "assistant", content: assistantContent }];
              });
            }
          } catch { /* partial JSON */ }
        }
      }
    } catch (e: any) {
      toast.error(e.message || "Error de conexión");
    } finally {
      setIsStreaming(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isStreaming || !canSendMore) return;

    const userMsg: Message = { role: "user", content: input.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");

    await streamChat(updatedMessages);
  };

  const finishSession = async () => {
    if (messages.length < 2) {
      toast.error("Necesitás al menos un intercambio para evaluar.");
      return;
    }

    setIsEvaluating(true);
    try {
      const { data, error } = await supabase.functions.invoke("roleplay-chat", {
        body: { messages, role, profile, action: "evaluate" },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setEvaluation(data.result);

      // Log usage
      if (!trial.isPaid) {
        await logUsage("roleplay");
      }
    } catch (e: any) {
      toast.error(e.message || "Error al evaluar");
    } finally {
      setIsEvaluating(false);
    }
  };

  const resetSession = () => {
    setMessages([]);
    setEvaluation(null);
    setSessionStarted(false);
    setRole("");
    setProfile("");
  };

  // Voice recording
  const toggleRecording = useCallback(async () => {
    if (isRecording && mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunks, { type: "audio/webm" });

        // Use Web Speech API for transcription
        if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
          toast.info("Procesando audio...");
        }
        // Fallback: just notify that voice was recorded
        toast.info("Audio grabado. Usa el texto para enviar tu mensaje.");
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      toast.info("Grabando... Habla ahora");
    } catch {
      toast.error("No se pudo acceder al micrófono.");
    }
  }, [isRecording, mediaRecorder]);

  // Use Web Speech API for live transcription
  const startSpeechRecognition = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Tu navegador no soporta reconocimiento de voz.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "es-ES";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join("");
      setInput(transcript);
    };

    recognition.onend = () => setIsRecording(false);
    recognition.onerror = () => {
      setIsRecording(false);
      toast.error("Error en el reconocimiento de voz.");
    };

    recognition.start();
    setIsRecording(true);
  }, []);

  const toggleVoice = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }
    startSpeechRecognition();
  };

  const difficultyBadge = (difficulty: string) => {
    const colors: Record<string, string> = {
      baja: "bg-green-500/20 text-green-400 border-green-500/30",
      media: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      alta: "bg-red-500/20 text-red-400 border-red-500/30",
    };
    return (
      <Badge variant="outline" className={`${colors[difficulty]} text-xs`}>
        {difficulty === "baja" ? "🟢" : difficulty === "media" ? "🟡" : "🔴"} {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <UsageLimitBanner toolId="roleplay" />
      <div className="flex items-center gap-2 mb-6">
        <Users className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-semibold">Asistente de Role Play</h1>
        <Sparkles className="h-4 w-4 text-primary" />
      </div>

      {!sessionStarted && !evaluation ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Setup */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-base">Configuración de la sesión</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <Tabs defaultValue="role" className="w-full">
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="role">Rol del cliente</TabsTrigger>
                  <TabsTrigger value="profile">Perfil de cliente</TabsTrigger>
                </TabsList>

                <TabsContent value="role" className="space-y-3 mt-4">
                  <Label>¿Qué rol tendrá la IA?</Label>
                  <p className="text-xs text-muted-foreground">Tú serás el agente inmobiliario. La IA será el cliente.</p>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccioná el rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="comprador">🏠 Comprador — Vos intentás vender</SelectItem>
                      <SelectItem value="vendedor">🔑 Vendedor/Propietario — Vos intentás captar</SelectItem>
                    </SelectContent>
                  </Select>
                </TabsContent>

                <TabsContent value="profile" className="space-y-3 mt-4">
                  <Label>Perfil de personalidad del cliente</Label>
                  <Select value={profile} onValueChange={setProfile}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccioná un perfil" />
                    </SelectTrigger>
                    <SelectContent>
                      {CLIENT_PROFILES.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          <span className="flex items-center gap-2">
                            {p.label}
                            <span className={`text-xs ${p.color}`}>({p.difficulty})</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedProfile && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-muted-foreground">Dificultad:</span>
                      {difficultyBadge(selectedProfile.difficulty)}
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <Button onClick={startSession} className="w-full" disabled={!role || !profile}>
                <MessageSquare className="h-4 w-4 mr-2" /> Iniciar sesión de Role Play
              </Button>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-base">📖 Cómo funciona</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <span className="text-primary font-bold">1.</span>
                <p>Elegí el <strong>rol del cliente</strong> (comprador o vendedor) y su <strong>perfil de personalidad</strong>.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary font-bold">2.</span>
                <p>La IA simulará un cliente real con objeciones típicas de su perfil.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary font-bold">3.</span>
                <p>Intentá resolver todas las objeciones y llegar a un acuerdo.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary font-bold">4.</span>
                <p>Al finalizar, la IA evaluará tu desempeño con puntuación y consejos.</p>
              </div>
              <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border">
                <p className="text-xs">
                  <strong>Límites:</strong> Máximo {MAX_MESSAGES} mensajes por sesión. Podés escribir o usar el micrófono 🎤 para dictar tus respuestas.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : evaluation ? (
        /* Evaluation */
        <div className="space-y-4">
          <Card className="glass-card border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Trophy className="h-5 w-5 text-primary" /> Evaluación del Role Play
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold text-primary">{evaluation.puntuacion}/10</div>
                <div className="flex gap-1">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < evaluation.puntuacion ? "text-primary fill-primary" : "text-muted-foreground/30"}`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{evaluation.resumen}</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="glass-card border-green-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-400" /> Lo que hiciste bien
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5">
                  {evaluation.aciertos?.map((a, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">✓</span> {a}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="glass-card border-amber-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4 text-amber-400" /> Áreas de mejora
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5">
                  {evaluation.mejoras?.map((m, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-amber-400 mt-0.5">!</span> {m}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {evaluation.objeciones_pendientes?.length > 0 && (
            <Card className="glass-card border-red-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-1">
                  <XCircle className="h-4 w-4 text-red-400" /> Objeciones no resueltas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5">
                  {evaluation.objeciones_pendientes.map((o, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-red-400 mt-0.5">✗</span> {o}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <Card className="glass-card border-primary/20">
            <CardContent className="p-4">
              <p className="text-sm font-medium text-primary">💡 Consejo final:</p>
              <p className="text-sm text-muted-foreground mt-1">{evaluation.consejo_final}</p>
            </CardContent>
          </Card>

          <Button onClick={resetSession} className="w-full">
            <RotateCcw className="h-4 w-4 mr-2" /> Nueva sesión de entrenamiento
          </Button>
        </div>
      ) : (
        /* Chat */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {role === "comprador" ? "🏠 Venta" : "🔑 Captación"}
              </Badge>
              <Badge variant="outline" className="text-xs">
                👤 {selectedProfile?.label}
              </Badge>
              {selectedProfile && difficultyBadge(selectedProfile.difficulty)}
            </div>
            <span className="text-xs text-muted-foreground">
              {userMessageCount}/{MAX_MESSAGES} mensajes
            </span>
          </div>

          <Card className="glass-card">
            <CardContent className="p-0">
              <div className="h-[450px] overflow-y-auto p-4 space-y-3">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-muted text-foreground rounded-bl-sm"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-2xl px-4 py-2.5 rounded-bl-sm">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="border-t border-border p-3 flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleVoice}
                  className={isRecording ? "border-red-500 text-red-400" : ""}
                  disabled={isStreaming || !canSendMore}
                >
                  {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={canSendMore ? "Escribí tu respuesta como agente..." : "Límite de mensajes alcanzado"}
                  className="min-h-[40px] max-h-[80px] resize-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  disabled={isStreaming || !canSendMore}
                />
                <Button onClick={sendMessage} size="icon" disabled={isStreaming || !input.trim() || !canSendMore}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button variant="outline" onClick={resetSession} className="flex-1">
              <RotateCcw className="h-4 w-4 mr-2" /> Reiniciar
            </Button>
            <Button onClick={finishSession} className="flex-1" disabled={isEvaluating || messages.length < 2}>
              {isEvaluating ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Evaluando...</>
              ) : (
                <><Trophy className="h-4 w-4 mr-2" /> Finalizar y evaluar</>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolePlayPage;
