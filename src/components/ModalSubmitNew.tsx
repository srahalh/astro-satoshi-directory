import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import SubmitForm from "./SubmitForm";

interface ModalSubmitNewProps {
  children: React.ReactNode;
}

export default function ModalSubmitNew({ children }: ModalSubmitNewProps) {
  const title = "Crea una nueva entrada";
  const description = "Rellena los campos para crear una nueva entrada";
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSubmitSuccess = () => {
    setIsDrawerOpen(false);
    setIsDialogOpen(false);
  };

  return (
    <>
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerTrigger className="block md:hidden">{children}</DrawerTrigger>
        <DrawerContent className="mx-2 max-h-[90%] min-h-[70%] px-4">
          <DrawerHeader className="px-0 text-left">
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </DrawerHeader>
          <SubmitForm
            onSubmitSuccess={handleSubmitSuccess}
            onCancel={() => setIsDrawerOpen(false)}
          />
          <DrawerFooter className="hidden" />
        </DrawerContent>
      </Drawer>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger className="hidden md:block">{children}</DialogTrigger>
        <DialogContent>
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </DialogHeader>
          <SubmitForm
            onSubmitSuccess={handleSubmitSuccess}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}