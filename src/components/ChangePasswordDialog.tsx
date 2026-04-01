import { useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound } from "lucide-react";

export function ChangePasswordDialog() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (password.length < 8) { toast.error(t("changePassword.minLength")); return; }
    if (password !== confirm) { toast.error(t("changePassword.mismatch")); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) toast.error("Error: " + error.message);
    else { toast.success(t("changePassword.success")); setOpen(false); setPassword(""); setConfirm(""); }
  };

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)} className="gap-2">
        <KeyRound className="h-4 w-4" />
        <span className="hidden sm:inline">{t("changePassword.button")}</span>
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{t("changePassword.title")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("changePassword.newPassword")}</Label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={t("changePassword.newPasswordPlaceholder")} />
            </div>
            <div className="space-y-2">
              <Label>{t("changePassword.confirmPassword")}</Label>
              <Input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder={t("changePassword.confirmPlaceholder")} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>{t("changePassword.cancel")}</Button>
            <Button onClick={handleSubmit} disabled={loading}>{loading ? t("changePassword.saving") : t("changePassword.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
