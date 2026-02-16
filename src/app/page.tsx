import { Header } from "@/components/Header";
import { StoicQuote } from "@/components/StoicQuote";
import { ConstitutionList } from "@/components/ConstitutionList";
import { OneThing } from "@/components/OneThing";
import { MorningProtocol } from "@/components/MorningProtocol";

export default function Home() {
  return (
    <main className="mx-auto min-h-screen max-w-2xl pb-16">
      <Header />

      <div className="animate-fade-in mt-8 space-y-8 px-4 sm:px-8 sm:mt-10">
        <section aria-label="Quote from Stoics">
          <StoicQuote />
        </section>

        <section aria-label="Morning Protocol">
          <MorningProtocol />
        </section>

        <section aria-label="Personal Constitution">
          <ConstitutionList />
        </section>

        <section aria-label="One Thing - Priority of the day">
          <OneThing />
        </section>
      </div>
    </main>
  );
}
