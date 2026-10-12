import type { Metadata } from "next";
import Shell from "@/components/resources/Shell";
import { HubGrid, PageIntro } from "@/components/resources/parts";
import { resources } from "@/lib/resources";

export const metadata: Metadata = {
  title: "Resources — Equal AI",
  description: resources.lede,
};

export default function ResourcesPage() {
  return (
    <Shell>
      <PageIntro title={resources.title} lede={resources.lede} />
      <HubGrid cards={resources.cards} />
    </Shell>
  );
}
