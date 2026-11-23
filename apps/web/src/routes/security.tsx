import { LegalLayout } from "@/components/layout/legal-layout";
import SecurityContent from "@/content/legal/security.mdx";
import { useSEO, SEO_CONFIGS } from "@/hooks/useSEO";

export default function SecurityPage() {
  useSEO(SEO_CONFIGS.security);

  return (
    <LegalLayout>
      <SecurityContent />
    </LegalLayout>
  );
}
