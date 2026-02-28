"use client";

import { useEffect, useState, useTransition } from "react";
import { getAllDemoTokens, generateNewDemoToken } from "@/actions/admin";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KeyRound, Plus, Copy, Check } from "lucide-react";

export default function DemoTokensPage() {
    const [tokens, setTokens] = useState<any[]>([]);
    const [isPending, startTransition] = useTransition();
    const [copiedId, setCopiedId] = useState<number | null>(null);

    useEffect(() => {
        loadTokens();
    }, []);

    const loadTokens = async () => {
        const allTokens = await getAllDemoTokens();
        setTokens(allTokens);
    };

    const handleCreateToken = () => {
        startTransition(async () => {
            await generateNewDemoToken();
            await loadTokens();
        });
    };

    const copyToClipboard = (id: number, text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Demo Tokens</h2>
                    <p className="text-muted-foreground text-sm">Generate temporary PRO access for prospective clients.</p>
                </div>
                <Button onClick={handleCreateToken} disabled={isPending}>
                    <Plus className="mr-2 h-4 w-4" />
                    {isPending ? "Generating..." : "Generate Token"}
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <KeyRound className="h-5 w-5 text-amber-500" />
                        Active & Inactive Tokens
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Token Code</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Expires</TableHead>
                                    <TableHead>Used By</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tokens.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                            No demo tokens generated yet. Click "Generate Token" to create one.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    tokens.map((token) => {
                                        // Turso timestamps are in seconds, so multiply by 1000
                                        const isExpired = Date.now() > token.expiresAt * 1000;

                                        return (
                                            <TableRow key={token.id}>
                                                <TableCell className="font-mono font-medium">
                                                    {token.token}
                                                </TableCell>
                                                <TableCell>
                                                    {token.isUsed ? (
                                                        <Badge variant="secondary">Used</Badge>
                                                    ) : isExpired ? (
                                                        <Badge variant="destructive">Expired</Badge>
                                                    ) : (
                                                        <Badge className="bg-green-600">Available</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {new Date(token.expiresAt * 1000).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {token.usedByEmail || "-"}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => copyToClipboard(token.id, token.token)}
                                                        disabled={token.isUsed || isExpired}
                                                    >
                                                        {copiedId === token.id ? (
                                                            <Check className="h-4 w-4 text-green-500" />
                                                        ) : (
                                                            <Copy className="h-4 w-4" />
                                                        )}
                                                        <span className="sr-only">Copy</span>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
