import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaChevronLeft, FaBackspace, FaHistory } from "react-icons/fa";

const Calculator = () => {
  const navigate = useNavigate();
  
  // States for Calculator Logic
  const [display, setDisplay] = useState("0");
  const [equation, setEquation] = useState("");
  const [isResult, setIsResult] = useState(false);

  // Safe Calculator Logic
  const handleNumber = (num) => {
    if (display === "0" || isResult) {
      setDisplay(num);
      setIsResult(false);
    } else {
      // Prevent multiple decimals
      if (num === "." && display.includes(".")) return;
      setDisplay(display + num);
    }
  };

  const handleOperator = (op) => {
    setIsResult(false);
    if (equation && !isResult) {
      setEquation(equation + " " + display + " " + op);
    } else {
      setEquation(display + " " + op);
    }
    setDisplay("0");
  };

  const calculate = () => {
    if (!equation) return;
    try {
      const fullEquation = equation + " " + display; 
      const mathEquation = fullEquation.replace(/×/g, "*").replace(/÷/g, "/");
       
      const result = new Function(`'use strict'; return (${mathEquation})`)();
       
      const formattedResult = Number.isInteger(result) ? result.toString() : result.toFixed(4).replace(/\.?0+$/, "");
      
      setDisplay(formattedResult);
      setEquation("");
      setIsResult(true);
    } catch (error) {
      setDisplay("Error");
      setEquation("");
      setIsResult(true);
    }
  };

  const handleClear = () => {
    setDisplay("0");
    setEquation("");
    setIsResult(false);
  };
 
  const handleDelete = () => {
    if (isResult) {
      handleClear();
      return;
    }
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));  
    } else {
      setDisplay("0");  
    }
  };

  const handlePercentage = () => {
    const value = parseFloat(display);
    setDisplay((value / 100).toString());
    setIsResult(true);
  };

  // Button UI Components
  const CalcBtn = ({ label, onClick, type = "number", className = "" }) => {
    let baseStyle = "flex items-center justify-center text-3xl font-medium rounded-full active:scale-90 transition-transform select-none ";
    
    if (type === "number") baseStyle += "bg-[#1E1E1E] text-white hover:bg-[#2C2C2C]";
    if (type === "operator") baseStyle += "bg-[var(--primary)] text-black font-bold hover:bg-yellow-500 shadow-lg shadow-[var(--primary)]/20";
    if (type === "function") baseStyle += "bg-[#333333] text-gray-200 hover:bg-[#444]";
    if (type === "zero") baseStyle += "bg-[#1E1E1E] text-white hover:bg-[#2C2C2C] col-span-2 rounded-[2rem] justify-start pl-10";

    return (
      <button onClick={() => onClick(label)} className={`${baseStyle} ${className}`}>
        {label}
      </button>
    );
  };

  return (
    <div className="bg-[#121212] h-[100dvh] w-full flex flex-col font-sans overflow-hidden fixed top-0 left-0 z-50">
      
      {/* 1. APP HEADER */}
      <div className="px-4 py-4 flex items-center justify-between border-b border-[#2C2C2C]">
        <button
          onClick={() => navigate(-1)}
          className="p-3 -ml-3 rounded-full active:bg-[#2C2C2C] text-white transition-colors"
        >
          <FaChevronLeft size={20} />
        </button>
        <h1 className="text-gray-400 text-sm font-bold tracking-widest uppercase">
          Calculator
        </h1>
        <button className="p-3 -mr-3 rounded-full active:bg-[#2C2C2C] text-gray-500 transition-colors">
          <FaHistory size={18} />
        </button>
      </div>

      {/* 2. DISPLAY AREA */}
      <div className="flex-1 flex flex-col justify-end p-6 items-end relative w-full">
        <div className="text-gray-500 text-2xl h-8 mb-2 font-mono tracking-wider w-full text-right overflow-hidden text-ellipsis whitespace-nowrap">
          {equation}
        </div>
        <div className="w-full overflow-x-auto no-scrollbar text-right">
          <span 
            className={`text-white font-light tracking-tighter ${display.length > 10 ? 'text-5xl' : 'text-7xl'}`}
            style={{ WebkitUserSelect: "none" }}
          >
            {display}
          </span>
        </div>
      </div>

      {/* 3. KEYPAD AREA */}
      <div className="w-full p-4 pb-8 bg-[#181818] rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="grid grid-cols-4 gap-4 max-w-md mx-auto aspect-[4/5]">
           
          <CalcBtn label="AC" onClick={handleClear} type="function" />
          
          {/* 🔥 BACKSPACE BUTTON (X) 🔥 */}
          <button 
            onClick={handleDelete} 
            className="flex items-center justify-center bg-[#333333] text-gray-200 hover:bg-[#444] rounded-full active:scale-90 transition-transform select-none"
          >
            <FaBackspace size={24} />
          </button>
          
          <CalcBtn label="%" onClick={handlePercentage} type="function" />
          <button onClick={handleOperator.bind(null, '÷')} className="flex items-center justify-center text-4xl bg-[var(--primary)] text-black font-bold rounded-full active:scale-90 transition-transform shadow-lg shadow-[var(--primary)]/20 pb-1">
            ÷
          </button>

          {/* Row 2 */}
          <CalcBtn label="7" onClick={handleNumber} />
          <CalcBtn label="8" onClick={handleNumber} />
          <CalcBtn label="9" onClick={handleNumber} />
          <button onClick={handleOperator.bind(null, '×')} className="flex items-center justify-center text-3xl bg-[var(--primary)] text-black font-bold rounded-full active:scale-90 transition-transform shadow-lg shadow-[var(--primary)]/20 pb-1">
            ×
          </button>

          {/* Row 3 */}
          <CalcBtn label="4" onClick={handleNumber} />
          <CalcBtn label="5" onClick={handleNumber} />
          <CalcBtn label="6" onClick={handleNumber} />
          <CalcBtn label="-" onClick={handleOperator} type="operator" className="text-4xl pb-1" />

          {/* Row 4 */}
          <CalcBtn label="1" onClick={handleNumber} />
          <CalcBtn label="2" onClick={handleNumber} />
          <CalcBtn label="3" onClick={handleNumber} />
          <CalcBtn label="+" onClick={handleOperator} type="operator" className="text-4xl pb-1" />

          {/* Row 5 */}
          <CalcBtn label="0" onClick={handleNumber} type="zero" />
          <CalcBtn label="." onClick={handleNumber} className="text-4xl pb-3" />
          <button onClick={calculate} className="flex items-center justify-center text-3xl bg-green-500 text-white font-bold rounded-full active:scale-90 transition-transform shadow-lg shadow-green-500/20">
            =
          </button>

        </div>
      </div>

    </div>
  );
};

export default Calculator;