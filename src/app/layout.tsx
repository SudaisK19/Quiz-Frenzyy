import Header from "@/components/Header" // ✅ Ensure default import
import Footer from "@/components/Footer";  // ✅ Ensure default import

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main style={{ padding: "20px", minHeight: "80vh" }}>
          {children} {/* The page content will be injected here */}
        </main>
        <Footer />
      </body>
    </html>
  );
}
