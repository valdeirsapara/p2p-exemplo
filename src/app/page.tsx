import { HeaderBar } from "@/components/header-bar";
import { CamerasGrid } from "@/components/home/cameras-grid";

export default function Home() {
    return (
        <div>
            <HeaderBar title="Dashboard" />
            <CamerasGrid />
        </div>
    );
}
