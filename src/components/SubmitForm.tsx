import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import tags from "@/data/tags.json";
import payoutMethods from "@/data/payoutMethod.json";
import countries from "@/data/countries.json";

interface SubmitFormProps {
  onSubmitSuccess?: () => void;
  onCancel?: () => void;
  containerType?: "drawer" | "dialog";
}

const formSchema = z.object({
  title: z.string().min(1, "El título es obligatorio").max(100, "Máximo 100 caracteres"),
  description: z.string().min(1, "La descripción es obligatoria").max(298, "Máximo 298 caracteres"),
  contact: z.string().min(1, "La forma de contacto es obligatoria").max(100, "Máximo 100 caracteres"),
  website: z.string().regex(/^https?:\/\/[^\s$.?#].[^\s]*$/, "Debe ser una URL válida").optional(),
  province: z.string().min(1, "La provincia es obligatoria"),
  paymentMethods: z.array(z.string()).min(1, "Debe seleccionar al menos un método de pago"),
  categories: z.array(z.string()).min(1, "Debe seleccionar al menos una categoría"),
});

export default function SubmitForm({ onSubmitSuccess, onCancel, containerType = "dialog" }: SubmitFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      contact: "",
      website: "",
      province: "",
      paymentMethods: [],
      categories: [],
    },
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    const submission = { ...data, submittedAt: new Date().toISOString() };

    try {
      const response = await fetch("/.netlify/functions/submit-listings", {
        method: "POST",
        body: JSON.stringify(submission),
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        onSubmitSuccess?.();
        alert("¡Envío exitoso!");
      } else {
        throw new Error("Error al enviar");
      }
    } catch (error) {
      console.error(error);
      alert("Error al enviar");
    } finally {
      setIsSubmitting(false);
    }
  };

  const buttonClass = containerType === "drawer" ? "w-full" : "";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Título */}
        <FormField
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Título del anuncio" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Descripción */}
        <FormField
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea placeholder="Descripción del anuncio" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Grid container for form fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Forma de contacto */}
          <FormField
            name="contact"
            render={({ field }) => (
              <FormItem>
          <FormLabel>Forma de contacto</FormLabel>
          <FormControl>
            <Input placeholder="Correo o teléfono" {...field} />
          </FormControl>
          <FormMessage />
              </FormItem>
            )}
          />

          {/* Sitio web */}
          <FormField
            name="website"
            render={({ field }) => (
              <FormItem>
          <FormLabel>Sitio web (opcional)</FormLabel>
          <FormControl>
            <Input placeholder="https://example.com" {...field} />
          </FormControl>
          <FormMessage />
              </FormItem>
            )}
          />

          {/* Provincia */}
          <FormField
            name="province"
            render={({ field }) => (
              <FormItem>
          <FormLabel>Provincia</FormLabel>
          <FormControl>
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una provincia" />
              </SelectTrigger>
              <SelectContent>
                {countries.flatMap((country) => country.provinces).map((province) => (
            <SelectItem key={province} value={province}>
              {province}
            </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
              </FormItem>
            )}
          />
        </div>


        {/* Métodos de pago */}
        <FormField
          name="paymentMethods"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Métodos de pago</FormLabel>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {payoutMethods.map((method) => (
                  <FormItem
                    key={method}
                    className="flex flex-row items-start space-x-3 space-y-0"
                  >
                    <FormControl>
                      <Checkbox
                        checked={field.value?.includes(method)}
                        onCheckedChange={(checked) => {
                          return checked
                            ? field.onChange([...field.value, method])
                            : field.onChange(
                                field.value?.filter((value: string) => value !== method)
                              );
                        }}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">{method}</FormLabel>
                  </FormItem>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Categorías */}
        <FormField
          name="categories"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categorías</FormLabel>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tags.map((tag) => (
            <FormItem
              key={tag}
              className="flex flex-row items-start space-x-3 space-y-0"
            >
              <FormControl>
                <Checkbox
            checked={field.value?.includes(tag)}
            onCheckedChange={(checked) => {
              return checked
                ? field.onChange([...field.value, tag])
                : field.onChange(
              field.value?.filter((value: string) => value !== tag)
                  );
            }}
                />
              </FormControl>
              <FormLabel className="font-normal">{tag}</FormLabel>
            </FormItem>
          ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Botones */}
        <div className="flex gap-2 flex-col sm:flex-row justify-end">
          {onCancel && (
            <Button
              type="button"
              variant="secondary"
              disabled={isSubmitting}
              onClick={onCancel}
              className={buttonClass}
            >
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting} className={buttonClass}>
            {isSubmitting ? "Enviando..." : "Enviar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}