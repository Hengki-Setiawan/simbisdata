"use client";

import { useEffect, useState, useTransition } from "react";
import { getAllUsers, toggleUserStatus, changeUserTier } from "@/actions/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function UsersManagementPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setIsLoading(true);
            const allUsers = await getAllUsers();
            setUsers(allUsers);
        } catch (error) {
            console.error("Failed to load users:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleActive = (userId: number, currentStatus: boolean) => {
        startTransition(async () => {
            const res = await toggleUserStatus(userId, currentStatus);
            if (res.success) await loadUsers();
        });
    };

    const handleChangeTier = (userId: number, newTier: string) => {
        startTransition(async () => {
            const res = await changeUserTier(userId, newTier);
            if (res.success) await loadUsers();
            else alert(res.error || "Gagal mengubah tier.");
        });
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>All Users</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search email or name..."
                                className="pl-8"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Plan Tier</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Sub Expires</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center">
                                                No users found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredUsers.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell>
                                                    <div className="font-medium">{user.name}</div>
                                                    <div className="text-xs text-muted-foreground">{user.email}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                                                        {user.role}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="capitalize font-medium">
                                                    <span className={user.planId === "enterprise" ? "text-purple-600" : user.planId === "pro" ? "text-blue-600" : ""}>
                                                        {user.planId}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={user.isActive ? "outline" : "destructive"}>
                                                        {user.isActive ? "Active" : "Disabled"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {user.sub ? new Date(user.sub.endDate * 1000).toLocaleDateString() : "No active sub"}
                                                </TableCell>
                                                <TableCell className="text-right space-x-2">
                                                    <select
                                                        className="border rounded px-2 py-1 text-sm bg-background mr-2 cursor-pointer focus:ring-2 focus:ring-primary outline-none"
                                                        value={user.planId || "free"}
                                                        onChange={(e) => handleChangeTier(user.id, e.target.value)}
                                                        disabled={isPending}
                                                    >
                                                        <option value="free">Free</option>
                                                        <option value="starter">Starter</option>
                                                        <option value="pro">Pro</option>
                                                        <option value="enterprise">Enterprise</option>
                                                    </select>
                                                    {user.role !== "admin" && (
                                                        <Button
                                                            variant={user.isActive ? "destructive" : "default"}
                                                            size="sm"
                                                            onClick={() => handleToggleActive(user.id, user.isActive)}
                                                            disabled={isPending}
                                                        >
                                                            {user.isActive ? "Deactivate" : "Activate"}
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
