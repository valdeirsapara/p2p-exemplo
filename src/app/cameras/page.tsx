"use client";

import { useState } from "react";
import { HeaderBar } from "@/components/header-bar";
import { CreateCameraDialog } from "@/components/dialogs/create-camera-dialog";
import { CamerasTable } from "@/components/cameras/cameras-table";

export default function CamerasPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div>
      <HeaderBar title="Câmeras">
        <CreateCameraDialog onSuccess={handleSuccess} />
      </HeaderBar>
      <CamerasTable refreshKey={refreshKey} />
    </div>
  );
}

