import {CalculatorSchema} from "../types/calculator.ts";
import type {Calculator} from "../types/calculator.ts";

export function calculate({firstNumber, operator, secondNumber}: Calculator): number {
  
    const parsedSchema = CalculatorSchema.parse({firstNumber, operator, secondNumber});
    switch (parsedSchema.operator) {
    case '+':
      return parsedSchema.firstNumber + parsedSchema.secondNumber;
    case '-':
      return parsedSchema.firstNumber - parsedSchema.secondNumber ;
    case '*':
      return parsedSchema.firstNumber * parsedSchema.secondNumber;
    case '/':
      if (secondNumber === 0) {
        throw new Error("Division by zero is not allowed.");
      }
      return firstNumber / secondNumber;
    default:
      throw new Error(`Unknown operator: ${operator}`);
  }
}