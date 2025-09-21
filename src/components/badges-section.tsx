'use client';

import { Badge as BadgeType } from "@/types";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Award } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

export function BadgesSection({ badges }: { badges: BadgeType[] }) {
    if (badges.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">Badges</h2>
            <Card className="glass-card">
                <CardContent className="p-4">
                    <TooltipProvider>
                        <div className="flex flex-wrap gap-4 justify-center">
                            {badges.map((badge, index) => (
                                <Tooltip key={badge.id}>
                                    <TooltipTrigger asChild>
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="flex flex-col items-center gap-2"
                                        >
                                            <div className="p-3 bg-primary/10 rounded-full border-2 border-primary/50">
                                                <badge.icon className="w-8 h-8 text-primary" />
                                            </div>
                                        </motion.div>
                                    </TooltipTrigger>
                                    <TooltipContent className="glass-card">
                                        <p className="font-bold text-base">{badge.name}</p>
                                        <p className="text-sm text-muted-foreground">{badge.description}</p>
                                    </TooltipContent>
                                </Tooltip>
                            ))}
                        </div>
                    </TooltipProvider>
                </CardContent>
            </Card>
        </div>
    );
}
