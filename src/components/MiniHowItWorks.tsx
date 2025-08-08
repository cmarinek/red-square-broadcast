import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadCloud, QrCode, MapPin, Monitor, ShieldCheck, Clock, CreditCard } from "lucide-react";
import heroImage from "@/assets/hero-redsquare.jpg";
export const MiniHowItWorks = () => {
  return (
<section className="bg-muted/30 border-y border-border">
          <div className="container py-16 md:py-24">
            <Tabs defaultValue="broadcasters" className="w-full">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <h2 className="text-2xl md:text-3xl font-bold">Made for two sides</h2>
                <TabsList>
                  <TabsTrigger value="broadcasters">Broadcasters</TabsTrigger>
                  <TabsTrigger value="owners">Owners</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="broadcasters" className="mt-6 outline-none">
                <div className="grid gap-6 md:grid-cols-3">
                  <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><MapPin /> Choose screen</CardTitle></CardHeader>
                    <CardContent className="text-muted-foreground">Search by proximity, scan QR, or enter ID to target an exact screen.</CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Clock /> Pick a time</CardTitle></CardHeader>
                    <CardContent className="text-muted-foreground">Reserve a minute or more. See live availability like a calendar.</CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><UploadCloud /> Upload & confirm</CardTitle></CardHeader>
                    <CardContent className="text-muted-foreground">Upload your media, confirm, and you’re set. We handle delivery.</CardContent>
                  </Card>
                </div>
              </TabsContent>
              <TabsContent value="owners" className="mt-6 outline-none">
                <div className="grid gap-6 md:grid-cols-3">
                  <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Monitor /> Register screen</CardTitle></CardHeader>
                    <CardContent className="text-muted-foreground">Plug in the Red Square dongle or app, then register to get a unique ID.</CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck /> Set rules</CardTitle></CardHeader>
                    <CardContent className="text-muted-foreground">Define allowed formats, content rules, and optional pricing per slot.</CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><CreditCard /> Earn automatically</CardTitle></CardHeader>
                    <CardContent className="text-muted-foreground">We route payouts and surface ratings. Fill gaps with your own content.</CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
            );
};
