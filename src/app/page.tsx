import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Apps from "@/components/Apps";
import Notes from "@/components/Notes";
import Profile from "@/components/Profile";
import Activity from "@/components/Activity";
import Work from "@/components/Work";
//　import AdsPlaceholder from "@/components/AdsPlaceholder";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <Apps />
        <Notes />
        <Profile />
        <Activity />
        <Work />
        {/* <AdsPlaceholder /> */}
      </main>
      <Footer />
    </>
  );
}
