"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CreateLinkSchema } from "@/lib/validation";

interface Link {
  id: string;
  code: string;
  url: string;
  shortUrl: string;
  clicks: number;
  lastClicked: string | null;
  createdAt: string;
}

const formSchema = CreateLinkSchema;

export default function Dashboard() {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [createLoading, setCreateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
      customCode: "",
    },
  });

  // Fetch all links
  const fetchLinks = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/links");
      const result = await response.json();

      if (result.success) {
        setLinks(result.data);
      } else {
        // toast
        console.log("Failed to fetch links");
      }
    } catch (error) {
      console.log("Failed to fetch links", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  // Create new link
  const onCreateLink = async (values: z.infer<typeof formSchema>) => {
    try {
      setCreateLoading(true);
      const response = await fetch("/api/links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (result.success) {
        console.log("Fetch all links");
        form.reset();
        setOpen(false);
        fetchLinks(); // Refresh the list
      } else {
        console.log("Error");
      }
    } catch (error) {
      console.log("Error", error);
    } finally {
      setCreateLoading(false);
    }
  };

  // Delete link
  const onDeleteLink = async (code: string) => {
    try {
      setDeleteLoading(code);
      const response = await fetch(`/api/links/${code}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        console.log("fetching all link for deletion");
        fetchLinks(); // Refresh the list
      } else {
        console.log("Error fetching all link for deletion");
      }
    } catch (error) {
      console.log("Failed to delete link", error);
    } finally {
      setDeleteLoading(null);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    console.log("Link copied to clipboard");
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">TinyLink</h1>
            <p className="text-gray-600">Shorten your URLs with ease</p>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Create New Link</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create Short Link</DialogTitle>
                <DialogDescription>
                  Create a shortened URL for your long link.
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onCreateLink)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Destination URL</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://example.com/very-long-url"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custom Code (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="mycustomcode" {...field} />
                        </FormControl>
                        <FormDescription>
                          6-8 characters, letters and numbers only
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button type="submit" disabled={createLoading}>
                      {createLoading ? "Creating..." : "Create Link"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Links</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{links.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Clicks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {links.reduce((total, link) => total + link.clicks, 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Links
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {links.filter((link) => link.clicks > 0).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Links Table */}
        <Card>
          <CardHeader>
            <CardTitle>Your Links</CardTitle>
            <CardDescription>
              Manage all your shortened URLs in one place
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : links.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No links created yet</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setOpen(true)}
                >
                  Create Your First Link
                </Button>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Short Code</TableHead>
                      <TableHead>Original URL</TableHead>
                      <TableHead className="text-center">Clicks</TableHead>
                      <TableHead>Last Clicked</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {links.map((link) => (
                      <TableRow key={link.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">
                              {link.code}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(link.shortUrl)}
                            >
                              Copy
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate" title={link.url}>
                            {link.url}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-semibold">{link.clicks}</span>
                        </TableCell>
                        <TableCell>
                          {link.lastClicked
                            ? formatDate(link.lastClicked)
                            : "Never"}
                        </TableCell>
                        <TableCell>{formatDate(link.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                window.open(`/code/${link.code}`, "_blank")
                              }
                            >
                              Stats
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => onDeleteLink(link.code)}
                              disabled={deleteLoading === link.code}
                            >
                              {deleteLoading === link.code
                                ? "Deleting..."
                                : "Delete"}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
