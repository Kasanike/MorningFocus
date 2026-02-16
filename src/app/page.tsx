import { Header } from "@/components/Header";
import { StoicQuote } from "@/components/StoicQuote";
import { ConstitutionList } from "@/components/ConstitutionList";
import { DailyAgenda } from "@/components/DailyAgenda";

export default function Home() {
  return (
    <main className="mx-auto min-h-screen max-w-2xl pb-16">
      <Header />

      <div className="mt-8 space-y-8 px-4 sm:px-8 sm:mt-10">
        <section aria-label="Stoic Oracle">
          <StoicQuote />
        </section>

        <section aria-label="Personal Constitution">
          <ConstitutionList />
        </section>

        <section aria-label="Daily Battle Plan">
          <DailyAgenda />
        </section>
      </div>
    </main>
  );
}
