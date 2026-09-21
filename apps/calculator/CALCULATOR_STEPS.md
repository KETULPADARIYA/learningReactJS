# Calculator project: step-by-step learning guide

This guide describes the order in which to build the calculator. The examples are intentionally small and incomplete. Use them to understand the shape of the solution, then write the final implementation yourself.

The project currently has a React, TypeScript, Vite, and Tailwind foundation. Zod is installed. The visual shell exists, but the reusable button, calculation engine, state transitions, and tests still need to be completed.

## Step 1: define the MVP behavior

### Goal

Decide exactly what the first version of the calculator must do before writing more UI or logic.

For this project, the MVP supports:

- digits from 0 to 9
- decimal values
- addition, subtraction, multiplication, and division
- clear
- change sign
- equals
- optional delete/backspace

### Why this step matters

The calculator can be implemented in different ways. If the behavior is not decided first, the state model will keep changing while you code.

Start with immediate calculation:

1. Enter the first number.
2. Select an operator.
3. Enter the second number.
4. Press equals.

Expression parsing and mathematical precedence can be added later. They are a different feature because `2 + 3 * 4` requires an expression model rather than one pending operator.

### How we are doing it

Write a short behavior checklist before implementation. For example:

| User action | Expected result |
|---|---|
| Press a digit | Add it to the current input |
| Press decimal | Add one decimal point at most |
| Press operator | Store the current number and operator |
| Press equals | Calculate the stored value and current input |
| Press clear | Return to the initial state |
| Divide by zero | Show a controlled error |

### Terms

- **MVP**: the smallest useful version of a product.
- **Behavior specification**: written rules for how the application responds.
- **Edge case**: unusual input, such as pressing equals before entering a second number.
- **Operator precedence**: the rule that decides which operation happens first.

### Done when

You can describe what every key should do without discussing React code yet.

---

## Step 2: repair the project foundation

### Goal

Make the project compile and make the reusable button component structurally correct before adding calculator behavior.

### Why this step matters

The current project cannot pass its build because [calculatorButton.tsx](src/components/calculatorButton.tsx) contains an unfinished declaration. It also imports a module that does not exist. Adding more features before fixing this will make later errors harder to understand.

### How we are doing it

Work through these changes in order:

1. Remove or finish the incomplete declaration inside the button component.
2. Point the button variant import at the type definition that actually exists, or create one clearly named type file.
3. Rename schema and type values so their roles are obvious.
4. Give the click callback a specific function shape instead of the broad `Function` type.
5. Make the variant affect the button class.
6. Give the HTML button an explicit button type.
7. Run lint and build before moving on.

A small props shape might look like this conceptually:

```ts
type ButtonProps = {
  label: string
  variant: ButtonVariant
  onPress: () => void
}
```

This is only the component contract. It does not contain calculator arithmetic.

### Naming decision

In [types/calculator.ts](src/types/calculator.ts), a Zod schema is a runtime value, while an inferred TypeScript type is a compile-time description. A clearer naming pattern is:

```ts
const ButtonVariantSchema = z.enum([...])
type ButtonVariant = z.infer<typeof ButtonVariantSchema>
```

The exact names are your choice. The important rule is that a name ending in `Schema` should be treated as a validator, and a name such as `ButtonVariant` should be treated as a type.

### Terms

- **Syntax error**: code that the compiler cannot parse.
- **Module resolution**: how TypeScript finds an imported file.
- **Props contract**: the exact data and callbacks a component accepts.
- **Compile-time checking**: checking source code before it runs.
- **Runtime validation**: checking actual values while the app is running.

### Done when

The calculator workspace passes both lint and build. The button renders, but it does not need to calculate anything yet.

---

## Step 3: design the calculator state

### Goal

Describe all information the calculator needs while a user is entering a calculation.

### Why this step matters

A calculator is not only a number on a screen. It must remember the previous number, the selected operator, and whether the next digit starts a new number.

### How we are doing it

Use a state model with responsibilities like these:

