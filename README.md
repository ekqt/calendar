# Local Setup + Development

```
# Using degit <- https://github.com/Rich-Harris/degit

$ npx degit https://github.com/ekqt/calendar calendar
$ cd calendar

$ npm i
$ npm run dev
```

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/ekqt/calendar?file=src/components/Calendar.tsx&title=Calendar%20Component)

# Build a Tiny Calendar without Flex or useState

Is it possible to build a fully functional calendar component under 7 kB without using CSS Flex or `useState`? Let's explore that possibility by using Day.js with CSS Grid, TailwindCSS, React and TypeScript. Here's what each of these are bringing to the table today:

-   **Day.js** — a [tiny and fast 2kB alternative API](https://day.js.org/en/) to parse, manipulate and display dates on the web (`date-fns` is [9.5 times larger](https://bundlephobia.com/package/dayjs@1.11.5)).
-   **TailwindCSS** — skip CSS Flex by learning the fundamentals of [CSS Grid](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Grids) the smart way using [Tailwind's Grid ](https://tailwindcss.com/docs/display#grid)utility classes.
-   **React** — extract state logic into reducers by exploring [useReducer](https://beta.reactjs.org/apis/react/useReducer) and skipping additional re-renders using [useCallback](https://beta.reactjs.org/apis/react/useCallback)
-   **TypeScript** — work smarter and faster by taking advantage of TypeScript's autocompletion and IntelliSense.

There's a lot of ground to cover, so please go through this guide along with the finished component: [Calendar GH Repo](https://github.com/ekqt/calendar) | [Open 'Calendar' in StackBlitz](https://stackblitz.com/github/ekqt/calendar?file=src/components/Calendar.tsx&title=Calendar%20Component).

## Getting started with Day.js

Regardless of the library of choice (if any), here's what we need: (a) current date, (b) current month, and (c) dates for the entire month. Let's take a look how Day.js helps us to get started in defining those initial values:

```typescript showLineNumbers
// USING THE LIBRARY `dayjs`
// dayjs().toDate()      -> Timestamp of today's date / typeof Date
// dayjs().daysinMonth() -> Days in today's month / typeof number

// REUSABLE UTILITY FUNCTIONS FOR `dayjs`
/** Create a date at the start of the day 00:00. */
function today() {
    return dayjs().startOf("day").toDate();
}

/** Create an array of Dates for a given month */
function createMonth(month = today()) {
    return new Array(dayjs(month).daysInMonth()).fill("").map(
        (n, index) =>
            (n = dayjs(month)
                .date(index + 1)
                .toDate())
    );
}
```

These functions will help us clearly define initial values for our calendar with very little code. Once we have these values defined, we are ready to build our first Calendar grid to display each of those dates. The initial values are kept separately for our reducer function to use when we introduce our state logic into our component.

```typescript showLineNumbers
const initialValues = {
    selectedDate: today(),
    currentMonth: today(),
};

export default function Calendar() {
    const { selectedDate, currentMonth } = initialValues;
    const currentMonthDates = createMonth(currentMonth);
    return (
        <div>
            {currentMonthDates.map((date) => (
                <div key={date.toString()}>{dat.toString()}</div>
            ))}
        </div>
    );
}
```

## Building our Calendar using CSS Grid and TailwindCSS

Using TailwindCSS we can apply and define our Grid property by using the utility class `grid grid-cols-7`, then we can map over our array of dates and create a button for each of them for our users to interact with. By applying the CSS property `grid-template-columns: repeat(7, minmax(0, 1fr));` using `grid-cols-7`, we are explicitly defining the columns and allocation of our columns for all the rows of content to follow.

We also have an array named `firstDayOfMonth` that contains more Tailwind utility classes. We used this array to define a given utility class for our first item (set conditionally using `index === 0) and start the calendar on the correct day of the week (i.e. Monday, Tuesday, etc.).

For any given date (i.e. 1st of October 2022), Day.js can tell us which day of the week that date falls in. For example, the 1st of October 2022 falls on a Saturday, so it's the 7th day of the week (based on a Sunday to Saturday calendar week), calling `dayjs(date).day()` will return 7 accessing the right utility class to display our calendar.

```javascript showLineNumbers
export default function Calendar() {
    // ...
    const firstDayOfMonth = [
        "col-start-1",
        "col-start-2",
        "col-start-3",
        "col-start-4",
        "col-start-5",
        "col-start-6",
        "col-start-7",
    ];
    return (
        <div className="grid grid-cols-7">
            {currentMonthDates.map((date, index) => (
                <div
                    className={
                        index === 0 ? firstDayOfMonth[dayjs(date).day()] : ""
                    }
                    key={date.toString()}
                >
                    <button>{dayjs(date).format("D")}</button>
                </div>
            ))}
        </div>
    );
}
```

## Using Reducers to Manage State

Now we need to think how to further reduce complexity, keeping all of our calendar logic in a single easy-to-access place using **reducers**.

> Components with many state updates spread across many event handlers can get overwhelming. For these cases, you can consolidate all the state update logic outside your component in a single function, called a _reducer_.

Reducers are a great way to cut down on code when many event handlers modify state in a similar or related way (i.e. when updating month, we also need to update the days of the month). It also helps you cleanly separate your state logic and improve readability to easily understand _what happened_ on each update.

We need to (1) write a **reducer function** (which will process all of our actions), (2) **use the reducer** (function and initial values) in our component, and (3) set **dispatch actions** to update our component

```typescript showLineNumbers
// REDUCER FUNCTION OUTSIDE COMPONENT
/** Manages state for selected date and current month  */
function reducer(state, action) {
    switch (action.type) {
        case "SELECT_DATE": {
            return {
                ...state,
                selectedDate: action.value,
            };
        }
        case "UPDATE_MONTH": {
            return {
                ...state,
                currentMonth: action.value,
            };
        }
    }
}

// USING OUR REDUCER IN COMPONENT
export default function Calendar() {
    const [ state, dispatch ] = useReducer(reducer, initialValues);
    // ...
    return (
        // ...
    );
}

// DISPATCHING AN ACTION WITHIN COMPONENT
/** Performs calculations and dispatches reducer actions to update state */
function handleDispatch(action) {
    const { type, value } = action;
    switch (type) {
        case "SELECT_DATE": {
            dispatch({ type, value });
            // TODO: Return component's value
            // setValue: value;
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
```

## Avoiding Additional Renders

> When you optimize rending performance, you will sometimes need to cache the functions that you pass to child components.

Once our calendar is looking good and behaving the way we want it to, we need to figure out a way for our Calendar to return a Date value for our application. To avoid re-rendering our component, we can use a combination of the `ref` property and React's `useCallback`.

React uses `ref` as a reserved property on built-in primitives, where it stores DOM nodes once a component is rendered/mounted. However, the `ref`'s type declaration `type Ref<T> = RefCallback<T> | RefObject<T> | null` not only allows a `ref` object into it, but also a callback function. This allows us to cache a function definition (using both `ref` and `useCallback`) without having to use `useEffect`. Let's implement a callback ref for our calendar component:

```typescript showLineNumbers
export default function Calendar({ value, setValue }) {
    /** Cached function to update component's state at load */
    const callbackRef = useCallback(() => {
        setValue(selectedDate);
    }, []);
    /** Performs calculations and dispatches reducer actions to update state */
    function handleDispatch(action) {
        const { type, value } = action;
        switch (type) {
            case "SELECT_DATE": {
                dispatch({ type, value });
                setValue(value);
                break;
            }
            // ...
        }
    }
    // ...
    return <div ref={callbackRef}>// ...</div>;
}
```

> `useCallback` will return a memoized version of the callback that only changes if one of the `inputs` has changed.

For a more detailed explanation, Tk's post has a more detailed explanation of this structure: [Avoiding useEffect with Callback refs](https://tkdodo.eu/blog/avoiding-use-effect-with-callback-refs).

## Nice things to add

After setting up our data, styling our calendar, and managing its state, here are a couple of nice things that we added to our component:

-   Refactor the component into a "container/presentational" pattern. Use the "container" component to work with the data/state and then pass the data as props to the "presentational" component to display its UI.
-   Use an array and map it to create labels for the days of the week: `dayjs().day(index).format("dd")`.
-   Add a function to generate dynamic TailwindCSS classes using the native Boolean function: `function classNames(...classes) { return classes.filter(Boolean).join(" ")}`.
-   Use focusable elements `<button />` and descriptive labels `aria-label` to make sure your component is accessible.

Feel free to explore this example using the resources below:

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/ekqt/calendar?file=src/components/Calendar.tsx&title=Calendar%20Component)
