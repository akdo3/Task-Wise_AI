
"use client";

import type { FC } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useTheme } from '@/hooks/useTheme';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsDialog: FC<SettingsDialogProps> = ({ isOpen, onClose }) => {
  const { theme, setSpecificTheme } = useTheme();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-md rounded-[var(--radius)]">
        <DialogHeader>
          <DialogTitle className="text-xl">Application Settings</DialogTitle>
          <DialogDescription>
            Manage your application preferences here.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
          <div>
            <h3 className="text-md font-semibold mb-3 text-foreground">Appearance</h3>
            <div className="space-y-3">
              <div>
                <Label className="text-sm text-muted-foreground">Theme</Label>
                <div className="flex items-center space-x-2 mt-1.5">
                  <Button
                    variant={theme === 'light' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSpecificTheme('light')}
                    className={cn("flex-1", theme === 'light' && "bg-primary text-primary-foreground hover:bg-primary/90")}
                  >
                    <Sun className="mr-2 h-4 w-4" /> Light
                  </Button>
                  <Button
                    variant={theme === 'dark' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSpecificTheme('dark')}
                     className={cn("flex-1", theme === 'dark' && "bg-primary text-primary-foreground hover:bg-primary/90")}
                  >
                    <Moon className="mr-2 h-4 w-4" /> Dark
                  </Button>
                </div>
              </div>
              {/* Placeholder for more appearance settings */}
            </div>
          </div>

          <div className="pt-4 border-t border-border">
             <p className="text-sm text-muted-foreground text-center">More settings coming soon!</p>
          </div>
        </div>

        <DialogFooter className="pt-4">
          <Button onClick={onClose} variant="outline">Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
