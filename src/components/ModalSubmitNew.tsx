import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";


interface ModalSubmitNewProps {
  children: React.ReactNode;
  onSubmitSuccess?: () => void;
}

export default function ModalSubmitNew({ children, onSubmitSuccess }: ModalSubmitNewProps) {
  const [formData, setFormData] = useState({ url: "", comment: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const submission = { ...formData, submittedAt: new Date().toISOString() };

    try {
      const response = await fetch("/.netlify/functions/submit-listing", {
        method: "POST",
        body: JSON.stringify(submission),
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        setFormData({ url: "", comment: "" });
        onSubmitSuccess?.();
        alert("¡Envío exitoso!");
      } else throw new Error("Error al enviar");
    } catch (error) {
      console.error(error);
      alert("Error al enviar");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Drawer>
        <DrawerTrigger className="block md:hidden">{children}</DrawerTrigger>
        <DrawerContent className="mx-2 max-h-[90%] min-h-[70%] px-4">
          <DrawerHeader className="px-0 text-left">
            <DrawerTitle>Submit a new website</DrawerTitle>
            <DrawerDescription>Request us to list your website</DrawerDescription>
          </DrawerHeader>
          <form onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="inputUrl">Website URL</Label>
              <Input id="inputUrl" name="url" value={formData.url} onChange={handleChange} placeholder="https://example.com" required />
            </div>
            <div>
              <Label htmlFor="comment">Comment</Label>
              <Textarea id="comment" name="comment" value={formData.comment} onChange={handleChange} placeholder="Notes..." />
            </div>
            <DrawerFooter className="my-2 space-y-2 px-0">
              <DrawerClose asChild><Button size="lg" variant="secondary" disabled={isSubmitting} type="button">Cancel</Button></DrawerClose>
              <Button size="lg" type="submit" disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Submit"}</Button>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>
      <Dialog>
        <DialogTrigger className="hidden md:block">{children}</DialogTrigger>
        <DialogContent>
          <DialogHeader className="text-left">
            <DialogTitle>Submit a new website</DialogTitle>
            <DialogDescription>Request us to list your website</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="inputUrl">Website URL</Label>
              <Input id="inputUrl" name="url" value={formData.url} onChange={handleChange} placeholder="https://example.com" required />
            </div>
            <div>
              <Label htmlFor="comment">Comment</Label>
              <Textarea id="comment" name="comment" value={formData.comment} onChange={handleChange} placeholder="Notes..." />
            </div>
            <DialogFooter className="flex items-center pt-1">
              <DialogClose asChild><Button variant="secondary" disabled={isSubmitting} type="button">Cancel</Button></DialogClose>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Submit"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