| State field | Purpose |
|---|---|
| `display` | Text currently shown to the user |
| `storedValue` | First number waiting for an operation |
| `pendingOperator` | Operator selected by the user |
| `replaceDisplay` | Whether the next digit replaces the display |
| `error` | A user-facing error state |
| `justEvaluated` | Whether equals was pressed most recently |

Keep `display` as a string. This preserves editing states such as `0.`, `-`, and leading zeroes. Convert it to a number only when the calculation engine needs a numeric value.

A small type sketch might look like this:

```ts
type CalculatorState = {
  display: string
  storedValue: number | null
  pendingOperator: Operator | null
  replaceDisplay: boolean
  error: string | null
}
```

The final state can contain more fields if your behavior checklist requires them.

### Alternative design

You could store only numbers. That is simpler at first, but it makes decimal editing and leading zeroes awkward. A display string plus numeric calculation values is easier for a real calculator interface.

### Terms

- **State**: data that changes while the application runs.
- **State machine**: a system that moves between known states after actions.
- **Invariant**: a rule that should always remain true.
- **Presentation state**: data needed to display the interface.
- **Domain state**: data needed to perform the calculation.

### Done when

You can describe what each field contains before and after pressing every key in the MVP.

---

## Step 4: build the calculation engine

### Goal

Implement arithmetic separately from React in [lib/calculator.ts](src/lib/calculator.ts).

### Why this step matters

Arithmetic is easier to test when it is a pure function with no UI, browser events, or React state.

### How we are doing it

Start with one operation function that accepts two numbers and an operator. Its shape can be thought of like this:

```ts
calculate(firstValue, operator, secondValue)
```

The function should handle:

- addition
- subtraction
- multiplication
- division
- division by zero
- non-finite results

Do not use `eval`. The calculator should choose the operation explicitly from the allowed operator values.

You can represent errors in different ways:

1. Throw an error and let the caller handle it.
2. Return a result object containing either a value or an error.
3. Return a number and handle special cases before calling the function.

The result-object approach is often easiest to extend because success and failure are both explicit.

### Example of a result shape

```ts
type CalculationResult =
  | { kind: 'success'; value: number }
  | { kind: 'error'; message: string }
```

This is a model of the result, not a complete implementation.

### Terms

- **Pure function**: the same input always produces the same output and does not change outside state.
- **Side effect**: an external change, such as updating React state.
- **Domain logic**: rules belonging to the calculator itself.
- **Finite number**: a number that is not `NaN` or positive/negative infinity.
- **Discriminated union**: a type with a field such as `kind` that identifies which shape is present.

### Done when

Arithmetic can be tested by calling a function without rendering the calculator interface.

---

## Step 5: use Zod at data boundaries

### Goal

Use the Zod dependency where data may be unknown, without making every internal operation unnecessarily complicated.

### Why this step matters

TypeScript protects your source code during development. It does not validate data loaded from storage, an API, or another JavaScript module at runtime. Zod handles that runtime boundary.

### How we are doing it

Keep the operator schema for validating unknown operator values. Review the current `NumberSchema`, because it uses integer validation while the MVP includes decimal values.

Choose one of these designs:

- Keep the integer schema for a separate integer-only use case.
- Change the calculator number schema to allow decimals.
- Use separate schemas for display input and calculated numeric values.

Do not parse a value with Zod simply because it came from one of your own typed buttons. Use it when the value crosses a trust boundary.

### Conceptual boundary example

```ts
const parsedSettings = SettingsSchema.safeParse(valueFromStorage)
```

The important idea is that `valueFromStorage` is unknown until validation succeeds.

### Terms

- **Schema**: a description of valid data.
- **Parsing**: checking data and turning it into a trusted value.
- **Trust boundary**: the point where data enters from an external or uncertain source.
- **`safeParse`**: validation that returns a success or failure result instead of throwing immediately.

### Done when

Your schemas match the MVP rules, especially the decision about decimal values.

---

## Step 6: add tests for the engine

### Goal

Protect the arithmetic rules before connecting them to the interface.

### Why this step matters

When UI state and arithmetic are mixed together, a failing result is difficult to locate. Pure-function tests tell you whether the calculation rule itself is correct.

### How we are doing it

