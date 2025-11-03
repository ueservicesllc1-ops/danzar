export default function TicketLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Ocultar Navbar y Footer en móvil para pantalla completa */}
      <style jsx global>{`
        @media (max-width: 768px) {
          nav,
          header,
          footer {
            display: none !important;
          }
          main {
            padding-top: 0 !important;
          }
        }
      `}</style>
      {children}
    </>
  );
}
