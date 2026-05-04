import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Apps from "@/components/Apps";
import Notes from "@/components/Notes";
import Profile from "@/components/Profile";
import Activity from "@/components/Activity";
import Work from "@/components/Work";
//　import AdsPlaceholder from "@/components/AdsPlaceholder";
import Footer from "@/components/Footer";
import { RikiyaOnly } from "@/components/SideVisibility";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <RikiyaOnly>
          <Apps />
          <Notes />
        </RikiyaOnly>
        <Profile />
        <Activity />
        <Work />
        {/* <AdsPlaceholder /> */}
      </main>
      <Footer />
    </>
  );
}