Add a test runner such as Vitest and add a test script to the calculator workspace. Start with tests for:

- each basic operator
- decimal values
- negative values
- division by zero
- invalid input
- non-finite output

Then add transition tests for user input:

- several digits become one number
- a second decimal is ignored or rejected
- clear returns to the initial state
- an operator is stored
- equals evaluates the pending operation
- equals without a second number is handled deliberately

A test case has this shape:

```ts
describe('calculator operation', () => {
  it('adds two values', () => {
    // arrange input
    // perform the operation
    // assert the result
  })
})
```

### Terms

- **Unit test**: tests one small function or rule.
- **Integration test**: tests several pieces working together.
- **Regression test**: prevents a previously fixed behavior from breaking again.
- **Arrange–Act–Assert**: prepare input, perform an action, check the result.
- **Test case**: one input and its expected outcome.

### Done when

The arithmetic engine has tests that fail when its rules are intentionally changed.

---

## Step 7: finish the reusable button component

### Goal

Make one button component that can represent every calculator key.

### Why this step matters

The current [App.tsx](src/App.tsx) repeats button markup. A reusable component gives every key consistent behavior, styling, and accessibility.

### How we are doing it

Separate the button’s visible label from its action:

| Concept | Example |
|---|---|
| Label | `×` |
| Action | multiplication |
| Variant | operator |

The button should report its action to the parent. The parent decides how the calculator state changes.

A component contract might eventually resemble:

```ts
type CalculatorButtonProps = {
  label: string
  action: CalculatorAction
  variant: ButtonVariant
  onPress: (action: CalculatorAction) => void
}
```

This is a design example. Choose names that fit your implementation.

### Alternative design

You can pass only `label` and let the parent infer the action from the label. That is quicker, but it couples behavior to display text. Keeping them separate is safer when you later add localization or alternate symbols.

### Terms

- **Reusable component**: a UI element designed for multiple uses.
- **Component contract**: the props and behavior a component promises.
- **Action value**: the internal meaning of a button press.
- **Visual variant**: a style category such as number, operator, clear, or equals.

### Done when

Every button can render with the correct style and report its action without containing arithmetic code.

---

## Step 8: render the keypad from configuration

### Goal

Describe the keypad as data and render it instead of repeating JSX for every key.

### Why this step matters

A configuration makes it easier to change button order, add keys, support keyboard shortcuts, and keep labels and actions consistent.

### How we are doing it

Create a configuration item for each key with information such as:

- label
- action
- variant
- optional accessibility label

A single item might look like this:

```ts
const key = {
  label: '7',
  action: { type: 'digit', value: '7' },
  variant: 'number',
}
```

Then render each item through the reusable button component. Give every rendered item a stable React key.

### Keypad planning

Decide the layout before writing the array. A basic layout often contains:

- clear
- sign
- percent, if you want it
- division
- digits
- decimal
- multiplication
- subtraction
- addition
- equals

Do not combine unrelated operators into one label such as `*/` or `+-`. Each key should represent one action.

### Terms

- **Data-driven UI**: generating interface elements from data.
- **Mapping**: transforming each configuration item into a UI element.
- **Stable key**: a consistent identifier React uses to track a rendered item.
- **Single source of truth**: one authoritative definition instead of duplicated markup.

### Done when

The keypad is generated from one configuration and adding a new key requires adding one configuration item.

---

## Step 9: connect state with `useReducer`

### Goal

Make every button press produce a predictable state transition.

### Why this step matters

Several calculator values often need to change together. A reducer puts those rules in one place instead of spreading them across many event handlers.

### How we are doing it

Define actions such as:

- digit pressed
- decimal pressed
- operator selected
- equals pressed
- clear pressed
- sign toggled
- delete pressed

The reducer receives the current state and one action, then returns the next state.

A conceptual transition looks like this:

```ts
nextState = reducer(currentState, {
  type: 'digitPressed',
  digit: '7',
})
```

The reducer should call the calculation engine when an operation is ready. It should not manipulate the DOM directly.

### Alternative design

Multiple `useState` values can work for a small calculator. Choose `useReducer` when state fields must change together or when you want all transitions in one explicit list.

