import { AiotHub } from "@/components/aiot-hub";
import { initialDevices, initialRules } from "@/lib/aiot";

export default function Home() {
  return <AiotHub initialDevices={initialDevices} initialRules={initialRules} />;
}
