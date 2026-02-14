"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Copy, Check } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface ConversationOpenersCardProps {
  openers: string[];
}

export function ConversationOpenersCard({
  openers,
}: ConversationOpenersCardProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="backdrop-blur-xl shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-chart-2" />
            <span>Conversation Starters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {openers.map((opener, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                onClick={() => copyToClipboard(opener, i)}
                className="bg-muted rounded-xl p-4 cursor-pointer group relative overflow-hidden hover:bg-accent transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <p className="text-foreground flex-1">{opener}</p>
                  <button className="shrink-0">
                    {copiedIndex === i ? (
                      <Check className="w-5 h-5 text-chart-1" />
                    ) : (
                      <Copy className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
