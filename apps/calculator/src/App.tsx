import {CalculatorButton} from "./components/calculatorButton.tsx"
import {useState,useRef,useEffect} from "react";
import { OperatorSchema,NumberSchema} from "./types/calculator.ts";
import {calculate} from "./lib/calculator.ts";
import {toast,Toaster} from "sonner";

function App() {

  const displayRef = useRef<HTMLDivElement>(null);

  const [display,setDisplay] = useState('0');

  const handleNumberAdd = (num:string) => {
    const lastValue = display.trim().at(-1);
    const isLastValueOperator = OperatorSchema.safeParse(lastValue);
    if (isLastValueOperator.success){
      setDisplay((prev)=> prev + ' ' + num);
    } else {
      setDisplay((prev)=> ( prev === '0' ? num :prev+num))
    }
  };

  const handleOperatorAdd = (operator:string)=>{
    // check if the last character is an operator, if so replace it with the new operator
    const lastValue = display.trim().at(-1);
    console.log('Last value:', lastValue, 'Operator:', operator);
    const isLastValueOperator = OperatorSchema.safeParse(lastValue);
    console.log('Replacing last operator with new operator', isLastValueOperator.success, 'Last value:', lastValue, 'Operator:', operator);
    if (isLastValueOperator.success){
      setDisplay((prev)=> prev.slice(0,-1)+ operator);
      return;
    } else {
      setDisplay((prev)=> prev + ' ' + operator );
    }  
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
    let failed = false;
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
          numberResult.error.issues.forEach(issue => {
            console.error(`Validation error for item "${x}": ${issue.message}`);
            toast.error(`Validation error for item "${x}": ${issue.message}`);
          });
          // console.log(numberResult.error.issues);
          // console.error(`Invalid character: ${x}`);
          // toast.error(`Invalid Number: ${x} `);
          failed = true;
          break;
          // Handle invalid character
        }
      }
    }
    if (!failed){
    setDisplay(String(result));
    };
  };

  useEffect(() => {
    if(displayRef.current) {
      displayRef.current.scrollLeft = displayRef.current.scrollWidth;
    }
  },[display]);
  return (
    // Main container
    <div className="min-h-screen grid place-items-center bg-slate-950 px-4">
      {/* <!-- Calculator container box --> */}
      <div className="w-full max-w-sm rounded-3xl  bg-zinc-900 p-4 shadow-2xl">

        <div className="min-h-32 w-full min-w-0 box-border overflow-x-scroll px-2 py-4 text-5xl text-white" ref={displayRef}>
           <div className="block w-max shrink-0 whitespace-nowrap"> {display}</div>
          </div>
        {/* <!-- // Calculator keypad box --> */}
        <Toaster position="bottom-center" richColors closeButton />

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
          <CalculatorButton label='.' onClick={()=>handleNumberAdd('.')}/>
          <CalculatorButton label= {0}  onClick={()=>handleNumberAdd('0')}/>
          {/* <CalculatorButton label= '+-'/>         */}
          

          </div>
      </div>
    </div>
  )
};

export default App;
