import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle } from "lucide-react";

interface TermsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept?: () => void;
}

export function TermsModal({ open, onOpenChange, onAccept }: TermsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 flex flex-col">
        <DialogHeader className="flex-shrink-0 px-6 py-4 border-b">
          <DialogTitle>Terms of Service & Data Accuracy Disclaimer</DialogTitle>
          <DialogDescription>
            Please read and understand these terms before using PawSense
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 w-full">
          <div className="space-y-6 text-sm px-6 py-4">
            {/* Data Accuracy Warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-900 mb-1">⚠️ Important Data Accuracy Notice</h3>
                  <p className="text-yellow-800">
                    PawSense uses AI-powered analysis to interpret pet behavior. While we strive for accuracy, AI analysis may not always be 100% accurate and should NOT be considered a replacement for professional veterinary care.
                  </p>
                </div>
              </div>
            </div>

            {/* Veterinary Care Section */}
            <div>
              <h3 className="font-semibold text-foreground mb-2">1. Professional Veterinary Care Required</h3>
              <p className="text-muted-foreground mb-3">
                PawSense is a pet health monitoring tool designed to assist pet owners, not replace professional veterinary services.
              </p>
              <ul className="space-y-2 text-muted-foreground ml-4">
                <li>• <strong>Critical Situations:</strong> If your pet appears to be in distress, suffering from injuries, or showing signs of life-threatening conditions, immediately contact an emergency veterinary clinic or call emergency services.</li>
                <li>• <strong>Unusual Behaviors:</strong> Any unusual behavior detected by PawSense should be verified by a qualified veterinarian before taking action.</li>
                <li>• <strong>Medical Decisions:</strong> Never make medical decisions based solely on PawSense analysis. Always consult with a licensed veterinarian.</li>
                <li>• <strong>Prescriptions:</strong> PawSense cannot prescribe medications or treatments. All medical interventions must be approved by a veterinarian.</li>
              </ul>
            </div>

            {/* Limitations */}
            <div>
              <h3 className="font-semibold text-foreground mb-2">2. Limitations of AI Analysis</h3>
              <p className="text-muted-foreground mb-2">
                PawSense's AI analysis has the following limitations:
              </p>
              <ul className="space-y-2 text-muted-foreground ml-4">
                <li>• Analysis accuracy depends on video quality and lighting</li>
                <li>• Complex health conditions may not be detected</li>
                <li>• Analysis is based on visual interpretation, not medical diagnostics</li>
                <li>• Different pet breeds, sizes, and individual characteristics may affect accuracy</li>
              </ul>
            </div>

            {/* User Responsibility */}
            <div>
              <h3 className="font-semibold text-foreground mb-2">3. Your Responsibility as a Pet Owner</h3>
              <p className="text-muted-foreground mb-2">
                By using PawSense, you acknowledge that:
              </p>
              <ul className="space-y-2 text-muted-foreground ml-4">
                <li>• You are responsible for your pet's health and well-being</li>
                <li>• You will seek professional veterinary care when needed</li>
                <li>• You understand PawSense is supplementary, not definitive</li>
                <li>• You will not delay critical medical treatment based on PawSense analysis</li>
              </ul>
            </div>

            {/* Privacy */}
            <div>
              <h3 className="font-semibold text-foreground mb-2">4. Privacy & Data</h3>
              <p className="text-muted-foreground mb-2">
                Your pet's health data and videos uploaded to PawSense are:
              </p>
              <ul className="space-y-2 text-muted-foreground ml-4">
                <li>• Stored securely using encryption</li>
                <li>• Never shared with third parties without your consent</li>
                <li>• Used only for pet behavior analysis</li>
                <li>• Deletable at any time from your account</li>
              </ul>
            </div>

            {/* Emergency */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-900 mb-2">🚨 Emergency Contacts</h3>
              <p className="text-red-800 mb-2">
                In case of a pet emergency:
              </p>
              <ul className="space-y-1 text-red-800 ml-4">
                <li>• Contact your local emergency veterinary clinic immediately</li>
                <li>• Call your regular veterinarian's emergency line</li>
                <li>• For US: Search "24-hour emergency vet" + your city</li>
              </ul>
            </div>

            {/* Acceptance */}
            <div>
              <h3 className="font-semibold text-foreground mb-2">5. Terms Acceptance</h3>
              <p className="text-muted-foreground">
                By clicking "I Accept" and creating an account, you acknowledge that you have read, understood, and agree to these terms. You understand that PawSense is not a substitute for professional veterinary care and that you will seek appropriate medical attention for your pet when needed.
              </p>
            </div>
          </div>
        </ScrollArea>

        <div className="flex gap-3 justify-end px-6 py-4 border-t flex-shrink-0 bg-background">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Decline
          </Button>
          <Button 
            onClick={() => {
              onAccept?.();
              onOpenChange(false);
            }}
          >
            I Accept & Agree
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
