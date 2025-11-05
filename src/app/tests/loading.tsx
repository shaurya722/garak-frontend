import { Suspense } from "react";
import { PageLoader } from "@/components/shared";

export default function Loading() {
  return (
    <Suspense fallback={<PageLoader message="Loading..." />}>
      <div>Content</div>
    </Suspense>
  );
}
