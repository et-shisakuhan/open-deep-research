"use client";

import { useState, useEffect } from "react";
import { Message } from "ai";
import { motion } from "framer-motion";
import { BrainCircuitIcon, Cpu, PanelRightOpen } from "lucide-react";

import { useScrollToBottom } from "@/lib/hooks/use-scroll-to-bottom";

import DownloadTxtButton from "./download-txt";
import { MultimodalInput } from "./input";
import { PreviewMessage, ProgressStep } from "./message";
import { ResearchProgress } from "./research-progress";

export function Chat({
  id,
  initialMessages,
}: {
  id: string;
  initialMessages: Message[];
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<ProgressStep[]>([]);
  const [containerRef, messagesEndRef] = useScrollToBottom<HTMLDivElement>();

  // New state to store the final report text
  const [finalReport, setFinalReport] = useState<string | null>(null);

  // States for interactive feedback workflow
  const [stage, setStage] = useState<"initial" | "feedback" | "researching">(
    "initial"
  );
  const [initialQuery, setInitialQuery] = useState("");
  
  // State for current input text, exposed to welcome message
  const [inputText, setInputText] = useState("");

  // State for progress panel visibility (both mobile and desktop)
  const [showProgress, setShowProgress] = useState(false);

  // State to track if we're on mobile (using 768px as breakpoint for md)
  const [isMobile, setIsMobile] = useState<boolean>(false);
  useEffect(() => {
    const handleResize = () => {
      const isMobileView = window.innerWidth < 768;
      setIsMobile(isMobileView);
      // Show progress panel by default on desktop, hide by default on mobile
      setShowProgress(!isMobileView);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Update the condition to only be true when there are actual research steps
  const hasStartedResearch =
    progress.filter(
      (step) =>
        // Only count non-report steps or initial report steps
        step.type !== "report" ||
        step.content.includes("Generating") ||
        step.content.includes("Synthesizing")
    ).length > 0;

  // Helper function to call the research endpoint
  const sendResearchQuery = async (
    query: string,
    config: { breadth: number; depth: number; modelId: string }
  ) => {
    try {
      setIsLoading(true);
      setProgress([]);
      // Inform the user that research has started
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "Starting in-depth research based on your inputs...",
        },
      ]);

      const response = await fetch("/api/research", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          breadth: config.breadth,
          depth: config.depth,
          modelId: config.modelId,
        }),
      });

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      const textDecoder = new TextDecoder();
      let buffer = "";
      const reportParts: string[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += textDecoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";

        for (const part of parts) {
          if (part.startsWith("data: ")) {
            const jsonStr = part.substring(6).trim();
            if (!jsonStr) continue;
            try {
              const event = JSON.parse(jsonStr);
              if (event.type === "progress") {
                if (event.step.type !== "report") {
                  // Check for duplicates before adding this progress step.
                  setProgress((prev) => {
                    if (
                      prev.length > 0 &&
                      prev[prev.length - 1].content === event.step.content
                    ) {
                      return prev;
                    }
                    return [...prev, event.step];
                  });
                }
              } else if (event.type === "result") {
                // Save the final report so we can download it later
                setFinalReport(event.report);
                setMessages((prev) => [
                  ...prev,
                  {
                    id: Date.now().toString(),
                    role: "assistant",
                    content: event.report,
                  },
                ]);
              } else if (event.type === "report_part") {
                reportParts.push(event.content);
              }
            } catch (e) {
              console.error("Error parsing event:", e);
            }
          }
        }
      }

      if (reportParts.length > 0) {
        // In case the report was sent in parts
        const fullReport = reportParts.join("\n");
        setFinalReport(fullReport);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: fullReport,
          },
        ]);
      }
    } catch (error) {
      console.error("Research error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "Sorry, there was an error conducting the research.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (
    userInput: string,
    config: { breadth: number; depth: number; modelId: string }
  ) => {
    if (!userInput.trim() || isLoading) return;

    // Add user message immediately
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: "user",
        content: userInput,
      },
    ]);

    setIsLoading(true);

    if (stage === "initial") {
      // Add thinking message only for initial query
      setMessages((prev) => [
        ...prev,
        {
          id: "thinking",
          role: "assistant",
          content: "Thinking...",
        },
      ]);

      // Handle the user's initial query
      setInitialQuery(userInput);

      try {
        const response = await fetch("/api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: userInput,
            numQuestions: 3,
            modelId: config.modelId,
          }),
        });
        const data = await response.json();
        const questions: string[] = data.questions || [];
        setMessages((prev) => {
          const filtered = prev.filter((m) => m.id !== "thinking");
          if (questions.length > 0) {
            const formattedQuestions = questions
              .map((q, index) => `${index + 1}. ${q}`)
              .join("\n\n");
            return [
              ...filtered,
              {
                id: Date.now().toString(),
                role: "assistant",
                content: `Please answer the following follow-up questions to help clarify your research:\n\n${formattedQuestions}`,
              },
            ];
          }
          return filtered;
        });
        setStage("feedback");
      } catch (error) {
        console.error("Feedback generation error:", error);
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== "thinking"),
          {
            id: Date.now().toString(),
            role: "assistant",
            content: "Sorry, there was an error generating feedback questions.",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    } else if (stage === "feedback") {
      // In feedback stage, combine the initial query and follow-up answers
      const combined = `Initial Query: ${initialQuery}\nFollow-up Answers:\n${userInput}`;
      setStage("researching");
      try {
        await sendResearchQuery(combined, config);
      } finally {
        setIsLoading(false);
        // Reset the stage so further messages will be processed
        setStage("initial");
        // Inform the user that a new research session can be started
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "assistant",
            content:
              "Research session complete. You can now ask another question to begin a new research session.",
          },
        ]);
      }
    }
  };

  return (
    <div className="flex w-full h-full relative">
      {/* Main container with dynamic width */}
      <motion.div
        className={`mx-auto flex flex-col h-full pt-10 ${
          hasStartedResearch && showProgress ? "md:mr-0" : "md:mx-auto"
        }`}
        initial={{ width: "100%", maxWidth: "800px" }}
        animate={{
          width: !isMobile && hasStartedResearch && showProgress ? "55%" : "100%",
          maxWidth: !isMobile && hasStartedResearch && showProgress ? "1000px" : "800px",
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {/* Messages Container */}
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto relative"
        >
          {/* Welcome Message (if no research started and no messages) */}
          {!hasStartedResearch && messages.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 100,
                  damping: 20,
                }}
                className="relative text-center space-y-4 p-4 md:p-8
                  before:absolute before:inset-0 
                  before:bg-gradient-to-b before:from-primary/[0.03] before:to-primary/[0.01]
                  before:rounded-[32px] before:blur-xl before:-z-10
                  after:absolute after:inset-0 
                  after:bg-gradient-to-br after:from-primary/[0.08] after:via-transparent after:to-primary/[0.03]
                  after:rounded-[32px] after:blur-md after:-z-20"
              >
                <motion.div
                  animate={{
                    y: [-2, 2, -2],
                    rotate: [-1, 1, -1],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="relative"
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.05, 1],
                      opacity: [0.8, 1, 0.8],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/30 
                      blur-2xl rounded-full -z-10"
                  />
                  <Cpu className="w-12 h-12 mx-auto text-primary drop-shadow-[0_0_15px_rgba(var(--primary),0.3)]" />
                </motion.div>

                <div className="space-y-3">
                  <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-base md:text-2xl font-semibold bg-clip-text text-transparent 
                      bg-gradient-to-r from-primary via-primary/90 to-primary/80"
                  >
                    EdgeTech
                  </motion.h2>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-xs md:text-sm text-muted-foreground/90 space-y-1.5"
                  >
                    <p className="font-medium">サンプル質問:</p>
                    <ul className="space-y-1.5 text-left px-2">
                      <li 
                        className="cursor-pointer hover:text-primary transition-colors"
                        onClick={() => setInputText("量子コンピューティングの最新進展について調査して")}
                      >
                        「量子コンピューティングの最新進展について調査して」
                      </li>
                      <li 
                        className="cursor-pointer hover:text-primary transition-colors"
                        onClick={() => setInputText("自動運転技術の現状と将来の課題は？")}
                      >
                        「自動運転技術の現状と将来の課題は？」
                      </li>
                      <li 
                        className="cursor-pointer hover:text-primary transition-colors"
                        onClick={() => setInputText("気候変動対策として有望な新技術を教えて")}
                      >
                        「気候変動対策として有望な新技術を教えて」
                      </li>
                    </ul>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="pt-1"
                  >
                    <span className="inline-flex items-center px-3 py-1 md:px-4 md:py-2 text-xs md:text-sm font-medium 
                      bg-primary/10 text-primary rounded-full">
                      質問を入力して開始
                    </span>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Messages */}
          <div className="p-4 md:p-6 space-y-6">
            {messages.map((message) => (
              <PreviewMessage key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} className="h-4" />
            
            {/* Download button - moved to a more visible position */}
            {finalReport && (
              <div className="sticky bottom-20 left-0 right-0 z-10 flex justify-center my-4">
                <DownloadTxtButton 
                  reportText={finalReport}
                  initialQuery={initialQuery}
                />
              </div>
            )}
          </div>
        </div>

        {/* Input - Fixed to bottom */}
        <div className="sticky bottom-0">
          <div className="p-4 md:p-6 mx-auto">
            <MultimodalInput
              onSubmit={handleSubmit}
              isLoading={isLoading}
              value={inputText}
              onChange={setInputText}
              placeholder={
                stage === "initial"
                  ? "What would you like to research?"
                  : stage === "feedback"
                  ? "Please provide your answers to the follow-up questions..."
                  : "Research in progress..."
              }
            />
            {/* Status bar */}
            <div className="mt-2 text-xs text-center flex items-center justify-center gap-1">
              <BrainCircuitIcon className="w-3 h-3 text-primary" />
              <span className="text-primary/90 font-medium">EdgeTech Research Assistant</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Research Progress Panel */}
      <motion.div
        className={`
          pt-10 fixed md:relative
          inset-0 md:inset-auto
          bg-background md:bg-transparent
          md:w-[45%]
          ${showProgress ? "flex" : "hidden"}
          ${hasStartedResearch ? "" : "hidden"}
        `}
        initial={{ opacity: 0, x: 20 }}
        animate={{ 
          opacity: showProgress ? 1 : 0, 
          x: showProgress ? 0 : 20,
          width: showProgress ? "45%" : "0%"
        }}
        transition={{ duration: 0.3 }}
      >
        <ResearchProgress progress={progress} isLoading={isLoading} />
      </motion.div>

      {/* Subtle Toggle Button - Show on both mobile and desktop when research has started */}
      {hasStartedResearch && (
        <button
          onClick={() => setShowProgress(!showProgress)}
          className={`
            fixed md:absolute
            bottom-24 md:top-14
            right-4
            z-50
            p-2
            bg-background/80
            text-muted-foreground
            hover:text-primary
            border border-border/30
            hover:border-border/50
            rounded-md
            shadow-sm
            backdrop-blur-sm
            transition-all
            duration-200
            ${isMobile ? "" : "md:hover:shadow-md"}
          `}
          aria-label="Toggle research progress"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="18" 
            height="18" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className={`transition-transform duration-200 ${showProgress ? 'rotate-180' : ''}`}
          >
            {showProgress ? (
              <path d="M11 17l-5-5 5-5M18 17l-5-5 5-5" />
            ) : (
              <path d="M13 17l5-5-5-5M6 17l5-5-5-5" />
            )}
          </svg>
        </button>
      )}
    </div>
  );
}
