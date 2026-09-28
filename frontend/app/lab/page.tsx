import type { Metadata } from "next";
import { LabPlayground } from "./LabPlayground";

export const metadata: Metadata = {
  title: "Motion lab",
  robots: { index: false },
};

export default function LabPage() {
  return <LabPlayground />;
}
