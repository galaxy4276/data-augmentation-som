import { Suspense } from "react";
import DatasetsPageContent from "./datasets-page-content";

export default function DatasetsPage() {
  return (
    <Suspense fallback={<div>Loading datasets...</div>}>
      <DatasetsPageContent />
    </Suspense>
  );
}
