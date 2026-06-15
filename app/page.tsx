"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import WhatWeDo from "@/components/WhatWeDo";
import HowWeWork from "@/components/HowWeWork";
import StopDoing from "@/components/StopDoing";
import ClosingBlock from "@/components/ClosingBlock";
import BookModal from "@/components/BookModal";
import CustomCursor from "@/components/CustomCursor";

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);
  const onBook = () => setModalOpen(true);

  return (
    <>
      <CustomCursor hidden={modalOpen} />
      <Header onBook={onBook} />
      <main>
        <Hero onBook={onBook} />
        <WhatWeDo />
        <HowWeWork />
        <StopDoing />
        <ClosingBlock onBook={onBook} />
      </main>
      <BookModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
