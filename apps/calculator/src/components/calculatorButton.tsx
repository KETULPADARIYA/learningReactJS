
import {ColorSchema} from "../types/calculator.ts";

import {CalculatorButtonPropsSchema, type CalculatorButtonProps} from "../types/calculator.ts";

// Defines the apperance and basic strcture of one button



export function CalculatorButton ({label, variant = 'number',onClick}:CalculatorButtonProps): React.JSX.Element {

    const parsedProps = CalculatorButtonPropsSchema.parse({
        label,
        variant,
        onClick
    }
    )

    const color = ColorSchema.parse(parsedProps.variant);


    return (
    <button onClick={parsedProps.onClick} className={`min-h-16 rounded-2xl ${color} text-2xl font-medium text-white`} >
        {parsedProps.label}
    </button>
    )
};

