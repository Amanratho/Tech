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

  // Sleek, Compact Round Button UI Components
  const CalcBtn = ({ label, onClick, type = "number", className = "" }) => {
    let baseStyle =
      "flex items-center justify-center text-lg font-bold rounded-full active:scale-95 transition-all select-none cursor-pointer py-3.5 ";

    if (type === "number")
      baseStyle += "bg-white text-[#1a1c1c] border border-[#e2e2e2] hover:bg-[#f9f9f9] shadow-sm";
    if (type === "operator")
      baseStyle += "bg-[#fbc02d] text-[#6c5000] border border-[#795900] font-extrabold hover:bg-[#f8bd2a] shadow-sm shadow-[#fbc02d]/20 text-xl";
    if (type === "function")
      baseStyle += "bg-[#eeeeee] text-[#4f4633] border border-[#e2e2e2] hover:bg-[#e8e8e8]";
    if (type === "zero")
      baseStyle += "bg-white text-[#1a1c1c] border border-[#e2e2e2] hover:bg-[#f9f9f9] col-span-2 rounded-full justify-start pl-8 shadow-sm";

    return (
      <button type="button" onClick={() => onClick(label)} className={`${baseStyle} ${className}`}>
        {label}
      </button>
    );
  };

  return (
    <div className="bg-[#f9f9f9] text-[#1a1c1c] min-h-screen pt-16 pb-[64px] flex flex-col justify-end w-full max-w-sm mx-auto font-sans">
      {/* ── COMPACT BORDERLESS OPEN DISPLAY AREA ── */}
      <div className="flex-1 flex flex-col justify-end p-5 items-end relative w-full min-h-[120px]">
        <div className="text-[#4f4633] text-sm h-5 mb-1 font-mono tracking-wider w-full text-right overflow-hidden text-ellipsis whitespace-nowrap font-medium">
          {equation}
        </div>
        <div className="w-full overflow-x-auto no-scrollbar text-right">
          <span
            className={`text-[#1a1c1c] font-extrabold tracking-tight ${
              display.length > 12
                ? "text-2xl"
                : display.length > 8
                ? "text-3xl"
                : "text-4xl"
            }`}
            style={{ WebkitUserSelect: "none" }}
          >
            {display}
          </span>
        </div>
      </div>

      {/* ── COMPACT SLEEK KEYPAD CONTAINER (FLUSH TO BOTTOM NAVBAR) ── */}
      <div className="w-full p-4 pb-3 bg-white rounded-t-[2rem] shadow-[0_-6px_25px_rgba(0,0,0,0.08)] border-t border-[#e2e2e2]">
        <div className="grid grid-cols-4 gap-3 max-w-xs mx-auto">
          <CalcBtn label="AC" onClick={handleClear} type="function" />

          {/* Backspace Button */}
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center justify-center bg-[#eeeeee] text-[#4f4633] border border-[#e2e2e2] hover:bg-[#e8e8e8] rounded-full active:scale-95 transition-all select-none cursor-pointer py-3.5"
          >
            <FaBackspace size={18} />
          </button>

          <CalcBtn label="%" onClick={handlePercentage} type="function" />
          <button
            type="button"
            onClick={() => handleOperator("÷")}
            className="flex items-center justify-center text-xl bg-[#fbc02d] text-[#6c5000] border border-[#795900] font-extrabold rounded-full active:scale-95 transition-all shadow-sm shadow-[#fbc02d]/20 py-3.5 cursor-pointer"
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
            className="flex items-center justify-center text-xl bg-[#fbc02d] text-[#6c5000] border border-[#795900] font-extrabold rounded-full active:scale-95 transition-all shadow-sm shadow-[#fbc02d]/20 py-3.5 cursor-pointer"
          >
            ×
          </button>

          {/* Row 3 */}
          <CalcBtn label="4" onClick={handleNumber} />
          <CalcBtn label="5" onClick={handleNumber} />
          <CalcBtn label="6" onClick={handleNumber} />
          <CalcBtn label="-" onClick={handleOperator} type="operator" />

          {/* Row 4 */}
          <CalcBtn label="1" onClick={handleNumber} />
          <CalcBtn label="2" onClick={handleNumber} />
          <CalcBtn label="3" onClick={handleNumber} />
          <CalcBtn label="+" onClick={handleOperator} type="operator" />

          {/* Row 5 */}
          <CalcBtn label="0" onClick={handleNumber} type="zero" />
          <CalcBtn label="." onClick={handleNumber} />
          <button
            type="button"
            onClick={calculate}
            className="flex items-center justify-center text-xl bg-[#16a34a] hover:bg-green-700 text-white font-extrabold rounded-full active:scale-95 transition-all shadow-sm shadow-green-500/20 py-3.5 cursor-pointer"
          >
            =
          </button>
        </div>
      </div>
    </div>
  );
};

export default Calculator;