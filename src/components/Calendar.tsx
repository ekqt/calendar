import { useReducer, useCallback } from "react";

import dayjs from "dayjs";

// REUSABLE UTILITY FUNCTIONS FOR `dayjs`

/** Create a date at the start of the day 00:00. */
function today() {
    return dayjs().startOf("day").toDate();
}
/** Create an array of Dates for a given month */
function createMonth(month = today()) {
    return Array.from(
        { length: dayjs(month).daysInMonth() },
        (n, i) =>
            (n = dayjs(month)
                .date(i + 1)
                .toDate())
    );
}

/** Compare two dates with each other or one against today's date. */
function sameDay(date1: Date, date2?: Date): boolean {
    return date2
        ? dayjs(date1).isSame(date2, "day")
        : dayjs().isSame(date1, "day");
}

// REDUCER SETUP FOR STATE LOGIC

const initialValues = {
    selectedDate: today(),
    currentMonth: today(),
};

type ReducerActionType =
    | { type: "SELECT_DATE"; value: Date }
    | { type: "UPDATE_MONTH"; value: Date };

/** Manages state for selected date and current month  */
function reducer(state: typeof initialValues, action: ReducerActionType) {
    const { type, value } = action;
    switch (type) {
        case "SELECT_DATE": {
            return {
                ...state,
                selectedDate: value,
            };
        }
        case "UPDATE_MONTH": {
            return {
                ...state,
                currentMonth: value,
            };
        }
    }
}

type HandleDispatchType =
    | { type: "SELECT_DATE"; value: Date }
    | { type: "UPDATE_MONTH"; value: number };

export default function CalendarContainer({
    appointments,
    value,
    setValue,
}: {
    appointments?: Array<{ date: string }>;
    value: Date | null;
    setValue: (n: Date) => void;
}) {
    const [{ selectedDate, currentMonth }, dispatch] = useReducer(
        reducer,
        initialValues
    );

    const currentMonthDates: Array<Date> = createMonth(currentMonth);

    /** Cached function to update component's state at load */
    const calRef = useCallback(() => {
        !value && setValue(selectedDate);
    }, []);

    /** Performs calculations and dispatches reducer actions to update state */
    function handleDispatch(action: HandleDispatchType): void {
        const { type, value } = action;
        switch (type) {
            case "SELECT_DATE": {
                dispatch({ type, value });
                setValue(value);
                break;
            }
            case "UPDATE_MONTH": {
                const updatedMonth = dayjs(currentMonth)
                    .add(value, "month")
                    .toDate();
                dispatch({ type, value: updatedMonth });
                break;
            }
        }
    }

    return (
        <div aria-label="Calendar" ref={calRef}>
            <CalendarComponent
                selectedDate={selectedDate}
                month={currentMonth}
                dates={currentMonthDates}
                appointments={appointments}
                dispatch={handleDispatch}
            />
        </div>
    );
}

export function CalendarComponent({
    selectedDate,
    month,
    dates,
    appointments,
    dispatch,
}: {
    selectedDate: Date;
    month: Date;
    dates: Array<Date>;
    appointments?: Array<{ date: string }>;
    dispatch: (action: HandleDispatchType) => void;
}) {
    // UTILITY DEFINITIONS/FUNCTIONS FOR `dayjs`

    /** Generates an array of labels -> [`Mo`, `Tu`, `We`, `...rest`]*/
    const daysOfWeek: Array<string> = Array.from(
        { length: 7 },
        (n, i) => (n = dayjs().day(i).format("dd"))
    );

    /** Checks for appointments to conditionally display indicators */
    function hasAppointment(
        appointments: { date: string }[],
        date: Date
    ): boolean {
        return appointments.filter((appointment) =>
            sameDay(dayjs(appointment.date).toDate(), date)
        ).length
            ? true
            : false;
    }

    // UTILITY DEFINITIONS/FUNCTIONS FOR 'TAILWINDCSS'

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

    function createClass(d1: Date, d2?: Date): string {
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
                    onClick={() =>
                        dispatch({ type: "UPDATE_MONTH", value: -1 })
                    }
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
                    onClick={() =>
                        dispatch({ type: "UPDATE_MONTH", value: +1 })
                    }
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
            {/* Calendar dates */}
            <div aria-label="Dates" className="grid grid-cols-7">
                {dates.map((date, index) => (
                    <div
                        key={date.toString()}
                        className={classNames(
                            index === 0 && firstDayOfMonth[dayjs(date).day()],
                            "p-2"
                        )}
                    >
                        <button
                            aria-label={dayjs(date).format("DD/MM/YYYY")}
                            onClick={() =>
                                dispatch({ type: "SELECT_DATE", value: date })
                            }
                            className={createClass(date, selectedDate)}
                        >
                            {dayjs(date).format("D")}
                        </button>
                        {/* Appointment Indicator */}
                        <div className="mx-auto mt-1 h-1 w-1">
                            {appointments &&
                                hasAppointment(appointments, date) && (
                                    <div className="h-1 w-1 rounded-full bg-gray-900" />
                                )}
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
