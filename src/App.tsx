import Calendar from "./components/Calendar";
import { useState } from "react";

const appointments: { date: string }[] = [
    {
        date: "2022-10-16T12:00:00.000Z",
    },
    {
        date: "2022-10-22T12:00:00.000Z",
    },
    {
        date: "2022-10-26T12:00:00.000Z",
    },
];

function App() {
    const [value, setValue] = useState<Date | null>(null);
    return (
        <main className="grid gap-8 py-16">
            <header className="text-center">
                <h1 className="font-bold text-4xl mb-2">Calendar Demo</h1>
                <code className="text-sm">{value?.toString()}</code>
            </header>
            <div className="mx-auto">
                <Calendar
                    appointments={appointments}
                    value={value}
                    setValue={setValue}
                />
            </div>
        </main>
    );
}

export default App;
