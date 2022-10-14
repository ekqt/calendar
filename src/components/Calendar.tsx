import { useReducer, useEffect } from "react";

import dayjs from "dayjs";

// State Logic Setup

const initialValues = {
    selectedDate: dayjs().toDate(),
    firstMonth: dayjs().format("MMMM YYYY"),
    secondMonth: dayjs().add(1, "month").format("MMMM YYYY"),
};

type DispatchActionType =
    | { operation: "selectDate"; value: Date }
    | { operation: "firstMonth"; value: number }
    | { operation: "bothMonths"; value: number };

function reducer(state: typeof initialValues, action: DispatchActionType) {
    const { operation, value } = action;
    const { firstMonth, secondMonth } = state;
    switch (operation) {
        case "selectDate": {
            return {
                ...state,
                selectedDate: value,
            };
        }
        case "firstMonth": {
            return {
                ...state,
                firstMonth: dayjs(firstMonth)
                    .add(value, "month")
                    .format("MMMM YYYY"),
            };
        }
        case "bothMonths": {
            return {
                ...state,
                firstMonth: dayjs(firstMonth)
                    .add(value, "month")
                    .format("MMMM YYYY"),
                secondMonth: dayjs(secondMonth)
                    .add(value, "month")
                    .format("MMMM YYYY"),
            };
        }
    }
}

export default function Calendar({
    appointments,
    showSecondMonth,
    value,
    setValue,
}: {
    appointments?: Array<{ date: string }>;
    showSecondMonth?: boolean;
    value: Date | null;
    setValue: (n: Date) => void;
}) {
    const [{ selectedDate, firstMonth, secondMonth }, dispatch] = useReducer(
        reducer,
        initialValues
    );

    useEffect(() => {
        setValue(selectedDate);
    }, [selectedDate]);

    const firstMonthDays: Array<Date> = Array(dayjs(firstMonth).daysInMonth())
        .fill("")
        .map(
            (n, index) =>
                (n = dayjs(firstMonth)
                    .date(index + 1)
                    .toDate())
        );

    const secondMonthDays: Array<Date> = Array(dayjs(secondMonth).daysInMonth())
        .fill("")
        .map(
            (n, index) =>
                (n = dayjs(secondMonth)
                    .date(index + 1)
                    .toDate())
        );

    // Utility functions for child components

    function handleMonth(value: number): void {
        !showSecondMonth
            ? dispatch({ operation: "firstMonth", value })
            : dispatch({ operation: "bothMonths", value });
    }

    function handleDate(value: Date): void {
        dispatch({ operation: "selectDate", value });
    }

    return (
        <div aria-label="Calendar">
            <CalendarDays
                month={firstMonth}
                days={firstMonthDays}
                appointments={appointments}
                selectedDay={value ?? selectedDate}
                handleMonth={handleMonth}
                handleDate={handleDate}
            />
            {showSecondMonth && (
                <CalendarDays
                    month={secondMonth}
                    days={secondMonthDays}
                    appointments={appointments}
                    selectedDay={value ?? selectedDate}
                    handleMonth={handleMonth}
                    handleDate={handleDate}
                />
            )}
        </div>
    );
}

export function CalendarDays({
    month,
    days,
    appointments,
    selectedDay,
    handleMonth,
    handleDate,
}: {
    month: string;
    days: Array<Date>;
    appointments?: Array<{ date: string }>;
    selectedDay: Date;
    handleMonth: (n: number) => void;
    handleDate: (n: Date) => void;
}) {
    // Utility definitions/functions for `dayjs`

    const daysOfWeek: Array<string> = Array(7)
        .fill("")
        .map((n, index) => (n = dayjs().day(index).format("dd")));

    function hasAppointment(
        appointments: { date: string }[],
        day: Date
    ): boolean {
        return appointments.filter((appointment) =>
            sameDay(dayjs(appointment.date).toDate(), day)
        ).length
            ? true
            : false;
    }

    function sameDay(date1: Date, date2?: Date): boolean {
        return date2
            ? dayjs(date1).isSame(date2, "day")
            : dayjs().isSame(date1, "day");
    }

    // Utility definitions/functions for `TailwindCSS`

    const firstDayOfMonth = [
        "col-start-1",
        "col-start-2",
        "col-start-3",
        "col-start-4",
        "col-start-5",
        "col-start-6",
        "col-start-7",
    ];

    function classNames(...classes: Array<string | boolean>): string {
        return classes.filter(Boolean).join(" ");
    }

    function generateDayClasses(d1: Date, d2?: Date): string {
        return classNames(
            sameDay(d1, d2) && "bg-gray-600 text-white ",
            !sameDay(d1, d2) && sameDay(d1) && "border border-gray-500",
            (sameDay(d1, d2) || sameDay(d1)) && "font-semibold",
            !sameDay(d1, d2) && "hover:bg-gray-200",
            (dayjs(d1).day() === 0 || dayjs(d1).day() === 6) &&
                !sameDay(d1, d2) &&
                "text-gray-500",
            "mx-auto grid h-8 w-8 items-center rounded-md"
        );
    }

    return (
        <>
            {/* Navigation controls */}
            <nav
                aria-label={`${month} Navigation`}
                className="grid grid-col-7 text-gray-500 text-sm text-center"
            >
                {/* Go to previous month */}
                <button
                    onClick={() => handleMonth(-1)}
                    className="hover:text-gray-500 mx-auto"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="w-4 h-4"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 19.5L8.25 12l7.5-7.5"
                        />
                    </svg>
                </button>
                {/* Current Month */}
                <span
                    aria-label="Current Month"
                    className="tracking-[0.24rem] col-span-5 uppercase"
                >
                    {dayjs(month).format("MMMM YYYY")}
                </span>
                {/* Go to next month */}
                <button
                    onClick={() => handleMonth(+1)}
                    className="hover:text-gray-500 col-start-7 mx-auto"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="w-4 h-4"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8.25 4.5l7.5 7.5-7.5 7.5"
                        />
                    </svg>
                </button>
                {/* Weekday labels */}
                {daysOfWeek.map((day: string) => (
                    <span className="w-12 my-4" key={day.toString()}>
                        {day}
                    </span>
                ))}
            </nav>
            {/* Calendar days */}
            <div aria-label="Days" className="grid grid-cols-7">
                {days.map((day, index) => (
                    <div
                        key={day.toString()}
                        className={classNames(
                            index === 0 && firstDayOfMonth[dayjs(day).day()],
                            "p-2"
                        )}
                    >
                        <button
                            aria-label={dayjs(day).format("DD/MM/YYYY")}
                            onClick={() => handleDate(day)}
                            className={generateDayClasses(day, selectedDay)}
                        >
                            {dayjs(day).format("D")}
                        </button>
                        {/* Appointment Indicator */}
                        <div className="mx-auto mt-1 h-1 w-1">
                            {appointments &&
                                hasAppointment(appointments, day) && (
                                    <div className="h-1 w-1 rounded-full bg-gray-900" />
                                )}
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
