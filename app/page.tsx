import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function WelcomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="flex flex-col items-center justify-center flex-1 w-full">
        <div className="flex items-center mb-8">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center mr-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white"
            >
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Shoppe</h1>
        </div>
        <Image
          src="/placeholder.svg?height=300&width=300"
          alt="Welcome illustration"
          width={300}
          height={300}
          className="mb-12"
        />
        <div className="w-full space-y-4">
          <Link href="/login" className="w-full">
            <Button className="w-full bg-primary hover:bg-primary/90 text-white rounded-full py-6">Login</Button>
          </Link>
          <Link href="/create-account" className="w-full">
            <Button
              variant="outline"
              className="w-full border-primary text-primary hover:bg-primary/5 rounded-full py-6"
            >
              Create Account
            </Button>
          </Link>
        </div>
      </div>
      <div className="mt-8 text-center text-sm text-muted-foreground">
        By continuing, you agree to our{" "}
        <Link href="#" className="text-primary underline">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="#" className="text-primary underline">
          Privacy Policy
        </Link>
      </div>
    </div>
  )
}

