"use client";
import { useState, useEffect, useRef } from "react";
import { ArrowRight, ChevronRight, Sparkle } from "lucide-react"; // Optional: you can use any arrow icon
import { useUrlStore } from "../stores/UrlStore";

export default function PullToRevealInput() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputClicked, setInputClicked] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const { url, setUrl } = useUrlStore(); // Access the URL state and setter function

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div className="flex flex-col items-center  justify-center transition-all duration-500 p-4 relative">
      {/* <div className="w-full max-w-md relative ">
        <input
          ref={inputRef}
          type="text"
          placeholder={inputClicked ? "" : "Enter URL"}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="text-center text-s w-full rounded-full backdrop-blur-md p-1 px-2 outline-none focus:outline-none focus:ring-2 transition-all duration-300 focus:w-full focus:text-xs focus:py-3 focus:backdrop-blur-lg bg-green-500 "
          onClick={() => setInputClicked(true)}
          onMouseOut={() => setInputClicked(false)}
        />

        {inputValue.trim() && (
          <button
            onClick={() => {
              console.log("Submitted:", inputValue);
              // Do something with the value
              setUrl(inputValue);
            }}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 transition-all duration-200"
          >
            <ChevronRight />
          </button>
        )}
      </div> */}
      <div className="w-full max-w-md relative">
        {/* Container to wrap both input and button */}
        <div className="flex items-center w-full">
          <input
            ref={inputRef}
            type="text"
            placeholder={inputClicked ? "" : "Enter URL"}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="text-center text-xs w-full rounded-full backdrop-blur-md pl-3 outline-none focus:outline-none focus:ring-2 transition-all duration-300 focus:w-full focus:text-lg focus:py-3 focus:backdrop-blur-lg "
            onClick={() => setInputClicked(true)}
            onMouseOut={() => setInputClicked(false)}
          />

          {/* Conditionally render button when input is not empty */}
          {inputValue.trim() && (
            <ChevronRight
              onClick={() => {
                console.log("Submitted:", inputValue);
                setUrl(inputValue); // Update URL
              }}
              className="ml-1 p-0.95 flex items-center justify-center text-white rounded-full transition-all duration-200"
            />
          )}
        </div>
      </div>
    </div>
  );
}
