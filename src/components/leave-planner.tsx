
'use client';

import { Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

export function LeavePlanner() {
    const { theme } = useTheme();
    const isLightTheme = theme === 'light';

    return (
        <div className={cn("rounded-xl", isLightTheme ? 'bg-white shadow' : 'glass-card' )}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calendar className="text-primary"/> Leave Planner
                </CardTitle>
                <CardDescription>
                    Plan your future leaves and see their impact on your attendance. (Coming Soon)
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-center py-8 bg-secondary/30 rounded-lg">
                    <p className="font-bold text-muted-foreground">This feature is under construction.</p>
                </div>
            </CardContent>
        </div>
    )
}
