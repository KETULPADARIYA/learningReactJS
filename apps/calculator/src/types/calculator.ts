// Holds types shared by calculator logic, especially operators
import {z} from 'zod';

export const OperatorSchema = z.enum(['+', '-', '*', '/']);


export type Operator = z.infer<typeof OperatorSchema>;

export const CalculatorButtonVariantSchema = z.enum(["number","operator", "clear", "equals"]); 

export type CalculatorButtonVariant = z.infer<typeof CalculatorButtonVariantSchema>;

export const ColorSchema = CalculatorButtonVariantSchema.transform((variant) => {
    switch(variant) {
        case "number":
            return 'bg-zinc-600';
        case 'operator':
            return 'bg-orange-500';
        case 'clear':
            return 'bg-blue-500';
        case "equals":
            return 'bg-green-500';
        default:
            throw new Error(`Unknown variant: ${variant}`);     
    }
});



const numberMax = 1_000_000;
const numberMin = -numberMax;
export const NumberSchema = z.number().min(numberMin, `Number is too small ${numberMin}`).max(numberMax, `Number is too large ${numberMax}`);



export const CalculatorButtonPropsSchema = z.object({
    label:z.union([z.string(),z.number()]),
    variant:CalculatorButtonVariantSchema.default("number").optional(),
    onClick:z.function().optional()
}
);

export type CalculatorButtonProps = z.infer<typeof CalculatorButtonPropsSchema>;


export const CalculatorSchema = z.object({
    firstNumber: NumberSchema,
    operator: OperatorSchema,
    secondNumber: NumberSchema
});

export type Calculator = z.infer<typeof CalculatorSchema>;