### Terms

- **Reducer**: a function that calculates the next state from current state and an action.
- **Action**: a description of something that happened.
- **Dispatch**: sending an action to the reducer.
- **Transition**: moving from one state to another.
- **Immutable update**: creating updated state without modifying the existing state directly.

### Done when

Every MVP key dispatches one action, and the reducer handles all calculator behavior in one predictable place.

---

## Step 10: format the display

### Goal

Turn internal values into readable calculator text.

### Why this step matters

The internal calculation value and the text shown to the user are different concerns. JavaScript floating-point arithmetic can also produce more digits than a calculator should display.

### How we are doing it

Decide rules for:

- maximum display length
- decimal rounding
- trailing zeroes
- negative zero
- very large results
- very small results
- error text

A formatting helper might have this conceptual shape:

```ts
formatDisplay(value, options)
```

Keep formatting separate from arithmetic. The engine calculates the result; the formatter decides how that result appears.

### Terms

- **Formatting**: converting an internal value into user-facing text.
- **Rounding**: limiting numeric precision.
- **Floating-point precision**: limits of representing decimal values digitally.
- **Derived value**: information calculated from existing state.

### Done when

Results remain readable and predictable for decimal, large, negative, and error values.

---

## Step 11: add accessibility and keyboard support

### Goal

Make the calculator usable without a mouse and understandable to assistive technology.

### Why this step matters

The calculator is an interactive tool. Keyboard users should not need to click every key, and screen-reader users need meaningful labels.

### How we are doing it

Add:

- real semantic button elements
- visible focus styles
- accessible labels where the symbol is ambiguous
- keyboard handling for digits and operators
- Enter for equals
- Escape for clear
- Backspace for delete

Keep keyboard mapping separate from arithmetic. A keyboard event should be converted into the same calculator action used by a mouse click.

A conceptual mapping looks like this:

```ts
const keyboardActions = {
  Enter: { type: 'equals' },
  Escape: { type: 'clear' },
}
```

### Terms

- **Accessibility**: making the interface usable by people with different abilities.
- **Semantic HTML**: using HTML elements according to their meaning.
- **Focus management**: controlling and showing where keyboard input is directed.
- **Keyboard mapping**: translating physical keys into application actions.

### Done when

The complete MVP can be used with a mouse and keyboard, and every control has a meaningful accessible name.

---

## Step 12: verify and document the result

### Goal

Confirm that the calculator is reliable and explain how someone else can run it.

### Why this step matters

An application is not finished when it works once in the browser. It should also pass automated checks and have repeatable behavior.

### How we are doing it

At each milestone, run:

1. lint
2. TypeScript build
3. unit tests
4. manual browser checks

Use a short acceptance checklist:

- The project starts locally.
- The project builds successfully.
- Lint reports no errors.
- Every key has one clear action.
- Basic operations return correct values.
- Decimals behave consistently.
- Division by zero is handled visibly.
- Clear resets all relevant state.
- Tests cover the calculation rules.
- Keyboard input works if included in the MVP.

Add a project README section that explains the workspace command, the MVP behavior, and the test command.

### Terms

- **Smoke test**: a quick check that the main application path works.
- **Acceptance criteria**: conditions that must be true for the feature to be considered complete.
- **Regression**: a previously working behavior that breaks after a change.
- **Build verification**: checking that the project can be compiled for production.

### Done when

The calculator passes the checklist and another person can understand how to run and test it.

---

## Suggested implementation order inside the repository

1. Repair [src/components/calculatorButton.tsx](src/components/calculatorButton.tsx).
2. Clean up [src/types/calculator.ts](src/types/calculator.ts).
3. Decide and document the state model.
4. Implement and test [src/lib/calculator.ts](src/lib/calculator.ts).
5. Add the button configuration.
6. Connect the configuration to the reusable button.
7. Add the reducer and calculator actions.
8. Connect the reducer to the display and keypad.
9. Add formatting, accessibility, and keyboard behavior.
10. Run the complete verification checklist.

At every stage, keep the project compiling before starting the next stage. This makes each error easier to understand and gives you a clear learning checkpoint.
