import {CalculatorButton} from "./components/calculatorButton.tsx"
import {useState} from "react";
import { OperatorSchema,NumberSchema} from "./types/calculator.ts";
import {calculate} from "./lib/calculator.ts";

function App() {
  const [display,setDisplay] = useState('0');

  const handleNumberAdd = (num:string) =>(
    setDisplay((prev)=> ( prev === '0' ? num :prev+num))
  );

  const handleOperatorAdd = (operator:string)=>{
    setDisplay((prev)=> `${prev} ${operator} `)
  }

  const handleClear = ()=>{
    setDisplay('0')
  }

  const handleDelete= ()=>{
    setDisplay((prev)=> prev.slice(0, -1) || '0')
  }
  const handleEquals = ()=> {
    let result = 0;// display.split(' ') 
    let op;
    let items = display.split(' ');
    console.log('Display:', display);
    for (let i = 0; i < items.length; i++) {
      const x = items[i];
      const operator = OperatorSchema.safeParse(x);

      console.log('Item:', x, 'Operator parse result:', operator);

      if (operator.success) {
        op = operator.data;
        // Handle operator
      } else {
        const numberResult = NumberSchema.safeParse(Number(x) );
        if (numberResult.success) {
          // Handle number
          if (op) {
            result = calculate({firstNumber: result, operator: op, secondNumber: Number(numberResult.data)});
          } else {
            result = numberResult.data;
          }
        } else {
          console.error(`Invalid character: ${x}`);
          // Handle invalid character
        }
      }
    }
    setDisplay(String(result));

  };
  return (
    // Main container
    <div className="min-h-screen grid place-items-center bg-slate-950 px-4">
      {/* <!-- Calculator container box --> */}
      <div className="w-full max-w-sm rounded-3xl  bg-zinc-900 p-4 shadow-2xl">

        {/* // Calculator display */}
        <div className="min-h-32 flex justify-end px-2 py-4 text-5xl text-white">
           {display}
          </div>
        {/* <!-- // Calculator keypad box --> */}
        <div className="grid grid-cols-4 gap-3">
          {/* // Calculator buttons */}
          <CalculatorButton label="AC" variant="clear" onClick={ ()=>handleClear()} />          
          <CalculatorButton label="DEL" variant="clear"onClick={()=>handleDelete()} />
          <CalculatorButton label="=" variant="clear" onClick={ ()=>handleEquals()} />          
          <CalculatorButton label="+" variant="operator" onClick={()=>handleOperatorAdd('+')} />          
                    
          <CalculatorButton label={1} onClick={()=>handleNumberAdd('1')} />          
          <CalculatorButton label={2}  onClick={()=>handleNumberAdd('2')}/>          
          <CalculatorButton label={3}  onClick={()=>handleNumberAdd('3')}/>          
          <CalculatorButton label="-" variant="operator" onClick={()=>handleOperatorAdd('-')}/>          
          <CalculatorButton label={4}  onClick={()=>handleNumberAdd('4')}/>          
          <CalculatorButton label={5}  onClick={()=>handleNumberAdd('5')}/>          
          <CalculatorButton label={6}  onClick={()=>handleNumberAdd('6')}/>          
          <CalculatorButton label="*" variant="operator" onClick={()=>handleOperatorAdd('*')}/>          
          <CalculatorButton label={7}  onClick={()=>handleNumberAdd('7')}/>          
          <CalculatorButton label={8}  onClick={()=>handleNumberAdd('8')}/>          
          <CalculatorButton label={9}  onClick={()=>handleNumberAdd('9')}/>          
          <CalculatorButton label="/" variant="operator" onClick={()=>handleOperatorAdd('/')}/>  
          <CalculatorButton label='.'/>
          <CalculatorButton label= {0}  onClick={()=>handleNumberAdd('0')}/>
          <CalculatorButton label= '+-'/>        
          

          </div>
      </div>
    </div>
  )
};

export default App;
