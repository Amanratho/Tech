import React, { useState } from "react";
import { FaBackspace } from "react-icons/fa";

const Calculator = () => {
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

      const formattedResult = Number.isInteger(result)
        ? result.toString()
        : result.toFixed(4).replace(/\.?0+$/, "");

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
    if (isNaN(value)) return;
    setDisplay((value / 100).toString());
    setIsResult(true);
  };

  // Original Sleek Round Button UI Components
  const CalcBtn = ({ label, onClick, type = "number", className = "" }) => {
    let baseStyle =
      "flex items-center justify-center text-3xl font-medium rounded-full active:scale-90 transition-transform select-none cursor-pointer ";

    if (type === "number")
      baseStyle += "bg-white text-[var(--text-main)] hover:bg-[var(--bg-input)] shadow-sm";
    if (type === "operator")
      baseStyle += "bg-[var(--primary)] text-black font-bold hover:bg-yellow-500 shadow-lg shadow-[var(--primary)]/20";
    if (type === "function")
      baseStyle += "bg-gray-200 text-[var(--text-main)] hover:bg-gray-300";
    if (type === "zero")
      baseStyle += "bg-white text-[var(--text-main)] hover:bg-[var(--bg-input)] col-span-2 rounded-[2rem] justify-start pl-10 shadow-sm";

    return (
      <button type="button" onClick={() => onClick(label)} className={`${baseStyle} ${className}`}>
        {label}
      </button>
    );
  };

  return (
    <div className="bg-[var(--bg-main)] min-h-screen pt-16 pb-20 flex flex-col justify-end w-full max-w-md mx-auto font-sans">
      {/* ── BORDERLESS OPEN DISPLAY AREA ── */}
      <div className="flex-1 flex flex-col justify-end p-6 items-end relative w-full min-h-[160px]">
        <div className="text-[var(--text-muted)] text-2xl h-8 mb-2 font-mono tracking-wider w-full text-right overflow-hidden text-ellipsis whitespace-nowrap">
          {equation}
        </div>
        <div className="w-full overflow-x-auto no-scrollbar text-right">
          <span
            className={`text-[var(--text-main)] font-light tracking-tighter ${
              display.length > 10 ? "text-5xl" : "text-7xl"
            }`}
            style={{ WebkitUserSelect: "none" }}
          >
            {display}
          </span>
        </div>
      </div>

      {/* ── ORIGINAL SLEEK KEYPAD CONTAINER ── */}
      <div className="w-full p-4 pb-6 bg-white rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.12)] border-t border-[var(--border-color)]">
        <div className="grid grid-cols-4 gap-4 max-w-md mx-auto aspect-[4/5]">
          <CalcBtn label="AC" onClick={handleClear} type="function" />

          {/* Backspace Button */}
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center justify-center bg-gray-200 text-[var(--text-main)] hover:bg-gray-300 rounded-full active:scale-90 transition-transform select-none cursor-pointer"
          >
            <FaBackspace size={24} />
          </button>

          <CalcBtn label="%" onClick={handlePercentage} type="function" />
          <button
            type="button"
            onClick={() => handleOperator("÷")}
            className="flex items-center justify-center text-4xl bg-[var(--primary)] text-black font-bold rounded-full active:scale-90 transition-transform shadow-lg shadow-[var(--primary)]/20 pb-1 cursor-pointer"
          >
            ÷
          </button>

          {/* Row 2 */}
          <CalcBtn label="7" onClick={handleNumber} />
          <CalcBtn label="8" onClick={handleNumber} />
          <CalcBtn label="9" onClick={handleNumber} />
          <button
            type="button"
            onClick={() => handleOperator("×")}
            className="flex items-center justify-center text-3xl bg-[var(--primary)] text-black font-bold rounded-full active:scale-90 transition-transform shadow-lg shadow-[var(--primary)]/20 pb-1 cursor-pointer"
          >
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
          <button
            type="button"
            onClick={calculate}
            className="flex items-center justify-center text-3xl bg-green-500 text-white font-bold rounded-full active:scale-90 transition-transform shadow-lg shadow-green-500/20 cursor-pointer"
          >
            =
          </button>
        </div>
      </div>
    </div>
  );
};

export default Calculator;