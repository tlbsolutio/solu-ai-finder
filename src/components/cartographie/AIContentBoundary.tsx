import React from "react";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface AIContentBoundaryProps {
  children: React.ReactNode;
  label?: string;
}

interface State {
  hasError: boolean;
}

export class AIContentBoundary extends React.Component<AIContentBoundaryProps, State> {
  constructor(props: AIContentBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error(`AIContentBoundary [${this.props.label || "unknown"}]:`, error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="border-dashed border-orange-300">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0" />
            <p className="text-sm text-muted-foreground">
              Erreur d'affichage{this.props.label ? ` (${this.props.label})` : ""}. Les donnees existent mais n'ont pas pu etre rendues.
            </p>
          </CardContent>
        </Card>
      );
    }
    return this.props.children;
  }
}
