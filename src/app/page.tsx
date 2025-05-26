import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-background text-foreground">
      <main className="flex flex-col items-center gap-8 max-w-4xl w-full">
        <h1 className="text-4xl font-bold text-center">
          Next.js + Tailwind + shadcn/ui Template
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <Card>
            <CardHeader>
              <CardTitle>Tailwind CSS</CardTitle>
              <CardDescription>Utility-first CSS framework</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Rapidly build modern websites without ever leaving your HTML.</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Learn More
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>shadcn/ui</CardTitle>
              <CardDescription>Beautifully designed components</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Accessible and customizable components that you can copy and paste into your apps.</p>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Explore Components</Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="flex gap-4 mt-8">
          <Button variant="default">Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="outline">Outline Button</Button>
          <Button variant="ghost">Ghost Button</Button>
        </div>
      </main>
      
      <footer className="mt-16 text-center text-sm text-muted-foreground">
        <p>Your App Template - {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
